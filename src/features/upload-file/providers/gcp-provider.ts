// eslint-disable-next-line import/no-extraneous-dependencies
import type { DeleteFileResponse, UploadResponse, Storage } from '@google-cloud/storage'
import { UploadedFile } from 'adminjs'
import { DAY_IN_MINUTES } from '../constants.js'
import { BaseProvider } from './base-provider.js'

/**
 * Google Storage options which can be set for GCP file upload.
 * In order to setup GCP credentials you have to follow this
 * {@link https://cloud.google.com/docs/authentication/getting-started tutorial}.
 * Basically it comes down to downloading service account and setting GOOGLE_APPLICATION_CREDENTIALS
 * env variable. After that you are ready to go.
 * @memberof module:@adminjs/upload
 */
export type GCPOptions = {
  /**
   * Google Storage Bucket name, where files will be stored
   */
  bucket: string
  /**
   * indicates how long links should be available after page load (in minutes).
   * Default to 24h. If set to 0 adapter will mark uploaded files as public.
   */
  expires?: number;
}

let GCPStorage: typeof Storage | null = null
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  GCPStorage = (await import('@google-cloud/storage')).Storage
} catch (error) {
  GCPStorage = null
}

export class GCPProvider extends BaseProvider {
  private storage: Storage

  public expires: number

  constructor(options: GCPOptions) {
    super(options.bucket)

    if (!GCPStorage) {
      throw new Error(
        'You have to install "@google-cloud/storage" in order to run this plugin with GCP',
      )
    }

    // // this check is needed because option expires can be `0`
    this.expires = typeof options.expires === 'undefined'
      ? DAY_IN_MINUTES
      : options.expires
    this.storage = new GCPStorage()
  }

  public async upload(file: UploadedFile, key: string): Promise<UploadResponse> {
    return this.storage.bucket(this.bucket).upload(file.path, {
      gzip: true,
      destination: key,
      predefinedAcl: this.expires === 0 ? 'publicRead' : 'private',
    })
  }

  public async delete(key: string, bucket: string): Promise<DeleteFileResponse> {
    const gcpBucket = this.storage.bucket(bucket)
    const file = gcpBucket.file(key)
    return file.delete()
  }

  public async path(key: string, bucket: string): Promise<string> {
    const gcpBucket = this.storage.bucket(bucket)
    const file = gcpBucket.file(key)

    if (this.expires) {
      const files = await file.getSignedUrl({
        action: 'read',
        expires: new Date().valueOf() + this.expires * 1000,
      })
      return files[0]
    }
    // https://cloud.google.com/storage/docs/access-public-data#api-link
    return `https://storage.googleapis.com/${bucket}/${key}`
  }
}
