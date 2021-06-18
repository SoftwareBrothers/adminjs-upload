AdminJS feature allowing you to upload files to a given resource.

## Features

* Upload files by using different providers (all included):
  * AWS S3
  * Google Cloud Storage
  * Local file system
* You can create Upload Provider and handle saving on your own with 3 methods
* Uploading more than one file to one resource to different fields
* Uploading multiple files to an array
* Configuration options allowing you to define which fields should be persisted and their names
in the database
* Previews of uploaded files

## Installation

To install the upload feature run:

```bash
yarn add @adminjs/upload
```

## Storing data

The main concept of the upload plugin is that it sends uploaded files to an external source via
the class called UploadProvider (we have 3 of them out of the box). And then it stores in the
database path and folder name where the file was stored. Where:

* **key** is the path of the stored file
* **bucket** is the name of the folder.

Next, base on the `expires` option, the system generates either a public URL or a time-constrained URL.

> Example: for 
> - `key: '927292/my-pinky-sweater.png'`
> - `bucket: 'aee-products'` and
> - `expires: 0`
>
> path for the file in AWS S3 will be 
> `https://aee-product.s3.amazonaws.com/927292/my-pinky-sweater.png` and it will be
> always available (not time-constrained)

Usually, buckets are the same for all the files handled by the feature it is optional
to store them in the database. But this might be handy if you want to change the bucket when the
project grows and have a reference where the old files went.

> To summarize: an important part is that **we don't store the actual URL** of the file - 
> we store `key` and based on that we compute path on every request.

## Usage

After that short introduction, let's go back to the feature itself.

As any feature you have to pass it to the resource in {@link AdminJsOptions#resources}
property:

```javascript
const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const uploadFeature = require('@adminjs/upload')

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

const adminJs = new AdminJS(options)
// and the rest of your app
```

## Previews

Feature support previews for both **audio** and 8*images**.
To make it work you have to have `mimeType` property mapped in the options.

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

To upload files to AWS S3, you have to
- [create a S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html)
- [get your access keys](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)

Then, fill all these data in {@link module:@adminjs/upload.AWSOptions AWSOptions}
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

Then, fill the bucket you created in {@link module:@adminjs/upload.GCPOptions GCPOptions}
and you are ready to go.

By default upload plugin generates a URL which is valid for 24h, if you want them to be always
`public`, you need to pass 0 as for `expire` parameter. Then set `expires` to `0`.

### Local Storage setup

Local storage will save files to the local folder.

There are 2 things you have to do before using this Provider.

#### 1. create the*folder** (`bucket`) for the files (i.e. `public`)

```sh
cd your-app
mkdir public
```

#### 2. tell your HTTP framework to host this folder

This is an example for the [express](https://expressjs.com) server

```
app.use('/uploads', express.static('uploads'));
```

Next you have to add @adminjs/upload to given resource:

```javascript
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
const { BaseProvider } = require('@adminjs/upload')

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

## Options

This feature requires just one field in the database to store the
path (Bucket key) of the uploaded file.

But it also can store more data like `bucket`, 'mimeType', 'size' etc. Fields mapping can be done
in `options.properties`.

Mapping fields is a process of telling @adminjs/upload that data from the field on the left
should go to the database under the field on the right.

> So below `key` property will be stored under the `mixed` property `uploadedFile` in its 
> sub-property `key` (mixed properties are JSONB properties in SQL databases or nested
> schemas in MongoDB).

Some properties are stored in the database, but some of them serve as the couriers in the
request/response cycle. So for example, `file` property is used to send actual File objects from
the Fronted to the Backend. Then, the File is uploaded and its `key` (and `bucket`) are stored.
But the value of property `file` itself is not being saved in the database, meaning you don't have
to have it in your DB schema.

### Example setup for mapping properties

```javascript
uploadFeature({
  provider: {},
  properties: {
    // virtual properties, created by this plugin on the go. They are not stored in the database
    // this is where frontend will send info to the backend
    file: `uploadedFile.file`,
    // here is where backend will send path to the file to the frontend [virtual property]
    filePath: `uploadedFile.file`,
    // here backend will send information which files has to be deleted
    // It is required only in `multiple` mode, but cannot overlap any other property
    filesToDelete: `uploadedFile.filesToDelete`,

    // DB properties: have to be in your schema
    // where bucket key will be stored
    key: `uploadedFile.key`,
    // where mime type will be stored
    mimeType: `uploadedFile.mime`,
    // where bucket name will be stored
    bucket: `uploadedFile.bucket`,
    // where size will be stored
    size: `uploadedFile.size`,
  },
})
```

In the example above we nest all the properties under `uploadedFile`, `mixed` property.
This convention is a convenient way of storing multiple files in one record.

For the list of all options take a look at
{@link UploadOptions UploadOptions}

## Storing multiple files in one model by invoking `uploadFeature` more than once

You can pass an array of features to AdminJS so that it allows you to define uploads multiple times
for one model. In other words you can have an `avatar` and `familyPhoto` in your User Resource.

In order to make that work you have to make sure that all the properties passed by each
`uploadFeature` invocation are different so they don't steal data from each other.

So:
* make sure to map at least `file`, `filePath` and `filesToDelete` properties to different values 
  in each upload.
* if you store other fields like `mimeType` they also should be stored under different paths.
* define the {@link UploadPathFunction} for each upload so that files do not override each other.

### Example:

```javascript

features = [
  uploadFeature({
    provider: {},
    properties: {
      file: `avatarFile`,
      filePath: `avatarFilePath`,
      filesToDelete: `avatarFilesToDelete`,
      key: `avatarKey`,
      mimeType: `avatarMime`,
      bucket: `avatarBucket`,
      size: `avatarSize`,
    },
  }),
  uploadFeature({
  provider: {},
  properties: {
    file: `familyPhoto.file`,
    filePath: `familyPhoto.file`,
    filesToDelete: `familyPhoto.filesToDelete`,
    key: `familyPhoto.key`,
    mimeType: `familyPhoto.mime`,
    bucket: `familyPhoto.bucket`,
    size: `familyPhoto.size`,
  },
  uploadPath: (record, filename) => (
    `${record.id()}/family-photos/${filename}`
  ),
})]
```

In the example above, all the fields are stored under different paths so during the
Frontend <-> Backend data transmission they don't overlap.

## Storing multiple files in one model by using `multiple` option

The feature allows you to store multiple files as an array. To do this you have to:

* set `multiple` option to true
* make sure that all your mapped properties are arrays of strings.

If you use let say sequelize adapter you can set the type of the property to JSONB and, in adminJs
options, define that this property is an array with {@link PropertyOptions.isArray}

## Validation

The feature can validate both:
- maximum size of the file
- available mime types

Take a look at {@link UploadOptions} here as well.

## Example models and addon configurations

Take a look at this database model working with google cloud for a reference:

### Sequelize database with Google Cloud

Take a look at an example product upload schema:

```javascript
export const ProductModel = sequelize.define('Products', {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  mainImage: {
    type: DataTypes.JSONB,
    allowNull: true,
  }
}, {
  // Other model options go here
})
```

It has 2 fields `images` and `topImage`. Let's define that images will have a multi-upload
feature and `topImage` single-upload feature.

By setting them as JSONB type we ensure that the plugin will setup their sub-properties as regular
strings (single-upload) or arrays (multi-upload).

To setup upload for 2 files we have to invoke `uploadFeature` twice as well:

```javascript

const validation = {
  mimeTypes: ['image/jpeg', 'image/png'],
}

const features = [
  uploadFileFeature({
    properties: {
      file: 'images.file',
      filePath: 'images.path',
      filename: 'images.filename',
      filesToDelete: 'images.toDelete',
      key: 'images.key',
      mimeType: 'images.mimeType',
      bucket: 'images.bucket',
    },
    multiple: true,
    provider: {
      gcp: {
        bucket: process.env.PRODUCTS_BUCKET as string,
        expires: 0,
      },
    },
    validation,
  }),
  uploadFeature({
    properties: {
      file: 'topImage.file',
      filePath: 'topImage.path',
      filename: 'topImage.filename',
      filesToDelete: 'topImage.toDelete',
      key: 'topImage.key',
      mimeType: 'topImage.mimeType',
      bucket: 'topImage.bucket',
    },
    provider: {
      gcp: {
        bucket: process.env.TOP_IMAGE_BUCKET as string,
        expires: 0,
      },
    },
    validation,
  }),
]
```


To see more examples, you can take a look at the example_app inside the repository.