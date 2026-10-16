/**
 * GitHub API utility functions for creating issues with embedded Base64 media
 */

/**
 * Converts entry data to the format expected in the JSON files
 * @param {Object} entryData The raw entry data from the form
 * @param {string} entryType The type of entry ('micronation' or 'organization')
 * @returns {Object} The formatted entry data
 */
function formatEntryForJSON(entryData, entryType) {
  const formatted = {
    name: entryData.name,
    motto: entryData.motto || '',
    languages: entryData.languages || [],
    contactInfo: entryData.contactInfo || [],
    websites: entryData.websites || [],
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
      const date = new Date(entryData.foundationDate)
      formatted.creationDate = {
        _seconds: Math.floor(date.getTime() / 1000)
      }
    }

    if (entryData.location) {
      formatted.location = {
        _latitude: entryData.location.latitude || 0,
        _longitude: entryData.location.longitude || 0
      }
    }
  } else {
    if (entryData.logoFile) {
      formatted.logo = `/images/logos/${entryData.logoFile.name}`
    } else {
      formatted.logo = entryData.logo || ''
    }

    if (entryData.foundationDate) {
      const date = new Date(entryData.foundationDate)
      formatted.creationDate = {
        _seconds: Math.floor(date.getTime() / 1000)
      }
    }
  }

  return formatted
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

export default { createGitHubIssue }
