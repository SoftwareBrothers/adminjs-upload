import uploadFeature from '@admin-bro/upload'

import { CreateResourceResult } from '../create-resource-result.type'
import { Multi } from '../../../multi/multi.entity'

const photoProperties = {
  bucket: {
    type: 'string',
    isVisible: false,
  },
  mime: {
    type: 'string',
    isVisible: false,
  },
  key: {
    type: 'string',
    isVisible: false,
  },
  size: {
    type: 'number',
    isVisible: false,
  },
}

const uploadFeatureFor = (name?: string) => (
  uploadFeature({
    provider: {
      gcp: {
        bucket: process.env.GOOGLE_BUCKET as string,
        expires: 0,
      },
    },
    properties: {
      file: name ? `${name}.file` : 'file',
      filePath: name ? `${name}.filePath` : 'filePath',
      key: name ? `${name}.key` : 'key',
      mimeType: name ? `${name}.mime` : 'mime',
      bucket: name ? `${name}.bucket` : 'bucket',
      size: name ? `${name}.size` : 'size',
    },
    uploadPath: (record, filename) => (
      name ? `${record.id()}/${name}/${filename}` : `${record.id}/global/${filename}`
    ),
  })
)

const photoPropertiesFor = (name) => (
  Object.keys(photoProperties).reduce((memo, key) => ({
    ...memo, [`${name}.${key}`]: photoProperties[key],
  }), {})
)

const createMultiResource = (): CreateResourceResult<typeof Multi> => ({
  resource: Multi,
  options: {
    properties: {
      topPhoto: {
        type: 'mixed',
      },
      bottomPhoto: {
        type: 'mixed',
      },
      ...photoPropertiesFor('topPhoto'),
      ...photoPropertiesFor('bottomPhoto'),
    },
  },
  features: [
    uploadFeatureFor(),
    uploadFeatureFor('topPhoto'),
    uploadFeatureFor('bottomPhoto'),
  ],
})

export default createMultiResource
