<script setup>
import { computed, ref } from 'vue'
import { notify } from '@kyvg/vue3-notification'
import { useUserFavorites } from '../composables/userFavorites.js'
import StarIcon from './icons/StarIcon.vue'

const props = defineProps({
  entryId: { type: String, default: '' },
  entryType: { type: String, required: true },
  placement: { type: String, default: 'card' }
})

const { currentUser, isFavorite, toggleFavorite } = useUserFavorites()
const isSaved = computed(() => isFavorite(props.entryType, props.entryId))
const isUpdating = ref(false)

async function onToggle() {
  if (isUpdating.value) return
  isUpdating.value = true
  try {
    await toggleFavorite(props.entryType, props.entryId)
  } catch (error) {
    notify({
      title: 'Could not update favorite',
      text: error.message || String(error),
      type: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <button
    v-if="currentUser && entryId"
    class="favorite-toggle"
    :class="`favorite-toggle--${placement}`"
    type="button"
    :disabled="isUpdating"
    :aria-pressed="isSaved"
    :aria-label="isSaved ? 'Remove from favorites' : 'Add to favorites'"
    :title="isSaved ? 'Remove from favorites' : 'Add to favorites'"
    @click.stop.prevent="onToggle"
  >
    <StarIcon aria-hidden="true" />
  </button>
</template>

<style>
.favorite-toggle {
  display: inline-grid;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-muted);
  background: var(--color-surface-raised);
  cursor: pointer;
  transition:
    color var(--transition-base) ease,
    background-color var(--transition-base) ease,
    border-color var(--transition-base) ease,
    transform var(--transition-base) ease;
}

.favorite-toggle:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-raised));
  color: var(--color-accent);
  transform: translateY(-1px);
}

.favorite-toggle[aria-pressed='true'] {
  color: var(--color-accent);
}

.favorite-toggle svg {
  width: 19px;
  height: 19px;
  fill: transparent;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.favorite-toggle[aria-pressed='true'] svg {
  fill: currentColor;
}

.favorite-toggle:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  outline-offset: 2px;
}

.favorite-toggle:disabled {
  cursor: wait;
  opacity: .65;
}

.favorite-toggle--card {
  position: absolute;
  z-index: 2;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  box-shadow: var(--shadow-soft);
}

.favorite-toggle--profile {
  width: 40px;
  height: 40px;
  background: var(--color-surface);
}

.favorite-toggle--card svg {
  width: 17px;
  height: 17px;
}
</style>
