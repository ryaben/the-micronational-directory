<script setup>
import { onAuthStateChanged } from 'firebase/auth'
import { onMounted, watch } from 'vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import Navbar from './components/Navbar.vue'
import store from './store'
import { auth } from './firebase/auth.js'
import { initializeAnalytics } from './firebase/analytics.js'
import { language, loadUserSettings, setLanguage, setTheme, theme } from './composables/userSettings.js'

const routeThemeProps = (component) => {
  const declaredProps = component?.props
  const declaredNames = Array.isArray(declaredProps) ? declaredProps : Object.keys(declaredProps || {})
  return declaredNames.includes('theme') ? { theme: theme.value } : {}
}
const applyTheme = (value) => (document.documentElement.dataset.theme = value)
watch(theme, (value) => {
  localStorage.setItem('tmd-theme', value)
  applyTheme(value)
})
watch(language, (value) => localStorage.setItem('tmd-language', value))
onMounted(() => {
  applyTheme(theme.value)
  initializeAnalytics().catch((error) => console.warn('Firebase Analytics could not initialize:', error))
})
</script>

<template>
  <SiteHeader :theme="theme" />
  <Navbar :buttons="navbarButtons" :theme="theme" />

  <main>
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <KeepAlive
          :include="[
            'Home',
            'Directory',
            'Organizations',
            'GlobalMap',
            'NewEntry',
            'ModerationHub'
          ]"
        >
          <component
            :is="Component"
            v-bind="routeThemeProps(Component)"
            @update:theme="setTheme"
          />
        </KeepAlive>
      </Transition>
    </router-view>
  </main>

  <SiteFooter
    :theme="theme"
    :language="language"
    @update:theme="setTheme"
    @update:language="setLanguage"
  />
  <notifications position="top right" width="350px" speed="700" :pause-on-hover="true" />
</template>

<script>
export default {
  data() {
    return {
      user: {},
      navigationButtons: [
        { text: 'Home', icon: 'home.png', route: 'Home' },
        {
          text: 'Directory',
          icon: 'directory.png',
          route: 'Directory',
          subButtons: [
            { text: 'Micronations', route: 'Directory' },
            { text: 'Organizations', route: 'Organizations' },
            { text: 'World map', route: 'GlobalMap' },
            { text: 'New entry', route: 'NewEntry' },
            { text: 'Moderation', route: 'ModerationPanel', requiresModerator: true }
          ]
        },
        {
          text: 'Stats',
          icon: 'stats.png',
          route: 'Stats',
          subButtons: [{ text: 'Rankings and\ncontests', route: 'Stats' }]
        },
        { text: 'Account', icon: 'profile.png', route: 'Account' },
        {
          text: 'Info',
          icon: 'about.png',
          route: 'About',
          subButtons: [
            { text: 'About us', route: 'About' },
            { text: 'Donate', route: 'Donate' },
            { text: 'Contests T&C', route: 'TermsOfContests' }
          ]
        }
      ]
    }
  },
  computed: {
    navbarButtons() {
      return this.navigationButtons.map((button) => ({
        ...button,
        subButtons: (button.subButtons || []).filter((subButton) =>
          !subButton.requiresModerator || this.userIsModerator
        )
      }))
    },
    userIsModerator() {
      return store.getters.moderators.includes(this.user.email)
    }
  },
  methods: {
    authListener() {
      onAuthStateChanged(auth, (user) => {
        this.user = user || { emailVerified: false }
        store.commit('SET_USER', this.user)
        loadUserSettings(user)
      })
    }
  },
  async mounted() {
    this.authListener()
    await store.dispatch('getMicronations')
    await store.dispatch('getOrganizations')
  }
}
</script>

<style>
nav {
  display: flex;
  justify-content: space-between;
  width: auto;
}

#openSourceCode {
  padding: 1px 9px;
  font-size: 15px;
  width: 177px;
  height: 27px;
}
</style>
