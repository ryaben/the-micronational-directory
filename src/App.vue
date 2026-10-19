<script setup>
import { onAuthStateChanged } from 'firebase/auth'
import { onMounted, ref, watch } from 'vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import Navbar from './components/Navbar.vue'
import store from './store'
import { auth } from './firebase/auth.js'
import { initializeAnalytics } from './firebase/analytics.js'

const theme = ref(localStorage.getItem('tmd-theme') || 'dark')
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
const applyTheme = (value) => (document.documentElement.dataset.theme = value)
watch(theme, (value) => {
  localStorage.setItem('tmd-theme', value)
  applyTheme(value)
})
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
            :theme="theme"
            :micronations-directory="micronationsDirectory"
            :visible-micronations="visibleMicronations"
            :supranational-micronations="supranationalMicronations"
            :physical-micronations-directory="physicalMicronationsDirectory"
            :micronations-approved-directory="micronationsApprovedDirectory"
            :organizations-directory="organizationsDirectory"
            :visible-organizations="visibleOrganizations"
            :organizations-moderation-directory="organizationsModerationDirectory"
            :organizations-approved-directory="organizationsApprovedDirectory"
            :moderators-list="moderatorsList"
            :user-is-moderator="userIsModerator"
            :user="currentLoggedUser"
          />
        </KeepAlive>
      </Transition>
    </router-view>
  </main>

  <SiteFooter :theme="theme" @toggle-theme="toggleTheme" />
  <notifications position="top right" width="350px" speed="700" :pause-on-hover="true" />
</template>

<script>
export default {
  data() {
    return {
      user: {},
      navbarButtons: [
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
            { text: 'Moderation', route: 'ModerationPanel' }
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
    micronationsDirectory() {
      return store.getters.micronations
    },
    visibleMicronations() {
      return this.micronationsDirectory.filter(
        (element) => element.approved && element.searchDisplay && element.filterDisplay
      )
    },
    supranationalMicronations() {
      return this.micronationsDirectory.filter((element) => element.supranational)
    },
    physicalMicronationsDirectory() {
      return store.getters.physicalMicronations
    },
    organizationsDirectory() {
      return store.getters.organizations
    },
    visibleOrganizations() {
      return this.organizationsDirectory.filter(
        (element) => element.approved && element.searchDisplay && element.filterDisplay
      )
    },
    organizationsModerationDirectory() {
      return this.organizationsDirectory.filter(
        (element) => !element.approved && element.searchDisplay && element.filterDisplay
      )
    },
    micronationsApprovedDirectory() {
      return store.getters.micronations.filter((element) => element.approved)
    },
    organizationsApprovedDirectory() {
      return store.getters.organizations.filter((element) => element.approved)
    },
    moderatorsList() {
      return store.getters.moderators
    },
    userIsModerator() {
      return this.moderatorsList.includes(this.user.email)
    },
    currentLoggedUser() {
      return this.user
    }
  },
  methods: {
    authListener() {
      onAuthStateChanged(auth, (user) => {
        this.user = user || { emailVerified: false }
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
