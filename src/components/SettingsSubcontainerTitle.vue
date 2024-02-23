<script setup>
defineProps({
  text: {
    type: String,
    required: true,
    default: "Title"
  },
  open: {
    type: Boolean,
    required: true,
    default: false
  }
});
</script>

<template>
  <div class="subcontainer-title" :class="{'bordered': open}">
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
  padding-left: 8px;
  padding-right: 8px;
  margin-right: 2px;
  background-color: var(--silver);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  color: var(--vt-c-black);
  border: 2px solid transparent;
  height: 100%;
  width: 75px;
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

.subcontainer-title.bordered {
  border: 2px solid var(--vt-c-white);
  background: var(--vt-c-white);
}

.subcontainer-title:not(.right-side):hover {
  background-color: var(--vt-c-white);
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

.subcontainer-title label {
  display: block;
  cursor: pointer;
  text-align: center;
  font-size: 18px;
  width: 100%;
}
</style>