import uploadFeature from '../../../../../src/index.js'
import { componentLoader } from '../../component-loader.js'
import { CreateResourceResult } from '../create-resource-result.type.js'
import credentials from '../../../credentials.js'
import { User } from '../../../user/user.entity.js'

const createUserResource = (): CreateResourceResult<typeof User> => ({
  resource: User,
  options: {
    listProperties: ['id', 'avatar', 'email', 'test'],
  },
  features: [uploadFeature({
    componentLoader,
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
