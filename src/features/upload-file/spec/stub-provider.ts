import { UploadedFile } from 'adminjs'
import sinon from 'sinon'
import { BaseProvider } from '../providers/base-provider.js'

const stubProvider = (resolvedS3Path?: string): BaseProvider => {
  const resolvedPath = resolvedS3Path || '/someS3Path.png'

  class StubProvider extends BaseProvider {
    public path = sinon.stub<[string, string], Promise<string>>().resolves(resolvedPath)

    public upload = sinon.stub<[UploadedFile, string], Promise<string>>().resolves(resolvedPath)

    public delete = sinon.stub<[string, string], Promise<string>>().resolves(resolvedPath)
  }
  return new StubProvider('bucketName')
}

export default stubProvider
