import { expect } from 'chai'
import { ERROR_MESSAGES } from '../constants.js'
import { AWSProvider } from '../providers/aws-provider.js'
import { GCPProvider } from '../providers/gcp-provider.js'
import { BaseProvider } from '../providers/index.js'
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
import { getProvider } from './get-provider.js'

class MyProvider extends BaseProvider {
  constructor() { super('bucketName') }
  public async upload() { return true }
  public async delete() { return true }
  public async path() { return '/fle-url' }
}

describe('getProvider', () => {
  const bucket = 'bucket'
  const region = 'east-1'

  it('returns options if options are type of BaseProvider', () => {
    const provider = new MyProvider()

    const getProviderResponse = getProvider(provider)

    expect(getProviderResponse.name).to.equals('base')
    expect(getProviderResponse.provider).to.equals(provider)
  })

  it('returns AWS provider when options have aws', () => {
    const getProviderResponse = getProvider({ aws: { bucket, region } })

    expect(getProviderResponse.name).to.equals('aws')
    expect(getProviderResponse.provider).to.be.instanceOf(AWSProvider)
  })

  it('returns GCP provider when options have gcp', () => {
    const getProviderResponse = getProvider({ gcp: { bucket } })

    expect(getProviderResponse.name).to.equals('gcp')
    expect(getProviderResponse.provider).to.be.instanceOf(GCPProvider)
  })

  it('throws error when user gave no providers', () => {
    expect(() => {
      getProvider({})
    }).to.throw(ERROR_MESSAGES.WRONG_PROVIDER_OPTIONS)
  })

  it('throws error when user gave too many providers', () => {
    expect(() => {
      getProvider({ gcp: { bucket }, aws: { bucket, region } })
    }).to.throw(ERROR_MESSAGES.WRONG_PROVIDER_OPTIONS)
  })
})
