/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import uploadFeature, { BaseProvider } from '@admin-bro/upload'

import { CreateResourceResult } from '../create-resource-result.type'
import { Custom } from '../../../custom/custom.entity'

class MyProvider extends BaseProvider {
  constructor() {
    super('bucketName')
  }

  public async upload() {
    console.log('uploaded')
    return true
  }

  public async delete() {
    console.log('deleted')
    return true
  }

  public async path() {
    return '/fle-url'
  }
}

const createPhotoResource = (): CreateResourceResult<typeof Custom> => ({
  resource: Custom,
  options: {
    properties: { file: { isVisible: { list: true, show: true, edit: true, filter: false } } },
  },
  features: [uploadFeature({
    provider: new MyProvider(),
    properties: { file: 'file', key: 'filePath', bucket: 'bucket' },
    validation: { mimeTypes: ['image/png'] },
  })],
})

export default createPhotoResource
