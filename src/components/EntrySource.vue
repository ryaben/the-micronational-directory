<script setup>
import SourceLink from './SourceLink.vue'

defineProps({
  icon: { type: String, default: 'www' },
  flagSource: { type: String, required: true, default: '/' },
  href: { type: String, required: true, default: '/' },
  size: { type: Number, default: 46 },
  micronationName: { type: String, default: '' }
})
</script>

<template>
  <SourceLink :icon="icon" :image="flagSource" :href="href" :width="size" :height="size"
    :label="$t('source.label', { icon, name: micronationName })" />
</template>

<script>
export default { name: 'EntrySource' }
</script>
