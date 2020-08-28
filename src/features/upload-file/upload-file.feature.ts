import fs from 'fs'
import path from 'path'

import AdminBro, {
  buildFeature,
  ActionRequest,
  ActionContext,
  RecordActionResponse,
  FeatureType,
  ListActionResponse,
  RecordJSON,
} from 'admin-bro'
import buildPath from './build-path'
import AWSAdapter from './adapters/aws-adapter'
import UploadConfig from './upload-config.type'
import PropertyCustom from './property-custom.type'

const uploadFileFeature = (config: UploadConfig): FeatureType => {
  const { credentials, properties, validation } = config

  const adapter = new AWSAdapter(credentials.aws)

  const fileProperty = properties.file || 'file'
  const filePathProperty = properties.filePath || 'filePath'

  const stripFileFromPayload = async (
    request: ActionRequest,
    context: ActionContext,
  ): Promise<ActionRequest> => {
    context[fileProperty] = request?.payload?.[fileProperty]
    delete (request?.payload?.[fileProperty])

    return request
  }

  const uploadFile = async (
    response: RecordActionResponse,
    request: ActionRequest,
    context: ActionContext,
  ): Promise<RecordActionResponse> => {
    const { record, [fileProperty]: file } = context
    const { method } = request

    if (method !== 'post') {
      return response
    }

    if (record && record.isValid()) {
      // someone wants to remove file
      if (file === null) {
        const bucket = (properties.bucket && record[properties.bucket]) || adapter.bucket
        const key = record.params[properties.key]

        // and file exists
        if (key && bucket) {
          const params = {
            [properties.key]: null,
            ...properties.bucket && { [properties.bucket]: null },
            ...properties.size && { [properties.size]: null },
            ...properties.mimeType && { [properties.mimeType]: null },
            ...properties.filename && { [properties.filename]: null },
          }

          await record.update(params)
          await adapter.delete(key, bucket)

          return {
            ...response,
            record: record.toJSON(context.currentAdmin),
          }
        }
      }
      if (file) {
        const { ext } = path.parse(file.name)
        const oldRecord = { ...record }

        const key = buildPath(record, properties, ext)
        const tmpFile = fs.readFileSync(file.path)

        await adapter.upload(tmpFile, key)

        const params = {
          [properties.key]: key,
          ...properties.bucket && { [properties.bucket]: adapter.bucket },
          ...properties.size && { [properties.size]: file.size },
          ...properties.mimeType && { [properties.mimeType]: file.type },
          ...properties.filename && { [properties.filename]: file.filename },
        }

        await record.update(params)

        if (oldRecord.params[properties.key] && oldRecord.params[properties.key] !== key) {
          const storedBucket = properties.bucket && oldRecord[properties.bucket]
          await adapter.delete(key, storedBucket || adapter.bucket)
        }

        return {
          ...response,
          record: record.toJSON(context.currentAdmin),
        }
      }
    }

    return response
  }

  const deleteFile = async (
    response: RecordActionResponse,
    request: ActionRequest,
    context: ActionContext,
  ): Promise<RecordActionResponse> => {
    const { record } = context

    const key = record?.param(properties.key)

    if (record && key) {
      const storedBucket = properties.bucket && record.param(properties.bucket)
      await adapter.delete(key, storedBucket || adapter.bucket)
    }
    return response
  }

  const fillRecordWithPath = async (record: RecordJSON): Promise<RecordJSON> => {
    const key = record?.params[properties.key]
    const storedBucket = properties.bucket && record?.params[properties.bucket]

    if (key) {
      // eslint-disable-next-line no-param-reassign
      record.params[filePathProperty] = await adapter.path(key, storedBucket || adapter.bucket)
    }

    return record
  }

  const fillPath = async (response: RecordActionResponse): Promise<RecordActionResponse> => {
    const { record } = response

    return {
      ...response,
      record: await fillRecordWithPath(record),
    }
  }

  const fillPaths = async (response: ListActionResponse): Promise<ListActionResponse> => {
    const { records } = response

    return {
      ...response,
      records: await Promise.all(records.map(fillRecordWithPath)),
    }
  }

  const custom: PropertyCustom = {
    fileProperty,
    filePathProperty,
    keyProperty: properties.key,
    bucketProperty: properties.bucket,
    mimeTypeProperty: properties.mimeType,
    // bucket property can be empty so default bucket has to be passed
    defaultBucket: adapter.bucket,
    mimeTypes: validation?.mimeTypes,
    maxSize: validation?.maxSize,
  }

  const uploadFeature = buildFeature({
    properties: {
      [fileProperty]: {
        custom,
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
    },
    actions: {
      show: {
        after: fillPath,
      },
      new: {
        before: stripFileFromPayload,
        after: [uploadFile, fillPath] },
      edit: {
        before: [stripFileFromPayload],
        after: [uploadFile, fillPath],
      },
      delete: {
        after: deleteFile,
      },
      list: {
        after: fillPaths,
      },
    },
  })

  return uploadFeature
}

export default uploadFileFeature
