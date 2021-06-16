import {
  flat,
  RecordActionResponse,
  ActionRequest,
  ActionContext,
  UploadedFile,
  After,
  BaseRecord,
} from 'admin-bro'

import { buildRemotePath } from '../utils/build-remote-path'
import { BaseProvider } from '../providers'
import { UploadOptionsWithDefault } from '../types/upload-options.type'
import { DB_PROPERTIES } from '../constants'
import { getNamespaceFromContext } from './strip-payload-factory'

export const updateRecordFactory = (
  uploadOptionsWithDefault: UploadOptionsWithDefault,
  provider: BaseProvider,
): After<RecordActionResponse> => {
  const { properties: origProperties, uploadPath, multiple, parentArray } = uploadOptionsWithDefault

  const processProperties = async (
    record: BaseRecord,
    context: ActionContext,
    properties: UploadOptionsWithDefault['properties'],
  ) => {
    const {
      [properties.file]: files,
      [properties.filesToDelete]: filesToDelete,
    } = getNamespaceFromContext(context)

    if (multiple && filesToDelete && filesToDelete.length) {
      const filesData = (filesToDelete as Array<string>).map((index) => ({
        key: record.get(properties.key)[index] as string,
        bucket: record.get(properties.bucket)[index] as string | undefined,
      }))

      await Promise.all(filesData.map(async (fileData) => (
        provider.delete(fileData.key, fileData.bucket || provider.bucket, context)
      )))

      const newParams = DB_PROPERTIES.reduce((params, propertyName: string) => {
        if (properties[propertyName]) {
          const filtered = record.get(properties[propertyName]).filter((el, i) => (
            !filesToDelete.includes(i.toString())
          ))
          return flat.set(params, properties[propertyName], filtered)
        }
        return params
      }, {})

      record.storeParams(newParams)
    }
    if (multiple && files) {
      const uploadedFiles = files as Array<UploadedFile>

      const keys = await Promise.all<string>(uploadedFiles.map(async (uploadedFile) => {
        const key = buildRemotePath(record, uploadedFile, uploadPath)
        await provider.upload(uploadedFile, key, context)
        return key
      }))

      let params = flat.set({}, properties.key, [
        ...(record.get(properties.key) || []),
        ...keys,
      ])
      if (properties.bucket) {
        params = flat.set(params, properties.bucket, [
          ...(record.get(properties.bucket) || []),
          ...uploadedFiles.map(() => provider.bucket),
        ])
      }
      if (properties.size) {
        params = flat.set(params, properties.size, [
          ...(record.get(properties.size) || []),
          ...uploadedFiles.map((file) => file.size),
        ])
      }
      if (properties.mimeType) {
        params = flat.set(params, properties.mimeType, [
          ...(record.get(properties.mimeType) || []),
          ...uploadedFiles.map((file) => file.type),
        ])
      }
      if (properties.filename) {
        params = flat.set(params, properties.filename, [
          ...(record.get(properties.filename) || []),
          ...uploadedFiles.map((file) => file.name),
        ])
      }

      record.storeParams(params)
      return
    }

    if (!multiple && files && files.length) {
      const uploadedFile: UploadedFile = files[0]

      const oldRecordParams = { ...record.params }
      const key = buildRemotePath(record, uploadedFile, uploadPath)

      await provider.upload(uploadedFile, key, context)

      const params = {
        [properties.key]: key,
        ...properties.bucket && { [properties.bucket]: provider.bucket },
        ...properties.size && { [properties.size]: uploadedFile.size?.toString() },
        ...properties.mimeType && { [properties.mimeType]: uploadedFile.type },
        ...properties.filename && { [properties.filename]: uploadedFile.name as string },
      }

      record.storeParams(params)

      const oldKey = oldRecordParams[properties.key] && oldRecordParams[properties.key]
      const oldBucket = (
        properties.bucket && oldRecordParams[properties.bucket]
      ) || provider.bucket

      if (oldKey && oldBucket && (oldKey !== key || oldBucket !== provider.bucket)) {
        await provider.delete(oldKey, oldBucket, context)
      }

      return
    }

    // someone wants to remove one file
    if (!multiple && files === null) {
      const bucket = (properties.bucket && record.get(properties.bucket)) || provider.bucket
      const key = record.get(properties.key) as string | undefined

      // and file exists
      if (key && bucket) {
        const params = {
          [properties.key]: null,
          ...properties.bucket && { [properties.bucket]: null },
          ...properties.size && { [properties.size]: null },
          ...properties.mimeType && { [properties.mimeType]: null },
          ...properties.filename && { [properties.filename]: null },
        }

        record.storeParams(params)
        await provider.delete(key, bucket, context)
      }
    }
  }

  const updateRecord = async (
    response: RecordActionResponse,
    request: ActionRequest,
    context: ActionContext,
  ): Promise<RecordActionResponse> => {
    const { method } = request
    const { record } = context

    if (method !== 'post') {
      return response
    }

    if (record && record.isValid()) {
      const data = getNamespaceFromContext(context)

      if (parentArray) {
        const items: Record<string, any>[] = flat.get(data, parentArray)
        if (items) {
          // Call processProperties with the properties mapped for each aray item.
          await Promise.all(items.map(async (_item, index) => {
            const basePath = [parentArray, index].join(flat.DELIMITER)
            const mappedProperties = Object.keys(origProperties).reduce((memo, prop) => ({
              ...memo,
              [prop]: [basePath, origProperties[prop]].join(flat.DELIMITER),
            }), { ...origProperties })
            return processProperties(
              record,
              context,
              mappedProperties,
            )
          }))
        }
      }

      await processProperties(record, context, origProperties)

      // Save any updates made by record.storeParams
      await record.save()

      return {
        ...response,
        record: record.toJSON(context.currentAdmin),
      }
    }

    return response
  }

  return updateRecord
}
