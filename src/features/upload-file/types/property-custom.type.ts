import { ProviderOpts } from '../providers/base-provider.js'
import { MimeType } from './mime-types.type.js'

// src/features/upload-file/providers/base-provider.ts

/**
 * Custom ({@link PropertyOptions#custom}) properties passed down to the component.
 * @private
 */
type PropertyCustom = {
  filePathProperty: string;
  fileProperty: string;
  filesToDeleteProperty: string;
  keyProperty: string;
  fileNameProperty?: string;
  mimeTypeProperty?: string;
  bucketProperty?: string;
  defaultBucket: string;
  mimeTypes?: Array<MimeType | string>;
  maxSize?: number;
  provider: string;
  multiple: boolean;
  opts?: ProviderOpts;
};

export default PropertyCustom
