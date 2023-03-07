/* eslint-disable no-underscore-dangle */
import { ActionContext, ActionRequest, Before, flat } from 'adminjs'
import { CONTEXT_NAMESPACE, ERROR_MESSAGES } from '../constants.js'
import { FeatureInvocation, UploadOptionsWithDefault } from '../types/upload-options.type.js'
import { validatePropertiesGlobally } from '../utils/validate-properties.js'

type ContextNamespace = {
  /**
   * for properties which name we don't now right now (user defines i.e. that property holding
   * `file` can be `myFile`
   */
  [key: string]: any,
  /**
   * When we strip payload for each upload we are also storing use properties under __invocations
   * key. This is because in the next step we have to validate if all the properties are unique.
   * Otherwise upload from one element will override the upload in another element.
   */
  __invocations: Array<FeatureInvocation>
}

export const stripPayloadFactory = (
  uploadOptionsWithDefault: UploadOptionsWithDefault,
): Before => {
  const stripFileFromPayload = async (
    request: ActionRequest,
    context: ActionContext,
  ): Promise<ActionRequest> => {
    const { properties } = uploadOptionsWithDefault

    if (request?.payload) {
      let data: ContextNamespace = context[CONTEXT_NAMESPACE] || {}

      data = {
        ...data,
        [properties.file]: flat.get(request.payload, properties.file),
        [properties.filesToDelete]: flat.get(request.payload, properties.filesToDelete),
        __invocations: [
          ...(data.__invocations || []),
          { properties },
        ],
      }

      context[CONTEXT_NAMESPACE] = data

      let filteredPayload = flat.filterOutParams(request.payload, properties.file)
      filteredPayload = flat.filterOutParams(filteredPayload, properties.filesToDelete)
      filteredPayload = flat.filterOutParams(filteredPayload, properties.filePath)

      const duplicatedOccurrences = validatePropertiesGlobally(data.__invocations)
      if (duplicatedOccurrences) {
        throw new Error(ERROR_MESSAGES.DUPLICATED_KEYS(duplicatedOccurrences))
      }

      return {
        ...request,
        payload: filteredPayload,
      }
    }

    return request
  }
  return stripFileFromPayload
}

export const getNamespaceFromContext = (context: ActionContext): ContextNamespace => {
  const namespace = (context || {})[CONTEXT_NAMESPACE]

  return namespace || {}
}
