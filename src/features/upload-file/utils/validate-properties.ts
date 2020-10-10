import { DuplicateOccurrence, ERROR_MESSAGES } from '../constants'
import { UploadOptions } from '../types/upload-options.type'

/**
 * Checks if values for properties given by the user are different
 *
 * @private
 */
export const validateProperties = (properties: UploadOptions['properties']): void => {
  // counting how many occurrences of given value are in the keys.
  const mappedFields = Object.keys(properties).reduce((memo, key) => {
    const property = properties[key] ? {
      [properties[key]]: {
        keys: memo[properties[key]] ? [...memo[properties[key]].keys, key] : [key],
        value: properties[key],
      } } : {}
    return {
      ...memo,
      ...property,
    }
  }, {} as Record<string, DuplicateOccurrence>)

  const duplicated = Object.values(mappedFields).filter((value) => value.keys.length > 1)

  if (duplicated.length) {
    throw new Error(ERROR_MESSAGES.DUPLICATED_KEYS(duplicated))
  }
}
