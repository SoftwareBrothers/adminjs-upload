import AdminBro, {
  buildFeature,
  RecordActionResponse,
  FeatureType,
  ListActionResponse,
  After,
} from 'admin-bro'

import { ERROR_MESSAGES } from './constants'
import { getProvider } from './utils/get-provider'
import { BaseProvider } from './providers'
import UploadOptions, { UploadOptionsWithDefault } from './types/upload-options.type'
import PropertyCustom from './types/property-custom.type'
import { updateRecordFactory } from './factories/update-record-factory'
import { fillRecordWithPath } from './utils/fill-record-with-path'
import { deleteFileFactory } from './factories/delete-file-factory'
import { deleteFilesFactory } from './factories/delete-files-factory'
import { stripPayloadFactory } from './factories/strip-payload-factory'

export type ProviderOptions = Required<Exclude<UploadOptions['provider'], BaseProvider>>

const DEFAULT_FILE_PROPERTY = 'file'
const DEFAULT_FILE_PATH_PROPERTY = 'filePath'
const DEFAULT_FILES_TO_DELETE_PROPERTY = 'filesToDelete'

const uploadFileFeature = (config: UploadOptions): FeatureType => {
  const { provider: providerOptions, validation, multiple } = config

  const configWithDefault: UploadOptionsWithDefault = {
    ...config,
    properties: {
      ...config.properties,
      file: config.properties?.file || DEFAULT_FILE_PROPERTY,
      filePath: config.properties?.filePath || DEFAULT_FILE_PATH_PROPERTY,
      filesToDelete: config.properties?.filesToDelete || DEFAULT_FILES_TO_DELETE_PROPERTY,
    },
  }

  const { properties } = configWithDefault
  const { provider, name: providerName } = getProvider(providerOptions)

  if (!properties.key) {
    throw new Error(ERROR_MESSAGES.NO_KEY_PROPERTY)
  }

  const stripFileFromPayload = stripPayloadFactory(configWithDefault)
  const updateRecord = updateRecordFactory(configWithDefault, provider)
  const deleteFile = deleteFileFactory(configWithDefault, provider)
  const deleteFiles = deleteFilesFactory(configWithDefault, provider)

  const fillPath: After<RecordActionResponse> = async (response, request, context) => {
    const { record } = response

    return {
      ...response,
      record: await fillRecordWithPath(record, context, configWithDefault, provider),
    }
  }

  const fillPaths: After<ListActionResponse> = async (response, request, context) => {
    const { records } = response

    return {
      ...response,
      records: await Promise.all(records.map((record) => (
        fillRecordWithPath(record, context, configWithDefault, provider)
      ))),
    }
  }

  const custom: PropertyCustom = {
    fileProperty: properties.file,
    filePathProperty: properties.filePath,
    filesToDeleteProperty: properties.filesToDelete,
    provider: providerName,
    keyProperty: properties.key,
    bucketProperty: properties.bucket,
    mimeTypeProperty: properties.mimeType,
    // bucket property can be empty so default bucket has to be passed
    defaultBucket: provider.bucket,
    mimeTypes: validation?.mimeTypes,
    maxSize: validation?.maxSize,
    multiple: !!multiple,
  }

  const uploadFeature = buildFeature({
    properties: {
      [properties.file]: {
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
