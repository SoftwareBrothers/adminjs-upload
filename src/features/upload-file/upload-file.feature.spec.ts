import path from 'path'
import chai, { expect } from 'chai'
import sinon, { createStubInstance } from 'sinon'
import sinonChai from 'sinon-chai'
import { After, RecordActionResponse, ActionRequest, ActionContext, BaseRecord, UploadedFile } from 'admin-bro'
import BaseAdapter from './adapters/base-adapter'
import UploadOptions from './upload-options.type'

import uploadFile from './upload-file.feature'
import stubProvider from './spec/stub-provider'

chai.use(sinonChai)

describe('uploadFileFeature', () => {
  let provider: BaseAdapter
  let recordStub: BaseRecord
  let properties: UploadOptions['properties']
  let expectedKey: string
  const resolvedS3Path = 'resolvedS3Path'
  const filePath = path.join(__dirname, 'spec/file-fixture.txt')
  const File: UploadedFile = {
    name: 'some-name.pdf',
    path: filePath,
    size: 111,
    type: 'txt',
  }

  beforeEach(() => {
    provider = stubProvider(resolvedS3Path)
    properties = {
      key: 's3Key',
      filePath: 'resolvedPath',
    }
    recordStub = createStubInstance(BaseRecord, {
      id: sinon.stub<any, string>().returns('1'),
      isValid: sinon.stub<any, boolean>().returns(true),
      update: sinon.stub<any, Promise<BaseRecord>>().returnsThis(),
    })
    recordStub.params = {}
    expectedKey = `${recordStub.id()}/file-fixture.txt`
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

  describe('edit#after hook - #updateRecord', () => {
    let response: RecordActionResponse

    const getAfterHook = (options: UploadOptions): After<RecordActionResponse> => {
      const feature = uploadFile(options)({})
      return feature.actions?.edit?.after?.[0] as After<RecordActionResponse>
    }

    beforeEach(() => {
      response = { record: { params: {
        name: 'some value',
      } } } as unknown as RecordActionResponse
    })

    it('does nothing when request is get', async () => {
      const updateRecord = getAfterHook({ provider, properties })

      const ret = await updateRecord(
        response as unknown as RecordActionResponse,
        { method: 'get', record: recordStub } as unknown as ActionRequest,
        {} as ActionContext,
      )
      expect(ret).to.deep.eq(response)
    })

    context('property.file is set in the contest', () => {
      let updateRecord: After<RecordActionResponse>
      let context: ActionContext
      const request: ActionRequest = { method: 'post' } as ActionRequest

      beforeEach(() => {
        properties.file = 'uploadedFile'
        properties.bucket = 'bucketProp'
        properties.size = 'sizeProp'
        properties.mimeType = 'mimeTypeProp'
        properties.filename = 'filenameProp'
        File.name = expectedKey
        context = { [properties.file]: File, record: recordStub } as ActionContext
        updateRecord = getAfterHook({ provider, properties })
      })

      it('uploads file with adapter', async () => {
        await updateRecord(response, request, context)

        expect(provider.upload).to.have.been.calledWith(File)
      })

      it('updates all fields in the record', async () => {
        await updateRecord(response, request, context)

        expect(recordStub.update).to.have.been.calledWith(sinon.match({
          [properties.key]: expectedKey,
          [properties.bucket as string]: provider.bucket,
          [properties.size as string]: File.size.toString(),
          [properties.mimeType as string]: File.type,
          [properties.filename as string]: File.name,
        }))
      })

      it('does not delete any old file if there were not file before', async () => {
        await updateRecord(response, request, context)

        expect(provider.delete).not.to.have.been.called
      })

      it('removes old file when there was file before', async () => {
        const oldKey = 'some-old-key.txt'
        const oldBucket = 'oldBucket'
        recordStub.params[properties.key] = oldKey
        recordStub.params[properties.bucket as string] = oldBucket

        await updateRecord(response, request, context)

        expect(provider.delete).to.have.been.calledWith(oldKey, oldBucket)
      })

      it('does not remove old file when it had the same key', async () => {
        recordStub.params[properties.key] = expectedKey

        await updateRecord(response, request, context)

        expect(provider.delete).not.to.have.been.called
      })

      it('removes old file when property.file is set to null', async () => {
        recordStub.params[properties.key] = expectedKey
        context[properties.file as string] = null

        await updateRecord(response, request, context)

        expect(provider.upload).not.to.have.been.called
        expect(provider.delete).to.have.been.calledWith(expectedKey, provider.bucket)
        expect(recordStub.update).to.have.been.calledWith(sinon.match({
          [properties.key]: null,
          [properties.bucket as string]: null,
          [properties.size as string]: null,
          [properties.mimeType as string]: null,
          [properties.filename as string]: null,
        }))
      })
    })
  })
})
