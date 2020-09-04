/**
 * @module @admin-bro/upload
 * @classdesc
 * AdminBro feature allowing you to upload files to a given resource.
 *
 * ## Installation
 *
 * To install the upload feature run:
 *
 * ```bash
 * yarn add @admin-bro/upload
 * ```
 *
 * ## Usage
 *
 * As any feature you have to pass it to the resource in {@link AdminBroOptions#resources}
 * property:
 *
 * ```
 * const AdminBro = require('admin-bro')
 * const uploadFeature = require('@admin-bro/upload')
 *
 * // part where you load adapter and models
 * const User = require('./user')
 *
 * const options = {
 *   resources: [{
 *     resource: User,
 *     features: [uploadFeature({
 *       credentials: { aws: { region, bucket, secretAccessKey ... } },
 *       properties: {
 *         key: 'fileUrl' // to this db field feature will safe S3 key
 *       },
 *       validation: {
 *         mimeTypes: 'application/pdf'
 *       }
 *     })]
 *   }]
 * }
 *
 * const adminBro = new AdminBro(options)
 * // and the rest of your app
 * ```
 *
 * ## Providers
 *
 * Right now plugin supports only AWS S3 as a file hosting.
 * New providers will come soon.
 *
 * ### AWS setup
 *
 * Make sure you have AWS-SDK installed
 *
 * ```
 * yarn add aws-sdk
 * ```
 *
 * In order to upload files to AWS S3, you have to
 * - [create a S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html)
 * - [get your access keys](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)
 *
 * Then fill all these data in {@link module:@admin-bro/upload.AWSOptions AWSOptions}
 * and you are ready to go.
 *
 * By default upload plugin generates urls valid for 24h, if you want them to be public always,
 * you need to create `public` bucket. Then set `expires` to `0`.
 *
 * ## Storing data
 *
 * @admin-bro/upload feature require just the one field in the database to store the
 * path (S3 key) of the uploaded file.
 *
 * But it also can store more data like `bucket`, 'mimeType', 'size' etc.
 * For the list of all available properties take a look at
 * {@link module:@admin-bro/upload.UploadOptions UploadOptions}
 *
 * ## Validation
 *
 * The feature can validate both:
 * - maximum size of the file
 * - available mime types
 *
 * Take a look at {@link module:@admin-bro/upload.UploadOptions UploadOptions} here as well.
 */

import uploadFileFeature from './features/upload-file/upload-file.feature'

export default uploadFileFeature

export { default as BaseAdapter } from './features/upload-file/adapters/base-adapter'
