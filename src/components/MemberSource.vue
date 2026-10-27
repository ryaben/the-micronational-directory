<script setup>
import SourceLink from './SourceLink.vue'

defineProps({
  icon: { type: String, default: 'www' },
  flagSource: { type: String, required: true, default: '/' },
  href: { type: String, default: null },
  width: { type: Number, default: 46 },
  height: { type: Number, default: 28 },
  micronationName: { type: String, default: '' }
})
</script>

<template>
  <SourceLink :icon="icon" :image="flagSource" :href="href" :width="width" :height="height"
    internal member-style :label="micronationName || $t('source.unknownMembership')" />
</template>

<script>
export default { name: 'MemberSource' }
</script>
