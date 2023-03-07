import { ERROR_MESSAGES } from '../constants.js'
import { AWSProvider } from '../providers/aws-provider.js'
import { GCPProvider } from '../providers/gcp-provider.js'
import { BaseProvider } from '../providers/index.js'
import { LocalProvider } from '../providers/local-provider.js'
import { AvailableDefaultProviders, UploadOptions } from '../types/upload-options.type.js'

export type GetProviderReturn = {
  name: AvailableDefaultProviders,
  provider: BaseProvider
}

export const getProvider = (options: UploadOptions['provider']): GetProviderReturn => {
  if (!options) {
    throw new Error(ERROR_MESSAGES.NO_PROVIDER)
  }

  // when someone passes its own implementation as options
  if ((options as BaseProvider).name === 'BaseProvider') {
    return {
      name: 'base',
      provider: options as BaseProvider,
    }
  }

  const givenProviders = Object.keys(options)

  if (givenProviders.length !== 1) {
    throw new Error(ERROR_MESSAGES.WRONG_PROVIDER_OPTIONS)
  }

  const providerName = givenProviders[0] as AvailableDefaultProviders
  const providerOptions = options[providerName]

  const providerMap: Record<AvailableDefaultProviders, () => BaseProvider> = {
    aws: () => new AWSProvider(providerOptions),
    gcp: () => new GCPProvider(providerOptions),
    local: () => new LocalProvider(providerOptions),
    base: () => providerOptions as BaseProvider,
  }
  const provider = providerMap[providerName]()
  if (!provider) {
    throw new Error(ERROR_MESSAGES.NO_PROVIDER)
  }

  return {
    provider,
    name: providerName,
  }
}
