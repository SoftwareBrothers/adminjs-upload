import {
  After,
  buildFeature, FeatureType,
  ListActionResponse,
  RecordActionResponse,
} from 'adminjs'

import { ERROR_MESSAGES } from './constants.js'
import { deleteFileFactory } from './factories/delete-file-factory.js'
import { deleteFilesFactory } from './factories/delete-files-factory.js'
import { stripPayloadFactory } from './factories/strip-payload-factory.js'
import { updateRecordFactory } from './factories/update-record-factory.js'
import { BaseProvider } from './providers/index.js'
import PropertyCustom from './types/property-custom.type.js'
import UploadOptions, { UploadOptionsWithDefault } from './types/upload-options.type.js'
import bundleComponent from './utils/bundle-component.js'
import { fillRecordWithPath } from './utils/fill-record-with-path.js'
import { getProvider } from './utils/get-provider.js'

export type ProviderOptions = Required<
  Exclude<UploadOptions['provider'], BaseProvider>
>;

const DEFAULT_FILE_PROPERTY = 'file'
const DEFAULT_FILE_PATH_PROPERTY = 'filePath'
const DEFAULT_FILES_TO_DELETE_PROPERTY = 'filesToDelete'

const uploadFileFeature = (config: UploadOptions): FeatureType => {
  const { componentLoader, provider: providerOptions, validation, multiple } = config

  const configWithDefault: UploadOptionsWithDefault = {
    ...config,
    properties: {
      ...config.properties,
      file: config.properties?.file || DEFAULT_FILE_PROPERTY,
      filePath: config.properties?.filePath || DEFAULT_FILE_PATH_PROPERTY,
      filesToDelete:
        config.properties?.filesToDelete || DEFAULT_FILES_TO_DELETE_PROPERTY,
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

  const fillPath: After<RecordActionResponse> = async (
    response,
    request,
    context,
  ) => {
    const { record } = response

    return {
      ...response,
      record: await fillRecordWithPath(
        record,
        context,
        configWithDefault,
        provider,
      ),
    }
  }

  const fillPaths: After<ListActionResponse> = async (
    response,
    request,
    context,
  ) => {
    const { records } = response

    return {
      ...response,
      records: await Promise.all(
        records.map((record) => fillRecordWithPath(record, context, configWithDefault, provider)),
      ),
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
    opts: provider?.opts,
  }

  const uploadFeature = () => {
    const editComponent = bundleComponent(componentLoader, 'UploadEditComponent')
    const listComponent = bundleComponent(componentLoader, 'UploadListComponent')
    const showComponent = bundleComponent(componentLoader, 'UploadShowComponent')
    return buildFeature({
      properties: {
        [properties.file]: {
          custom,
          isVisible: { show: true, edit: true, list: true, filter: false },
          components: {
            edit: editComponent,
            list: listComponent,
            show: showComponent,
          },
        },
      },
      actions: {
        show: {
          after: fillPath,
        },
        new: {
          before: stripFileFromPayload,
          after: [updateRecord, fillPath],
        },
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
  }

  return uploadFeature()
}

export default uploadFileFeature
