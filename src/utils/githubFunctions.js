/**
 * GitHub API utility functions for creating issues with embedded Base64 media
 */
import { createFirestoreStyleId } from './firestoreStyleId.js'

/**
 * Converts entry data to the format expected in the JSON files
 * @param {Object} entryData The raw entry data from the form
 * @param {string} entryType The type of entry ('micronation' or 'organization')
 * @returns {Object} The formatted entry data
 */
function formatEntryForJSON(entryData, entryType) {
  const formatted = {
    directoryId: entryData.directoryId || createFirestoreStyleId(),
    name: entryData.name,
    motto: entryData.motto || '',
    languages: entryData.languages || [],
    contactInfo: entryData.contactInfo || [],
    websites: entryData.websites || [],
    author: entryData.author || { name: 'Unknown', email: 'Unknown' },
    approved: false
  }

  if (entryType === 'micronation') {
    if (entryData.flagFile) {
      formatted.flag = `/images/flags/${entryData.flagFile.name}`
    } else {
      formatted.flag = entryData.flag || ''
    }
    formatted.type = entryData.type || []
    formatted.capital = entryData.capital || ''
    formatted.currency = entryData.currency || ''
    formatted.memberships = entryData.memberships || ''

    if (entryData.foundationDate) {
      let date
      if (entryData.foundationDate.seconds) {
        // Firebase timestamp format
        date = new Date(entryData.foundationDate.seconds * 1000)
      } else {
        // Date object or string
        date = new Date(entryData.foundationDate)
      }
      formatted.creationDate = {
        _seconds: Math.floor(date.getTime() / 1000)
      }
    }

    if (entryData.location) {
      const latitude = entryData.location.latitude
      const longitude = entryData.location.longitude
      formatted.location = {
        latitude: Number(latitude ?? 0),
        longitude: Number(longitude ?? 0)
      }
    }
  } else {
    if (entryData.logoFile) {
      formatted.logo = `/images/logos/${entryData.logoFile.name}`
    } else {
      formatted.logo = entryData.logo || ''
    }

    if (entryData.foundationDate) {
      let date
      if (entryData.foundationDate.seconds) {
        // Firebase timestamp format
        date = new Date(entryData.foundationDate.seconds * 1000)
      } else {
        // Date object or string
        date = new Date(entryData.foundationDate)
      }
      formatted.creationDate = {
        _seconds: Math.floor(date.getTime() / 1000)
      }
    }
  }

  return formatted
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value)
  const chunks = []
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, index + chunkSize)))
  }

  return btoa(chunks.join(''))
}

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  if (value && typeof value === 'object') {
    const properties = Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    return `{${properties.join(',')}}`
  }
  return JSON.stringify(value)
}

/**
 * Creates a GitHub issue containing the entry JSON and Base64 encoded file
 * @param {Object} entryData The entry data from the form
 * @param {string} entryType The type of entry ('micronation' or 'organization')
 * @returns {Promise<Object>} The response from GitHub API
 */
export async function createGitHubIssue(entryData, entryType) {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const fileData = entryData.flagFile || entryData.logoFile
  const folder = entryType === 'micronation' ? 'flags' : 'logos'
  const formattedData = formatEntryForJSON(entryData, entryType)
  const mainName = entryData.name?.main || entryData.name || 'Unnamed'

  const title = `New ${entryType} submission: ${mainName}`

  // Si la imagen viene en formato Data URI (data:image/png;base64,...), conservamos solo el hash base64
  let base64Content = ''
  if (fileData && fileData.data) {
    base64Content = fileData.data.includes(',') ? fileData.data.split(',')[1] : fileData.data
    const MAX_BASE64_LENGTH = 50000; // ~37 KB (Límite seguro para el body de GitHub)
    if (base64Content.length > MAX_BASE64_LENGTH) {
      console.warn(`La imagen Base64 excede el límite permitido (${base64Content.length} caracteres).`);
      throw new Error('La imagen adjunta es demasiado pesada. Por favor, sube una imagen de menor peso (máximo ~35 KB).');
    }
  }

  // Estructuramos el issue con marcadores claros para la GitHub Action
  let body = `## New ${entryType.charAt(0).toUpperCase() + entryType.slice(1)} Submission

A new ${entryType} submission is pending approval.

### Entry Data
\`\`\`json
${JSON.stringify(formattedData, null, 2)}
\`\`\`
`

  if (fileData && base64Content) {
    body += `
### Media File Metadata
- **File Name:** \`${fileData.name}\`
- **Target Path:** \`public/images/${folder}/${fileData.name}\`

### Media File Base64
\`\`\`base64
${base64Content}
\`\`\`
`
  }

  body += `
### Submitted By
- **Name:** ${entryData.author?.name || 'Unknown'}
- **Email:** ${entryData.author?.email || 'Unknown'}

---
### ⚙️ Approval Instructions
Add the label **\`approved\`** or close this issue with the **\`approved\`** label applied to automatically commit the image and update the JSON file.
`

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        body: body,
        labels: [entryType, 'new-entry', 'review-required']
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating GitHub issue:', error)
    throw error
  }
}

/**
 * Fetches GitHub issues with specific labels, paginating to retrieve all results
 * @param {Array} labels Labels to filter by (e.g., ['new-entry', 'review-required'])
 * @returns {Promise<Array>} Array of issues
 */
export async function fetchGitHubIssues(labels = ['new-entry', 'review-required']) {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const labelList = Array.isArray(labels) ? labels : (labels ? [labels] : [])
  let allIssues = []
  let page = 1

  try {
    while (true) {
      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=open&per_page=100&page=${page}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`GitHub API error: ${errorData.message}`)
      }

      const issues = await response.json()
      if (!issues || issues.length === 0) {
        break
      }

      // Filter out pull requests (GitHub API /issues returns PRs as well)
      const nonPrIssues = issues.filter(issue => !issue.pull_request)
      allIssues = allIssues.concat(nonPrIssues)

      if (issues.length < 100) {
        break
      }
      page++
    }

    // Filter by labels if specified (matches if the issue has any of the specified labels)
    if (labelList.length > 0) {
      return allIssues.filter(issue =>
        issue.labels && issue.labels.some(label => labelList.includes(label.name))
      )
    }

    return allIssues
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
  const hasOrgLabel = issue.labels && issue.labels.some(label =>
    label.name.toLowerCase() === 'organization' || label.name.toLowerCase() === 'organizations'
  )
  const hasMicronationLabel = issue.labels && issue.labels.some(label =>
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
    // Determine image type from file extension or default to png
    const extension = fileMetadata?.name?.split('.').pop() || 'png'
    imageDataUrl = `data:image/${extension};base64,${base64Image}`
  }

  // Add issue metadata
  const formatted = {
    ...entryData,
    id: issue.id, // Use issue ID as entry ID
    issueNumber: issue.number, // Store issue number for operations
    createdAt: issue.created_at || null, // GitHub submission creation timestamp
    githubUrl: issue.html_url, // Link to the issue
    issueBody: issue.body, // Store the original issue body for image extraction
    approved: false, // Issues are always pending approval
    searchDisplay: true,
    filterDisplay: true,
    entryType: isMicronation ? 'micronation' : 'organization',
    memberships: Array.isArray(entryData.memberships) ? entryData.memberships : [],
    languages: Array.isArray(entryData.languages) ? entryData.languages : [],
    contactInfo: Array.isArray(entryData.contactInfo) ? entryData.contactInfo : [],
    websites: Array.isArray(entryData.websites) ? entryData.websites : []
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
      main: formatted.name.main || issue.title.replace(/^New (micronation|organization) submission:\s*/i, '') || 'Unnamed',
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
    if (formatted.creationDate && (formatted.creationDate._seconds || formatted.creationDate.seconds)) {
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
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}/labels`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        labels: [label]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    return await response.json()
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
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        state: 'closed'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    return await response.json()
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
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}/comments`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        body: comment
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error adding comment to issue:', error)
    throw error
  }
}

/** Updates an issue's JSON submission while preserving the rest of its body. */
export async function updateGitHubIssueEntry(issueNumber, issueBody, entryData, entryType, mediaChange = null) {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    throw new Error('GitHub credentials not configured')
  }

  const jsonBlock = /(```json\s*\r?\n)[\s\S]*?(\r?\n```)/
  if (!jsonBlock.test(issueBody || '')) {
    throw new Error('Could not find the submission JSON block in the GitHub issue.')
  }

  const entryTypeLabel = entryType.charAt(0).toUpperCase() + entryType.slice(1)
  let body = issueBody.replace(jsonBlock, (match, opening, closing) =>
    `${opening}${JSON.stringify(entryData, null, 2)}${closing}`
  ).replace(/^## New .* Submission$/m, `## New ${entryTypeLabel} Submission`)

  const replaceMediaSection = (source, heading, section) => {
    const pattern = new RegExp(`### ${heading}\\r?\\n[\\s\\S]*?(?=\\r?\\n### |$)`)
    if (pattern.test(source)) return source.replace(pattern, section)
    const insertionPoint = source.indexOf('### Submitted By')
    if (insertionPoint < 0) return `${source.trimEnd()}\n\n${section}\n`
    return `${source.slice(0, insertionPoint).trimEnd()}\n\n${section}\n\n${source.slice(insertionPoint)}`
  }

  if (mediaChange?.mode === 'upload') {
    body = replaceMediaSection(
      body,
      'Media File Metadata',
      `### Media File Metadata\n- **File Name:** \`${mediaChange.name}\`\n- **Target Path:** \`${mediaChange.path}\``
    )
    body = replaceMediaSection(body, 'Media File Base64', `### Media File Base64\n\`\`\`base64\n${mediaChange.base64}\n\`\`\``)
  } else if (mediaChange?.mode === 'url') {
    body = body
      .replace(/### Media File Metadata\r?\n[\s\S]*?(?=\r?\n### |$)/, '')
      .replace(/### Media File Base64\r?\n[\s\S]*?(?=\r?\n### |$)/, '')
      .replace(/\n{3,}/g, '\n\n')
  }
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: `New ${entryType} submission: ${entryData.name?.main || 'Unnamed'}`,
      body
    })
  })

  const responseText = await response.text()
  let result
  try {
    result = responseText ? JSON.parse(responseText) : null
  } catch {
    throw new Error(`GitHub returned an unreadable response while updating issue #${issueNumber} (HTTP ${response.status}).`)
  }

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}): ${result?.message || response.statusText || 'Request failed'}`)
  }

  return result
}

/**
 * Fetches a file from the GitHub repository
 * @param {string} path The file path in the repository (e.g., 'public/micronations.json')
 * @returns {Promise<Object>} The file content and SHA
 */
export async function fetchRepoFile(path) {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })

    const responseText = await response.text()
    let data
    try {
      data = responseText ? JSON.parse(responseText) : null
    } catch {
      throw new Error(`GitHub returned an unreadable response while fetching ${path} (HTTP ${response.status}).`)
    }

    if (!response.ok) {
      throw new Error(`GitHub API error (${response.status}): ${data?.message || response.statusText || 'Request failed'}`)
    }

    if (!data || !data.sha) {
      throw new Error(`GitHub returned no file content for ${path}. Check that the repository and file path are configured correctly.`)
    }

    let content
    if (typeof data.content === 'string' && data.content.trim()) {
      // GitHub may wrap base64 content across multiple lines. Decode UTF-8 so
      // non-ASCII names and descriptions survive before parsing the JSON.
      const binaryContent = atob(data.content.replace(/\s/g, ''))
      const bytes = Uint8Array.from(binaryContent, character => character.charCodeAt(0))
      content = new TextDecoder().decode(bytes)
    } else {
      // The Contents API omits `content` for files larger than 1 MB. Fetch
      // the blob by SHA using GitHub's raw media type in that case.
      const blobUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs/${data.sha}`
      const blobResponse = await fetch(blobUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.raw'
        }
      })
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
      content = await blobResponse.text()
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
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`

  // GitHub expects base64 encoded UTF-8. btoa(content) fails for Unicode.
  const base64Content = encodeBase64Utf8(content)

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: sha
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    return await response.json()
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
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const repoOwner = import.meta.env.VITE_GITHUB_REPO_OWNER
  const repoName = import.meta.env.VITE_GITHUB_REPO_NAME

  if (!token || !repoOwner || !repoName) {
    console.error('GitHub credentials not configured')
    throw new Error('GitHub credentials not configured')
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: content
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    return await response.json()
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
  extractFileMetadata
}
