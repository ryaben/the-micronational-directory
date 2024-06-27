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
  width: auto;
  justify-content: center;
  align-items: center;
  background-color: var(--navbar-background-color);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  overflow: visible;
}

.tabs-container {
  display: flex;
}
</style>
