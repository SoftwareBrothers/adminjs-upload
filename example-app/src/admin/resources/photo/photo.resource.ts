import uploadFeature from '@admin-bro/upload'
import { Photo } from '../../../photo/photo.entity'
import { CreateResourceResult } from '../create-resource-result.type'
import credentials from '../../../credentials'

const createPhotoResource = (): CreateResourceResult<typeof Photo> => ({
  resource: Photo,
  options: {
    listProperties: ['id', 's3Key', 'bucket', 'path'],
    actions: {
      bulkDelete: {
        isAccessible: (): boolean => false,
      },
    },
  },
  features: [uploadFeature({
    provider: { aws: credentials },
    properties: { file: 'file', key: 's3Key', bucket: 'bucket' },
    validation: { mimeTypes: ['application/pdf'] },
  })],
})

export default createPhotoResource
