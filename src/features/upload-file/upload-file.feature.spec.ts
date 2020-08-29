/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { ResourceOptions, After, RecordActionResponse, ActionRequest, ActionContext } from 'admin-bro'
import BaseAdapter from './adapters/base-adapter'
import UploadOptions from './upload-config.type'

import uploadFile from './upload-file.feature'

chai.use(sinonChai)

describe('uploadFileFeature', () => {
  let provider: BaseAdapter
  let properties: UploadOptions['properties']
  const resolvedS3Path = 'resolvedS3Path'

  beforeEach(() => {
    provider = sinon.createStubInstance(BaseAdapter, {
      path: sinon.stub<[string, string], Promise<string>>().resolves(resolvedS3Path),
    })
    provider.name = 'BaseAdapter'
    provider.bucket = 'aws-bucket'
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

  describe('show#after hook', () => {
    const key = 'someKeyValue'

    const getAfterHook = (options: UploadOptions): After<RecordActionResponse> => {
      const feature = uploadFile(options)({})
      return feature.actions?.show?.after?.[0] as After<RecordActionResponse>
    }

    beforeEach(() => {
      properties = {
        key: 's3Key',
        filePath: 'resolvedPath',
      }
    })

    it('fills record with the path', async () => {
      const response = { record: { params: {
        [properties.key]: key,
      } } }
      const afterHook = getAfterHook({ provider, properties })

      const ret = await afterHook(
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
      const afterHook = getAfterHook({ provider, properties })

      await afterHook(
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
      const afterHook = getAfterHook({ provider, properties })

      const ret = await afterHook(
        response as unknown as RecordActionResponse,
        {} as ActionRequest,
        {} as ActionContext,
      )

      expect(ret).to.deep.eq(response)
      expect(provider.path).to.not.have.been.called
    })
  })

  it('show after hook', () => {
    expect(true).to.equal(true)
  })
})
