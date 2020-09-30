import path from 'path'
import { BaseRecord, UploadedFile } from 'admin-bro'

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
    throw new Error('You cannot upload file for not persisted record. Save record first')
  }
  if (!file.name) {
    throw new Error('Server could not have verified the file name')
  }
  const { ext, name } = path.parse(file.name)

  return `${record.id()}/${name}${ext}`
}

export default buildRemotePath
