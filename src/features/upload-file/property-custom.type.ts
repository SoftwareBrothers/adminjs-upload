import { MimeType } from './mime-types.type'

type PropertyCustom = {
  filePathProperty: string,
  fileProperty: string,
  keyProperty: string,
  fileNameProperty?: string,
  mimeTypeProperty?: string,
  bucketProperty?: string,
  defaultBucket: string,
  mimeTypes?: Array<MimeType>,
  maxSize?: number,
}

export default PropertyCustom
