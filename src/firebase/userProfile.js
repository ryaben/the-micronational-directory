import { doc, runTransaction } from 'firebase/firestore'
import { db } from './firestore.js'

export const defaultUserSettings = {
  darkMode: true,
  language: 'english'
}
export const defaultUserFavorites = {
  micronations: [],
  organizations: []
}

export async function ensureUserDocument(user) {
  if (!user?.uid) throw new Error('A signed-in Firebase user is required.')

  const userRef = doc(db, 'users', user.uid)
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(userRef)
    if (!snapshot.exists()) {
      transaction.set(userRef, {
        settings: defaultUserSettings,
        favorites: defaultUserFavorites
      })
      return
    }

    const data = snapshot.data()
    const updates = {}
    if (!data.settings) updates.settings = defaultUserSettings
    if (!Array.isArray(data.favorites?.micronations)) updates['favorites.micronations'] = []
    if (!Array.isArray(data.favorites?.organizations)) updates['favorites.organizations'] = []
    if (Object.keys(updates).length) transaction.update(userRef, updates)
  })

  return userRef
}
