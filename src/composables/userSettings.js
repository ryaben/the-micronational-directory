import { ref } from 'vue'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firestore.js'
import { ensureUserDocument } from '../firebase/userProfile.js'

export const theme = ref(localStorage.getItem('tmd-theme') || 'dark')
export const language = ref(localStorage.getItem('tmd-language') || 'english')

let activeUserId = null
let authLoadVersion = 0
let preferenceVersion = 0
let pendingWrites = Promise.resolve()

function persistSetting(field, value) {
  const uid = activeUserId
  if (!uid) return

  pendingWrites = pendingWrites
    .then(async () => {
      const user = { uid }
      await ensureUserDocument(user)
      await updateDoc(doc(db, 'users', uid), `settings.${field}`, value)
    })
    .catch(error => {
      console.warn(`Unable to save the ${field} user setting:`, error)
    })
}

export function setTheme(value) {
  if (value !== 'dark' && value !== 'light') return
  theme.value = value
  preferenceVersion += 1
  persistSetting('darkMode', value === 'dark')
}

export function setLanguage(value) {
  language.value = value
  preferenceVersion += 1
  persistSetting('language', value)
}

export async function loadUserSettings(user) {
  activeUserId = user?.uid || null
  const loadVersion = ++authLoadVersion
  if (!user?.uid) return

  const initialPreferenceVersion = preferenceVersion
  try {
    await ensureUserDocument(user)
    const snapshot = await getDoc(doc(db, 'users', user.uid))
    if (!snapshot.exists() || loadVersion !== authLoadVersion) return

    const settings = snapshot.data().settings || {}
    if (preferenceVersion !== initialPreferenceVersion) return
    if (typeof settings.darkMode === 'boolean') theme.value = settings.darkMode ? 'dark' : 'light'
    if (typeof settings.language === 'string') language.value = settings.language
  } catch (error) {
    console.warn('Unable to load user settings from Firestore:', error)
  }
}
