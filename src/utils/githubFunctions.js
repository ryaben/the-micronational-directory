/**
 * GitHub API utility functions for creating issues with embedded Base64 media
 */
import { auth } from '../firebase/auth.js'

async function githubServerRequest(action, payload = {}) {
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('Sign in with a verified email to use GitHub features.')
  return fetch('/api/github', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload })
  })
}

async function githubServerData(action, payload = {}) {
  const response = await githubServerRequest(action, payload)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || data.error || `GitHub operation failed (HTTP ${response.status}).`)
  return data
}

export function getPublicAssetPath(repositoryPath) {
  return repositoryPath?.replace(/^public(?=\/)/, '') || ''
}

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  if (value && typeof value === 'object') {
    const properties = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    return `{${properties.join(',')}}`
  }
  return JSON.stringify(value)
}

/**
 * Creates an entry submission issue using the same service as the source research workflow.
 */
export async function createGitHubIssue(entryData, entryType, options = {}) {
  try {
    return await githubServerData('createIssue', { entryData, entryType, options })
  } catch (error) {
    console.error('Error creating GitHub issue:', error)
    throw error
  }
}

/**
 * Fetches open GitHub issues, paginating through results and optionally filtering by labels.
 * @param {Array<string>|string} labels Labels to match (any matching label includes the issue).
 * @returns {Promise<Array<Object>>} Matching non-pull-request issues.
 */
export async function fetchGitHubIssues(labels = ['new-entry', 'review-required']) {
  const labelList = Array.isArray(labels) ? labels : labels ? [labels] : []
  try {
    return await githubServerData('fetchIssues', { labels: labelList })
  } catch (error) {
    console.error('Error fetching GitHub issues:', error)
    throw error
  }
}

/**
 * Parses GitHub issue body to extract entry JSON data
 * @param {string} body The issue body
 * @returns {Object|null} The parsed entry data or null if not found
 */
export function parseIssueBody(body) {
  if (!body) return null
  try {
    // Extract JSON from between ```json and ```
    const jsonMatch = body.match(/```json\s*\r?\n([\s\S]*?)\r?\n```/)
    if (!jsonMatch) {
      return null
    }

    return JSON.parse(jsonMatch[1])
  } catch (error) {
    console.error('Error parsing issue body:', error)
    return null
  }
}

export function parseAiReviewFromIssueBody(body) {
  if (!body) return null
  const jsonMatch = body.match(/<!-- AI_REVIEW_JSON\s*([\s\S]*?)\s*-->/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {
      // Fall through to parsing the human-readable review in older issues.
    }
  }

  const section = body.match(/### AI preliminary review[^\n]*\n([\s\S]*?)(?=\n### |$)/i)?.[1]
  if (!section) return null
  const verdict = section.match(/^- \*\*Triage:\*\*\s*(.+)$/m)?.[1]?.trim()
  const summary = section.match(/^- \*\*Summary:\*\*\s*(.+)$/m)?.[1]?.trim()
  const checks = [...section.matchAll(/^- \*\*(pass|fail|uncertain)\s+[—–-]\s+([^:*]+):\*\*\s*(.*)$/gim)]
    .map((match) => ({
      status: match[1].toLowerCase(),
      criterion: match[2].trim(),
      reason: match[3].trim()
    }))
  return { verdict: verdict || 'needs_review', summary: summary || '', checks }
}

/**
 * Converts GitHub issue data to the format expected by DirectoryEntry/OrganizationEntry components
 * @param {Object} issue The GitHub issue object
 * @returns {Object} The formatted entry data
 */
export function convertIssueToEntry(issue) {
  if (!issue || !issue.body) {
    return null
  }
  const entryData = parseIssueBody(issue.body)
  if (!entryData) {
    return null
  }

  // Determine entry type from issue labels, title, or entryData
  const hasOrgLabel =
    issue.labels &&
    issue.labels.some(
      (label) =>
        label.name.toLowerCase() === 'organization' || label.name.toLowerCase() === 'organizations'
    )
  const hasMicronationLabel =
    issue.labels &&
    issue.labels.some(
      (label) =>
        label.name.toLowerCase() === 'micronation' || label.name.toLowerCase() === 'micronations'
    )

  let isMicronation = false
  if (hasOrgLabel) {
    isMicronation = false
  } else if (hasMicronationLabel) {
    isMicronation = true
  } else if (issue.title && /^New organization submission/i.test(issue.title)) {
    isMicronation = false
  } else if (issue.title && /^New micronation submission/i.test(issue.title)) {
    isMicronation = true
  } else if (entryData.entryType) {
    isMicronation = entryData.entryType === 'micronation'
  } else {
    isMicronation = !!entryData.flag || !entryData.logo
  }

  // Extract base64 image if present and convert to data URL for preview
  const base64Image = extractBase64Image(issue.body)
  const fileMetadata = extractFileMetadata(issue.body)

  let imageDataUrl = null
  if (base64Image) {
    // Rebuild the data URL from the stored extension; JPEG uses the MIME subtype
    // "jpeg" even when its filename extension is "jpg".
    const extension = fileMetadata?.name?.split('.').pop()?.toLowerCase() || 'png'
    const mimeSubtype = extension === 'jpg' ? 'jpeg' : extension
    imageDataUrl = `data:image/${mimeSubtype};base64,${base64Image}`
  }

  // Add issue metadata
  const formatted = {
    ...entryData,
    aiReview: parseAiReviewFromIssueBody(issue.body),
    id: issue.id, // Use issue ID as entry ID
    directoryEntryId: entryData.id || entryData.directoryId || null,
    issueNumber: issue.number, // Store issue number for operations
    createdAt: issue.created_at || null, // GitHub submission creation timestamp
    githubUrl: issue.html_url, // Link to the issue
    issueBody: issue.body, // Store the original issue body for image extraction
    isEdit: !!issue.labels?.some((label) => label.name.toLowerCase() === 'edit-entry') || /^Edit (micronation|organization) submission/i.test(issue.title || ''),
    editTargetId: entryData.editTargetId || null,
    approved: false, // Issues are always pending approval
    searchDisplay: true,
    filterDisplay: true,
    entryType: isMicronation ? 'micronation' : 'organization',
    memberships: Array.isArray(entryData.memberships) ? entryData.memberships : [],
    languages: Array.isArray(entryData.languages) ? entryData.languages : [],
    contactInfo: Array.isArray(entryData.contactInfo) ? entryData.contactInfo : [],
    websites: Array.isArray(entryData.websites) ? entryData.websites : []
  }
  // Legacy issue bodies used creationDate for the founding date.
  if (!formatted.foundationDate && entryData.creationDate) {
    formatted.foundationDate = normalizeDate(entryData.creationDate)
  }
  const submittedAt = issue.created_at ? new Date(issue.created_at) : null
  if (submittedAt && Number.isFinite(submittedAt.getTime())) {
    formatted.creationDate = { _seconds: Math.floor(submittedAt.getTime() / 1000) }
  }

  // Use data URL for preview if image is in the issue, otherwise use the path
  if (isMicronation && imageDataUrl) {
    formatted.flag = imageDataUrl
  } else if (!isMicronation && imageDataUrl) {
    formatted.logo = imageDataUrl
  }

  // Ensure name has the required structure
  if (!formatted.name) {
    formatted.name = {
      main: issue.title.replace(/^New (micronation|organization) submission:\s*/i, '') || 'Unnamed',
      mainAlt: '',
      alt: [],
      title: '',
      titleAlt: ''
    }
  } else if (typeof formatted.name === 'string') {
    formatted.name = {
      main: formatted.name,
      mainAlt: '',
      alt: [],
      title: '',
      titleAlt: ''
    }
  } else {
    formatted.name = {
      main:
        formatted.name.main ||
        issue.title.replace(/^New (micronation|organization) submission:\s*/i, '') ||
        'Unnamed',
      mainAlt: formatted.name.mainAlt || '',
      alt: Array.isArray(formatted.name.alt) ? formatted.name.alt : [],
      title: formatted.name.title || '',
      titleAlt: formatted.name.titleAlt || ''
    }
  }

  // Ensure author has the required structure
  if (!formatted.author || typeof formatted.author !== 'object') {
    formatted.author = {
      name: typeof formatted.author === 'string' ? formatted.author : 'Unknown',
      email: ''
    }
  }

  // Normalize foundationDate
  if (!formatted.foundationDate) {
    if (
      formatted.creationDate &&
      (formatted.creationDate._seconds || formatted.creationDate.seconds)
    ) {
      formatted.foundationDate = {
        _seconds: formatted.creationDate._seconds || formatted.creationDate.seconds
      }
    } else {
      formatted.foundationDate = { _seconds: 0 }
    }
  } else if (typeof formatted.foundationDate === 'object') {
    if (!formatted.foundationDate._seconds && formatted.foundationDate.seconds) {
      formatted.foundationDate._seconds = formatted.foundationDate.seconds
    } else if (!formatted.foundationDate._seconds) {
      formatted.foundationDate = { _seconds: 0 }
    }
  } else {
    formatted.foundationDate = { _seconds: 0 }
  }

  return formatted
}

/**
 * Adds a label to a GitHub issue
 * @param {number} issueNumber The issue number
 * @param {string} label The label to add
 * @returns {Promise<Object>} The response from GitHub API
 */
export async function addIssueLabel(issueNumber, label) {
  try {
    return await githubServerData('addIssueLabel', { issueNumber, label })
  } catch (error) {
    console.error('Error adding label to issue:', error)
    throw error
  }
}

/**
 * Closes a GitHub issue
 * @param {number} issueNumber The issue number
 * @returns {Promise<Object>} The response from GitHub API
 */
export async function closeIssue(issueNumber) {
  try {
    return await githubServerData('closeIssue', { issueNumber })
  } catch (error) {
    console.error('Error closing issue:', error)
    throw error
  }
}

/**
 * Adds a comment to a GitHub issue
 * @param {number} issueNumber The issue number
 * @param {string} comment The comment text
 * @returns {Promise<Object>} The response from GitHub API
 */
export async function addIssueComment(issueNumber, comment) {
  try {
    return await githubServerData('addIssueComment', { issueNumber, comment })
  } catch (error) {
    console.error('Error adding comment to issue:', error)
    throw error
  }
}

/** Updates an issue's JSON submission while preserving the rest of its body. */
export async function updateGitHubIssueEntry(
  issueNumber,
  issueBody,
  entryData,
  entryType,
  mediaChange = null
) {
  const jsonBlock = /(```json\s*\r?\n)[\s\S]*?(\r?\n```)/
  if (!jsonBlock.test(issueBody || '')) {
    throw new Error('Could not find the submission JSON block in the GitHub issue.')
  }

  const entryTypeLabel = entryType.charAt(0).toUpperCase() + entryType.slice(1)
  let body = issueBody
    .replace(
      jsonBlock,
      (match, opening, closing) => `${opening}${JSON.stringify(entryData, null, 2)}${closing}`
    )
    .replace(/^## New .* Submission$/m, `## New ${entryTypeLabel} Submission`)

  const replaceMediaSection = (source, heading, section) => {
    const pattern = new RegExp(`### ${heading}\\r?\\n[\\s\\S]*?(?=\\r?\\n### |$)`)
    if (pattern.test(source)) return source.replace(pattern, section)
    const insertionPoint = source.indexOf('### Submitted By')
    if (insertionPoint < 0) return `${source.trimEnd()}\n\n${section}\n`
    return `${source.slice(0, insertionPoint).trimEnd()}\n\n${section}\n\n${source.slice(
      insertionPoint
    )}`
  }

  if (mediaChange?.mode === 'upload') {
    body = replaceMediaSection(
      body,
      'Media File Metadata',
      `### Media File Metadata\n- **File Name:** \`${mediaChange.name}\`\n- **Target Path:** \`${mediaChange.path}\``
    )
    body = replaceMediaSection(
      body,
      'Media File Base64',
      `### Media File Base64\n\`\`\`base64\n${mediaChange.base64}\n\`\`\``
    )
  } else if (mediaChange?.mode === 'url') {
    body = body
      .replace(/### Media File Metadata\r?\n[\s\S]*?(?=\r?\n### |$)/, '')
      .replace(/### Media File Base64\r?\n[\s\S]*?(?=\r?\n### |$)/, '')
      .replace(/\n{3,}/g, '\n\n')
  }
  return githubServerData('updateIssue', {
    issueNumber,
    title: `New ${entryType} submission: ${entryData.name?.main || 'Unnamed'}`,
    body
  })
}

/**
 * Fetches a file from the GitHub repository
 * @param {string} path The file path in the repository (e.g., 'public/micronations.json')
 * @returns {Promise<Object>} The file content and SHA
 */
export async function fetchRepoFile(path) {
  try {
    const response = await githubServerRequest('getRepoFile', { path })

    const responseText = await response.text()
    let data
    try {
      data = responseText ? JSON.parse(responseText) : null
    } catch {
      throw new Error(
        `GitHub returned an unreadable response while fetching ${path} (HTTP ${response.status}).`
      )
    }

    if (!response.ok) {
      throw new Error(
        `GitHub API error (${response.status}): ${
          data?.message || response.statusText || 'Request failed'
        }`
      )
    }

    if (!data || !data.sha) {
      throw new Error(
        `GitHub returned no file content for ${path}. Check that the repository and file path are configured correctly.`
      )
    }

    let content
    if (typeof data.content === 'string' && data.content.trim()) {
      // GitHub may wrap base64 content across multiple lines. Decode UTF-8 so
      // non-ASCII names and descriptions survive before parsing the JSON.
      const binaryContent = atob(data.content.replace(/\s/g, ''))
      const bytes = Uint8Array.from(binaryContent, (character) => character.charCodeAt(0))
      content = new TextDecoder().decode(bytes)
    } else {
      // The Contents API omits `content` for files larger than 1 MB. Fetch
      // the blob by SHA using GitHub's raw media type in that case.
      const blobResponse = await githubServerRequest('getRepoBlob', { sha: data.sha })
      if (!blobResponse.ok) {
        const blobError = await blobResponse.text()
        let message = blobResponse.statusText || 'Request failed'
        try {
          message = JSON.parse(blobError).message || message
        } catch {
          // Keep the HTTP status text when GitHub does not return JSON.
        }
        throw new Error(`GitHub API error (${blobResponse.status}): ${message}`)
      }
      const blob = await blobResponse.json()
      const binary = atob(String(blob.content || '').replace(/\s/g, ''))
      content = new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)))
    }

    let jsonContent
    try {
      jsonContent = JSON.parse(content)
    } catch {
      throw new Error(`The repository file ${path} does not contain valid JSON.`)
    }

    if (!Array.isArray(jsonContent)) {
      throw new Error(`The repository file ${path} must contain a JSON array.`)
    }

    return {
      content: jsonContent,
      sha: data.sha
    }
  } catch (error) {
    console.error('Error fetching repo file:', error)
    throw error
  }
}

/**
 * Updates a file in the GitHub repository
 * @param {string} path The file path in the repository
 * @param {string} content The new file content (as JSON string)
 * @param {string} sha The current file SHA (required for updates)
 * @param {string} commitMessage The commit message
 * @returns {Promise<Object>} The response from GitHub API
 */
export async function updateRepoFile(path, content, sha, commitMessage) {
  try {
    return await githubServerData('updateRepoFile', { path, content, sha, commitMessage })
  } catch (error) {
    console.error('Error updating repo file:', error)
    throw error
  }
}

/**
 * Creates a new file in the GitHub repository
 * @param {string} path The file path in the repository
 * @param {string} content The file content (as base64 string for binary files)
 * @param {string} commitMessage The commit message
 * @returns {Promise<Object>} The response from GitHub API
 */
export async function createRepoFile(path, content, commitMessage) {
  try {
    return await githubServerData('createRepoFile', { path, content, commitMessage })
  } catch (error) {
    console.error('Error creating repo file:', error)
    throw error
  }
}

/**
 * Extracts base64 image data from a GitHub issue body
 * @param {string} body The issue body
 * @returns {string|null} The base64 image data or null
 */
export function extractBase64Image(body) {
  if (!body) return null
  const match = body.match(/```base64\s*\r?\n([\s\S]*?)\r?\n```/)
  if (!match) {
    return null
  }
  return match[1].trim()
}

/**
 * Extracts file metadata from a GitHub issue body
 * @param {string} body The issue body
 * @returns {Object|null} The file metadata or null
 */
export function extractFileMetadata(body) {
  const nameMatch = body.match(/\*\*File Name:\*\* `([^`]+)`/)
  const pathMatch = body.match(/\*\*Target Path:\*\* `([^`]+)`/)

  if (!nameMatch || !pathMatch) {
    return null
  }

  return {
    name: nameMatch[1],
    path: pathMatch[1]
  }
}

export default {
  createGitHubIssue,
  fetchGitHubIssues,
  parseIssueBody,
  convertIssueToEntry,
  addIssueLabel,
  closeIssue,
  addIssueComment,
  updateGitHubIssueEntry,
  fetchRepoFile,
  updateRepoFile,
  createRepoFile,
  extractBase64Image,
  extractFileMetadata,
  getPublicAssetPath
}
