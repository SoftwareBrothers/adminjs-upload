import path from 'path'
import { BaseRecord, UploadedFile } from 'admin-bro'
import { ERROR_MESSAGES } from './constants'

/**
 * Creates a path to the file. Related to the given provider. If it is an AWS
 * path is related to the bucket.
 *
 * @param   {BaseRecord}  record
 * @param   {string}      path        file path
 *
 * @return  {string}
 * @private
 */
const buildRemotePath = (
  record: BaseRecord,
  file: UploadedFile,
): string => {
  if (!record.id()) {
    throw new Error(ERROR_MESSAGES.NO_PERSISTENT_RECORD_UPLOAD)
  }
  if (!file.name) {
    throw new Error(ERROR_MESSAGES.NO_FILENAME)
  }
  const { ext, name } = path.parse(file.name)

  return `${record.id()}/${name}${ext}`
}

export default buildRemotePath
