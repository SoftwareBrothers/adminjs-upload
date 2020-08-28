import { BaseRecord } from 'admin-bro'
import UploadConfig from './upload-config.type'

/**
 * Creates a path to the file. Related to the given provider. If it is an AWS
 * path is related to the bucket.
 *
 * @param   {BaseRecord}  record
 * @param   {Properties}  properties
 * @param   {string}      extension   file extension
 *
 * @return  {string}
 */
const buildRemotePath = (
  record: BaseRecord,
  properties: UploadConfig['properties'],
  extension: string,
): string => {
  if (!record.params.id) {
    throw new Error('you cannot upload file for not persisted record. Save record first')
  }
  const filename = properties.filename && record.params[properties.filename]
    ? record.params[properties.filename]
    : properties.file

  return `${record.params.id}/${filename}${extension}`
}

export default buildRemotePath
