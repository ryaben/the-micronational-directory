import guidance from '../assets/entry-field-guidance.json'
import { translate } from '../i18n.js'

export { guidance as ENTRY_FIELD_GUIDANCE }

export function buildTooltipTexts() {
  return Array.from({ length: 15 }, (_, index) => translate(`entryTooltips.${index}`))
}
