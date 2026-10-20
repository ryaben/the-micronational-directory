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
      aria-label="Language"
      @change="emit('update:language', $event.target.value)"
    >
      <option value="english">English</option>
    </select>
    <button
      type="button"
      :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
      @click="emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
    >
      <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
      {{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}
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
