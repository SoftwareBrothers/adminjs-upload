import sinon from 'sinon'
import { UploadedFile } from 'admin-bro'

import { BaseProvider } from '../providers/base-provider'

const stubProvider = (resolvedS3Path: string): BaseProvider => {
  class StubProvider extends BaseProvider {
    public path = sinon.stub<[string, string], Promise<string>>().resolves(resolvedS3Path)

    public upload = sinon.stub<[UploadedFile, string], Promise<string>>().resolves(resolvedS3Path)

    public delete = sinon.stub<[string, string], Promise<string>>().resolves(resolvedS3Path)
  }
  return new StubProvider('bucketName')
}

export default stubProvider
