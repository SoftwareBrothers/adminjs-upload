import { ActionContext, ActionRequest, After, BaseRecord, BaseResource, ComponentLoader, RecordActionResponse, UploadedFile } from 'adminjs'
import { expect } from 'chai'
import sinon, { SinonStubbedInstance, createStubInstance } from 'sinon'
import { CONTEXT_NAMESPACE } from '../constants.js'
import { BaseProvider } from '../providers/index.js'
import stubProvider from '../spec/stub-provider.js'
import UploadOptions, { UploadOptionsWithDefault } from '../types/upload-options.type.js'
import { updateRecordFactory } from './update-record-factory.js'

const componentLoader = new ComponentLoader()
describe('updateRecordFactory', () => {
  const request: ActionRequest = { method: 'post' } as ActionRequest
  let response: RecordActionResponse
  let actionContext: ActionContext

  let provider: BaseProvider
  let recordStub: SinonStubbedInstance<BaseRecord> & BaseRecord
  let uploadOptions: UploadOptionsWithDefault
  let updateRecord: After<RecordActionResponse>

  const resolvedS3Path = 'resolvedS3Path'
  const expectedKey = '1/some-name.pdf'
  const File: UploadedFile = {
    name: 'some-name.pdf',
    path: 'path/some-name.pdf',
    size: 111,
    type: 'txt',
  }

  beforeEach(() => {
    provider = stubProvider(resolvedS3Path)
    response = {
      record: {
        params: {
          name: 'some value',
        },
      },
    } as unknown as RecordActionResponse
    uploadOptions = {
      componentLoader,
      properties: {
        key: 's3Key',
        filePath: 'resolvedPath',
        file: 'file',
        filesToDelete: 'fileToDelete',
      },
      provider: {
        aws: { bucket: 'any' },
      } as UploadOptions['provider'],
    }
    recordStub = createStubInstance(BaseRecord, {
      id: sinon.stub<any, string>().returns('1'),
      isValid: sinon.stub<any, boolean>().returns(true),
      update: sinon.stub<any, Promise<BaseRecord>>().returnsThis(),
    })
    recordStub.params = {}
  })

  afterEach(() => {
    sinon.restore()
    sinon.reset()
  })

  it('does nothing when request is get', async () => {
    updateRecord = updateRecordFactory(uploadOptions, provider)

    const ret = await updateRecord(
      response as unknown as RecordActionResponse,
      { method: 'get', record: recordStub } as unknown as ActionRequest,
      {} as ActionContext,
    )
    expect(ret).to.deep.eq(response)
  })

  context('property.file is set in the context to single file', () => {
    beforeEach(() => {
      uploadOptions.properties.file = 'uploadedFile'
      uploadOptions.properties.bucket = 'bucketProp'
      uploadOptions.properties.size = 'sizeProp'
      uploadOptions.properties.mimeType = 'mimeTypeProp'
      uploadOptions.properties.filename = 'filenameProp'
      File.name = expectedKey
      actionContext = {
        record: recordStub as BaseRecord,
        [CONTEXT_NAMESPACE]: {
          [uploadOptions.properties.file]: [File],
        },
      } as unknown as ActionContext
      updateRecord = updateRecordFactory(uploadOptions, provider)
    })

    it('uploads file with adapter', async () => {
      await updateRecord(response, request, actionContext)

      expect(provider.upload).to.have.been.calledWith(File)
    })

    it('updates all fields in the record', async () => {
      await updateRecord(response, request, actionContext)

      expect(recordStub.update).to.have.been.calledWith(sinon.match({
        [uploadOptions.properties.key]: expectedKey,
        [uploadOptions.properties.bucket as string]: provider.bucket,
        [uploadOptions.properties.size as string]: File.size.toString(),
        [uploadOptions.properties.mimeType as string]: File.type,
        [uploadOptions.properties.filename as string]: File.name,
      }))
    })

    it('does not delete any old file if there were not file before', async () => {
      await updateRecord(response, request, actionContext)

      expect(provider.delete).not.to.have.been.called
    })

    it('removes old file when there was file before', async () => {
      const oldKey = 'some-old-key.txt'
      const oldBucket = 'oldBucket'
      recordStub.params[uploadOptions.properties.key] = oldKey
      recordStub.params[uploadOptions.properties.bucket as string] = oldBucket

      await updateRecord(response, request, actionContext)

      expect(provider.delete).to.have.been.calledWith(oldKey, oldBucket)
    })

    it('does not remove old file when it had the same key', async () => {
      recordStub.params[uploadOptions.properties.key] = expectedKey

      await updateRecord(response, request, actionContext)

      expect(provider.delete).not.to.have.been.called
    })

    it('removes old file when property.file is set to null', async () => {
      const storedBucket = 'bucketProp'
      recordStub.get.onCall(0).returns(storedBucket)
      recordStub.get.onCall(1).returns(expectedKey)
      actionContext[CONTEXT_NAMESPACE][uploadOptions.properties.file as string] = null

      await updateRecord(response, request, actionContext)

      expect(provider.upload).not.to.have.been.called

      expect(provider.delete).to.have.been.calledWith(expectedKey, storedBucket)

      expect(recordStub.update).to.have.been.calledWith(sinon.match({
        [uploadOptions.properties.key]: null,
        [uploadOptions.properties.bucket as string]: null,
        [uploadOptions.properties.size as string]: null,
        [uploadOptions.properties.mimeType as string]: null,
        [uploadOptions.properties.filename as string]: null,
      }))
    })
  })

  context('property.file is set in the context to multiple files', () => {
    const Files = [
      { ...File, name: 'file1.png' },
      { ...File, name: 'file2.png' },
      { ...File, name: 'file3.png' },
    ]

    beforeEach(() => {
      uploadOptions.multiple = true
      uploadOptions.properties.file = 'media.file'
      uploadOptions.properties.bucket = 'media.bucket'
      uploadOptions.properties.size = 'media.size'
      uploadOptions.properties.mimeType = 'media.mimeType'
      uploadOptions.properties.filename = 'media.filename'
      actionContext = {
        [CONTEXT_NAMESPACE]: {
          [uploadOptions.properties.file]: Files,
        },
        record: recordStub as BaseRecord,
      } as unknown as ActionContext
      updateRecord = updateRecordFactory(uploadOptions, provider)
    })

    it('uploads multiple files with adapter', async () => {
      await updateRecord(response, request, actionContext)

      expect(provider.upload).to.have.callCount(3)
    })

    it('updates all fields in the record', async () => {
      await updateRecord(response, request, actionContext)

      const values = (index) => ({
        [`${uploadOptions.properties.key}.${index}`]: `${recordStub.id()}/${Files[index].name}`,
        [`${uploadOptions.properties.bucket}.${index}` as string]: provider.bucket,
        [`${uploadOptions.properties.size}.${index}` as string]: Files[index].size,
        [`${uploadOptions.properties.mimeType}.${index}` as string]: Files[index].type,
        [`${uploadOptions.properties.filename}.${index}` as string]: Files[index].name,
      })

      expect(recordStub.update).to.have.been.calledWith(sinon.match({
        ...values(0),
        ...values(1),
        ...values(2),
      }))
    })
  })

  context('filesToDelete are set in the context to multiple files', () => {
    const fileIndexesToDelete = ['0', '2']
    const oldParams = {
      'media.key.0': 'key0',
      'media.key.1': 'key1',
      'media.key.2': 'key2',
      'media.bucket.0': 'bucket0',
      'media.bucket.1': 'bucket1',
      'media.bucket.2': 'bucket2',
      'media.type.0': 'mime0',
      'media.type.1': 'mime1',
      'media.type.2': 'mime2',
    }

    beforeEach(() => {
      uploadOptions.multiple = true
      uploadOptions.properties = {
        file: 'media.file',
        key: 'media.key',
        bucket: 'media.bucket',
        mimeType: 'media.type',
        filesToDelete: 'media.fileToDelete',
        filePath: 'media.filePath',
      }
      actionContext = {
        [CONTEXT_NAMESPACE]: {
          [uploadOptions.properties.filesToDelete]: fileIndexesToDelete,
        },
        record: new BaseRecord(oldParams, {} as BaseResource),
      } as unknown as ActionContext
      sinon.stub(BaseRecord.prototype, 'update')

      updateRecord = updateRecordFactory(uploadOptions, provider)
    })

    it('removes files from the database', async () => {
      await updateRecord(response, request, actionContext)

      expect(BaseRecord.prototype.update).to.have.been.calledWith({
        'media.key.0': 'key1',
        'media.bucket.0': 'bucket1',
        'media.type.0': 'mime1',
      })
    })

    it('removes files from the adapter store', async () => {
      await updateRecord(response, request, actionContext)

      expect(provider.delete).to.have.callCount(2)
      expect(provider.delete).to.have.been.calledWith('key0', 'bucket0')
      expect(provider.delete).to.have.been.calledWith('key2', 'bucket2')
    })
  })
})
