<script setup>
import Navbar from './components/Navbar.vue';
import store from './store';
import { auth } from './firebase/init.js';
import { onAuthStateChanged } from 'firebase/auth';
import { version } from '../package.json';
</script>

<template>
  <header>
    <a href="/" class="logo-link"><img id="logo" src="/images/logo.png" alt="Logo"></a>
    <p id="slogan">The ultimate worldwide directory of micronations from all over history.</p>
  </header>

  <Navbar :buttons="navbarButtons" />

  <main>
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <KeepAlive
          :include="['Home', 'Directory', 'Organizations', 'GlobalMap', 'NewEntry', 'MediaWikiReader', 'MicronationalMapReader']">
          <component
            :is="Component"
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

  <footer class="site-section">
    <div class="credits">
      <img src="/images/plain-logo1.png" alt="TMD logo">
      <p><b>The Micronational Directory © 2023-{{ new Date().getFullYear() }}</b></p>
      <label class="footer-label">Current version: {{ version }}-beta</label>
    </div>

    <div class="social-media">
      <label class="footer-label">TMD at social media:</label>
      <a href="https://twitter.com/the_micro_direc?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-size="large"
        data-dnt="true" data-show-count="false">Follow @the_micro_direc</a>
      <a class="anchor-button" id="sendEmail"
        href="mailto:themicronationaldirectory@gmail.com">themicronationaldirectory@gmail.com</a>
    </div>

    <div class="settings">
      <label class="footer-label">Global settings:</label>
      <select name="languageSelect" id="languageSelect">
        <option value="english">English</option>
      </select>
      <label for="darkModeCheckbox"><input id="darkModeCheckbox" type="checkbox" disabled checked>Dark mode</label>
      <!-- <label class="footer-label margin-top">Cookie-free<br>website! ✅</label> -->
    </div>

    <a href="https://s01.flagcounter.com/more/n91V/" class="tab-router-link" target="_blank"><img
        src="https://s01.flagcounter.com/count2/n91V/bg_FFFFFF/txt_000000/border_CCCCCC/columns_3/maxflags_15/viewers_0/labels_1/pageviews_0/flags_0/percent_0/"
        alt="Flag Counter" border="0"></a>
  </footer>

  <notifications position="top right" width="350px" speed="700" :pause-on-hover="true" />
</template>

<script>
export default {
  components: {
    Navbar
  },
  data() {
    return {
      user: {},
      navbarButtons: [
        { text: 'Home', icon: 'home.png', route: 'Home' },
        { text: 'Directory', icon: 'directory.png', route: 'Directory', subButtons: [{ text: 'Micronations', route: 'Directory' }, { text: 'Organizations', route: 'Organizations' }, { text: 'World map', route: 'GlobalMap' }, { text: 'New entry', route: 'NewEntry' }, { text: 'Moderation', route: 'ModerationPanel' }] },
        { text: 'Stats', icon: 'stats.png', route: 'Stats', subButtons: [{ text: 'Rankings and\ncontests', route: 'Stats' }] },
        { text: 'Profile', icon: 'profile.png', route: 'Login' },
        { text: 'Info', icon: 'about.png', route: 'About', subButtons: [{ text: 'About us', route: 'About' }, { text: 'Donate', route: 'Donate' }, { text: 'Contests T&C', route: 'TermsOfContests' }] }
      ]
    }
  },
  computed: {
    micronationsDirectory() {
      return store.getters.micronations;
    },
    visibleMicronations() {
      return this.micronationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    supranationalMicronations() {
      return this.micronationsDirectory.filter(element => element.supranational);
    },
    physicalMicronationsDirectory() {
      return store.getters.physicalMicronations;
    },
    organizationsDirectory() {
      return store.getters.organizations;
    },
    visibleOrganizations() {
      return this.organizationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    organizationsModerationDirectory() {
      return this.organizationsDirectory.filter((element) => !element.approved && element.searchDisplay && element.filterDisplay);
    },
    micronationsApprovedDirectory() {
      return store.getters.micronations.filter(element => element.approved);
    },
    organizationsApprovedDirectory() {
      return store.getters.organizations.filter(element => element.approved);
    },
    moderatorsList() {
      return store.getters.moderators;
    },
    userIsModerator() {
      return this.moderatorsList.includes(this.user.email);
    },
    currentLoggedUser() {
      return this.user;
    }
  },
  methods: {
    authListener() {
      onAuthStateChanged(auth, user => {
        if (user) {
          this.user = user;
        } else {
          this.user = {
            emailVerified: false
          }
        }
      });
    }
  },
  async mounted() {
    this.authListener();
    await store.dispatch('getMicronations');
    await store.dispatch('getOrganizations');
    await store.dispatch('getContests');
  }
}
</script>

<style scoped>
header {
  display: flex;
  width: auto;
  flex-direction: column;
  align-items: center;
  line-height: 1.5;
}

.logo-link:hover {
  background: none;
}

#logo {
  width: 600px;
  margin-bottom: 20px;
}

#slogan {
  font-size: 21px;
  margin-block-start: 0;
  margin-block-end: 20px;
}

nav {
  display: flex;
  justify-content: space-between;
  width: auto;
}

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

footer label[for="darkModeCheckbox"],
#languageSelect {
  font-size: 15px;
  width: 100px;
  padding: 5px;
  background-color: var(--navbar-tab-background-color);
  border-radius: 8px;
  cursor: pointer;
}

footer label[for="darkModeCheckbox"] {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

#languageSelect {
  font-size: 15px;
  width: 110px;
  border: none;
  color: var(--color-text);
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.footer-label {
  font-size: 14px;
  font-weight: bold;
}

.footer-label.margin-top {
  margin-top: 8px;
}

.social-media,
.credits,
.settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.credits img {
  width: 56px;
}

.anchor-button {
  text-decoration: none;
  border-radius: 15px;
  text-align: center;
  background-color: var(--vt-c-indigo);
  color: var(--vt-c-white-mute);
}

.anchor-button:hover {
  background-color: var(--vt-c-indigo-dark);
  color: var(--vt-c-white-mute);
}

#sendEmail {
  padding: 6px 9px 6px 9px;
  font-size: 10px;
  width: 177px;
  height: 17px;
}

#openSourceCode {
  padding: 1px 9px 1px 9px;
  font-size: 15px;
  width: 177px;
  height: 27px;
}
</style>
