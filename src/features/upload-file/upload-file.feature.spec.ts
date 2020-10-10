import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { After, RecordActionResponse, ActionRequest, ActionContext } from 'admin-bro'
import { BaseProvider } from './providers/base-provider'
import UploadOptions from './types/upload-options.type'

import uploadFile from './upload-file.feature'
import stubProvider from './spec/stub-provider'

chai.use(sinonChai)

describe('uploadFileFeature', () => {
  let provider: BaseProvider
  let properties: UploadOptions['properties']
  const resolvedS3Path = 'resolvedS3Path'

  beforeEach(() => {
    provider = stubProvider(resolvedS3Path)
    properties = {
      key: 's3Key',
      filePath: 'resolvedPath',
      file: 'filePath',
    }
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('constructor', () => {
    it('throws an error when provider was not been given', () => {
      expect(() => uploadFile({} as any)).to.throw('You have to specify provider in options')
    })
    it('throws an error when provider was not been given', () => {
      const options = { provider, properties: {} } as UploadOptions

      expect(() => uploadFile(options)).to.throw('You have to define `key` property in options')
    })
  })

  describe('show#after hook - #fillPath', () => {
    const key = 'someKeyValue'

    const getAfterHook = (options: UploadOptions): After<RecordActionResponse> => {
      const feature = uploadFile(options)({})
      return feature.actions?.show?.after?.[0] as After<RecordActionResponse>
    }

    it('fills record with the path', async () => {
      const response = { record: { params: {
        [properties.key]: key,
      } } }
      const fillPath = getAfterHook({ provider, properties })

      const ret = await fillPath(
        response as RecordActionResponse,
        {} as ActionRequest,
        {} as ActionContext,
      )

      expect(provider.path).to.have.been.calledWith(key, provider.bucket)
      expect(ret.record.params[properties.filePath as string]).to.equal(resolvedS3Path)
    })

    it('gets bucket from the record when it is present', async () => {
      const bucket = 'some-other-bucket'
      properties.bucket = 'storedBucketProperty'
      const response = { record: { params: {
        [properties.key]: key,
        [properties.bucket]: bucket,
      } } }
      const fillPath = getAfterHook({ provider, properties })

      await fillPath(
        response as RecordActionResponse,
        {} as ActionRequest,
        {} as ActionContext,
      )

      expect(provider.path).to.have.been.calledWith(key, bucket)
    })

    it('does nothing when path is not present', async () => {
      const response = { record: { params: {
        name: 'some value',
      } } }
      const fillPath = getAfterHook({ provider, properties })

      const ret = await fillPath(
        response as unknown as RecordActionResponse,
        {} as ActionRequest,
        {} as ActionContext,
      )

      expect(ret).to.deep.eq(response)
      expect(provider.path).to.not.have.been.called
    })
  })
})
