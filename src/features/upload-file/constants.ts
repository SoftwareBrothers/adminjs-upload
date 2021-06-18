export const DAY_IN_MINUTES = 86400

export type DuplicateOccurrence = {
  keys: Array<string>,
  value: string
}

/**
 * These properties are stored to the database
 *
 * @private
 */
export const DB_PROPERTIES = ['key', 'bucket', 'size', 'mimeType', 'filename'] as const

/**
 * Namespace under which data in the ActionContext will be stored.
 * I.e when user posts data in payload which should be stripped before the record.update - they
 * will go to ActionContext to context[CONTEXT_NAMESPACE][property-name]
 *
 * @private
 */
export const CONTEXT_NAMESPACE = 'adminjs-upload'

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
      ` - keys: ${[...new Set(duplicate.keys).values()]
        .map((k) => `"${k}"`)
        .join(', ')
      }" have the same value: "${duplicate.value},`
    )).join('\n')

    return [
      '\n',
      'Upload Options Error:',
      'You have at least 2 different `UploadOptions.properties` defined for storing the same value',
      'This might be the issue if you use @adminjs/upload multiple times in one resource',
      'with a default values. Make sure that all of them are assigned to a different database',
      `columns like this { properties: {${keys[0].keys[0]}: "myPropertyName"} }. And this has`,
      'to be done for all `uploadFeature` invocations.',
      '',
      `The same values were found in following properties:\n\n${mergedKeys}`,
      '\n',
    ].join('\n')
  },
}
