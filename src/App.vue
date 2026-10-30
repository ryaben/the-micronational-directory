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

const applyTheme = (value) => (document.documentElement.dataset.theme = value)
watch(theme, (value) => {
  localStorage.setItem('tmd-theme', value)
  applyTheme(value)
})
watch(language, (value) => {
  localStorage.setItem('tmd-language', value)
  document.documentElement.lang = value
})
onMounted(() => {
  applyTheme(theme.value)
  document.documentElement.lang = language.value
  initializeAnalytics().catch((error) => console.warn('Firebase Analytics could not initialize:', error))
})
</script>

<template>
  <SiteHeader :theme="theme" class="site-header--mobile-nav" />
  <Navbar :buttons="navbarButtons" :theme="theme" :mobile-directory="true" />

  <main class="directory-mobile-main">
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
            :theme="theme"
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
        { text: 'nav.home', icon: 'home.png', route: 'Home' },
        {
          text: 'nav.directory',
          icon: 'directory.png',
          route: 'Directory',
          subButtons: [
            { text: 'nav.micronations', route: 'Directory' },
            { text: 'nav.organizations', route: 'Organizations' },
            { text: 'nav.map', route: 'GlobalMap' },
            { text: 'nav.newEntry', route: 'NewEntry' },
            { text: 'nav.moderation', route: 'ModerationPanel', requiresModerator: true }
          ]
        },
        {
          text: 'nav.stats',
          icon: 'stats.png',
          route: 'Stats',
          subButtons: [
            { text: 'nav.rankings', route: 'Stats' },
            { text: 'nav.timeline', route: 'StatsTimeline' }
          ]
        },
        { text: 'nav.account', icon: 'profile.png', route: 'Account' },
        {
          text: 'nav.info',
          icon: 'about.png',
          route: 'About',
          subButtons: [
            { text: 'nav.about', route: 'About' },
            { text: 'nav.donate', route: 'Donate' },
            { text: 'nav.terms', route: 'TermsOfContests' }
          ]
        }
      ]
    }
  },
  computed: {
    navbarButtons() {
      return this.navigationButtons.map((button) => ({
        ...button,
        text: this.$t(button.text),
        subButtons: (button.subButtons || [])
          .filter((subButton) => !subButton.requiresModerator || this.userIsModerator)
          .map((subButton) => ({ ...subButton, text: this.$t(subButton.text) }))
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
@media (max-width: 760px) {
  #app:has(.directory-mobile-nav) { padding-top: 68px; }
  main.directory-mobile-main,
  footer.site-footer { margin-left: 0; }
}

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
