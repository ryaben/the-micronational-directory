const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function createId() {
  let id = ''
  const values = new Uint8Array(32)
  while (id.length < 20) {
    globalThis.crypto.getRandomValues(values)
    for (const value of values) {
      if (value < 248) id += ID_ALPHABET[value % 62]
      if (id.length === 20) break
    }
  }
  return id
}

function normalizeDate(value) {
  if (!value) return { _seconds: 0 }
  if (value._seconds != null) return { _seconds: Number(value._seconds) }
  if (value.seconds != null) return { _seconds: Number(value.seconds) }
  const date = new Date(value)
  return { _seconds: Number.isFinite(date.getTime()) ? Math.floor(date.getTime() / 1000) : 0 }
}

function formatEntryForJSON(entryData, entryType) {
  const formatted = {
    id: entryData.id || entryData.directoryId || createId(),
    name: entryData.name,
    motto: entryData.motto || '',
    languages: entryData.languages || [],
    contactInfo: entryData.contactInfo || [],
    websites: entryData.websites || [],
    author: entryData.author || { name: 'Unknown', email: 'Unknown' },
    approved: false
  }
  if (Array.isArray(entryData.uncertain)) formatted.uncertain = entryData.uncertain

  if (entryType === 'micronation') {
    formatted.flag = entryData.flagFile ? `/images/flags/${entryData.flagFile.name}` : entryData.flag || ''
    formatted.type = entryData.type || []
    formatted.capital = entryData.capital || ''
    formatted.currency = entryData.currency || ''
    formatted.memberships = entryData.memberships || ''
    formatted.foundationDate = normalizeDate(entryData.foundationDate)
    if (entryData.location) {
      formatted.location = {
        latitude: Number(entryData.location.latitude ?? 0),
        longitude: Number(entryData.location.longitude ?? 0)
      }
    }
  } else {
    formatted.logo = entryData.logoFile ? `/images/logos/${entryData.logoFile.name}` : entryData.logo || ''
    formatted.foundationDate = normalizeDate(entryData.foundationDate)
  }

  formatted.creationDate = { _seconds: Math.floor(Date.now() / 1000) }
  return formatted
}

function sourceResearchSection(sourceResearch) {
  if (!sourceResearch) return ''
  const evidence = Array.isArray(sourceResearch.evidence) ? sourceResearch.evidence : []
  const lines = evidence.map((item) => {
    let source = ''
    try {
      const url = new URL(item.sourceUrl)
      if (['http:', 'https:'].includes(url.protocol)) source = ` ([source](<${url.toString()}>))`
    } catch {}
    const excerpt = String(item.excerpt || '').replace(/@/g, '@\u200b').replace(/[`*_{}\[\]()#+\-.!|>\\]/g, '\\$&').replace(/[\r\n]+/g, ' ').slice(0, 320)
    const field = String(item.field || 'field').replace(/[\r\n]/g, ' ').slice(0, 100)
    return `- **${field} — ${item.status === 'supported' ? 'supported' : 'uncertain'}:** ${excerpt}${source}`
  }).join('\n') || '- No field-level citations were returned; review every proposed value manually.'
  const sourceName = String(sourceResearch.sourceName || 'local source index').replace(/@/g, '@\u200b').replace(/[\r\n]/g, ' ').slice(0, 200)
  return `\n### Source Research (AI-generated; review required)\nResearch source: **${sourceName}**. This draft is unapproved. Verify each value, citation, duplicate, activity, and eligibility before moderation.\n\n### Field Evidence\n${lines}\n\nThe source research process did not approve this entry or edit public JSON files.\n`
}

export async function createGitHubIssueWithCredentials(entryData, entryType, options = {}, credentials = {}) {
  const { token, repoOwner, repoName } = credentials
  if (!token || !repoOwner || !repoName) throw new Error('GitHub credentials not configured')
  const fileData = entryData.flagFile || entryData.logoFile
  const folder = entryType === 'micronation' ? 'flags' : 'logos'
  const formattedData = formatEntryForJSON(entryData, entryType)
  if (options.editTargetId && entryData.creationDate) formattedData.creationDate = entryData.creationDate
  const mainName = entryData.name?.main || entryData.name || 'Unnamed'
  const isEdit = !!options.editTargetId
  const title = `${isEdit ? 'Edit' : 'New'} ${entryType} submission: ${mainName}`
  if (isEdit) formattedData.editTargetId = options.editTargetId

  let base64Content = ''
  if (fileData?.data) {
    base64Content = fileData.data.includes(',') ? fileData.data.split(',')[1] : fileData.data
    if (base64Content.length > 50000) throw new Error('The attached image is too large. Please upload a smaller image (maximum ~35 KB).')
  }

  let body = `## ${isEdit ? 'Edit' : 'New'} ${entryType.charAt(0).toUpperCase() + entryType.slice(1)} Submission\n\n${isEdit ? `A proposed edit for directory entry ${options.editTargetId} is pending approval.` : `A new ${entryType} submission is pending approval.`} Fields listed in the "uncertain" array have uncertain values or lack precise confirmation.\n\n### Entry Data\n\n\`\`\`json\n${JSON.stringify(formattedData, null, 2).replace(/`/g, '\\u0060')}\n\`\`\`\n`
  if (fileData && base64Content) {
    body += `\n### Media File Metadata\n- **File Name:** \`${fileData.name}\`\n- **Target Path:** \`public/images/${folder}/${fileData.name}\`\n\n### Media File Base64\n\`\`\`base64\n${base64Content}\n\`\`\`\n`
  }
  if (entryData.aiReview) {
    body += `\n### AI preliminary review (not a final moderation decision)\n- **Triage:** ${entryData.aiReview.verdict || 'needs_review'}\n- **Summary:** ${entryData.aiReview.summary || 'No summary provided.'}\n\n${(entryData.aiReview.checks || []).map((check) => `- **${check.status || 'uncertain'} — ${check.criterion || 'Criterion'}:** ${check.reason || ''}`).join('\n')}\n\n<!-- AI_REVIEW_JSON\n${JSON.stringify(entryData.aiReview)}\n-->\n`
  }
  body += sourceResearchSection(options.sourceResearch)
  body += `\n### Submitted By\n- **Name:** ${entryData.author?.name || 'Unknown'}\n- **Email:** ${entryData.author?.email || 'Unknown'}\n\n---\n### ⚙️ Approval Instructions\nAdd the label **\`approved\`** or close this issue with the **\`approved\`** label applied to automatically commit the image and update the JSON file.\n`

  let response
  try {
    response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        body,
        labels: [entryType, isEdit ? 'edit-entry' : 'new-entry', 'review-required']
      })
    })
  } catch (error) {
    throw new Error(`GitHub issue creation request failed: ${error.cause?.code || error.message}`)
  }
  const result = await response.json()
  if (!response.ok) throw new Error(`GitHub API error: ${result.message || response.statusText}`)
  return result
}
