import fs from 'fs'
import path from 'path'

import AdminBro, { buildFeature, ActionRequest, ActionContext, RecordActionResponse, BaseRecord, FeatureType } from 'admin-bro'
import { S3 } from 'aws-sdk'
import { MIME_TYPES, MAX_SIZE } from './file.constants'

export interface Credentials {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
}

export interface Properties {
  file: string;
  key: string;
  bucket: string;
  mimeType?: string;
  size?: string;
  filename?: string;
}

export interface Validation {
  mimeTypes?: string[],
  maxSize?: number,
}

export interface Config {
    credentials: Credentials,
    properties: Properties,
    validation?: Validation,
}

const buildS3Key = (record: BaseRecord, properties: Properties, extension: string): string => {
  const filename = properties.filename && record.params[properties.filename]
    ? record.params[properties.filename] : properties.file

  return `${record.params.id}/${filename}${extension}`
}

const uploadFileFeature = (config: Config): FeatureType => {
  const { credentials, properties, validation } = config

  const s3 = new S3(credentials)

  const before = async (request: ActionRequest, context: ActionContext): Promise<ActionRequest> => {
    context[properties.file] = request?.payload?.[properties.file]
    delete (request?.payload?.[properties.file])

    return request
  }

  const removeFile = async (
    key: string,
    bucket: string,
  ) => (s3.deleteObject({ Key: key, Bucket: bucket }).promise())

  const after = async (
    response: RecordActionResponse,
    request: ActionRequest,
    context: ActionContext,
  ): Promise<RecordActionResponse> => {
    const { record, [properties.file]: file } = context
    if (record && record.isValid() && file) {
      const { ext } = path.parse(file.name)
      const oldRecord = { ...record }

      const s3Key = buildS3Key(record, properties, ext)
      const tmpFile = fs.readFileSync(file.path)

      const s3Response = await s3
        .upload({
          Bucket: credentials.bucket,
          Key: s3Key,
          ACL: 'public-read',
          Body: tmpFile,
        })
        .promise()

      const params = {
        [properties.key]: s3Key,
        [properties.bucket]: credentials.bucket,
        path: s3Response.Location,
        ...properties.size && { [properties.size]: file.size },
        ...properties.mimeType && { [properties.mimeType]: file.type },
      }

      await record.update(params)

      if (oldRecord.params.s3Key && oldRecord.params.s3Key !== s3Key) {
        await removeFile(s3Key, credentials.bucket)
      }

      return {
        ...response,
        record: record.toJSON(context.currentAdmin),
      }
    }

    return response
  }

  const afterDelete = async (
    response: RecordActionResponse,
    request: ActionRequest,
    context: ActionContext,
  ): Promise<RecordActionResponse> => {
    const { record } = context
    const s3Key = record?.param(properties.key)
    if (s3Key) {
      await removeFile(s3Key, credentials.bucket)
    }
    return response
  }

  const uploadFeature = buildFeature({
    properties: {
      [properties.file]: {
        position: 0,
        custom: {
          file: properties.file,
          mimeTypes: validation?.mimeTypes || MIME_TYPES,
          maxSize: validation?.maxSize || MAX_SIZE,
        },
        isVisible: { show: true, edit: true, list: true },
        components: {
          edit: AdminBro.bundle(
            '../../../src/features/upload-file/components/edit',
          ),
          list: AdminBro.bundle(
            '../../../src/features/upload-file/components/list',
          ),
          show: AdminBro.bundle(
            '../../../src/features/upload-file/components/show',
          ),
        },
      },
      [properties.bucket]: { isVisible: false },
      ...properties.filename && { [properties.filename]: { isVisible: true } },
      path: { isVisible: { show: true } },
      [properties.key]: { isVisible: { show: true } },
      ...properties.mimeType && { [properties.mimeType]: { isVisible: {
        show: true,
        edit: false,
      } } },
      ...properties.size && { [properties.size]: { isVisible: { show: true, edit: false } } },
    },
    actions: {
      new: { before, after },
      edit: { before, after },
      delete: { after: afterDelete },
    },
  })

  return uploadFeature
}

export default uploadFileFeature
