<script setup>
defineProps({
  theme: { type: String, required: true },
  language: { type: String, required: true }
})

const emit = defineEmits(['update:theme', 'update:language'])
</script>

<template>
  <div class="preference-controls">
    <select
      :value="language"
      name="languageSelect"
      :aria-label="$t('language.label')"
      @change="emit('update:language', $event.target.value)"
    >
      <option value="en">{{ $t('language.english') }}</option>
      <option value="es">{{ $t('language.spanish') }}</option>
    </select>
    <button
      type="button"
      :aria-label="$t('theme.switchTo', { mode: $t(theme === 'dark' ? 'theme.light' : 'theme.dark') })"
      @click="emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
    >
      <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
      {{ $t(theme === 'dark' ? 'theme.light' : 'theme.dark') }}
    </button>
  </div>
</template>

<style scoped>
.preference-controls {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.preference-controls select {
  width: 100%;
  min-height: 42px;
  margin-bottom: 9px;
  cursor: pointer;
}

.preference-controls button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 42px;
  padding: 8px 13px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background: var(--color-background-soft);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.preference-controls button:hover {
  background: var(--navbar-tab-background-color-hover);
}
</style>
