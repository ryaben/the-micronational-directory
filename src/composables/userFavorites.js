import { ref, shallowRef } from 'vue'
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/auth.js'
import { db } from '../firebase/firestore.js'
import { ensureUserDocument } from '../firebase/userProfile.js'

export const currentUser = shallowRef(auth.currentUser)
export const favorites = ref({ micronations: [], organizations: [] })
let authListenerStarted = false
let stopFavoritesListener

function startAuthListener() {
  if (authListenerStarted) return
  authListenerStarted = true

  onAuthStateChanged(auth, user => {
    stopFavoritesListener?.()
    stopFavoritesListener = undefined
    currentUser.value = user
    favorites.value = { micronations: [], organizations: [] }
    if (!user) return

    ensureUserDocument(user).catch(error => {
      console.warn('Unable to initialize the user favorites document:', error)
    })

    stopFavoritesListener = onSnapshot(
      doc(db, 'users', user.uid),
      snapshot => {
        if (currentUser.value?.uid !== user.uid) return
        const data = snapshot.data()?.favorites || {}
        favorites.value = {
          micronations: Array.isArray(data.micronations) ? data.micronations : [],
          organizations: Array.isArray(data.organizations) ? data.organizations : []
        }
      },
      error => console.warn('Unable to load user favorites:', error)
    )
  })
}

export function useUserFavorites() {
  startAuthListener()

  function isFavorite(collection, entryId) {
    return Boolean(entryId && favorites.value[collection]?.includes(entryId))
  }

  async function toggleFavorite(collection, entryId) {
    const user = currentUser.value || auth.currentUser
    if (!user?.uid) throw new Error('Sign in to save favorites.')
    if (!['micronations', 'organizations'].includes(collection) || !entryId) {
      throw new Error('This entry cannot be saved as a favorite.')
    }

    await ensureUserDocument(user)
    const currentlyFavorite = isFavorite(collection, entryId)
    await updateDoc(doc(db, 'users', user.uid), `favorites.${collection}`,
      currentlyFavorite ? arrayRemove(entryId) : arrayUnion(entryId))
    return !currentlyFavorite
  }

  return { currentUser, favorites, isFavorite, toggleFavorite }
}
