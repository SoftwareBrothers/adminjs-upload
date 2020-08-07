const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAWDVPBGHHOMJ3EOAL',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
  region: process.env.AWS_REGION || 'eu-west-2',
  bucket: process.env.AWS_BUCKET || 'onserro-media-local-plorenc',
}
export default credentials
