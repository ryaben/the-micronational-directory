<script setup>
import Sectionbar from '../components/Sectionbar.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import OrganizationEntry from '../components/OrganizationEntry.vue';
import store from '../store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '../firebase/init.js';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { notify } from "@kyvg/vue3-notification";
import emailjs from 'emailjs-com';
</script>

<template>
  <section class="site-section">
    <div class="moderation-menu" v-if="userIsModerator">
      <div id="moderationMicronationsContainer">
        <p id="moderationTitle">Submitted entries pending moderation:</p>
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
    }" @click="selectedEntry = i; selectedEntryName = item.name.main; selectedEntryAuthor = item.author.email; selectedEntryType = 'Micronation'" />
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
    }" @click="selectedEntry = i; selectedEntryName = item.name.main; selectedEntryAuthor = item.author.email; selectedEntryType = 'Organization'" />
        </div>
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
    <div id="notEnoughPrivileges" v-if="!userIsModerator" v-show="micronationsDirectory.length !== 0">
      You don't have sufficient privileges in order to moderate pending submissions.
    </div>
  </section>
</template>

<script>
export default {
  components: {
    Sectionbar,
    OrganizationEntry,
    DirectoryEntry
  },
  data() {
    return {
      componentKey: 0,
      entryWidth: 180,
      fixedHeight: false,
      user: {},
      moderationViewMode: 'moderate',
      moderationbarTabs: [
        { text: 'Moderate', target: 'moderate', display: true },
        { text: 'Edit', target: 'edit', display: true },
      ],
      selectedEntry: undefined,
      selectedEntryName: 'None selected',
      selectedEntryAuthor: '',
      selectedEntryType: undefined,
      rejectionReason: ""
    }
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
    micronationsModerationDirectory() {
      return this.micronationsDirectory.filter((element) => !element.approved && element.searchDisplay && element.filterDisplay);
    },
    organizationsModerationDirectory() {
      return this.organizationsDirectory.filter((element) => !element.approved && element.searchDisplay && element.filterDisplay);
    },
    visibleOrganizations() {
      return this.organizationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    moderatorsList() {
      return store.getters.moderators;
    },
    userIsModerator() {
      return this.moderatorsList.includes(this.user.email);
    }
  },
  methods: {
    async entryReject(entryIndex, deletionRequest) {
      const that = this;
      const remoteDirectory = this.selectedEntryType === 'Micronation' ? this.micronationsModerationDirectory : this.organizationsModerationDirectory;
      const remoteCollection = this.selectedEntryType === 'Micronation' ? 'micronations' : 'organizations';

      try {
        if (!this.moderatorsList.includes(that.selectedEntryAuthor)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            entry_decision: 'reject',
            entry_decisiond: 'rejected',
            to_name: remoteDirectory[entryIndex].author.name,
            to_email: that.selectedEntryAuthor,
            entry_name: that.selectedEntryName,
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

          that.remoteDirectory.splice(entryIndex, 1);
          that.forceRerender();
          that.selectedEntry = undefined;
          that.selectedEntryName = 'None selected';
          that.selectedEntryType = undefined;
          that.rejectionReason = '';
        }

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
            to_name: remoteDirectory[entryIndex].author.name,
            to_email: that.selectedEntryAuthor,
            entry_name: that.selectedEntryName,
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
    changeModerationViewMode(newValue) {
      this.moderationViewMode = newValue;
    },
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
    forceRerender() {
      this.componentKey += 1;
    },
    scrollToTop() {
      window.scrollTo(0, 0);
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

#moderationTitle {
  font-size: 20px;
  font-weight: bold;
  width: 100%;
}

.moderation-menu {
  display: flex;
}

#moderationMicronationsContainer {
  display: flex;
  flex-direction: column;
  width: 80%;
  padding: 0 15px 10px 15px;
}

#moderationMicronations {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
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

#notEnoughPrivileges {
  margin: 20px;
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
</style>
