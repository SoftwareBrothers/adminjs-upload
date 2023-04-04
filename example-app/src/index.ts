/* eslint-disable import/first */
import path from 'path'
import * as url from 'url'
import { config } from 'dotenv'

const dirname = url.fileURLToPath(new URL('.', import.meta.url))

config({ path: path.join(dirname, '../../.env') })

import express from 'express'
import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { Database, Resource } from '@adminjs/typeorm'
import { createConnection } from 'typeorm'
import { componentLoader } from './admin/component-loader.js'

import createPhotoResource from './admin/resources/photo/photo.resource.js'
import createUserResource from './admin/resources/user/user.resource.js'
import createCustomResource from './admin/resources/custom/custom.resource.js'
import createPostResource from './admin/resources/post/post.resource.js'
import createMultiResource from './admin/resources/multi/multi.resource.js'

const PORT = 3000

AdminJS.registerAdapter({ Resource, Database })
const run = async () => {
  await createConnection()
  const app = express()
  app.use('/public', express.static('public'))
  const admin = new AdminJS({
    componentLoader,
    resources: [
      createPhotoResource(),
      createUserResource(),
      createCustomResource(),
      createPostResource(),
      createMultiResource(),
    ],
    version: { admin: true },
    locale: {
      language: 'en',
      translations: {
        labels: {
          Photo: 'photos (Local)',
          User: 'users (AWS)',
          Custom: 'custom provider',
          Post: 'posts (GCP)',
        },
      },
    },
  })

  admin.watch()

  const router = AdminJSExpress.buildRouter(admin)

  app.use(admin.options.rootPath, router)

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
}

run()
