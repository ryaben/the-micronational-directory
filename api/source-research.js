const { inflateRawSync } = require('node:zlib')
const { verifyFirebaseUser } = require('./_firebase-auth.js')

const ALLOWED_SOURCES = new Set(['microwiki', 'micronaciones_fandom', 'micraswiki', 'google_mymaps'])
const WORKFLOW_FILE = 'ingest-source-candidates.yml'

function response(res, status, body) {
  return res.status(status).json(body)
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_WORKFLOW_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}

async function github(path, options = {}) {
  const result = await fetch(`https://api.github.com${path}`, { ...options, headers: { ...githubHeaders(), ...options.headers } })
  if (!result.ok && result.status !== 204) {
    const data = await result.json().catch(() => ({}))
    throw new Error(data.message || `GitHub API returned HTTP ${result.status}.`)
  }
  return result.status === 204 ? null : result
}

function findZipEntries(zip) {
  const entries = []
  let eocd = -1
  for (let i = Math.max(0, zip.length - 65557); i <= zip.length - 22; i += 1) {
    if (zip.readUInt32LE(i) === 0x06054b50) eocd = i
  }
  if (eocd < 0) throw new Error('GitHub log archive is not a valid ZIP file.')
  const count = zip.readUInt16LE(eocd + 10)
  let offset = zip.readUInt32LE(eocd + 16)
  for (let i = 0; i < count; i += 1) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) break
    const method = zip.readUInt16LE(offset + 10)
    const compressedSize = zip.readUInt32LE(offset + 20)
    const nameLength = zip.readUInt16LE(offset + 28)
    const extraLength = zip.readUInt16LE(offset + 30)
    const commentLength = zip.readUInt16LE(offset + 32)
    const localOffset = zip.readUInt32LE(offset + 42)
    const name = zip.toString('utf8', offset + 46, offset + 46 + nameLength)
    const localNameLength = zip.readUInt16LE(localOffset + 26)
    const localExtraLength = zip.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength
    const compressed = zip.subarray(dataStart, dataStart + compressedSize)
    if (name.endsWith('.txt')) {
      const data = method === 8 ? inflateRawSync(compressed) : compressed
      entries.push({ name, text: data.toString('utf8') })
    }
    offset += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

function scriptOutputFromActionsLog(text) {
  const lines = text.split(/\r?\n/)
  const commandGroup = lines.findIndex(line => /##\[group\]Run /.test(line))
  const groupEnd = commandGroup < 0 ? -1 : lines.findIndex((line, index) => index > commandGroup && /##\[endgroup\]/.test(line))
  const outputLines = lines.slice(groupEnd >= 0 ? groupEnd + 1 : 0)
    .map(line => line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\s?/, ''))
    .filter(line => line && !/##\[error\]Process completed with exit code/.test(line))
  return outputLines.join('\n').trim()
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return response(res, 405, { error: 'Method not allowed.' })
  }
  try {
    const user = await verifyFirebaseUser(req)
    if (!user?.isModerator) return response(res, 403, { error: 'Moderator access required.' })
    const repository = 'ryaben/the-micronational-directory'
    if (!process.env.GITHUB_WORKFLOW_TOKEN) {
      return response(res, 503, { error: 'Configure the server-only GITHUB_WORKFLOW_TOKEN with Actions: write permission.' })
    }

    if (req.method === 'POST') {
      const { source, offset = 0, maxEntries = 3, candidateNames = '' } = req.body || {}
      const parsedOffset = Number(offset)
      const parsedMax = Number(maxEntries)
      if (!ALLOWED_SOURCES.has(source)) return response(res, 400, { error: 'Choose a supported local source.' })
      if (!Number.isInteger(parsedOffset) || parsedOffset < 0) return response(res, 400, { error: 'Offset must be a non-negative integer.' })
      if (!Number.isInteger(parsedMax) || parsedMax < 1 || parsedMax > 5) return response(res, 400, { error: 'Maximum entries must be between 1 and 5.' })
      if (typeof candidateNames !== 'string' || candidateNames.length > 5000) return response(res, 400, { error: 'Candidate names must be text under 5,000 characters.' })
      const startedAt = new Date(Date.now() - 15000).toISOString()
      await github(`/repos/${repository}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: process.env.GITHUB_WORKFLOW_REF || 'main', inputs: {
          candidate_source: source,
          candidate_offset: String(parsedOffset),
          max_entries: String(parsedMax),
          candidate_names: candidateNames.trim()
        } })
      })
      let run = null
      for (let attempt = 0; attempt < 5 && !run; attempt += 1) {
        if (attempt) await new Promise(resolve => setTimeout(resolve, 1000))
        const result = await github(`/repos/${repository}/actions/workflows/${WORKFLOW_FILE}/runs?event=workflow_dispatch&per_page=10`)
        const payload = await result.json()
        run = payload.workflow_runs?.find(item => item.created_at >= startedAt && item.event === 'workflow_dispatch') || null
      }
      if (!run) return response(res, 202, { status: 'queued', message: 'Workflow dispatched. Refresh Actions to inspect its run.', actionsUrl: `https://github.com/${repository}/actions/workflows/${WORKFLOW_FILE}` })
      return response(res, 202, { runId: run.id, runUrl: run.html_url, status: run.status, conclusion: run.conclusion })
    }

    const runId = String(req.query?.runId || '')
    if (!/^\d{1,20}$/.test(runId)) return response(res, 400, { error: 'A valid workflow run ID is required.' })
    const runResponse = await github(`/repos/${repository}/actions/runs/${runId}`)
    const run = await runResponse.json()
    const jobsResponse = await github(`/repos/${repository}/actions/runs/${runId}/jobs?per_page=20`)
    const jobsData = await jobsResponse.json()
    let logs = ''
    const researchJob = (jobsData.jobs || []).find(job => (job.steps || []).some(step => /research source and open review issues/i.test(step.name)))
    const researchStepIndex = researchJob?.steps?.findIndex(step => /research source and open review issues/i.test(step.name)) ?? -1
    if (researchJob && researchStepIndex >= 0) {
      try {
        const stepLogResponse = await github(`/repos/${repository}/actions/jobs/${researchJob.id}/steps/${researchStepIndex}/logs`)
        if (stepLogResponse.ok) logs = scriptOutputFromActionsLog(await stepLogResponse.text())
      } catch {
        // GitHub may not have published this step's live log yet.
      }
    }
    if (!logs && run.status === 'completed') {
      const logResponse = await github(`/repos/${repository}/actions/runs/${runId}/logs`)
      if (logResponse.ok) {
        const archive = Buffer.from(await logResponse.arrayBuffer())
        const entries = findZipEntries(archive)
        const usefulEntries = entries.filter(entry => /research source and open review issues|validate required secrets/i.test(entry.name))
        logs = usefulEntries
          .map(entry => scriptOutputFromActionsLog(entry.text))
          .filter(Boolean)
          .join('\n')
        if (logs.length > 120000) logs = `${logs.slice(-120000)}\n[Older output truncated]`
      }
    }
    return response(res, 200, {
      runId: run.id,
      runUrl: run.html_url,
      status: run.status,
      conclusion: run.conclusion,
      jobs: (jobsData.jobs || []).map(job => ({ name: job.name, status: job.status, conclusion: job.conclusion, steps: (job.steps || []).map(step => ({ name: step.name, status: step.status, conclusion: step.conclusion })) })),
      logs
    })
  } catch (error) {
    return response(res, 502, { error: error.message || 'Source research request failed.' })
  }
}

module.exports.config = { maxDuration: 60 }
