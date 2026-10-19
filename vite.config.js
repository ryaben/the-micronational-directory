import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)
const xPostsHandler = require('./api/x-posts.js')

function xPostsDevApi() {
  return {
    name: 'x-posts-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/x-posts', (request, response) => {
        const apiResponse = {
          setHeader: (name, value) => response.setHeader(name, value),
          status(code) {
            response.statusCode = code
            return {
              json(data) {
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(JSON.stringify(data))
              }
            }
          }
        }

        xPostsHandler(request, apiResponse)
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), xPostsDevApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
