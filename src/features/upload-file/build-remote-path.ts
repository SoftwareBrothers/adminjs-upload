import path from 'path'
import { BaseRecord, UploadedFile } from 'admin-bro'
import { ERROR_MESSAGES } from './constants'
import { UploadPathFunction } from './upload-options.type'

/**
 * Creates a path to the file. Related to the given provider. If it is an AWS
 * path is related to the bucket.
 *
 * @param   {BaseRecord}  record
 * @param   {string}      path        file path
 * @param   {UploadPathFunction}      [pathFunction]
 *
 * @return  {string}
 * @private
 */
export const buildRemotePath = (
  record: BaseRecord,
  file: UploadedFile,
  uploadPathFunction?: UploadPathFunction,
): string => {
  if (!record.id()) {
    throw new Error(ERROR_MESSAGES.NO_PERSISTENT_RECORD_UPLOAD)
  }
  if (!file.name) {
    throw new Error(ERROR_MESSAGES.NO_FILENAME)
  }
  const { ext, name } = path.parse(file.name)

  if (uploadPathFunction) {
    return uploadPathFunction(record, `${name}${ext}`)
  }

  return `${record.id()}/${name}${ext}`
}
