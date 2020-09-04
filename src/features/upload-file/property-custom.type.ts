import { MimeType } from './mime-types.type'
import UploadOptions from './upload-options.type'
import BaseProvider from './providers/base-provider'

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
  provider: keyof Required<Exclude<UploadOptions['provider'], BaseProvider>> | 'base'
}

export default PropertyCustom
