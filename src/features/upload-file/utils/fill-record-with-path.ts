import { RecordJSON, ActionContext, flat } from 'adminjs'
import { BaseProvider } from '../providers'
import { UploadOptionsWithDefault } from '../types/upload-options.type'

export const fillRecordWithPath = async (
  record: RecordJSON,
  context: ActionContext,
  uploadOptionsWithDefault: UploadOptionsWithDefault,
  provider: BaseProvider,
): Promise<RecordJSON> => {
  const { properties, multiple, recordPath } = uploadOptionsWithDefault

  const key = flat.get(record?.params, properties.key)
  const storedBucket = properties.bucket && flat.get(record?.params, properties.bucket)

  let filePath: string | Array<string> | undefined
  if (!recordPath) {
    if (multiple && key && key.length) {
      filePath = await Promise.all(key.map(async (singleKey, index) => (
        provider.path(
          singleKey, storedBucket?.[index] ?? provider.bucket, context,
        )
      )))
    } else if (!multiple && key) {
      filePath = await provider.path(
        key, storedBucket ?? provider.bucket, context,
      )
    }
  } else {
    // disable calculation on-the-fly, and use recordPath instead
    filePath = key
  }

  return {
    ...record,
    params: flat.set(record.params, properties.filePath, filePath),
  }
}
