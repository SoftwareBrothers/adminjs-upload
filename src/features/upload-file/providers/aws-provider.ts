import { UploadedFile } from 'adminjs'
import fs from 'fs'
// eslint-disable-next-line import/no-extraneous-dependencies
import { DeleteObjectCommandOutput, GetObjectCommand, PutObjectCommandInput, PutObjectCommandOutput, S3 } from '@aws-sdk/client-s3'
// eslint-disable-next-line import/no-extraneous-dependencies
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DAY_IN_MINUTES, ERROR_MESSAGES } from '../constants.js'
import { BaseProvider } from './base-provider.js'

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
   * indicates how long links should be available after page load (in minutes).
   * Default to 24h. If set to 0 adapter will mark uploaded files as PUBLIC ACL.
   */
  expires?: number;
}

let AWS_S3
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const AWS = await import('@aws-sdk/client-s3')
  AWS_S3 = AWS?.S3
} catch (error) {
  AWS_S3 = null
}

export class AWSProvider extends BaseProvider {
  protected s3: S3

  public expires: number

  constructor(options: AWSOptions) {
    super(options.bucket)

    if (!AWS_S3) {
      throw new Error(ERROR_MESSAGES.NO_AWS_SDK)
    }

    this.expires = options.expires ?? DAY_IN_MINUTES
    this.s3 = new AWS_S3(options)
  }

  public async upload(file: UploadedFile, key: string): Promise<PutObjectCommandOutput> {
    const tmpFile = fs.createReadStream(file.path)
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: tmpFile,
    }
    if (!this.expires) {
      params.ACL = 'public-read'
    }
    return this.s3.putObject(params)
  }

  public async delete(key: string, bucket: string): Promise<DeleteObjectCommandOutput> {
    return this.s3.deleteObject({ Key: key, Bucket: bucket })
  }

  public async path(key: string, bucket: string): Promise<string> {
    if (this.expires) {
      return getSignedUrl(
        this.s3,
        new GetObjectCommand({ Key: key, Bucket: bucket }),
        { expiresIn: this.expires },
      )
    }
    // https://bucket.s3.amazonaws.com/key
    return `https://${bucket}.s3.amazonaws.com/${key}`
  }
}
