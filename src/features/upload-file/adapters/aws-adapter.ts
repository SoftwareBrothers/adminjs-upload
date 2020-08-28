import { S3 } from 'aws-sdk'
import BaseAdapter from './base-adapter'

/**
 * AWS Credentials which can be set for S3 file upload.
 * If not given 'aws-sdk' will try to fetch them from
 * environmental variables.
 */
export type AWSCredentials = {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucket: string;
}

export default class AWSAdapter extends BaseAdapter {
  private s3: S3

  public bucket: string

  constructor(credentials: AWSCredentials) {
    super()
    this.bucket = credentials.bucket
    this.s3 = new S3(credentials)
  }

  public async upload(tmpFile: Buffer, key: string): Promise<S3.ManagedUpload.SendData> {
    return this.s3.upload({
      Bucket: this.bucket,
      Key: key,
      ACL: 'public-read',
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
      Expires: 86400,
    })
  }
}
