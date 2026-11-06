import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'

const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'))
const issue = event.issue
const decision = event.label?.name

if (!issue || !['approved', 'rejected', 'send-email'].includes(decision)) {
  throw new Error('This workflow only handles moderation and send-email labels.')
}

const entryMatch = issue.body?.match(/```json\s*\n([\s\S]*?)\n```/)
if (!entryMatch) throw new Error('No entry JSON found in the issue body.')

const entry = JSON.parse(entryMatch[1])
const recipient = String(entry.author?.email || '').trim()
if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient)) {
  throw new Error('The entry does not contain a valid author.email address.')
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]))

const token = process.env.GITHUB_TOKEN
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
const comments = []
for (let page = 1; ; page += 1) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments?per_page=100&page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  if (!response.ok) throw new Error(`Could not load issue comments (HTTP ${response.status}).`)
  const batch = await response.json()
  comments.push(...batch)
  if (batch.length < 100) break
}

const localeMarkerPattern = /<!--\s*TMD_EMAIL_LOCALE:(es|en)\s*-->/i
const localeMarkerComment = [...comments].reverse().find((comment) => localeMarkerPattern.test(comment.body || ''))
const markerLanguage = localeMarkerComment?.body?.match(localeMarkerPattern)?.[1]?.toLowerCase()
const emailComments = comments
  .map((comment) => ({
    ...comment,
    body: String(comment.body || '').replace(/<!--\s*TMD_EMAIL_LOCALE:(?:es|en)\s*-->/ig, '').trim()
  }))
  .filter((comment) => comment.body)

const isApproved = decision === 'approved'
const isDecisionEmail = decision !== 'send-email'
const authorLanguage = ['es', 'spanish'].includes(String(entry.author?.language || '').toLowerCase())
  ? 'es'
  : ['en', 'english'].includes(String(entry.author?.language || '').toLowerCase())
    ? 'en'
    : null
const locale = authorLanguage || markerLanguage || 'en'
const copy = locale === 'es'
  ? {
      approved: 'aprobada',
      rejected: 'rechazada',
      approvedSubject: 'Actualización de moderación: entrada aprobada',
      rejectedSubject: 'Actualización de moderación: entrada rechazada',
      commentsSubject: 'Comentarios sobre tu contribución',
      hello: 'Hola',
      newComments: 'Hay comentarios sobre tu contribución',
      comments: 'Comentarios de moderación',
      noComments: 'No hay comentarios en esta notificación.',
      commentBy: 'Comentario de',
      footer: 'Mensaje automático de The Micronational Directory.'
    }
  : {
      approved: 'approved',
      rejected: 'rejected',
      approvedSubject: 'Moderation update: submission approved',
      rejectedSubject: 'Moderation update: submission rejected',
      commentsSubject: 'Comments on your submission',
      hello: 'Hello',
      newComments: 'There are comments on your submission',
      comments: 'Moderation comments',
      noComments: 'There are no comments in this notification.',
      commentBy: 'Comment by',
      footer: 'Automated message from The Micronational Directory.'
    }
const title = String(entry.name?.main || issue.title || (locale === 'es' ? 'tu contribución' : 'your submission'))
const dateLocale = locale === 'es' ? 'es-AR' : 'en-US'
const commentsHtml = emailComments.length
  ? emailComments.map((comment) => `
      <article style="margin:16px 0;padding:16px;border:1px solid #d7deea;border-radius:8px;background:#ffffff;">
        <p style="margin:0 0 8px;color:#566174;font-size:13px;"><strong>${escapeHtml(copy.commentBy)} ${escapeHtml(comment.user?.login || (locale === 'es' ? 'moderación' : 'moderation'))}</strong> · ${escapeHtml(new Date(comment.created_at).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }))} UTC</p>
        <div style="color:#273449;line-height:1.6;white-space:pre-wrap;">${escapeHtml(comment.body)}</div>
      </article>`).join('')
  : `<p style="color:#566174;">${escapeHtml(copy.noComments)}</p>`
const subject = isDecisionEmail
  ? (isApproved ? copy.approvedSubject : copy.rejectedSubject)
  : copy.commentsSubject
const decisionStatus = isApproved ? copy.approved : copy.rejected
const logoUrl = 'https://the-micronational-directory.vercel.app/images/brand/plain-logo1.png'

const html = `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:28px 12px;background:#f1f4f9;color:#202a3a;font-family:Arial,Helvetica,sans-serif;">
    <main style="max-width:620px;margin:0 auto;border:1px solid #d7deea;border-radius:12px;overflow:hidden;background:#ffffff;">
      <header style="padding:24px;text-align:center;background:#1e2638;color:#ffffff;">
        <img src="${logoUrl}" width="72" height="72" alt="TMD" style="display:block;width:72px;height:72px;margin:0 auto 12px;" />
        <h1 style="margin:0;font-size:22px;">The Micronational Directory</h1>
      </header>
      <section style="padding:28px 30px;">
        <p style="margin-top:0;">${escapeHtml(copy.hello)}${entry.author?.name ? ` ${escapeHtml(entry.author.name)}` : ''},</p>
        ${isDecisionEmail
    ? locale === 'es'
      ? `<p>La contribución <strong>${escapeHtml(title)}</strong> fue <strong>${escapeHtml(decisionStatus)}</strong>.</p>`
      : `<p>Your submission <strong>${escapeHtml(title)}</strong> was <strong>${escapeHtml(decisionStatus)}</strong>.</p>`
    : `<p>${escapeHtml(copy.newComments)} <strong>${escapeHtml(title)}</strong>.</p>`}
        <h2 style="margin:28px 0 12px;font-size:17px;">${escapeHtml(copy.comments)}</h2>
        ${commentsHtml}
      </section>
      <footer style="padding:16px 24px;background:#f7f9fc;color:#667085;text-align:center;font-size:12px;">${escapeHtml(copy.footer)}</footer>
    </main>
  </body>
</html>`

await mkdir('.github/email', { recursive: true })
await writeFile('.github/email/moderation-email.html', html, 'utf8')
await appendFile(process.env.GITHUB_OUTPUT, `recipient=${recipient}\nsubject=${subject}\n`)
