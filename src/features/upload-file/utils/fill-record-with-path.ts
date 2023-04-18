import { ActionContext, flat, RecordJSON } from 'adminjs'
import { BaseProvider } from '../providers/index.js'
import { UploadOptionsWithDefault } from '../types/upload-options.type.js'

export const fillRecordWithPath = async (
  record: RecordJSON,
  context: ActionContext,
  uploadOptionsWithDefault: UploadOptionsWithDefault,
  provider: BaseProvider,
): Promise<RecordJSON> => {
  const { properties, multiple } = uploadOptionsWithDefault

  const key = flat.get(record?.params, properties.key)
  const storedBucket = properties.bucket && flat.get(record?.params, properties.bucket)

  let filePath: string | Array<string> | undefined
  if (multiple && key && key.length) {
    filePath = await Promise.all(key.map(async (singleKey, index) => (
      provider.path(singleKey, storedBucket?.[index] ?? provider.bucket, context)
    )))
  } else if (!multiple && key) {
    filePath = await provider.path(key, storedBucket ?? provider.bucket, context)
  }

  return {
    ...record,
    params: flat.set(record.params, properties.filePath, filePath),
  }
}
