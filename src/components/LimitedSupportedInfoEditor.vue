<script setup>
import { ref } from 'vue'
import { notify } from '@kyvg/vue3-notification'
import { checkIcon } from '../utils/EntrySourceFunctions'
import { translate } from '../i18n.js'
import SelectedElement from './SelectedElement.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue'])

const draftSource = ref('')
const draftContent = ref('')

function addFact() {
  const content = draftContent.value.trim()
  const source = draftSource.value.trim()

  if (!content || !source) {
    return notify({
      title: translate('entryForm.messages.submitError'),
      text: translate('newEntry.limitedEntryForm.completeTextAndSource'),
      type: 'error'
    })
  }

  try {
    const parsedSource = new URL(source)
    if (!['http:', 'https:'].includes(parsedSource.protocol)) throw new Error('Invalid protocol')
    emit('update:modelValue', [...props.modelValue, { content, source: parsedSource.href }])
    draftContent.value = ''
    draftSource.value = ''
  } catch {
    notify({
      title: translate('newEntry.limitedEntryForm.invalidSourceTitle'),
      text: translate('newEntry.limitedEntryForm.invalidSourceText'),
      type: 'error'
    })
  }
}

function removeFact(index) {
  emit('update:modelValue', props.modelValue.filter((_, itemIndex) => itemIndex !== index))
}
</script>

<template>
  <div class="new-entry-option-container limited-facts-editor">
    <div class="limited-fact-fields">
      <div class="limited-source-row">
        <input v-model="draftSource" type="url" :required="modelValue.length === 0"
          :placeholder="$t('newEntry.limitedEntryForm.sourceLink')" />
        <button type="button" class="login-button squared-button color-transition new-entry-option-button"
          @click="addFact">{{ $t('entryForm.add') }}</button>
      </div>
      <textarea id="limitedEntryContent" v-model="draftContent" rows="3"
        :placeholder="$t('newEntry.limitedEntryForm.text')" />
    </div>
    <div class="selected-elements-container limited-facts-list">
      <SelectedElement v-for="(item, index) in modelValue" :key="`${item.source}-${index}`"
        :element-text="item.source" :href="item.source" :icon="checkIcon(item.source)"
        @remove-element="removeFact(index)" />
    </div>
  </div>
</template>

<style scoped>
.limited-facts-editor { align-self: stretch; gap: 10px; }
.limited-fact-fields { display: grid; gap: 8px; }
.limited-fact-fields textarea { box-sizing: border-box; width: 100%; min-height: 92px; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-background); color: var(--color-text); font: inherit; resize: vertical; }
.limited-source-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.limited-source-row input { box-sizing: border-box; width: 100%; min-width: 0; }
.limited-source-row .new-entry-option-button { width: auto; min-width: 64px; min-height: 42px; }
.limited-facts-list { display: flex; flex-wrap: wrap; gap: 8px; }
.limited-facts-list:not(:empty) { margin-top: 8px; }
.limited-facts-list :deep(.selected-element) { box-sizing: border-box; flex: 0 1 auto; width: auto; min-width: 0; max-width: 100%; }
.limited-facts-list :deep(.element-text) { min-width: 0; }
</style>
