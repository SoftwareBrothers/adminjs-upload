import { expect } from 'chai'
import { ERROR_MESSAGES } from './constants'
import { validateProperties } from './validate-properties'

describe('validateProperties', () => {
  it('does not throw an all properties have different values', () => {
    expect(() => {
      validateProperties({
        key: 'sameValue',
        file: 'otherValue',
      })
    }).not.to.throw()
  })

  it('throws an error when 2 properties have the same values', () => {
    expect(() => {
      validateProperties({
        key: 'sameValue',
        file: 'sameValue',
      })
    }).to.throw(ERROR_MESSAGES.DUPLICATED_KEYS([{
      keys: ['key', 'file'],
      value: 'sameValue',
    }]))
  })
})
