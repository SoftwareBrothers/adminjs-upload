import { BaseRecord } from 'admin-bro'
import { AWSOptions } from './providers/aws-provider'
import { MimeType } from './mime-types.type'
import { BaseProvider } from './providers/base-provider'
import { LocalUploadOptions } from './providers/local-provider'
import { GCPOptions } from './providers/gcp-provider'

/**
 * Configuration options for @admin-bro/upload feature
 *
 * @memberof module:@admin-bro/upload
 */
export type UploadOptions = {
  /**
   * Options for the provider
   */
  provider: {
    /** AWS Credentials */
    aws?: AWSOptions,
    /** GCP Credentials */
    gcp?: GCPOptions,
    /** Storage on the local drive */
    local?: LocalUploadOptions
  } | BaseProvider,
  properties: {
    /**
     * Property under which file key (path) will be stored
     */
    key: string;
    /**
     * Virtual property where uploaded file will be passed to from
     * frontend to the backend in the request payload.
     * Default to `file`
     */
    file?: string;
    /**
     * Virtual property where path for uploaded file will be
     * generated and accessible on the frontend.
     * Default to `filePath`
     */
    filePath?: string
    /**
     * Property under which file bucket (folder) will be stored
     */
    bucket?: string;
    /**
     * Property under which file mime type will be stored.
     * When you give this system will show a correct icon by the
     * uploaded file
     */
    mimeType?: string;
    /**
     * Property under which file size will be stored
     */
    size?: string;
    /**
     * Property under which file name will be stored
     */
    filename?: string;
  },
  /**
   * Function which defines where the file should be placed inside the bucket.
   * Default to `${record.id()}/${filename}`.
   */
  uploadPath?: UploadPathFunction;
  /** Validation rules */
  validation?: {
    /**
     * Available mime types
     */
    mimeTypes?: Array<MimeType>,
    /**
     * Maximum size in bytes
     */
    maxSize?: number,
  },
}

/**
 * Function which defines where in the bucket file should be stored.
 * If we have 2 uploads in one resource we might need to set them to
 * - `${record.id()}/upload1/${filename}`
 * - `${record.id()}/upload2/${filename}`
 *
 * By default system uploads files to: `${record.id()}/${filename}`
 *
 * @memberof module:@admin-bro/upload
 */
export type UploadPathFunction = (
  /**
   * Record for which file is uploaded
   */
  record: BaseRecord,
  /**
   * filename with extension
   */
  filename: string,
) => string

export type ProviderOptions = Required<Exclude<UploadOptions['provider'], BaseProvider>>

export type AvailableDefaultProviders = keyof ProviderOptions | 'base'

export default UploadOptions
