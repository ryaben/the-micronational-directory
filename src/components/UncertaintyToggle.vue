<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])
</script>

<template>
  <button
    type="button"
    class="uncertainty-toggle"
    :class="{ active }"
    :aria-pressed="active"
    :disabled="disabled"
    :title="disabled ? 'This info is uncertain' : 'Mark this value as uncertain'"
    @click="$emit('toggle')"
  >
    ?
  </button>
</template>

<style scoped>
.uncertainty-toggle {
  display: inline-flex;
  flex: 0 0 20px;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 6px;
  margin-right: 7px;
  padding: 0;
  border: 1px solid var(--color-border-hover);
  border-radius: 50%;
  background: transparent;
  color: var(--color-muted);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  vertical-align: middle;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.uncertainty-toggle:active {
  transform: scale(0.92);
}

.uncertainty-toggle.active {
  border-color: var(--color-warning, #d99000);
  background: var(--color-warning, #d99000);
  color: #fff;
  transform: scale(1.06);
}

.uncertainty-toggle:disabled {
  cursor: default;
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .uncertainty-toggle {
    transition: none;
  }
}
</style>
