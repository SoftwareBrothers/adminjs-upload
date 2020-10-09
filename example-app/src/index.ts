/* eslint-disable import/first */
import path from 'path'
import { config } from 'dotenv'

config({ path: path.join(__dirname, '../../.env') })

import express from 'express'
import AdminBro from 'admin-bro'
import { buildRouter } from '@admin-bro/express'
import { Database, Resource } from '@admin-bro/typeorm'
import { createConnection } from 'typeorm'

import createPhotoResource from './admin/resources/photo/photo.resource'
import createUserResource from './admin/resources/user/user.resource'
import createCustomResource from './admin/resources/custom/custom.resource'
import createPostResource from './admin/resources/post/post.resource'
import createMultiResource from './admin/resources/multi/multi.resource'

const PORT = 3000

AdminBro.registerAdapter({ Resource, Database })
const run = async () => {
  await createConnection()
  const app = express()
  app.use('/public', express.static('public'))
  const admin = new AdminBro({
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

  const router = buildRouter(admin)

  app.use(admin.options.rootPath, router)

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
}

run()
