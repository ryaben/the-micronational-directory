import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)
const xPostsHandler = require('./api/x-posts.js')
const aiAssistantHandler = require('./api/ai-assistant.js')
const sourceResearchHandler = require('./api/source-research.js')
const githubHandler = require('./api/github.js')

function githubDevApi() {
  return {
    name: 'github-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/github', async (request, response) => {
        try {
          const chunks = []
          let size = 0
          for await (const chunk of request) {
            size += chunk.length
            if (size > 4 * 1024 * 1024) {
              response.statusCode = 413
              response.end(JSON.stringify({ error: 'Request is too large.' }))
              return
            }
            chunks.push(chunk)
          }
          request.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          const apiResponse = {
            status(code) {
              response.statusCode = code
              return { json(data) {
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(JSON.stringify(data))
              } }
            }
          }
          await githubHandler(request, apiResponse)
        } catch (error) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ error: error instanceof SyntaxError ? 'Invalid JSON request.' : error.message }))
        }
      })
    }
  }
}

function sourceResearchDevApi() {
  return {
    name: 'source-research-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/source-research', async (request, response) => {
        try {
          if (request.method === 'POST') {
            const chunks = []
            for await (const chunk of request) chunks.push(chunk)
            request.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          } else {
            const url = new URL(request.url, 'http://localhost')
            request.query = Object.fromEntries(url.searchParams)
          }
          const apiResponse = {
            setHeader: (name, value) => response.setHeader(name, value),
            status(code) {
              response.statusCode = code
              return { json(data) {
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(JSON.stringify(data))
              } }
            }
          }
          await sourceResearchHandler(request, apiResponse)
        } catch (error) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ error: error instanceof SyntaxError ? 'Invalid JSON request.' : error.message }))
        }
      })
    }
  }
}

function aiAssistantDevApi() {
  return {
    name: 'ai-assistant-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/ai-assistant', async (request, response) => {
        if (request.method !== 'POST') {
          response.setHeader('Allow', 'POST')
          response.statusCode = 405
          response.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const chunks = []
          let size = 0
          for await (const chunk of request) {
            size += chunk.length
            if (size > 4.4 * 1024 * 1024) {
              response.statusCode = 413
              response.end(JSON.stringify({ error: 'Request is too large. Files must be no larger than 3 MB.' }))
              return
            }
            chunks.push(chunk)
          }
          request.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
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
          await aiAssistantHandler(request, apiResponse)
        } catch (error) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ error: error instanceof SyntaxError ? 'Invalid JSON request.' : 'AI assistant request failed.' }))
        }
      })
    }
  }
}

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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY
  for (const key of ['GITHUB_WORKFLOW_TOKEN', 'GITHUB_WORKFLOW_REF']) {
    if (env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [vue(), xPostsDevApi(), aiAssistantDevApi(), sourceResearchDevApi(), githubDevApi()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
