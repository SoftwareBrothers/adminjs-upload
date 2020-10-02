AdminBro feature allowing you to upload files to a given resource.

## Installation

To install the upload feature run:

```bash
yarn add @admin-bro/upload
```

## Usage

As any feature you have to pass it to the resource in {@link AdminBroOptions#resources}
property:

```javascript
const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const uploadFeature = require('@admin-bro/upload')

// part where you load adapter and models
const User = require('./user')

const options = {
  resources: [{
    resource: User,
    options: {
      listProperties: ['fileUrl', 'mimeType'],
    },
    features: [uploadFeature({
      provider: { aws: { region, bucket, secretAccessKey ... } },
      properties: {
        key: 'fileUrl' // to this db field feature will safe S3 key
        mimeType: 'mimeType' // this property is important because allows to have previews
      },
      validation: {
        mimeTypes: 'application/pdf'
      }
    })]
  }]
}

const adminBro = new AdminBro(options)
// and the rest of your app
```

## Previews

Feature support previews for both*audio** and*images**.
In order to make it work you have to have `mimeType` property mapped in the options.

Here we define that mime type will be save under a property `mimeType`:

```javascript
const options = {
  resources: [{
    resource: User,
    options: { properties: { mimeType: { /** ... **/ } }},
    features: [uploadFeature({
      provider: {},
      properties: {
        key: 'fileUrl',
        mimeType: 'mimeType'
      },
    })]
  }]
}
```

## Providers

Right now plugin supports both AWS S3 and Google Storage as a cloud hosting. Apart from that
you can store files locally.

### AWS setup

Make sure you have AWS-SDK installed

```bash
yarn add aws-sdk
```

In order to upload files to AWS S3, you have to
- [create a S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html)
- [get your access keys](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)

Then, fill all these data in {@link module:@admin-bro/upload.AWSOptions AWSOptions}
and you are ready to go.

By default upload plugin generates a URL which is valid for 24h, if you want them to be always
`public` (`public-acl`), you need to create a `public` bucket. Then set `expires` to `0`.

### Google Storage setup

Make sure you have Google Storage {@link https://github.com/googleapis/nodejs-storage Node SDK}
installed:

```sh
yarn add @google-cloud/storage
```


and you are authenticated. follow {@link https://cloud.google.com/docs/authentication/getting-started this tutorial}.

To upload files to AWS Google Storage, you have to follow all the instructions from:
{@link https://github.com/googleapis/nodejs-storage#before-you-begin}

Then, fill the bucket you created in {@link module:@admin-bro/upload.GCPOptions GCPOptions}
and you are ready to go.

By default upload plugin generates a URL which is valid for 24h, if you want them to be always
`public`, you need to pass 0 as for `expire` parameter. Then set `expires` to `0`.

### Local Storage setup

Local storage will save files to the local folder.

There are 2 things you have to do before using this Provider.

#### 1. create the*folder** (`bucket`) for the files (i.e. `public`)

```
cd your-app
mkdir public
```

#### 2. tell your HTTP framework to host this folder

This is an example for the [express](https://expressjs.com) server

```
app.use('/uploads', express.static('uploads'));
```

Next you have to add @admin-bro/upload to given resource:

```
* const options = {
  resources: [{
    resource: User,
    features: [uploadFeature({
      provider: { local: { bucket: 'public' } },
    })]
  }]
}
```

### Custom Provider

The plugin allows you also to pass your provider. In such a case, you have to pass to the `provider`
option an instance of the class extended from {@link BaseProvider}.

```
const { BaseProvider } = require('@admin-bro/upload')

class MyProvider extends BaseProvider {
  constructor() {
     // it requires bucket as a parameter to properly pass it to other methods
     super('public')
  }
  // your implementation goes here
}

const provider = new MyProvider()

const options = {
  resources: [{
    resource: User,
    features: [uploadFeature({ provider })]
  }]
}
```

## Storing data

This feature requires just one field in the database to store the
path (S3 key) of the uploaded file.

But it also can store more data like `bucket`, 'mimeType', 'size' etc.
For the list of all available properties take a look at
{@link module:@admin-bro/upload.UploadOptions UploadOptions}

## Validation

The feature can validate both:
- maximum size of the file
- available mime types

Take a look at {@link module:@admin-bro/upload.UploadOptions UploadOptions} here as well.
