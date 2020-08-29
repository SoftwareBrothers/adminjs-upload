import sinon from 'sinon'
import BaseAdapter from '../adapters/base-adapter'

const stubProvider = (resolvedS3Path: string): BaseAdapter => {
  const provider = sinon.createStubInstance(BaseAdapter, {
    path: sinon.stub<[string, string], Promise<string>>().resolves(resolvedS3Path),
    upload: sinon.stub<[Buffer, string], Promise<string>>().resolves(resolvedS3Path),
    delete: sinon.stub<[string, string], Promise<string>>().resolves(resolvedS3Path),
  })
  provider.name = 'BaseAdapter'
  provider.bucket = 'aws-bucket'
  return provider
}

export default stubProvider
