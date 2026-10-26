<script setup>
import NavbarButton from './NavbarButton.vue';
import MoreIcon from './icons/MoreIcon.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps({
  buttons: {
    type: Array,
    required: true,
    default: [{
      text: "Home", icon: "home.png", route: "Home", subButtons: []
    }]
  },
  theme: {
    type: String,
    default: 'dark'
  },
  mobileDirectory: { type: Boolean, default: false }
})
const expanded = ref(false)
const router = useRouter()
const navigate = (route) => {
  router.push({ name: route })
  expanded.value = false
}
</script>

<template>
  <nav v-if="mobileDirectory" class="navbar directory-mobile-nav" :class="{ 'is-expanded': expanded }" aria-label="Main navigation">
    <div class="mobile-topbar">
      <router-link :to="{ name: 'Home' }" class="mobile-brand-row" aria-label="The Micronational Directory home">
        <img class="mobile-logo" :src="theme === 'light' ? '/images/brand/plain-logo1-black.png' : '/images/brand/plain-logo1.png'" alt="" />
        <span class="mobile-brand-name">The Micronational Directory</span>
      </router-link>
      <button class="mobile-menu-toggle" :aria-expanded="expanded" aria-label="Toggle main menu" @click="expanded = !expanded">
        <MoreIcon />
      </button>
    </div>
    <Transition name="mobile-menu">
      <div v-if="expanded" class="mobile-nav-links">
        <template v-for="item in buttons" :key="item.route">
          <div class="mobile-nav-group">
            <button class="mobile-nav-item" @click="navigate(item.route)">
              <img :src="'/images/navbar-icons/' + (theme === 'light' ? item.icon.replace('.png', '-black.png') : item.icon)" alt="" />
              <span>{{ item.text }}</span>
            </button>
            <button v-for="subitem in item.subButtons" :key="subitem.route" class="mobile-nav-subitem" @click="navigate(subitem.route)">{{ subitem.text.replace('\n', ' ') }}</button>
          </div>
        </template>
      </div>
    </Transition>
  </nav>
  <nav class="navbar desktop-navbar" :class="{ 'directory-desktop-nav': mobileDirectory }">
    <div class="tabs-container">
      <NavbarButton v-for="(item, i) in buttons" :key="i" :text="item.text" :icon="item.icon" :route="item.route" :sub-buttons="item.subButtons" :theme="theme" />
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
  border-radius: var(--radius-2xl);
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

.directory-mobile-nav { display: none; }
.directory-desktop-nav { display: flex; }

@media (max-width: 760px) {
  .directory-desktop-nav { display: none; }
  .directory-mobile-nav {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    right: 0;
    display: block;
    width: 100%;
    max-height: 100vh;
    padding: 6px 12px;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 14px;
    border-bottom-right-radius: 14px;
    background: var(--navbar-background-color);
    box-shadow: var(--shadow-soft);
  }
  .mobile-topbar {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 44px;
  }
  .mobile-brand-row {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;
    color: var(--color-heading);
    text-decoration: none;
  }
  .mobile-logo { width: 34px; height: 34px; object-fit: contain; flex: 0 0 34px; }
  .mobile-brand-name { min-width: 0; font-weight: 700; font-size: 15px; line-height: 1.15; }
  .mobile-menu-toggle {
    display: inline-flex;
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    color: var(--color-heading);
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    cursor: pointer;
  }
  .mobile-menu-toggle svg { width: 22px; height: 22px; fill: currentColor; }
  .mobile-nav-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 8px;
    padding: 10px 0 4px;
    border-top: 1px solid var(--color-border);
  }
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    overflow: hidden;
    transition: opacity 180ms ease, transform 180ms ease, max-height 220ms ease;
  }
  .mobile-menu-enter-from,
  .mobile-menu-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-8px);
  }
  .mobile-menu-enter-to,
  .mobile-menu-leave-from {
    max-height: 70vh;
    opacity: 1;
    transform: translateY(0);
  }
  .mobile-nav-group { min-width: 0; }
  .mobile-nav-item, .mobile-nav-subitem {
    display: flex; align-items: center; width: 100%; min-height: 42px; padding: 7px 10px;
    color: var(--color-text); border: 0; border-radius: var(--radius-md); background: transparent;
    text-align: left; cursor: pointer;
  }
  .mobile-nav-item { gap: 10px; font-weight: 600; }
  .mobile-nav-item img { width: 22px; height: 22px; object-fit: contain; }
  .mobile-nav-subitem { min-height: 36px; padding-left: 44px; color: var(--color-muted); font-size: 14px; }
  .mobile-nav-item:hover, .mobile-nav-subitem:hover { background: var(--navbar-tab-background-color-hover); color: var(--color-accent); }
}

@media (max-width: 520px) {
  .navbar { padding: 7px; }
  .tabs-container { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
