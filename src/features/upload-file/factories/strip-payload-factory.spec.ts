/* eslint-disable no-underscore-dangle */
import { ActionContext, ActionRequest, Before } from 'admin-bro'
import { expect } from 'chai'
import { CONTEXT_NAMESPACE } from '../constants'
import UploadOptions, { UploadOptionsWithDefault } from '../types/upload-options.type'
import { stripPayloadFactory } from './strip-payload-factory'

describe('stripPayloadFactory', () => {
  let actionContext = {} as ActionContext

  let uploadOptions: UploadOptionsWithDefault
  let stripPayload: Before

  beforeEach(() => {
    uploadOptions = {
      properties: {
        key: 's3Key',
        filePath: 'resolvedPath',
        file: 'file',
        filesToDelete: 'fileToDelete',
      },
      provider: {
        aws: { bucket: 'any' },
      } as UploadOptions['provider'] }
  })

  context('standard upload payload', () => {
    let payload
    let newRequest: ActionRequest

    beforeEach(async () => {
      actionContext = {} as ActionContext
      payload = {
        [uploadOptions.properties.filePath]: 'somePath',
        [uploadOptions.properties.file]: 'someFile',
        [uploadOptions.properties.filesToDelete]: 'someFile',
      }
      stripPayload = stripPayloadFactory(uploadOptions)
      newRequest = await stripPayload({ payload, method: 'post' } as ActionRequest, actionContext)
    })

    it('removes file, fileToDelete and filePath from the payload', () => {
      expect(newRequest.payload).not.to.have.keys(
        uploadOptions.properties.filePath,
        uploadOptions.properties.file,
        uploadOptions.properties.filesToDelete,
      )
    })

    it('moves file and fileToDelete to the context', () => {
      expect(actionContext[CONTEXT_NAMESPACE]).to.contains.keys({
        [uploadOptions.properties.file]: payload[uploadOptions.properties.file],
        [uploadOptions.properties.filesToDelete]: payload[uploadOptions.properties.filesToDelete],
      })
    })
  })
})
