<script setup>
import NavbarButton from './NavbarButton.vue';

defineProps({
  buttons: {
    type: Array,
    required: true,
    default: [{
      text: "Home", icon: "home.png", route: "Home", subButtons: []
    }]
  }
})
</script>

<template>
  <nav class="navbar">
    <div class="tabs-container">
      <NavbarButton v-for="(item, i) in buttons" :key="i" :text="item.text" :icon="item.icon" :route="item.route" :sub-buttons="item.subButtons" />
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  components: {
    NavbarButton
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  height: auto;
  width: 100%;
  justify-content: center;
  align-items: center;
  background-color: var(--navbar-background-color);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 10px;
  margin-bottom: 22px;
  overflow: visible;
  box-shadow: var(--shadow-soft);
  border-bottom-color: transparent;
}

.tabs-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  border: 0;
  box-shadow: none;
}

@media (max-width: 520px) {
  .navbar { padding: 7px; }
  .tabs-container { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
