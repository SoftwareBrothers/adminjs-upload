import fs from 'fs'
// eslint-disable-next-line import/no-extraneous-dependencies
import { S3, Endpoint } from 'aws-sdk'
import { UploadedFile } from 'adminjs'
import { ERROR_MESSAGES, DAY_IN_MINUTES } from '../constants'

import { BaseProvider } from './base-provider'

/**
 * AWS Credentials which can be set for S3 file upload.
 * If not given, 'aws-sdk' will try to fetch them from
 * environmental variables.
 * @memberof module:@adminjs/upload
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
   * The endpoint URI to send requests to.
   * The default endpoint is built from the configured region.
   */
  endpoint?: string | Endpoint;
  /**
   * indicates how long links should be available after page load (in minutes).
   * Default to 24h. If set to 0 adapter will mark uploaded files as PUBLIC ACL.
   */
  expires?: number;
}

/**
 * Generic S3 Provider for S3-compatible Object Storage Services, like Tencent Cloud COS.
 */
export class AWSProvider extends BaseProvider {
  private s3: S3

  public expires: number

  public endpoint?: Endpoint

  constructor(options: AWSOptions) {
    super(options.bucket)

    let AWS_S3: typeof S3
    try {
      // eslint-disable-next-line
      const AWS = require('aws-sdk')
      AWS_S3 = AWS.S3
    } catch (error) {
      throw new Error(ERROR_MESSAGES.NO_AWS_SDK)
    }
    const newOptions = options
    if (typeof newOptions.endpoint === 'string') {
      // convert into Endpoint object
      newOptions.endpoint = new Endpoint(newOptions.endpoint)
    }
    this.expires = newOptions.expires ?? DAY_IN_MINUTES
    this.endpoint = newOptions.endpoint
    this.s3 = new AWS_S3(newOptions)
  }

  public async upload(file: UploadedFile, key: string): Promise<S3.ManagedUpload.SendData> {
    const uploadOptions = { partSize: 5 * 1024 * 1024, queueSize: 10 }
    const tmpFile = fs.createReadStream(file.path)
    const params: S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: tmpFile,
    }
    if (!this.expires) {
      params.ACL = 'public-read'
    }
    return this.s3.upload(params, uploadOptions).promise()
  }

  public async delete(key: string, bucket: string): Promise<S3.DeleteObjectOutput> {
    return this.s3.deleteObject({ Key: key, Bucket: bucket }).promise()
  }

  public async path(key: string, bucket: string): Promise<string> {
    if (this.expires) {
      return this.s3.getSignedUrl('getObject', {
        Key: key,
        Bucket: bucket,
        Expires: this.expires,
      })
    }

    let keyedPath: string

    if (this.endpoint) {
      keyedPath = `${this.endpoint.protocol}://${this.endpoint.host}/${key}`
    } else {
      // https://bucket.s3.amazonaws.com/key
      keyedPath = `https://${bucket}.s3.amazonaws.com/${key}`
    }
    return keyedPath
  }
}
