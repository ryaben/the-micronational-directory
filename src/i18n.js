import { computed } from 'vue'
import en from './locales/en.json'
import es from './locales/es.json'
import { language } from './composables/userSettings.js'

const messages = { en, es }

export const dateFormats = {
  full: { month: 'long', day: 'numeric', year: 'numeric' },
  compact: { month: 'short', day: 'numeric', year: 'numeric' },
  monthDay: { month: 'long', day: 'numeric' }
}

function toDate(value) {
  if (value == null || value === '') return null
  if (value instanceof Date) return value
  const seconds = value?._seconds ?? value?.seconds
  const date = seconds != null ? new Date(seconds * 1000) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value, options = dateFormats.full) {
  const date = toDate(value)
  if (!date) return translate('common.unknown')
  const locale = language.value === 'es' ? 'es-419' : 'en-US'
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(date)
}

function lookup(locale, key) {
  return key.split('.').reduce((value, part) => value?.[part], messages[locale])
}

export function translate(key, params = {}) {
  const locale = language.value === 'es' ? 'es' : 'en'
  let value = lookup(locale, key) ?? lookup('en', key) ?? key
  return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`)
}

export function useI18n() {
  const locale = computed(() => language.value)
  return { locale, t: translate }
}

export function installI18n(app) {
  app.config.globalProperties.$t = translate
  app.config.globalProperties.$formatDate = formatDate
}
