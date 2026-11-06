<script setup>
defineProps({ modelValue: { type: Boolean, default: false } })
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="entry-mode-switch" role="group" :aria-label="$t('newEntry.formMode')">
    <button type="button" :class="{ active: !modelValue }" :aria-pressed="!modelValue" @click="$emit('update:modelValue', false)">
      {{ $t('newEntry.modeNormal') }}
    </button>
    <button type="button" :class="{ active: modelValue }" :aria-pressed="modelValue" @click="$emit('update:modelValue', true)">
      {{ $t('newEntry.modeLimited') }}
    </button>
  </div>
</template>

<style scoped>
.entry-mode-switch { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-self: start; width: min(100%, 380px); margin: 0 0 6px; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-background-soft); }
.entry-mode-switch button { min-width: 0; min-height: 32px; padding: 4px 12px; border: 0; color: var(--color-text); background: var(--color-background-soft); font: inherit; cursor: pointer; transition: color 180ms ease, background-color 180ms ease, font-weight 180ms ease; }
.entry-mode-switch button.active { color: var(--color-navbar-text-color-active, var(--color-text)); background: var(--navbar-tab-background-color-hover); font-weight: 700; }
.entry-mode-switch button:focus-visible { position: relative; z-index: 1; outline: 2px solid var(--color-accent); outline-offset: -2px; }
</style>
