import {
  ActionContext,
  ActionRequest,
  After,
  BulkActionResponse,
} from 'adminjs'
import { BaseProvider } from '../providers/index.js'
import { UploadOptionsWithDefault } from '../types/upload-options.type.js'
import { deleteFile } from '../utils/delete-file.js'

export const deleteFilesFactory = (
  uploadOptionsWithDefault: UploadOptionsWithDefault,
  provider: BaseProvider,
): After<BulkActionResponse> => async function deleteFilesHook(
  response: BulkActionResponse,
  request: ActionRequest,
  context: ActionContext,
): Promise<BulkActionResponse> {
  const { records = [] } = context
  if (request.method === 'post') {
    await Promise.all(
      records.map(async (record) => {
        await deleteFile(uploadOptionsWithDefault, provider, context, record)
      }),
    )
  }

  return response
}
