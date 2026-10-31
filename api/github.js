const { verifyFirebaseUser } = require('./_firebase-auth.js')

const REPOSITORY = 'ryaben/the-micronational-directory'
const JSON_FILES = new Set(['public/micronations.json', 'public/organizations.json'])

function reply(res, status, payload) {
  return res.status(status).json(payload)
}

async function github(path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_WORKFLOW_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const text = await response.text()
  let result = {}
  try { result = text ? JSON.parse(text) : {} } catch { result = { message: text || response.statusText } }
  if (!response.ok) return { status: response.status, data: result }
  return { status: response.status, data: result }
}

function validIssueNumber(value) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1) throw new Error('Invalid issue number.')
  return number
}

function validFilePath(value) {
  if (JSON_FILES.has(value)) return value
  // Existing submissions can use the entry name as the uploaded image name,
  // which may contain spaces. Keep the allowlist limited to one safe filename.
  // Submitted media names may include ordinary punctuation (for example,
  // ampersands in micronation names). Keep the path to one filename and
  // explicitly exclude separators so it cannot escape the allowed folders.
  if (/^public\/images\/(?:flags|logos)\/[\p{L}\p{N}._'&(), -]+\.(?:png|jpe?g|webp|gif|avif|svg)$/iu.test(String(value))) return value
  throw new Error('This repository file path is not allowed.')
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return reply(res, 405, { error: 'Method not allowed.' })
  }
  try {
    if (!process.env.GITHUB_WORKFLOW_TOKEN) return reply(res, 503, { error: 'Configure the server-only GITHUB_WORKFLOW_TOKEN.' })
    const user = await verifyFirebaseUser(req)
    if (!user) return reply(res, 401, { error: 'A verified Firebase session is required.' })
    const input = req.body || {}
    const { action } = input
    const needsModerator = !['createIssue', 'fetchIssues'].includes(action)
    if (needsModerator && !user.isModerator) return reply(res, 403, { error: 'Moderator access required.' })

    if (action === 'createIssue') {
      const { entryData, entryType, options = {} } = input
      if (!entryData || !['micronation', 'organization'].includes(entryType)) throw new Error('Invalid submission data.')
      const { createGitHubIssueWithCredentials } = await import('../src/utils/githubIssueService.mjs')
      const issue = await createGitHubIssueWithCredentials(entryData, entryType, options, {
        token: process.env.GITHUB_WORKFLOW_TOKEN,
        repoOwner: 'ryaben',
        repoName: 'the-micronational-directory'
      })
      return reply(res, 200, issue)
    }

    let result
    switch (action) {
      case 'fetchIssues': {
        const issues = []
        for (let page = 1; page <= 10; page += 1) {
          const response = await github(`issues?state=open&per_page=100&page=${page}`)
          if (response.status >= 400) return reply(res, response.status, response.data)
          if (!Array.isArray(response.data)) break
          issues.push(...response.data.filter(issue => !issue.pull_request))
          if (response.data.length < 100) break
        }
        const labels = Array.isArray(input.labels) ? input.labels : input.labels ? [input.labels] : []
        return reply(res, 200, labels.length ? issues.filter(issue => issue.labels?.some(label => labels.includes(label.name))) : issues)
      }
      case 'addIssueLabel': {
        const label = String(input.label || '')
        if (!['approved', 'rejected'].includes(label)) throw new Error('Invalid moderation label.')
        result = await github(`issues/${validIssueNumber(input.issueNumber)}/labels`, 'POST', { labels: [label] })
        break
      }
      case 'closeIssue':
        result = await github(`issues/${validIssueNumber(input.issueNumber)}`, 'PATCH', { state: 'closed' })
        break
      case 'addIssueComment':
        if (typeof input.comment !== 'string' || input.comment.length > 10000) throw new Error('Invalid issue comment.')
        result = await github(`issues/${validIssueNumber(input.issueNumber)}/comments`, 'POST', { body: input.comment })
        break
      case 'updateIssue':
        if (typeof input.title !== 'string' || typeof input.body !== 'string' || input.body.length > 60000) throw new Error('Invalid issue update.')
        result = await github(`issues/${validIssueNumber(input.issueNumber)}`, 'PATCH', { title: input.title, body: input.body })
        break
      case 'getRepoFile':
        result = await github(`contents/${validFilePath(input.path)}`)
        break
      case 'getRepoBlob':
        if (!/^[a-f0-9]{40}$/i.test(String(input.sha))) throw new Error('Invalid repository blob SHA.')
        result = await github(`git/blobs/${input.sha}`)
        break
      case 'updateRepoFile': {
        const path = validFilePath(input.path)
        if (typeof input.content !== 'string' || input.content.length > 8_000_000 || !/^[a-f0-9]{40}$/i.test(String(input.sha))) throw new Error('Invalid repository file update.')
        result = await github(`contents/${path}`, 'PUT', {
          message: String(input.commitMessage || '').slice(0, 200),
          content: Buffer.from(input.content, 'utf8').toString('base64'),
          sha: input.sha
        })
        break
      }
      case 'createRepoFile': {
        const path = validFilePath(input.path)
        if (!/^public\/images\/(?:flags|logos)\//.test(path) || typeof input.content !== 'string' || input.content.length > 200_000) throw new Error('Invalid media file creation request.')
        result = await github(`contents/${path}`, 'PUT', {
          message: String(input.commitMessage || '').slice(0, 200),
          content: input.content
        })
        break
      }
      case 'importExternalImage': {
        let imageUrl
        try { imageUrl = new URL(String(input.url || '')) } catch { throw new Error('Enter a valid external image URL.') }
        if (imageUrl.protocol !== 'https:' || imageUrl.username || imageUrl.password
          || !imageUrl.hostname || imageUrl.hostname === 'localhost' || imageUrl.hostname.endsWith('.localhost')
          || imageUrl.hostname.endsWith('.local') || /^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(?:1[6-9]|2\d|3[01])\./.test(imageUrl.hostname)
          || imageUrl.hostname === '::1' || imageUrl.hostname === '[::1]') {
          throw new Error('Only public HTTPS image URLs can be imported.')
        }
        const assetType = input.entryType === 'organization' ? 'logos' : input.entryType === 'micronation' ? 'flags' : ''
        if (!assetType) throw new Error('Invalid entry type for image import.')
        const response = await fetch(imageUrl, { redirect: 'error', signal: AbortSignal.timeout(15000) })
        if (!response.ok) throw new Error(`Could not fetch the external image (HTTP ${response.status}).`)
        const mimeType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
        const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
        const extension = extensions[mimeType]
        if (!extension) throw new Error('The external URL did not return a supported JPEG, PNG, WebP, or GIF image.')
        const declaredLength = Number(response.headers.get('content-length') || 0)
        if (declaredLength > 5 * 1024 * 1024) throw new Error('The external image exceeds the 5 MB import limit.')
        const bytes = Buffer.from(await response.arrayBuffer())
        if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('The external image is empty or exceeds the 5 MB import limit.')
        const namePart = String(input.name || 'entry').normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'entry'
        const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const path = `public/images/${assetType}/${namePart}-${uniquePart}.${extension}`
        result = await github(`contents/${path}`, 'PUT', {
          message: `Import ${assetType === 'flags' ? 'micronation flag' : 'organization logo'}: ${namePart}`.slice(0, 200),
          content: bytes.toString('base64')
        })
        if (result.status >= 400) return reply(res, result.status, result.data)
        return reply(res, 200, { path })
      }
      default:
        return reply(res, 400, { error: 'Unknown GitHub operation.' })
    }
    return reply(res, result.status >= 400 ? result.status : 200, result.data)
  } catch (error) {
    return reply(res, 400, { error: error.message || 'GitHub operation failed.' })
  }
}

module.exports.config = { maxDuration: 60 }
