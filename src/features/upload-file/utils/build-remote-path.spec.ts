import { BaseRecord, UploadedFile } from 'adminjs'
import { expect } from 'chai'
import sinon, { createStubInstance } from 'sinon'
import { buildRemotePath } from './build-remote-path.js'

describe('buildPath', () => {
  let recordStub: BaseRecord
  const recordId = '1'
  const File: UploadedFile = {
    name: 'some-name.pdf',
    path: '/some-path.pdf',
    size: 111,
    type: 'txt',
  }

  after(() => {
    sinon.restore()
  })

  before(() => {
    recordStub = createStubInstance(BaseRecord, {
      id: sinon.stub<any, string>().returns(recordId),
      isValid: sinon.stub<any, boolean>().returns(true),
      update: sinon.stub<any, Promise<BaseRecord>>().returnsThis(),
    })
    recordStub.params = {}
  })

  it('returns default path when no custom function is given', () => {
    expect(buildRemotePath(recordStub, File)).to.equal(`${recordId}/${File.name}`)
  })

  it('returns default custom path when function is given', () => {
    const newPath = '1/1/filename'
    const fnStub = sinon.stub<[BaseRecord, string], string>().returns(newPath)

    const path = buildRemotePath(recordStub, File, fnStub)

    expect(path).to.equal(newPath)
    expect(fnStub).to.have.been.calledWith(recordStub, File.name)
  })
})
