import { RecordActionResponse, After, ActionRequest, ActionContext } from 'admin-bro/types/src'
import { BaseProvider } from '../providers'
import { UploadOptionsWithDefault } from '../types/upload-options.type'
import { deleteFile } from '../utils/delete-file'

export const deleteFileFactory = (
  uploadOptionsWithDefault: UploadOptionsWithDefault,
  provider: BaseProvider,
): After<RecordActionResponse> => async function deleteFileHook(
  response: RecordActionResponse,
  request: ActionRequest,
  context: ActionContext,
): Promise<RecordActionResponse> {
  const { record } = context
  await deleteFile(uploadOptionsWithDefault, provider, context, record)
  return response
}
