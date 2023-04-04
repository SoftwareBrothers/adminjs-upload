// eslint-disable-next-line @typescript-eslint/no-var-requires
import path from 'path'
import { fileURLToPath } from 'node:url'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = 'build/src'

export default {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: +(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'secret',
  database: process.env.POSTGRES_DATABASE || 'postgres',
  entities: [`${dirname}/./**/*.entity.js`],
  migrations: [path.join(rootDir, '/migration/**/*.js')],
  subscribers: [path.join(rootDir, '/subscriber/**/*.js')],
  synchronize: true,
  logging: false,
  cli: {
    migrationsDir: path.join(rootDir, '/migration'),
    entitiesDir: path.join(rootDir, '/entity'),
    subscribersDir: path.join(rootDir, '/subscriber'),
  },
}
