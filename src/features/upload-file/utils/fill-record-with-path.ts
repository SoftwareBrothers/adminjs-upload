import { RecordJSON, ActionContext, flat } from 'admin-bro'
import { BaseProvider } from '../providers'
import { UploadOptionsWithDefault } from '../types/upload-options.type'

export const fillRecordWithPath = async (
  record: RecordJSON,
  context: ActionContext,
  uploadOptionsWithDefault: UploadOptionsWithDefault,
  provider: BaseProvider,
): Promise<RecordJSON> => {
  const { properties, multiple, parentArray } = uploadOptionsWithDefault

  const getPath = async (
    keyProperty: string,
    bucketProperty?: string,
  ): Promise<string | string[] | undefined> => {
    const key = flat.get(record?.params, keyProperty)
    const storedBucket = bucketProperty && flat.get(record?.params, bucketProperty)

    if (multiple && key && key.length) {
      return Promise.all(key.map(async (singleKey, index) => (
        provider.path(
          singleKey, storedBucket?.[index] ?? provider.bucket, context,
        )
      )))
    }

    if (!multiple && key) {
      return provider.path(
        key, storedBucket ?? provider.bucket, context,
      )
    }

    return undefined
  }

  const { key, bucket, filePath } = properties
  let { params } = record

  if (parentArray) {
    const items: Record<string, any>[] = flat.get(params, parentArray)
    if (items) {
      await Promise.all(items.map(async (_item, index) => {
        const path = await getPath(
          [parentArray, index, key].join(flat.DELIMITER),
          bucket && [parentArray, index, bucket].join(flat.DELIMITER),
        )
        params = flat.set(params, [parentArray, index, filePath].join(flat.DELIMITER), path)
      }))
    }
  } else {
    params = flat.set(params, filePath, await getPath(key, bucket))
  }

  return { ...record, params }
}
