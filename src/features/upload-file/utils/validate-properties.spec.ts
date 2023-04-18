import { expect } from 'chai'
import { FeatureInvocation } from '../types/upload-options.type.js'
import { hasDuplicatedProperties, validatePropertiesGlobally } from './validate-properties.js'

describe('hasDuplicatedProperties', () => {
  it('does not throw an all properties have different values', () => {
    expect(hasDuplicatedProperties({
      key: 'sameValue',
      file: 'otherValue',
    })).to.be.false
  })

  it('throws an error when 2 properties have the same values', () => {
    const duplicates = hasDuplicatedProperties({
      key: 'sameValue',
      file: 'sameValue',
    })
    expect(duplicates).not.to.be.false
  })
})

describe('validatePropertiesGlobally', () => {
  it('shows errors for a second invocation', () => {
    const context = [
      { properties: { key: 'sameValue', file: 'otherValue' } },
      { properties: { key: 'sameValue', file: 'otherValue' } },
    ] as Array<FeatureInvocation>

    const duplicates = validatePropertiesGlobally(context)
    expect(duplicates).to.have.lengthOf(2)
  })
})
