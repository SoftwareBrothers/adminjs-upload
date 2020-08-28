import { S3 } from 'aws-sdk'
import BaseAdapter from './base-adapter'

/**
 * AWS Credentials which can be set for S3 file upload.
 * If not given 'aws-sdk' will try to fetch them from
 * environmental variables.
 * @memberof module:@admin-bro/upload
 */
export type AWSOptions = {
  /**
   * AWS IAM accessKeyId. By default its value is taken from AWS_ACCESS_KEY_ID env variable
  */
  accessKeyId?: string;
  /**
   * AWS IAM secretAccessKey. By default its value is taken from AWS_SECRET_ACCESS_KEY env variable
   */
  secretAccessKey?: string;
  /**
   * AWS region where your bucket was created.
  */
  region: string;
  /**
   * S3 Bucket where files will be stored
   */
  bucket: string;
  /**
   * indicates how long links should be available after page load (in minutes).
   * Default to 24h
   */
  expires?: number;
}

export default class AWSAdapter extends BaseAdapter {
  private s3: S3

  public bucket: string

  public expires: number

  constructor(options: AWSOptions) {
    super()
    this.bucket = options.bucket
    this.expires = options.expires || 86400
    this.s3 = new S3(options)
  }

  public async upload(tmpFile: Buffer, key: string): Promise<S3.ManagedUpload.SendData> {
    return this.s3.upload({
      Bucket: this.bucket,
      Key: key,
      Body: tmpFile,
    }).promise()
  }

  public async delete(key: string, bucket: string): Promise<S3.DeleteObjectOutput> {
    return this.s3.deleteObject({ Key: key, Bucket: bucket }).promise()
  }

  public async path(key: string, bucket: string): Promise<string> {
    return this.s3.getSignedUrl('getObject', {
      Key: key,
      Bucket: bucket,
      Expires: this.expires,
    })
  }
}
