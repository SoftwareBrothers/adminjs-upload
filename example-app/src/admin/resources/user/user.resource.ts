import uploadFeature from '@adminjs/upload'
import { CreateResourceResult } from '../create-resource-result.type'
import credentials from '../../../credentials'
import { User } from '../../../user/user.entity'

const createUserResource = (): CreateResourceResult<typeof User> => ({
  resource: User,
  options: {
    listProperties: ['id', 'avatar', 'email', 'test'],
  },
  features: [uploadFeature({
    provider: { aws: credentials },
    properties: {
      filename: 'name',
      file: 'test',
      key: 'avatar',
      bucket: 's3Bucket',
      size: 'sajz',
      mimeType: 'majmtajp',
    },
  })],
})

export default createUserResource
