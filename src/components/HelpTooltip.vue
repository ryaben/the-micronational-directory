<script setup>
defineProps({
  helpText: {
    type: String,
    required: false,
    default: 'Text'
  },
  title: {
    type: String,
    required: false,
    default: 'Title'
  },
  position: {
    type: Object,
    required: false,
    default: {
      y: 0,
      x: 0
    }
  }
});
</script>

<template>
  <section class="help-tooltip" :class="{ 'is-positioned': position.x !== 0 && position.y !== 0 }"
    :style="tooltipStyles" role="dialog" :aria-label="`${title} help`">
    <div class="close-container">
      <h3 class="tooltip-title">{{ title }}</h3>
      <button class="close-button" type="button" aria-label="Close help" @click="closeTooltip">×</button>
    </div>
    <p class="help-text">{{ helpText }}</p>
  </section>
</template>

<script>
export default {
  name: 'HelpTooltip',
  emits: ['closedTooltip'],
  data() {
    return {

    }
  },
  computed: {
    tooltipStyles() {
      return {
        '--tooltip-top': `${this.position.y}px`,
        '--tooltip-left': `${this.position.x}px`
      }
    }
  },
  methods: {
    closeTooltip() {
      this.$emit('closedTooltip');
    }
  }
}
</script>

<style scoped>
.help-tooltip {
  position: fixed;
  z-index: 30;
  width: min(340px, calc(100vw - 24px));
  max-height: min(70vh, 520px);
  overflow: auto;
  color: var(--color-text);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-hover);
  border-radius: var(--radius-xl);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.24);
  animation: tooltip-appear 140ms ease-out;
}

.help-tooltip.is-positioned {
  top: var(--tooltip-top);
  left: var(--tooltip-left);
}

.help-text {
  margin: 0;
  padding: 14px 16px 16px;
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.close-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 8px 10px 8px 16px;
  background: color-mix(in srgb, var(--color-accent) 12%, var(--color-surface-raised));
  border-bottom: 1px solid var(--color-border);
}

.tooltip-title {
  margin: 0;
  color: var(--color-heading);
  font-size: 15px;
  font-weight: 700;
}

.close-button {
  display: flex;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  padding: 0 0 2px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 78%, transparent);
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-background);
  font-size: 21px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background-color var(--transition-fast) ease, border-color var(--transition-fast) ease;
}

.close-button:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 82%, var(--color-heading));
}

.close-button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
  outline-offset: 2px;
}

@keyframes tooltip-appear {
  from { opacity: 0; transform: translateY(4px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .help-tooltip { animation: none; }
}
</style>
