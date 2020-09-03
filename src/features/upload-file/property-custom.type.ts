import { MimeType } from './mime-types.type'

/**
 * @private
 *
 * Custom ({@link PropertyOptions#custom}) properties passed down to the component.
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
