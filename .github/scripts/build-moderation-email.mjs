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
const seenComments = new Set()
const emailComments = comments
  .map((comment) => ({
    ...comment,
    body: String(comment.body || '').replace(/<!--\s*TMD_EMAIL_LOCALE:(?:es|en)\s*-->/ig, '').trim()
  }))
  .filter((comment) => comment.body)
  .filter((comment) => {
    const author = String(comment.user?.login || '').trim().toLowerCase()
    const normalizedBody = comment.body.replace(/\s+/g, ' ').toLowerCase()
    const key = `${author}\u0000${normalizedBody}`
    if (seenComments.has(key)) return false
    seenComments.add(key)
    return true
  })

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
      approvedSubject: 'Actualización de moderación: entrada aprobada',
      rejectedSubject: 'Actualización de moderación: entrada rechazada',
      commentsSubject: 'Comentarios sobre tu contribución',
      hello: 'Hola',
      decisionIntro: 'Queríamos contarte que revisamos la entrada de',
      approvedEnding: 'y, después de analizarla, decidimos aprobarla.',
      rejectedEnding: 'y, después de analizarla, decidimos rechazarla.',
      manualIntro: 'Revisamos tu entrada',
      manualEnding: 'y queremos compartirte los comentarios del equipo de moderación.',
      commentsIntro: 'El moderador o administrador también agregó estos comentarios:',
      noComments: 'No se agregaron comentarios adicionales.',
      inquiry: 'Si tienes alguna consulta, revisa los',
      requirements: 'requisitos para agregar una entrada',
      reply: 'y responde a este correo para preguntar o aportar nueva información. También podemos ayudarte a través de nuestros canales de contacto. ¡Muchas gracias por participar!',
      signoff: 'Saludos,',
      team: 'El equipo de The Micronational Directory'
    }
  : {
      approvedSubject: 'Moderation update: submission approved',
      rejectedSubject: 'Moderation update: submission rejected',
      commentsSubject: 'Comments on your submission',
      hello: 'Hello',
      decisionIntro: 'We wanted to let you know that we reviewed your entry for',
      approvedEnding: 'and, after reviewing it, we have decided to approve it.',
      rejectedEnding: 'and, after reviewing it, we have decided to reject it.',
      manualIntro: 'We have reviewed your entry',
      manualEnding: 'and would like to share the moderation team’s comments below.',
      commentsIntro: 'The moderator or admin also added the following comments:',
      noComments: 'No additional comments were added.',
      inquiry: 'If you have any questions, please review the',
      requirements: 'entry requirements',
      reply: 'and feel free to reply to this email with questions or new information. We are also happy to help through our contact channels. Thanks a lot for participating!',
      signoff: 'Best regards,',
      team: 'The Micronational Directory team'
    }
const title = String(entry.name?.main || issue.title || (locale === 'es' ? 'tu contribución' : 'your submission'))
const commentsHtml = emailComments.length
  ? emailComments.map((comment) => `
      <blockquote style="margin:14px 0;padding:14px 18px;border-left:4px solid #2868c7;background:#ffffff;color:#273449;font-style:italic;line-height:1.6;white-space:pre-wrap;">
        ${escapeHtml(comment.body)}
      </blockquote>`).join('')
  : `<p style="color:#566174;">${escapeHtml(copy.noComments)}</p>`
const subject = isDecisionEmail
  ? (isApproved ? copy.approvedSubject : copy.rejectedSubject)
  : copy.commentsSubject
const logoUrl = 'https://the-micronational-directory.vercel.app/images/brand/plain-logo1.png'

const html = `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:28px 12px;background:#f1f4f9;color:#202a3a;font-family:Arial,Helvetica,sans-serif;">
    <main style="max-width:620px;margin:0 auto;border:1px solid #d7deea;border-radius:12px;overflow:hidden;background:#ffffff;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000" style="width:100%;background-color:#000000;">
        <tr>
          <td align="left" bgcolor="#000000" style="padding:16px 24px;background-color:#000000;color:#ffffff;">
            <table role="presentation" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td valign="middle" style="padding-right:16px;">
                  <img src="${logoUrl}" width="58" height="58" alt="TMD" style="display:block;width:58px;height:58px;border:0;" />
                </td>
                <td valign="middle" style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;">
                  The Micronational Directory
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <section style="padding:38px 30px 28px;">
        <p style="margin-top:0;">${escapeHtml(copy.hello)}${entry.author?.name ? ` ${escapeHtml(entry.author.name)}` : ''},</p>
        ${isDecisionEmail
    ? `<p>${escapeHtml(copy.decisionIntro)} <strong>${escapeHtml(title)}</strong> ${escapeHtml(isApproved ? copy.approvedEnding : copy.rejectedEnding)}</p>`
    : `<p>${escapeHtml(copy.manualIntro)} <strong>${escapeHtml(title)}</strong> ${escapeHtml(copy.manualEnding)}</p>`}
        ${emailComments.length ? `<p>${escapeHtml(copy.commentsIntro)}</p>` : ''}
        ${commentsHtml}
        <p style="margin-top:28px;">${escapeHtml(copy.inquiry)} <a href="https://www.themicronationaldirectory.com.ar/new-entry" style="color:#2868c7;text-decoration:underline;">${escapeHtml(copy.requirements)}</a> ${escapeHtml(copy.reply)}</p>
        <p style="margin:28px 0 0;">${escapeHtml(copy.signoff)}<br /><strong>${escapeHtml(copy.team)}</strong></p>
      </section>
    </main>
  </body>
</html>`

await mkdir('.github/email', { recursive: true })
await writeFile('.github/email/moderation-email.html', html, 'utf8')
await appendFile(process.env.GITHUB_OUTPUT, `recipient=${recipient}\nsubject=${subject}\n`)
