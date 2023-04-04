import { defineConfig } from 'cypress'
import pluginConfig from './cypress/plugins/index.js'

export default defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      pluginConfig(on, config)
    },
    baseUrl: 'http://localhost:3000/admin',
  },
})
