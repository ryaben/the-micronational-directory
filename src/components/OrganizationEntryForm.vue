<script setup>
import NewEntryForm from './NewEntryForm.vue'

defineProps({
  directoryData: { type: Array, required: true },
  micronationsDirectory: { type: Array, default: () => [] },
  organizationsDirectory: { type: Array, default: () => [] },
  visibleOrganizations: { type: Array, default: () => [] },
  supranationalMicronations: { type: Array, default: () => [] },
  formPlaceholders: { type: Object, default: undefined },
  theme: { type: String, default: 'dark' },
  isModerationEditor: { type: Boolean, default: false },
  initialEntry: { type: Object, default: null },
  submittedEntry: { type: Object, default: null },
  publishedEntry: { type: Object, default: null },
  directoryEdit: { type: Boolean, default: false },
  editTargetId: { type: String, default: '' },
  initialImageMode: { type: String, default: 'url' },
  saving: { type: Boolean, default: false },
  imageProcessing: { type: Boolean, default: false },
  limited: { type: Boolean, default: false }
})
const emit = defineEmits(['save-corrections', 'edit-image-change', 'image-error', 'image-processing', 'submission-success', 'update:limited'])
</script>

<template>
  <NewEntryForm v-bind="{ ...$attrs, ...$props }" entry-type="organization"
    @save-corrections="emit('save-corrections', $event)" @edit-image-change="emit('edit-image-change', $event)"
    @image-error="emit('image-error', $event)" @image-processing="emit('image-processing', $event)"
    @submission-success="emit('submission-success', $event)" @update:limited="emit('update:limited', $event)" />
</template>
