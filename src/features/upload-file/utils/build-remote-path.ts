import { BaseRecord, UploadedFile } from 'adminjs'
import path from 'path'
import { ERROR_MESSAGES } from '../constants.js'
import { UploadPathFunction } from '../types/upload-options.type.js'

/**
 * Creates a path to the file. Related to the given provider. If it is an AWS
 * path is related to the bucket.
 *
 * @param   {BaseRecord}  record
 * @param   {UploadedFile} file  uploaded file
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
