import uploadFeature from '../../../../../src/index.js'
import { componentLoader } from '../../component-loader.js'
import { CreateResourceResult } from '../create-resource-result.type.js'
import { Multi } from '../../../multi/multi.entity.js'

const photoProperties = (options = {}) => ({
  bucket: {
    type: 'string',
    isVisible: false,
    ...options,
  },
  mime: {
    type: 'string',
    isVisible: false,
    ...options,
  },
  key: {
    type: 'string',
    isVisible: false,
    ...options,
  },
  size: {
    type: 'number',
    isVisible: false,
    ...options,
  },
} as const)

const uploadFeatureFor = (name?: string, multiple = false) => (
  uploadFeature({
    componentLoader,
    provider: {
      gcp: {
        bucket: process.env.GOOGLE_BUCKET as string,
        expires: 0,
      },
    },
    multiple,
    properties: {
      file: name ? `${name}.file` : 'file',
      filePath: name ? `${name}.filePath` : 'filePath',
      filesToDelete: name ? `${name}.filesToDelete` : 'filesToDelete',
      key: name ? `${name}.key` : 'key',
      mimeType: name ? `${name}.mime` : 'mime',
      bucket: name ? `${name}.bucket` : 'bucket',
      size: name ? `${name}.size` : 'size',
    },
    uploadPath: (record, filename) => (
      name ? `${record.id()}/${name}/${filename}` : `${record.id()}/global/${filename}`
    ),
  })
)

const photoPropertiesFor = (name, options = {}) => {
  const properties = photoProperties(options)
  return Object.keys(properties).reduce((memo, key) => ({
    ...memo, [`${name}.${key}`]: properties[key],
  }), {})
}

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
      images: {
        type: 'mixed',
      },
      ...photoProperties(),
      ...photoPropertiesFor('topPhoto'),
      ...photoPropertiesFor('bottomPhoto'),
      ...photoPropertiesFor('images', { isArray: true }),
    },
  },
  features: [
    uploadFeatureFor(),
    uploadFeatureFor('topPhoto'),
    uploadFeatureFor('bottomPhoto'),
    uploadFeatureFor('images', true),
  ],
})

export default createMultiResource
