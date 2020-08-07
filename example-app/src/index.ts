/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express from 'express'
import AdminBro from 'admin-bro'
import { buildRouter } from '@admin-bro/express'
import { Database, Resource } from '@admin-bro/typeorm'
import { createConnection } from 'typeorm'

import createPhotoResource from './admin/resources/photo/photo.resource'
import createUserResource from './admin/resources/user/user.resource'

const PORT = 3000

AdminBro.registerAdapter({ Resource, Database })
const run = async () => {
  await createConnection()
  const app = express()
  const admin = new AdminBro({
    resources: [
      createPhotoResource(),
      createUserResource(),
    ],
  })

  const router = buildRouter(admin)

  app.use(admin.options.rootPath, router)

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
}

run()
