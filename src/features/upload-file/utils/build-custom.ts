import { flat, PropertyJSON } from 'admin-bro'
import PropertyCustom from '../types/property-custom.type'

export default (property: PropertyJSON): PropertyCustom => {
  const { custom } = property as unknown as { custom: PropertyCustom }

  if (custom.parentArray) {
    // Array OR mixed property
    // TODO look at adding mixed property support
    // TODO Handle the case were `parentArray` is nested within another array.
    const parts = flat.pathToParts(property.path)
    const parentArrayIndex = parts.indexOf(custom.parentArray)
    if (parentArrayIndex === -1) {
      return custom
    }
    const parentPath = parts[parentArrayIndex + 1]
    const updates = [
      'fileProperty',
      'filePathProperty',
      'filesToDeleteProperty',
      'keyProperty',
    ].reduce((memo, prop) => {
      const val = custom[prop]
      return {
        ...memo,
        [prop]: val && [parentPath, val].join(flat.DELIMITER),
      }
    }, {})

    return {
      ...custom,
      ...updates,
    }
  }

  return custom
}
