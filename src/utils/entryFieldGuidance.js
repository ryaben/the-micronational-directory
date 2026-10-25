import guidance from '../assets/entry-field-guidance.json'
import tooltips from '../assets/entry-field-tooltips.json'

export { guidance as ENTRY_FIELD_GUIDANCE }

export function buildTooltipTexts() {
  return [...tooltips]
}
