<script setup>
defineProps({
  extraMarginEnd: {
    type: Boolean,
    required: false,
    default: false
  },
  borderLeft: {
    type: Boolean,
    required: false,
    default: false
  },
  centered: {
    type: Boolean,
    required: false,
    default: false
  }
});
</script>

<template>
  <div class="setting-parameter-subcontainer"
    :class="{ 'extra-margin-end': extraMarginEnd, 'border-left': borderLeft, 'centered': centered }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'SettingsSubcontainerParameter',
  data: () => {
    return {
    };
  },
}
</script>

<style scoped>
.setting-parameter-subcontainer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: auto;
  margin: 0 5px 0 5px;
}

.setting-parameter-subcontainer.extra-margin-end {
  margin-right: 6px;
}

.setting-parameter-subcontainer.border-left {
  padding-left: 6px;
  margin-left: 0px;
  border-left: 2px solid var(--vt-c-white);
}

.setting-parameter-subcontainer.centered {
  align-items: center;
}
</style>