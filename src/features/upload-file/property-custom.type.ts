import { MimeType } from './mime-types.type'

/**
 * Custom ({@link PropertyOptions#custom}) properties passed down to the component.
 * @private
 */
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
