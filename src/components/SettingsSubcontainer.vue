<script setup>
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';

defineProps({
  text: {
    type: String,
    required: true,
    default: "Title"
  }
});
</script>

<template>
  <div class="settings-subcontainer">
    <SettingsSubcontainerTitle :class="{'borderless': !open}" :text="text" @display-toggled="toggleDisplay" />
    <slot v-if="open"></slot>
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
  components: {
    SettingsSubcontainerTitle
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
  justify-content: center;
}

.settings-subcontainer {
  border: 2px solid var(--vt-c-white);
  border-radius: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
  height: 62px;
}

.settings-subcontainer .subcontainer-title.borderless {
  border-right: none;
}
</style>