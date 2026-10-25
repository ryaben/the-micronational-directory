const { createPublicKey, verify } = require('node:crypto')
const moderators = require('../src/assets/moderators.json')

const PROJECT_ID = 'the-micronational-directory'
const MODERATOR_EMAILS = new Set(moderators.map(email => email.toLowerCase()))
let signingKeys

async function getSigningKeys() {
  if (signingKeys) return signingKeys
  const response = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
  if (!response.ok) throw new Error('Could not retrieve Firebase session verification keys.')
  signingKeys = await response.json()
  return signingKeys
}

async function verifyFirebaseUser(req) {
  const token = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  let header, claims
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch { return null }
  const now = Math.floor(Date.now() / 1000)
  if (header.alg !== 'RS256' || claims.aud !== PROJECT_ID || claims.iss !== `https://securetoken.google.com/${PROJECT_ID}` ||
      !claims.sub || claims.sub.length > 128 || claims.email_verified !== true || !Number.isFinite(claims.exp) || claims.exp <= now ||
      !Number.isFinite(claims.iat) || claims.iat > now + 60 || claims.exp - claims.iat > 3900) return null
  let keys = await getSigningKeys()
  let key = keys.keys?.find(item => item.kid === header.kid && item.alg === 'RS256')
  if (!key) {
    signingKeys = null
    keys = await getSigningKeys()
    key = keys.keys?.find(item => item.kid === header.kid && item.alg === 'RS256')
    if (!key) return null
  }
  const valid = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key, format: 'jwk' }), Buffer.from(parts[2], 'base64url'))
  if (!valid) return null
  const email = String(claims.email || '').toLowerCase()
  return { email, isModerator: MODERATOR_EMAILS.has(email) }
}

module.exports = { verifyFirebaseUser }
