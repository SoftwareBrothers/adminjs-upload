// This fixes imports for regular javascript files
// in standard tsc build following doesn't work:
//
// const uploadFeature = require('@admin-bro/upload')
//
// because tsc changes that so only following works:
// this is standard way of handling that by both tsc and babel
//
// const { default: uploadFeature } = require('@admin-bro/upload')
//
// Here we fix that so both JavaScript and TypeScript works

/* eslint-disable @typescript-eslint/no-var-requires */
const regularExport = require('./build/index')

const uploadFeature = regularExport.default
const { BaseProvider } = regularExport

module.exports = uploadFeature
module.exports.BaseProvider = BaseProvider
module.exports.default = uploadFeature
