/* eslint-disable no-underscore-dangle */
import { Before, ActionContext, ActionRequest, flat } from 'admin-bro'

import { FeatureInvocation, UploadOptionsWithDefault } from '../types/upload-options.type'
import { CONTEXT_NAMESPACE, ERROR_MESSAGES } from '../constants'
import { validatePropertiesGlobally } from '../utils/validate-properties'

type ContextNamespace = {
  /**
   * for properties which name we don't now right now (user defines i.e. that property holding
   * `file` can be `myFile`
   */
  [key: string]: any,
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
        __invocations: data.__invocations || [
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
