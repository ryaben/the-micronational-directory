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

const isApproved = decision === 'approved'
const isDecisionEmail = decision !== 'send-email'
const statusEs = isApproved ? 'aprobada' : 'rechazada'
const statusEn = isApproved ? 'approved' : 'rejected'
const title = String(entry.name?.main || issue.title || 'tu contribución')
const commentsHtml = comments.length
  ? comments.map((comment) => `
      <article style="margin:16px 0;padding:16px;border:1px solid #d7deea;border-radius:8px;background:#ffffff;">
        <p style="margin:0 0 8px;color:#566174;font-size:13px;"><strong>${escapeHtml(comment.user?.login || 'Moderación')}</strong> · ${escapeHtml(new Date(comment.created_at).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }))} UTC</p>
        <div style="color:#273449;line-height:1.6;white-space:pre-wrap;">${escapeHtml(comment.body)}</div>
      </article>`).join('')
  : '<p style="color:#566174;">No hay comentarios en la incidencia / There are no issue comments.</p>'
const subject = isDecisionEmail
  ? `Actualización de moderación / Moderation update: ${statusEn}`
  : 'Comentarios de moderación / Moderation comments'

const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:28px 12px;background:#f1f4f9;color:#202a3a;font-family:Arial,Helvetica,sans-serif;">
    <main style="max-width:620px;margin:0 auto;border:1px solid #d7deea;border-radius:12px;overflow:hidden;background:#ffffff;">
      <header style="padding:24px;text-align:center;background:#1e2638;color:#ffffff;">
        <h1 style="margin:0;font-size:22px;">The Micronational Directory</h1>
      </header>
      <section style="padding:28px 30px;">
        <p style="margin-top:0;">Hola${entry.author?.name ? ` ${escapeHtml(entry.author.name)}` : ''},</p>
        ${isDecisionEmail
    ? `<p>La contribución <strong>${escapeHtml(title)}</strong> fue <strong style="color:${isApproved ? '#237a48' : '#ad3434'};">${statusEs}</strong>.</p>`
    : `<p>Hay comentarios nuevos sobre tu contribución <strong>${escapeHtml(title)}</strong>.</p>`}
        <p>Hello${entry.author?.name ? ` ${escapeHtml(entry.author.name)}` : ''},</p>
        ${isDecisionEmail
    ? `<p>Your contribution <strong>${escapeHtml(title)}</strong> was <strong style="color:${isApproved ? '#237a48' : '#ad3434'};">${statusEn}</strong>.</p>`
    : `<p>There are new comments on your contribution <strong>${escapeHtml(title)}</strong>.</p>`}
        <h2 style="margin:28px 0 12px;font-size:17px;">Comentarios / Comments</h2>
        ${commentsHtml}
        <p style="margin:28px 0 0;"><a href="${escapeHtml(issue.html_url)}" style="display:inline-block;padding:12px 18px;border-radius:6px;background:#2868c7;color:#ffffff;text-decoration:none;font-weight:bold;">Ver incidencia / View issue</a></p>
      </section>
      <footer style="padding:16px 24px;background:#f7f9fc;color:#667085;text-align:center;font-size:12px;">Mensaje automático / Automated message from The Micronational Directory.</footer>
    </main>
  </body>
</html>`

await mkdir('.github/email', { recursive: true })
await writeFile('.github/email/moderation-email.html', html, 'utf8')
await appendFile(process.env.GITHUB_OUTPUT, `recipient=${recipient}\nsubject=${subject}\n`)
