import { BaseRecord, ComponentLoader } from 'adminjs'
import { AWSOptions } from '../providers/aws-provider.js'
import { BaseProvider } from '../providers/base-provider.js'
import { GCPOptions } from '../providers/gcp-provider.js'
import { LocalUploadOptions } from '../providers/local-provider.js'

/**
 * Function which defines where in the bucket file should be stored.
 * If we have 2 uploads in one resource we might need to set them to
 * - `${record.id()}/upload1/${filename}`
 * - `${record.id()}/upload2/${filename}`
 *
 * By default system uploads files to: `${record.id()}/${filename}`
 *
 * @memberof module:@adminjs/upload
 * @alias UploadPathFunction
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

/**
 * Configuration options for @adminjs/upload feature
 *
 * @alias UploadOptions
 * @memberof module:@adminjs/upload
 */
export type UploadOptions = {
  /**
   * Your ComponentLoader instance. It is required for the feature to add it's components.
   */
  componentLoader: ComponentLoader;
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
     * frontend to the backend in the request payload. Default to `file`
     */
    file?: string;

    /**
     * Virtual property needed used when upload works in `multiple` mode. It contains all the keys
     * of the files which should be deleted. Default to `filesToDelete`
     */
    filesToDelete?: string
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
  /**
   * Indicates if feature should handle uploading multiple files
   */
  multiple?: boolean,

  /** Validation rules */
  validation?: {
    /**
     * Available mime types
     */
    mimeTypes?: Array<string>,
    /**
     * Maximum size in bytes
     */
    maxSize?: number,
  },
}

export type UploadOptionsWithDefault = {
  properties: Exclude<UploadOptions['properties'], 'filePath' | 'file' | 'filesToDelete'> & {
    filePath: string,
    file: string,
    filesToDelete: string
  }
} & Exclude<UploadOptions, 'properties'>

export type FeatureInvocation = {
  properties: Partial<UploadOptions['properties']>
}

export type ProviderOptions = Required<Exclude<UploadOptions['provider'], BaseProvider>>

export type AvailableDefaultProviders = keyof ProviderOptions | 'base'

export default UploadOptions
