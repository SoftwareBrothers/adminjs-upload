import AdminBro, {
  buildFeature,
  ActionRequest,
  ActionContext,
  RecordActionResponse,
  FeatureType,
  ListActionResponse,
  RecordJSON,
  UploadedFile,
  BulkActionResponse,
  After,
} from 'admin-bro'

import { ERROR_MESSAGES } from './constants'
import { getProvider } from './get-provider'
import { buildRemotePath } from './build-remote-path'
import { BaseProvider } from './providers'
import UploadOptions from './upload-options.type'
import PropertyCustom from './property-custom.type'
import { validateProperties } from './validate-properties'

export type ProviderOptions = Required<Exclude<UploadOptions['provider'], BaseProvider>>

const uploadFileFeature = (config: UploadOptions): FeatureType => {
  const { provider: providerOptions, properties, validation, uploadPath } = config

  const { provider, name: providerName } = getProvider(providerOptions)

  validateProperties(properties)

  if (!properties.key) {
    throw new Error(ERROR_MESSAGES.NO_KEY_PROPERTY)
  }

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

  const updateRecord = async (
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
        const bucket = (properties.bucket && record[properties.bucket]) || provider.bucket
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
          await provider.delete(key, bucket, context)

          return {
            ...response,
            record: record.toJSON(context.currentAdmin),
          }
        }
      }
      if (file) {
        const uploadedFile: UploadedFile = file

        const oldRecordParams = { ...record.params }
        const key = buildRemotePath(record, uploadedFile, uploadPath)

        await provider.upload(uploadedFile, key, context)

        const params = {
          [properties.key]: key,
          ...properties.bucket && { [properties.bucket]: provider.bucket },
          ...properties.size && { [properties.size]: uploadedFile.size.toString() },
          ...properties.mimeType && { [properties.mimeType]: uploadedFile.type },
          ...properties.filename && { [properties.filename]: uploadedFile.name as string },
        }

        await record.update(params)

        const oldKey = oldRecordParams[properties.key] && oldRecordParams[properties.key]
        const oldBucket = (
          properties.bucket && oldRecordParams[properties.bucket]
        ) || provider.bucket

        if (oldKey && oldBucket && (oldKey !== key || oldBucket !== provider.bucket)) {
          await provider.delete(oldKey, oldBucket, context)
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
      await provider.delete(key, storedBucket || provider.bucket, context)
    }
    return response
  }

  const deleteFiles = async (
    response: BulkActionResponse,
    request: ActionRequest,
    context: ActionContext,
  ): Promise<BulkActionResponse> => {
    const { records = [] } = context

    await Promise.all(records.map(async (record) => {
      const key = record?.param(properties.key)
      if (record && key) {
        const storedBucket = properties.bucket && record.param(properties.bucket)
        await provider.delete(key, storedBucket || provider.bucket, context)
      }
    }))

    return response
  }

  const fillRecordWithPath = async (
    record: RecordJSON, context: ActionContext,
  ): Promise<RecordJSON> => {
    const key = record?.params[properties.key]
    const storedBucket = properties.bucket && record?.params[properties.bucket]

    if (key) {
      // eslint-disable-next-line no-param-reassign
      record.params[filePathProperty] = await provider.path(
        key, storedBucket || provider.bucket, context,
      )
    }

    return record
  }

  const fillPath: After<RecordActionResponse> = async (response, request, context) => {
    const { record } = response

    return {
      ...response,
      record: await fillRecordWithPath(record, context),
    }
  }

  const fillPaths: After<ListActionResponse> = async (response, request, context) => {
    const { records } = response

    return {
      ...response,
      records: await Promise.all(records.map((record) => fillRecordWithPath(record, context))),
    }
  }

  const custom: PropertyCustom = {
    fileProperty,
    filePathProperty,
    provider: providerName,
    keyProperty: properties.key,
    bucketProperty: properties.bucket,
    mimeTypeProperty: properties.mimeType,
    // bucket property can be empty so default bucket has to be passed
    defaultBucket: provider.bucket,
    mimeTypes: validation?.mimeTypes,
    maxSize: validation?.maxSize,
  }

  const uploadFeature = buildFeature({
    properties: {
      [fileProperty]: {
        custom,
        isVisible: { show: true, edit: true, list: true, filter: false },
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
        after: [updateRecord, fillPath] },
      edit: {
        before: [stripFileFromPayload],
        after: [updateRecord, fillPath],
      },
      delete: {
        after: deleteFile,
      },
      list: {
        after: fillPaths,
      },
      bulkDelete: {
        after: deleteFiles,
      },
    },
  })

  return uploadFeature
}

export default uploadFileFeature
