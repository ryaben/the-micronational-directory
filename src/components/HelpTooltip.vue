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
  <div class='help-tooltip' :class="{ 'absolute-position': position.x !== 0 && position.y !== 0 }"
    :style="tooltipStyles">
    <div class="close-container">
      {{ title }}
      <div class="close-button" @click="closeTooltip">X</div>
    </div>
    <p class="help-text">{{ helpText }}</p>
  </div>
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
  background-color: var(--vt-c-indigo);
  color: var(--vt-c-white-soft);
  border: solid 1px var(--pale-tone);
  z-index: 3;
  width: 300px;
}

.help-tooltip.absolute-position {
  position: absolute;
  top: var(--tooltip-top);
  left: var(--tooltip-left);
}

.help-text {
  font-size: 14px;
  margin: 7px;
  text-align: justify;
  text-justify: auto;
}

.close-container {
  display: flex;
  font-size: 16px;
  justify-content: space-between;
  align-items: center;
  background: var(--vt-c-indigo-dark);
  width: auto;
  height: min-content;
  border-bottom: 1px solid var(--vt-c-black-soft);
  padding-left: 6px;
}

.close-button {
  width: 24px;
  text-align: center;
  border: 1px outset var(--vt-c-black-soft);
  background: var(--vt-c-black-soft);
  color: var(--vt-c-white-soft);
  cursor: pointer;
}

.close-button:active {
  background: var(--vt-c-white-soft);
  color: var(--vt-c-black-soft);
}
</style>
