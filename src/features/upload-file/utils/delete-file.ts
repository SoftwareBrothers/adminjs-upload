import { ActionContext, BaseRecord } from 'adminjs'
import { BaseProvider } from '../providers/index.js'
import { UploadOptionsWithDefault } from '../types/upload-options.type.js'

export const deleteFile = async (
  options: UploadOptionsWithDefault,
  provider: BaseProvider,
  context: ActionContext,
  record?: BaseRecord,
): Promise<void> => {
  const { properties, multiple } = options
  const key = record?.get(properties.key)

  if (record && key && !multiple) {
    const storedBucket = properties.bucket && record.get(properties.bucket) as string
    await provider.delete(key as string, storedBucket || provider.bucket, context)
  } else if (record && multiple && key && (key as Array<string>).length) {
    const storedBuckets = properties.bucket ? record.get(properties.bucket) as Array<string> : []
    await Promise.all((key as Array<string>).map(async (singleKey, index) => (
      provider.delete(singleKey as string, storedBuckets[index] || provider.bucket, context)
    )))
  }
}
