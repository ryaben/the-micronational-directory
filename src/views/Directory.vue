<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import OrganizationEntry from '../components/OrganizationEntry.vue';
import LocationPicker from '../components/LocationPicker.vue';
import Sectionbar from '../components/Sectionbar.vue';
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue';
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue';
import Settingsbar from '../components/Settingsbar.vue';
import NewEntryForm from '../components/NewEntryForm.vue';
import store from '../store';
import { auth, db, storage } from '../firebase/init.js';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';
import { notify } from "@kyvg/vue3-notification";
import '@vuepic/vue-datepicker/dist/main.css';
import emailjs from 'emailjs-com';
</script>

<template>
  <div class="animation-error-avoider">
    <section class="site-section">
      <Sectionbar :sections="sectionbarTabs" @show-target-tab="changeViewMode" :initial-selected-tab="'micronationsTab0'"
        @click="renderMapbox" />

      <section
        v-show="viewMode === 'micronations' || viewMode === 'collage' || viewMode === 'moderation' || viewMode === 'organizations'"
        class="directory-container">

        <Settingsbar :view-mode="viewMode" :store-getter="'micronations'" :elements-directory="micronationsDirectory"
          @loaded-directory="loadPagedMicronations" @view-mode-changed="updateViewMode"
          @updated-entry-width="updateEntryWidth" />
        <div id="micronationsList" class="micronations-list"
          v-show="viewMode === 'micronations' || viewMode === 'collage'" ref="micronationsList" :key="componentKey"
          :class="{ 'fixed-height': fixedHeight }">
          <TransitionGroup>
            <DirectoryEntry v-for="(item, i) in pagedMicronationsDirectory" :key="i + componentKey" :width="entryWidth"
              :flag-height="entryWidth * 0.6" :view-mode="viewMode" :micronations-directory="micronationsDirectory"
              :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
              :supranational-micronations="supranationalMicronations" :info="{
                id: item.id,
                name: {
                  main: item.name.main,
                  mainAlt: item.name.mainAlt,
                  title: item.name.title,
                  titleAlt: item.name.titleAlt
                },
                flag: item.flag,
                motto: item.motto,
                type: item.type,
                languages: item.languages,
                capital: item.capital,
                currency: item.currency,
                foundationDate: item.foundationDate,
                location: item.location,
                memberships: item.memberships,
                contactInfo: item.contactInfo,
                websites: item.websites,
                author: item.author,
                approved: item.approved,
                creationDate: item.creationDate
              }" />
          </TransitionGroup>
        </div>

        <Settingsbar :view-mode="viewMode" :store-getter="'organizations'" :elements-directory="organizationsDirectory"
          @loaded-directory="loadPagedOrganizations" />
        <div id="organizationsList" class="organizations-list" v-show="viewMode === 'organizations'"
          ref="organizationsList" :key="componentKey" :class="{ 'fixed-height': fixedHeight }">
          <TransitionGroup>
            <OrganizationEntry v-for="(item, i) in pagedOrganizationsDirectory" :key="i" :width="entryWidth"
              :logo-height="entryWidth * 0.6" :view-mode="viewMode" :micronations-directory="micronationsDirectory" :info="{
                id: item.id,
                name: {
                  main: item.name.main,
                  mainAlt: item.name.mainAlt,
                },
                logo: item.logo,
                motto: item.motto,
                languages: item.languages,
                foundationDate: item.foundationDate,
                contactInfo: item.contactInfo,
                websites: item.websites,
                author: item.author,
                approved: item.approved,
                creationDate: item.creationDate
              }" />
          </TransitionGroup>
        </div>

        <div class="moderation-menu" v-if="userIsModerator" v-show="viewMode === 'moderation'">
          <div class="micronations-list" id="moderationMicronations" ref="micronationsListModeration" :key="componentKey"
            :class="{ 'fixed-height': fixedHeight }">
            <DirectoryEntry v-for="(item, i) in micronationsModerationDirectory" :key="i" :width="entryWidth"
              :flag-height="entryWidth * 0.6" :view-mode="'micronations'" :micronations-directory="micronationsDirectory"
              :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
              :supranational-micronations="supranationalMicronations" :info="{
                id: item.id,
                name: {
                  main: item.name.main,
                  mainAlt: item.name.mainAlt,
                  title: item.name.title,
                  titleAlt: item.name.titleAlt
                },
                flag: item.flag,
                motto: item.motto,
                type: item.type,
                languages: item.languages,
                capital: item.capital,
                currency: item.currency,
                foundationDate: item.foundationDate,
                location: item.location,
                memberships: item.memberships,
                contactInfo: item.contactInfo,
                websites: item.websites,
                author: item.author,
                approved: item.approved,
                creationDate: item.creationDate
              }"
              @click="selectedEntry = i; selectedEntryName = item.name.main; selectedEntryAuthor = item.author.email; selectedEntryType = 'Micronation'" />
            <OrganizationEntry v-for="(item, i) in organizationsModerationDirectory" :key="i" :width="entryWidth"
              :flag-height="entryWidth * 0.6" :micronations-directory="micronationsDirectory" :info="{
                id: item.id,
                name: {
                  main: item.name.main,
                  mainAlt: item.name.mainAlt
                },
                logo: item.logo,
                motto: item.motto,
                languages: item.languages,
                foundationDate: item.foundationDate,
                contactInfo: item.contactInfo,
                websites: item.websites,
                author: item.author,
                approved: item.approved,
                creationDate: item.creationDate
              }"
              @click="selectedEntry = i; selectedEntryName = item.name.main; selectedEntryAuthor = item.author.email; selectedEntryType = 'Organization'" />
          </div>

          <div class="moderation-buttons" v-if="userIsModerator" v-show="micronationsDirectory.length !== 0">
            <label class="selected-entry-name">{{ selectedEntryName }}</label>
            <label class="selected-entry-author">Type: {{ selectedEntryType }}</label>
            <label class="selected-entry-author">Author: {{ selectedEntryAuthor }}</label>

            <Sectionbar id="moderationBar" :sections="moderationbarTabs" @show-target-tab="changeModerationViewMode"
              :initial-selected-tab="'moderateTab0'" />

            <div v-show="moderationViewMode === 'moderate'" class="moderation-tab">
              <textarea class="login-input" v-model="rejectionReason" rows="6"
                placeholder="Additional message for rejection/approval"></textarea>
              <button id="entryReject" class="login-button color-transition" :disabled="selectedEntry === undefined"
                @click="entryReject(selectedEntry, false)">
                Reject
              </button>
              <button id="entryReject" class="login-button color-transition" :disabled="selectedEntry === undefined"
                @click="entryReject(selectedEntry, true)">
                Reject and delete
              </button>
              <button id="entryApprove" class="login-button color-transition" :disabled="selectedEntry === undefined"
                @click="entryApprove(selectedEntry)">
                Approve
              </button>
            </div>
            <div v-show="moderationViewMode === 'edit'" class="moderation-tab">
              <p>Work in progress.</p>
            </div>
          </div>
        </div>
        <div v-if="!userIsModerator" v-show="micronationsDirectory.length !== 0">
          You don't have sufficient privileges in order to moderate pending submissions.
        </div>
      </section>

      <LocationPicker v-if="renderedMapbox" v-show="viewMode === 'map'" ref="micronationsMap" mode="locationMap"
        :collection="physicalMicronationsDirectory.filter(element => element.approved)" width="100%" height="40vw" />

      <div v-show="viewMode === 'addEntry'" class="dropdown-info-box color-transition">
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
            Please provide <b>truthful, appropriate and precise information</b>. Additionally, cases of micronations/organizations that
            promote Nazi symbology, adult 18+ content and/or any kind of illegal activity will be immediately rejected.
          </li>
          <li>
            Micronations/organizations submitted should have <b>at least one (1) month of proven existence.</b> This way we avoid
            lightning entries that may only be games or premature/fake experiments.
          </li>
          <li>
            It's <b>mandatory</b> that all entries have a website source (<b>NOT</b> a social media account) of the
            micronation/organization and/or (preferably
            <b>and</b>) an info article on any wiki. This way, a veridical source for the information entered is
            specified, and we can avoid entries that could be jokes, games, fake, misleading or cheating for contests.
          </li>
          <li>
            Physical and digital micronations can be included alike, as well as fictional countries as long as they also demonstrate activity as a proper
            micronation (news, diplomacy, activity) with imaginary elements (e.g., <a
              href="https://en.wikipedia.org/wiki/Babar%27s_Kingdom" target="_blank">Babar's Kingdom</a>
            is not a valid case, while the <router-link :to="'/directory/Redonda'">Kingdom of Redonda</router-link>
            or most of the micronations from <router-link :to="'/organizations/Micras Cartography Society'">Micras</router-link> indeed are).
          </li>
          <li>
            Ideally and whenever possible, please input the entry data in English. If not, then in the micronation's/organization's main
            official language.
          </li>
          <li>
            If website is closed or inactive, you can check it on the <b><a
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

        <!-- los containers de new entry van acá con v-show="newEntryView" -->
        <NewEntryForm :entry-type="'micronation'" v-show="newMicronationView" :directory-data="micronationsDirectory"
          :micronations-directory="micronationsDirectory" :organizations-directory="organizationsDirectory"
          :visible-organizations="visibleOrganizations" :supranational-micronations="supranationalMicronations" />
        <NewEntryForm :entry-type="'organization'" v-show="newOrganizationView"
          :micronations-directory="micronationsDirectory" :directory-data="organizationsDirectory" />

        <button v-show="!newMicronationView && !newOrganizationView" class="login-button short color-transition"
          :disabled="!user.emailVerified" @click="newMicronationView = true" :key="componentKey">Add new
          micronation</button>
        <button v-show="!newOrganizationView && !newMicronationView" class="login-button short color-transition"
          :disabled="!user.emailVerified" @click="newOrganizationView = true" :key="componentKey">Add new
          organization</button>
        <label v-if="!user.emailVerified" :key="componentKey">(Available for <router-link :to="'/login'">registered users
            with verified email</router-link> only)</label>
      </div>
    </section>

    <Transition name="opacity">
      <div id="goToTopButton" v-show="!fixedHeight" @click="scrollToTop">⬆️</div>
    </Transition>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      user: {},
      pagedMicronationsDirectory: [],
      pagedOrganizationsDirectory: [],
      sectionbarTabs: [
        { text: 'Micronations', target: 'micronations', display: true, classes: '' },
        { text: 'Organizations', target: 'organizations', display: true, classes: '' },
        { text: 'Map', target: 'map', display: true, classes: '' },
        { text: 'Add entry', target: 'addEntry', display: true, classes: 'border-left' },
        { text: 'Moderate entries', target: 'moderation', display: true, classes: '' }
      ],
      moderationbarTabs: [
        { text: 'Moderate', target: 'moderate', display: true },
        { text: 'Edit', target: 'edit', display: true },
      ],

      componentKey: 0,
      entryWidth: 180,
      newMicronationView: false,
      newOrganizationView: false,
      viewMode: 'micronations',
      moderationViewMode: 'moderate',
      selectedEntry: undefined,
      selectedEntryName: 'None selected',
      selectedEntryAuthor: '',
      selectedEntryType: undefined,
      rejectionReason: "",
      renderedMapbox: false,
      fixedHeight: false
    };
  },
  components: {
    DirectoryEntry,
    OrganizationEntry,
    LocationPicker,
    Sectionbar,
    SettingsSubcontainer,
    SettingsSubcontainerTitle,
    SettingsSubcontainerParameter,
    Settingsbar,
    NewEntryForm
  },
  computed: {
    moderatorsList() {
      return store.getters.moderators;
    },
    userIsModerator() {
      return this.moderatorsList.includes(this.user.email);
    },
    micronationsDirectory() {
      return store.getters.micronations;
    },
    physicalMicronationsDirectory() {
      return store.getters.physicalMicronations;
    },
    visibleMicronations() {
      return this.micronationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    supranationalMicronations() {
      return this.micronationsDirectory.filter(element => element.supranational);
    },
    organizationsDirectory() {
      return store.getters.organizations;
    },
    visibleOrganizations() {
      return this.organizationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    micronationsModerationDirectory() {
      return this.micronationsDirectory.filter((element) => !element.approved && element.searchDisplay && element.filterDisplay);
    },
    organizationsModerationDirectory() {
      return this.organizationsDirectory.filter((element) => !element.approved && element.searchDisplay && element.filterDisplay);
    },
    cssStyles() {
      return {
        "--micronations-list-width": this.$refs.micronationsList.offsetWidth + "px"
      }
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
    changeViewMode(newValue) {
      this.viewMode = newValue;
    },
    changeModerationViewMode(newValue) {
      this.moderationViewMode = newValue;
    },
    async entryReject(entryIndex, deletionRequest) {
      const that = this;
      const remoteDirectory = this.selectedEntryType === 'Micronation' ? this.micronationsModerationDirectory : this.organizationsModerationDirectory;
      const remoteCollection = this.selectedEntryType === 'Micronation' ? 'micronations' : 'organizations';

      try {
        if (!this.moderatorsList.includes(that.selectedEntryAuthor)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            entry_decision: 'reject',
            entry_decisiond: 'rejected',
            to_name: that.selectedEntryName,
            to_email: that.selectedEntryAuthor,
            entry_name: remoteDirectory[entryIndex].main.name,
            rejection_reason: that.rejectionReason
          },
            "P8-p_r-gTZedo_h84");
        }

        if (deletionRequest === true) {
          await deleteDoc(doc(db, remoteCollection, remoteDirectory[entryIndex].id));

          const flagRef = ref(storage, "images/" + remoteFolder + "/" + remoteDirectory[entryIndex].name.main + ".png");
          deleteObject(flagRef).then(() => {
            remoteDirectory.splice(entryIndex, 1);

            notify({
              title: 'Entry moderation',
              text: 'The rejected entry was successfully deleted from the database.',
              type: 'success'
            })
          }).catch((error) => {
            notify({
              title: 'Entry moderation',
              text: error,
              type: 'error'
            })
          });
        }

        remoteDirectory.splice(entryIndex, 1)
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.selectedEntryType = undefined;
        this.rejectionReason = '';

        notify({
          title: 'Entry moderation',
          text: 'The author was notified that their entry was rejected.',
          type: 'warning'
        })
      } catch (error) {
        notify({
          title: 'Error while moderating entry',
          text: error,
          type: 'error'
        })
      }
    },
    async entryApprove(entryIndex) {
      const that = this;
      const remoteDirectory = this.selectedEntryType === 'Micronation' ? this.micronationsModerationDirectory : this.organizationsModerationDirectory;
      const remoteCollection = this.selectedEntryType === 'Micronation' ? 'micronations' : 'organizations';

      try {
        if (!this.moderatorsList.includes(that.selectedEntryAuthor)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            entry_decision: 'approve',
            entry_decisiond: 'approved',
            to_name: that.selectedEntryName,
            to_email: that.selectedEntryAuthor,
            entry_name: remoteDirectory[entryIndex].name.main,
            rejection_reason: that.rejectionReason
          },
            "P8-p_r-gTZedo_h84");
        }

        const entryRef = doc(db, remoteCollection, remoteDirectory[entryIndex].id);
        await updateDoc(entryRef, {
          approved: true
        });

        remoteDirectory[entryIndex].approved = true;
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.selectedEntryType = undefined;
        this.rejectionReason = '';

        notify({
          title: 'Entry moderation',
          text: 'The entry was successfully approved, the author was notified and it will now be available in the Directory.',
          type: 'success'
        })
      } catch (error) {
        notify({
          title: 'Error while moderating entry',
          text: error,
          type: 'error'
        })
      }
    },
    loadPagedMicronations(payload) {
      this.pagedMicronationsDirectory = payload;
    },
    loadPagedOrganizations(payload) {
      this.pagedOrganizationsDirectory = payload;
    },
    updateViewMode(payload) {
      this.viewMode = payload;
    },
    updateEntryWidth(payload) {
      this.entryWidth = payload;
    },
    toggleDropdown(e) {
      e.target.parentNode.classList.toggle('open');
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    renderMapbox(event) {
      if (event.target.id === 'mapTab2') {
        this.renderedMapbox = true;
      }
    },
    forceRerender() {
      this.componentKey += 1;
    }
  },
  mounted() {
    this.authListener();
  }
}
</script>

<style scoped>
.site-section {
  padding: 0px;
}

.moderation-menu {
  display: flex;
}

#moderationMicronations {
  width: 80%;
  padding-top: 15px;
}

.micronations-list,
.organizations-list {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  padding: 0 12px 9px 12px;
}

.micronations-list.fixed-height {
  max-height: calc(v-bind('fixedHeightValue') * 1px);
  overflow-y: scroll;
}

.dropdown-info-box {
  border-top: none;
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
}

.moderation-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  background-color: var(--profile-left-side-background-color);
  border-right: none;
  border-left: 4px solid var(--site-section-border-color);
  border-radius: 0px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  min-height: fit-content;
  height: auto;
  width: 30%;
}

#moderationBar {
  width: 100%;
  justify-content: center;
  border-radius: 0px;
}

.moderation-buttons .moderation-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.moderation-buttons .selected-entry-name {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
}

.moderation-buttons .selected-entry-author {
  font-size: 14px;
}

.login-button.short {
  margin-right: 4px;
}

.moderation-buttons .login-button {
  width: 70%;
  margin-bottom: 25px;
}

.moderation-buttons .login-button:last-child {
  margin-bottom: 0;
}

.moderation-buttons .login-input {
  margin-top: 15px;
  width: 100%;
}

#entryReject {
  background-color: var(--intense-tone);
}

#entryApprove {
  background-color: var(--success-tone);
}

#goToTopButton {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: 50px;
  height: 50px;
  right: 10px;
  bottom: 10px;
  border-radius: 50%;
  font-size: 30px;
  background-color: var(--vt-c-text-dark-2);
  color: var(--vt-c-indigo);
  cursor: pointer;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

@media only screen and (max-width: 960px) {
  .directory-settings>div:not(div:last-of-type) {
    margin-bottom: 12px;
  }
}
</style>
