<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true,
    default: false
  }
});
</script>

<template>
  <div v-if="open" class="settings-subcontainer">
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
  align-items: center;
  width: 100%;
  background-color: var(--directory-settings-background-color);
  border: 2px solid white;
  border-bottom-left-radius: 12px;
}

.settings-subcontainer {
  margin-right: 8px;
  height: max-content;
}

.slot-container {
  display: flex;
  height: 65px;
}
</style>