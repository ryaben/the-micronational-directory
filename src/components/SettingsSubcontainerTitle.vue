<script setup>
defineProps({
  text: {
    type: String,
    required: true,
    default: "Title"
  }
});
</script>

<template>
  <div class="subcontainer-title" @click="emitVisualToggle">
    <label>{{ text }}</label>
  </div>
</template>

<script>
export default {
  name: 'SettingsSubcontainerTitle',
  emits: [
    "displayToggled"
  ],
  data: () => {
    return {
    };
  },
  methods: {
    emitVisualToggle() {
      this.$emit("displayToggled");
    }
  }
}
</script>

<style scoped>
.subcontainer-title {
  display: flex;
  align-items: center;
  text-align: center;
  font-weight: bold;
  padding-left: 4px;
  padding-right: 4px;
  border-right: 2px solid var(--vt-c-white);
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  background-color: var(--vt-c-text-dark-2);
  color: var(--vt-c-black);
  height: 100%;
  width: 55px;
  cursor: pointer;
}

.subcontainer-title.right-side {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  border-right: none;
  border-left: 2px solid var(--vt-c-white);
  background-color: var(--pale-tone);
}

.settings-subcontainer:hover .subcontainer-title:not(.right-side) {
  background-color: var(--vt-c-white);
}

.settings-subcontainer .subcontainer-title.right-side {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  border-right: none;
  border-left: 2px solid var(--vt-c-white);
  background-color: var(--pale-tone);
}

.subcontainer-title label {
  cursor: pointer;
  text-align: center;
  width: 100%;
}
</style>