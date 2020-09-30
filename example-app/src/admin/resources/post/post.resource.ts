import uploadFeature from '@admin-bro/upload'

import { CreateResourceResult } from '../create-resource-result.type'
import { Post } from '../../../post/post.entity'

const createPostResource = (): CreateResourceResult<typeof Post> => ({
  resource: Post,
  options: {
    listProperties: ['id', 'bucketKey', 'bucket', 'path'],
  },
  features: [uploadFeature({
    provider: {
      gcp: {
        bucket: 'admin-bro-demo-app-uploads',
        expires: 0,
      },
    },
    properties: { file: 'file', key: 'bucketKey', bucket: 'bucket', mimeType: 'mime' },
  })],
})

export default createPostResource
