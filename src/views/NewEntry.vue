<script setup>
import NewEntryForm from '../components/NewEntryForm.vue';
import store from '../store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/init.js';
import '@vuepic/vue-datepicker/dist/main.css';
</script>

<template>
  <section class="site-section">
    <div class="dropdown-info-box color-transition">
      <h3 @click="toggleDropdown">⚠️ Important notes on new entries and to add your own:</h3>
      <p>
        Don't know what micronations to add? <a
          href="https://docs.google.com/spreadsheets/d/1jwekLc1EpbVfznTbMrqiM8KUJW_ra3vywcMpiLTJrEs/edit?usp=sharing"
          target="_blank">Check out this list with many sources that we've composed</a>.
      </p>
      <p>
        We invite the community to contribute to the directory and add entries to it.
        <b>It's important to highlight that:</b>
      </p>
      <ul class="notes-list">
        <li>
          Please provide <b>truthful, appropriate and precise information</b>. Additionally, cases of
          micronations/organizations that
          promote Nazi symbology, adult 18+ content and/or any kind of illegal activity will be immediately rejected.
        </li>
        <li>
          Micronations/organizations submitted should have <b>at least one (1) month of proven existence.</b> This way
          we avoid
          lightning entries that may only be games or premature/fake experiments.
        </li>
        <li>
          It's <b>mandatory</b> that all entries have a website source of the
          micronation/organization and/or (preferably
          <b>and</b>) an info article on any wiki. This way, a veridical source for the information entered is
          specified, and we can avoid entries that could be jokes, games, fake, misleading or cheating for contests.
        </li>
        <li>
          Physical and digital micronations can be included alike, as well as fictional countries as long as they also
          demonstrate activity as a proper
          micronation (news, diplomacy, activity) with imaginary elements (e.g., <a
            href="https://en.wikipedia.org/wiki/Babar%27s_Kingdom" target="_blank">Babar's Kingdom</a>
          is not a valid case, while the <router-link :to="'/directory/Redonda'">Kingdom of Redonda</router-link>
          or most of the micronations from <router-link
            :to="'/organizations/Micras Cartography Society'">Micras</router-link> indeed are).
        </li>
        <li>
          Ideally and whenever possible, please input the entry data in English. If not, then in the
          micronation's/organization's main
          official language.
        </li>
        <li>
          If a micronation's/organization's website is down or inactive, you can check it on the <b><a
              href="http://web.archive.org/">Wayback
              Machine</a></b> because it may have a past snapshot saved. If so, you can add the link the service
          generates instead.
        </li>
        <li>
          All submissions will first <b>require approval from the administrator</b> (can take up to 72 hours) before
          they are posted on the definitive public online directory.
        </li>
      </ul>
      <p>
        Thanks for understanding and for helping to create this digital database museum!
      </p>

      <button class="login-button short color-transition" :class="{ 'active': newMicronationView }"
        :disabled="!user.emailVerified" @click="newMicronationView = true; newOrganizationView = false">
        Add new micronation
      </button>
      <button class="login-button short color-transition" :class="{ 'active': newOrganizationView }"
        :disabled="!user.emailVerified" @click="newOrganizationView = true; newMicronationView = false">
        Add new organization
      </button>
      <label v-if="!user.emailVerified">(Available for <router-link :to="'/login'">registered
          users with verified email</router-link> only)
      </label>

      <!-- los containers de new entry van acá con v-show="newEntryView" -->
      <NewEntryForm class="new-entry-container" :entry-type="'micronation'" v-if="user.emailVerified && newMicronationView"
        :directory-data="micronationsDirectory" :micronations-directory="micronationsDirectory"
        :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
        :supranational-micronations="supranationalMicronations" />
      <NewEntryForm class="new-entry-container" :entry-type="'organization'" v-if="user.emailVerified && newOrganizationView"
        :micronations-directory="micronationsDirectory" :directory-data="organizationsDirectory" />
    </div>
  </section>
</template>

<script>
export default {
  components: {
    NewEntryForm
  },
  data: () => {
    return {
      user: {},
      newMicronationView: false,
      newOrganizationView: false,
      componentKey: 0
    };
  },
  computed: {
    micronationsDirectory() {
      return store.getters.micronations;
    },
    supranationalMicronations() {
      return this.micronationsDirectory.filter(element => element.supranational);
    },
    organizationsDirectory() {
      return store.getters.organizations;
    },
    visibleOrganizations() {
      return this.organizationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
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
    },
  },
  mounted() {
    this.authListener();
  },
}
</script>

<style scoped>
.site-section {
  padding: 0px;
}

.login-button.short {
  margin-right: 4px;
}

.dropdown-info-box {
  border-top: none;
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
}

.new-entry-container {
  margin-top: 10px;
}
</style>
