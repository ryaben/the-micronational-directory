<script setup>
import { computed } from 'vue'
import SimpleDirectoryEntry from './SimpleDirectoryEntry.vue'
import { toLimitedEntryPresentation } from '../utils/limitedEntryPresentation.js'

const props = defineProps({
  entry: { type: Object, required: true },
  entryType: { type: String, default: 'micronation' },
  width: { type: Number, default: 180 },
  logoHeight: { type: Number, default: 120 },
  moderationLabel: { type: String, default: '' },
  profileUrl: { type: String, default: '' },
  showProfileButton: { type: Boolean, default: false },
  inlineProfilePreview: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  viewMode: { type: String, default: 'micronations' }
})

const emit = defineEmits(['open-profile'])
const cardInfo = computed(() => toLimitedEntryPresentation(props.entry, props.entryType))
</script>

<template>
  <SimpleDirectoryEntry
    :info="cardInfo"
    :width="width"
    :logo-height="logoHeight"
    :moderation-label="moderationLabel"
    :profile-url="profileUrl"
    :show-profile-button="showProfileButton"
    :inline-profile-preview="inlineProfilePreview"
    :expandable="expandable"
    :view-mode="viewMode"
    @open-profile="emit('open-profile')"
  />
</template>
