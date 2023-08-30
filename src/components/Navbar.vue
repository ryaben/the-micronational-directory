<script setup>
defineProps({
  buttons: {
    type: Array,
    required: true,
    default: [{
      text: "Home", icon: "home.png", route: "Home"
    }]
  }
})
</script>

<template>
  <nav class="navbar">
    <div class="tabs-container">
      <router-link :to="{ name: item.route }" v-for="(item, i) in this.buttons" :key="i" class="tab-router-link">
        <div class="button-container color-transition" @mouseenter="toggleGreyscale" @mouseleave="toggleGreyscale">
          <img :src="'src/assets/navbar-icons/' + item.icon" :alt="item.text + ' icon'">
          <p>{{ item.text }}</p>
        </div>
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  methods: {
    toggleGreyscale(e) {
      e.target.classList.toggle('greyscaled');
    }
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
}

.tabs-container {
  display: flex;
}

.tab-router-link {
  text-decoration: none;
  margin-left: 10px;
  margin-right: 10px;
}

.tab-router-link:first-of-type {
  margin-left: 20px;
}

.tab-router-link:last-of-type {
  margin-right: 20px;
}

.button-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 110px;
  height: auto;
  padding: 10px;
  border: 2px solid var(--navbar-tab-border-color);
  border-radius: 8px;
  color: var(--navbar-text-color);
  background-color: var(--navbar-tab-background-color);
  cursor: pointer;
}

.button-container.selected {
  background-color: var(--navbar-tab-background-color-selected);
}

.button-container:hover {
  background-color: var(--navbar-tab-background-color-hover);
  color: var(--navbar-text-color-hover);
}

.button-container.greyscaled img {
  filter: invert(100%);
}

.button-container img {
  width: 32px;
  margin-right: 8px;
  transition: linear filter 0.2s;
}

.button-container p {
  margin: 0;
  font-size: 17px;
}
</style>
