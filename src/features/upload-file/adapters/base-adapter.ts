/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Abstract class which is a base for every @admin-bro/upload Adapter.
 *
 * In order to implement your own - you have to override all of its methods.
 * Next, you can pass it with: {@link UploadOptions#provider}
 */
abstract class BaseAdapter {
  /**
   * Name is used to verify if the object passed by {@link UploadOptions#provider} is
   * this type. We cannot check typeof because there could be a different versions of
   * npm package installed in a project.
   */
  public name: string

  /**
   * Bucket is a place where files should be stored. Usually it is a folder location
   */
  public bucket: string

  /**
   *
   * @param bucket place where files should be stored
   * @param options adapter options
   */
  constructor(bucket: string) {
    this.name = 'BaseAdapter'
    this.bucket = bucket
  }

  /**
   * Uploads file to given bucket
   *
   * @param tmpFile buffer holding file to upload
   * @param key file path
   */
  public abstract async upload (tmpFile: Buffer, key: string): Promise<any>

  /**
   * Deletes given file
   *
   * @param key file path
   * @param bucket where file should be uploaded
   */
  public abstract async delete (key: string, bucket: string): Promise<any>

  /**
   * Returns path for the file from where it can be downloaded. It is dynamic in case of
   * time based paths: i.e. link valid in the next 24h
   *
   * @param key file path
   * @param bucket where file should be put
   */
  public abstract async path (key: string, bucket: string): Promise<any>
}

export default BaseAdapter
