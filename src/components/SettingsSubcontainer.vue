<script setup>
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';

defineProps({
  text: {
    type: String,
    required: true,
    default: 'Title'
  }
});
</script>

<template>
  <div class="settings-subcontainer">
    <SettingsSubcontainerTitle :text="text" />
    <div class="slot-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsSubcontainer',
  data: () => {
    return {
      open: false
    };
  },
  methods: {
    toggleDisplay() {
      this.open = !this.open;
    }
  }
}
</script>

<style scoped>
.settings-subcontainer,
.new-entry-type {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.settings-subcontainer {
  margin-right: 5px;
  height: max-content;
}

.slot-container {
  display: flex;
  height: 58px;
  min-width: 106px;
  background-color: var(--directory-settings-background-color);
  border: 2px solid white;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.settings-subcontainer:hover .subcontainer-title:not(.right-side) {
  background-color: var(--vt-c-white);
}

.settings-subcontainer.no-title .subcontainer-title {
  opacity: 0;
  width: 1px;
}

.settings-subcontainer.no-min-width .slot-container {
  min-width: min-content;
}
</style>