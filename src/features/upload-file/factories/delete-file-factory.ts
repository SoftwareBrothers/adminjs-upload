import { ActionContext, ActionRequest, After, RecordActionResponse } from 'adminjs'
import { BaseProvider } from '../providers/index.js'
import { UploadOptionsWithDefault } from '../types/upload-options.type.js'
import { deleteFile } from '../utils/delete-file.js'

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
