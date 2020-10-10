export const DAY_IN_MINUTES = 86400

export type DuplicateOccurrence = {
  keys: Array<string>,
  value: string
}

export const ERROR_MESSAGES = {
  NO_PROVIDER: 'You have to specify provider in options',
  WRONG_PROVIDER_OPTIONS: [
    'WRONG PROVIDER OPTIONS:',
    'You have to give options for at least one provider or pass class based on BaseProvider',
  ].join(' '),
  NO_PERSISTENT_RECORD_UPLOAD: 'You cannot upload file for not persisted record. Save record first',
  NO_FILENAME: 'Server could not verify the file name',
  NO_KEY_PROPERTY: 'You have to define `key` property in options',
  NO_AWS_SDK: 'You have to install `aws-sdk` in order to run this plugin with AWS',
  NO_DIRECTORY: (dir: string): string => (
    `directory: "${dir}" does not exists. Create it before running LocalAdapter`
  ),
  METHOD_NOT_IMPLEMENTED: (method: string): string => (
    `you have to implement "${method}" method`
  ),
  DUPLICATED_KEYS: (keys: Array<DuplicateOccurrence>): string => {
    const mergedKeys = keys.map((duplicate) => (
      ` - keys: ${duplicate.keys
        .map((k) => `"${k}"`)
        .join(', ')
      }" have the same value: "${duplicate.value},`
    )).join('\n')

    return `The same value for properties:\n${mergedKeys}`
  },
}
