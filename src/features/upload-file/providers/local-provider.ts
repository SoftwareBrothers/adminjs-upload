import fs, { existsSync } from 'fs'
import path from 'path'
import { UploadedFile } from 'admin-bro'

import BaseAdapter from './base-provider'

/**
 * Options required by the LocalAdapter
 *
 * @memberof module:@admin-bro/upload
 */
export type LocalUploadOptions = {
  /**
   * Path where files will be stored. For example: `path.join(__dirname, '../public')`
   */
  bucket: string;
}

export default class LocalProvider extends BaseAdapter {
  constructor(options: LocalUploadOptions) {
    super(options.bucket)
    if (!existsSync(options.bucket)) {
      throw new Error(`directory: "${options.bucket}" does not exists. Create it before running LocalAdapter`)
    }
  }

  public async upload(file: UploadedFile, key: string): Promise<any> {
    const filePath = this.path(key)
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    await fs.promises.rename(file.path, filePath)
  }

  public async delete(key: string, bucket: string): Promise<any> {
    await fs.promises.unlink(this.path(key, bucket))
  }

  // eslint-disable-next-line class-methods-use-this
  public path(key: string, bucket?: string): string {
    return path.join(bucket || this.bucket, key)
  }
}
