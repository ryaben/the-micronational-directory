const FIRESTORE_ID_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// Firestore auto IDs use 20 random characters from this alphabet.
export function createFirestoreStyleId() {
  let id = ''
  const randomValues = new Uint8Array(32)

  while (id.length < 20) {
    crypto.getRandomValues(randomValues)
    for (const value of randomValues) {
      // 248 is the largest multiple of 62 below 256, avoiding modulo bias.
      if (value < 248) id += FIRESTORE_ID_ALPHABET[value % 62]
      if (id.length === 20) break
    }
  }

  return id
}
