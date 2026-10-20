import { doc, runTransaction } from 'firebase/firestore'
import { db } from './firestore.js'

export const defaultUserSettings = {
  darkMode: true,
  language: 'english'
}

export async function ensureUserDocument(user) {
  if (!user?.uid) throw new Error('A signed-in Firebase user is required.')

  const userRef = doc(db, 'users', user.uid)
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(userRef)
    if (!snapshot.exists()) transaction.set(userRef, { settings: defaultUserSettings })
  })

  return userRef
}
