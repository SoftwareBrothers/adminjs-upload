import sinon from 'sinon'
import BaseAdapter from '../adapters/base-adapter'

const stubProvider = (resolvedS3Path: string): BaseAdapter => {
  class StubProvider extends BaseAdapter {
    public path = sinon.stub<[string, string], Promise<string>>().resolves(resolvedS3Path)

    public upload = sinon.stub<[Buffer, string], Promise<string>>().resolves(resolvedS3Path)

    public delete = sinon.stub<[string, string], Promise<string>>().resolves(resolvedS3Path)
  }
  return new StubProvider('bucketName')
}

export default stubProvider
