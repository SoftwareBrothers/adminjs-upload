import uploadFeature from '../../../../../src/index.js'
import { componentLoader } from '../../component-loader.js'
import { CreateResourceResult } from '../create-resource-result.type.js'
import { Photo } from '../../../photo/photo.entity.js'

const createPhotoResource = (): CreateResourceResult<typeof Photo> => ({
  resource: Photo,
  options: {
    listProperties: ['id', 's3Key', 'bucket', 'path'],
  },
  features: [uploadFeature({
    componentLoader,
    provider: { local: { bucket: 'public', opts: {} } },
    properties: { file: 'file', key: 's3Key', bucket: 'bucket', mimeType: 'mime' },
    validation: { mimeTypes: ['image/png'] },
  })],
})

export default createPhotoResource
