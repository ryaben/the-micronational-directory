<script setup>
defineProps({
  text: {
    type: String,
    required: true,
    default: 'Home'
  },
  route: {
    type: String,
    required: true,
    default: 'Home'
  }
})
</script>

<template>
  <router-link class="subbutton-router-link color-transition" :to="{ name: route }">
    <p class="subbutton-text">{{ text }}</p>
  </router-link>
</template>

<script>
export default {
  name: 'NavbarSubButton',
  data: () => {
    return {
    }
  }
}
</script>

<style scoped>
.subbutton-router-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  height: fit-content;
  background-color: var(--navbar-tab-background-color);
  border: 2px solid var(--navbar-tab-border-color);
  z-index: 100;
}

.subbutton-router-link.router-link-active {
  background-color: var(--navbar-tab-background-color-hover);
  color: var(--navbar-text-color-hover);
}

.subbutton-text {
  text-align: center;
  margin: 4px auto 4px auto;
}
</style>
