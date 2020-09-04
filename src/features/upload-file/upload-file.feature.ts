import AdminBro, {
  buildFeature,
  ActionRequest,
  ActionContext,
  RecordActionResponse,
  FeatureType,
  ListActionResponse,
  RecordJSON,
  UploadedFile,
} from 'admin-bro'
import { BulkActionResponse } from 'admin-bro/types/src/backend/actions/action.interface'
import buildPath from './build-path'
import AWSProvider from './providers/aws-provider'
import UploadOptions from './upload-options.type'
import PropertyCustom from './property-custom.type'
import BaseProvider from './providers/base-provider'
import LocalProvider from './providers/local-provider'

type ProviderOptions = Required<Exclude<UploadOptions['provider'], BaseProvider>>

const uploadFileFeature = (config: UploadOptions): FeatureType => {
  const { provider, properties, validation } = config

  let adapter: BaseProvider
  if (provider && (provider as BaseProvider).name === 'BaseAdapter') {
    adapter = provider as BaseProvider
  } else if (provider && (provider as ProviderOptions).aws) {
    const options = (provider as ProviderOptions).aws
    adapter = new AWSProvider(options)
  } else if (provider && (provider as ProviderOptions).local) {
    const options = (provider as ProviderOptions).local
    adapter = new LocalProvider(options)
  } else {
    throw new Error('You have to specify provider in options')
  }

  if (!properties.key) {
    throw new Error('You have to define `key` property in options')
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
        const uploadedFile: UploadedFile = file

        const oldRecord = { ...record }
        const key = buildPath(record, uploadedFile)

        await adapter.upload(uploadedFile, key)

        const params = {
          [properties.key]: key,
          ...properties.bucket && { [properties.bucket]: adapter.bucket },
          ...properties.size && { [properties.size]: uploadedFile.size.toString() },
          ...properties.mimeType && { [properties.mimeType]: uploadedFile.type },
          ...properties.filename && { [properties.filename]: uploadedFile.name },
        }

        await record.update(params)

        const oldKey = oldRecord.params[properties.key] && oldRecord.params[properties.key]
        const oldBucket = (
          properties.bucket && oldRecord.params[properties.bucket]
        ) || adapter.bucket

        if (oldKey && oldBucket && (oldKey !== key || oldBucket !== adapter.bucket)) {
          await adapter.delete(oldKey, oldBucket)
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
        await adapter.delete(key, storedBucket || adapter.bucket)
      }
    }))

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
