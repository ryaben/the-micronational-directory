<script setup>
defineProps({ label: { type: String, required: true } })
</script>

<template>
  <span class="moderation-kind-chip" :class="label.toLowerCase()" :aria-label="$t('moderation.submissionType')">
    {{ $t(label === 'Edit' ? 'moderation.edit' : 'moderation.new') }}
  </span>
</template>

<style scoped>
.moderation-kind-chip { position: absolute; z-index: 2; top: 8px; right: 8px; padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--color-accent) 30%, var(--color-border)); border-radius: var(--radius-full); background: color-mix(in srgb, var(--color-surface) 94%, transparent); color: var(--color-accent); font-size: 10px; font-weight: 750; letter-spacing: .04em; line-height: 1.2; text-transform: uppercase; pointer-events: none; }
.moderation-kind-chip.edit { border-color: color-mix(in srgb, #a15ac4 35%, var(--color-border)); background: color-mix(in srgb, #a15ac4 10%, var(--color-surface)); color: color-mix(in srgb, #a15ac4 82%, var(--color-heading)); }
</style>
