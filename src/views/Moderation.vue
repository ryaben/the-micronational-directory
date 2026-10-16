<script setup>
import Sectionbar from '../components/Sectionbar.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import OrganizationEntry from '../components/OrganizationEntry.vue';
import store from '../store';
import { notify } from "@kyvg/vue3-notification";
import emailjs from 'emailjs-com';
import { fetchGitHubIssues, convertIssueToEntry, addIssueLabel, closeIssue, addIssueComment, fetchRepoFile, updateRepoFile, createRepoFile, extractBase64Image, extractFileMetadata } from '../utils/githubFunctions.js';

defineProps({
  micronationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
  },
  supranationalMicronations: {
    type: Array,
    required: false,
    default: store.getters.micronations.filter(element => element.supranational)
  },
  organizationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.organizations
  },
  visibleOrganizations: {
    type: Array,
    required: false,
    default: store.getters.organizations.filter(element => element.approved && element.searchDisplay && element.filterDisplay)
  },
  moderatorsList: {
    type: Array,
    required: true,
    default: store.getters.moderators
  },
  userIsModerator: {
    type: Boolean,
    required: false,
    default: false
  },
  user: {
    type: Object,
    required: true,
    default: {}
  }
});
</script>

<template>
  <section class="site-section">
    <div class="moderation-menu" v-if="userIsModerator">
      <div id="moderationMicronationsContainer">
        <p id="moderationTitle">Submitted entries pending moderation:</p>
        <div v-if="loadingIssues" class="loading-message">Loading pending entries from GitHub...</div>
        <div v-else-if="githubIssues.length === 0 || (micronationsModerationDirectory.length === 0 && organizationsModerationDirectory.length === 0)" class="loading-message">No pending entries found.</div>
        <div v-else class="micronations-list" id="moderationMicronations" ref="micronationsListModeration" :key="componentKey"
          :class="{ 'fixed-height': fixedHeight }">
          <DirectoryEntry v-for="item in micronationsModerationDirectory" :key="item.id" :width="entryWidth"
            :flag-height="entryWidth * 0.6" :view-mode="'micronations'" :micronations-directory="micronationsDirectory"
            :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
            :supranational-micronations="supranationalMicronations" :disable-full-profile-button="true" :info="{
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
    }" @click="handleEntryClick(item, 'Micronation')" />
          <OrganizationEntry v-for="item in organizationsModerationDirectory" :key="item.id" :width="entryWidth"
            :flag-height="entryWidth * 0.6" :micronations-directory="micronationsDirectory" :disable-full-profile-button="true" :info="{
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
    }" @click="handleEntryClick(item, 'Organization')" />
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
            @click="entryReject(selectedEntry)">
            Reject
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
      moderationViewMode: 'moderate',
      moderationbarTabs: [
        { text: 'Moderate', target: 'moderate', display: true },
        { text: 'Edit', target: 'edit', display: true },
      ],
      selectedEntry: undefined,
      selectedEntryName: 'None selected',
      selectedEntryAuthor: '',
      selectedEntryType: undefined,
      rejectionReason: "",
      githubIssues: [],
      loadingIssues: false
    }
  },
  computed: {
    micronationsModerationDirectory() {
      return this.githubIssues
        .map(issue => convertIssueToEntry(issue))
        .filter(entry => entry && entry.entryType === 'micronation' && !entry.approved)
        .map(entry => {
          const { issueBody, ...rest } = entry;
          return rest;
        });
    },
    organizationsModerationDirectory() {
      return this.githubIssues
        .map(issue => convertIssueToEntry(issue))
        .filter(entry => entry && entry.entryType === 'organization' && !entry.approved)
        .map(entry => {
          const { issueBody, ...rest } = entry;
          return rest;
        });
    },
  },
  methods: {
    handleEntryClick(item, type) {
      // Find the full entry data with issueBody from the original issues
      const fullEntry = this.githubIssues
        .map(issue => convertIssueToEntry(issue))
        .find(entry => entry && entry.id === item.id);
      
      if (fullEntry) {
        this.selectedEntry = fullEntry;
        this.selectedEntryName = item.name.main;
        this.selectedEntryAuthor = item.author.email;
        this.selectedEntryType = type;
      }
    },
    async fetchPendingIssues() {
      this.loadingIssues = true;
      try {
        const issues = await fetchGitHubIssues(['new-entry', 'review-required']);
        this.githubIssues = issues;
        this.forceRerender();
      } catch (error) {
        console.error('Error fetching GitHub issues:', error);
        notify({
          title: 'Error loading pending entries',
          text: 'Failed to fetch pending entries from GitHub issues.',
          type: 'error'
        });
      } finally {
        this.loadingIssues = false;
      }
    },
    async entryReject(entry) {
      const that = this;

      try {
        // Add rejection comment to the GitHub issue
        const comment = `**Entry Rejected**\n\n${that.rejectionReason ? `Reason: ${that.rejectionReason}` : 'No reason provided.'}\n\nThe entry was rejected by a moderator.`;
        await addIssueComment(entry.issueNumber, comment);

        // Add 'rejected' label and close the issue
        await addIssueLabel(entry.issueNumber, 'rejected');
        await closeIssue(entry.issueNumber);

        // Send email notification if author is not a moderator
        if (!this.moderatorsList.includes(that.selectedEntryAuthor)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            entry_decision: 'reject',
            entry_decisiond: 'rejected',
            to_name: entry.author.name,
            to_email: that.selectedEntryAuthor,
            entry_name: that.selectedEntryName,
            rejection_reason: that.rejectionReason
          },
            "P8-p_r-gTZedo_h84");
        }

        // Remove from local list
        this.githubIssues = this.githubIssues.filter(issue => issue.id !== entry.id);
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.selectedEntryType = undefined;
        this.rejectionReason = '';

        notify({
          title: 'Entry moderation',
          text: 'The entry was rejected and the GitHub issue was closed.',
          type: 'warning'
        })
      } catch (error) {
        console.error('Error rejecting entry:', error);
        notify({
          title: 'Error while moderating entry',
          text: error.message || error,
          type: 'error'
        })
      }
    },
    async entryApprove(entry) {
      const that = this;

      try {
        // Determine entry type and file paths
        const isMicronation = this.selectedEntryType === 'Micronation';
        const jsonFilePath = isMicronation ? 'public/micronations.json' : 'public/organizations.json';
        const entryTypeName = isMicronation ? 'micronation' : 'organization';

        // Fetch the current JSON file
        const { content: currentData, sha: currentSha } = await fetchRepoFile(jsonFilePath);

        // Handle image file if present in the issue
        let base64Image = null;
        let fileMetadata = null;
        if (entry.issueBody) {
          base64Image = extractBase64Image(entry.issueBody);
          fileMetadata = extractFileMetadata(entry.issueBody);
        }

        // Prepare the entry data for the JSON file
        const entryForJson = { ...entry };
        delete entryForJson.id;
        delete entryForJson.issueNumber;
        delete entryForJson.githubUrl;
        delete entryForJson.issueBody;
        delete entryForJson.entryType;
        delete entryForJson.searchDisplay;
        delete entryForJson.filterDisplay;
        entryForJson.approved = true;

        // Restore the original flag/logo path (not the data URL) for JSON file
        if (fileMetadata) {
          if (isMicronation) {
            entryForJson.flag = fileMetadata.path;
          } else {
            entryForJson.logo = fileMetadata.path;
          }
        }

        // Add entry to the JSON array
        currentData.push(entryForJson);

        // Update the JSON file
        await updateRepoFile(
          jsonFilePath,
          JSON.stringify(currentData, null, 2),
          currentSha,
          `Add approved ${entryTypeName}: ${entry.name.main}`
        );

        // Upload image file if present
        if (base64Image && fileMetadata) {
          try {
            await createRepoFile(
              fileMetadata.path,
              base64Image,
              `Add ${entryTypeName} image: ${fileMetadata.name}`
            );
          } catch (imageError) {
            console.error('Error creating image file:', imageError);
            // Continue with the approval even if image fails
          }
        }

        // Add approval comment to the GitHub issue
        const comment = `**Entry Approved**\n\n${that.rejectionReason ? `Note: ${that.rejectionReason}` : ''}\n\nThe entry has been approved and automatically added to ${jsonFilePath}.`;
        await addIssueComment(entry.issueNumber, comment);

        // Add 'approved' label to the issue
        await addIssueLabel(entry.issueNumber, 'approved');

        // Close the issue
        await closeIssue(entry.issueNumber);

        // Send email notification if author is not a moderator
        if (!this.moderatorsList.includes(that.selectedEntryAuthor)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            entry_decision: 'approve',
            entry_decisiond: 'approved',
            to_name: entry.author.name,
            to_email: that.selectedEntryAuthor,
            entry_name: that.selectedEntryName,
            rejection_reason: that.rejectionReason
          },
            "P8-p_r-gTZedo_h84");
        }

        // Remove from local list
        this.githubIssues = this.githubIssues.filter(issue => issue.id !== entry.id);
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.selectedEntryType = undefined;
        this.rejectionReason = '';

        notify({
          title: 'Entry moderation',
          text: 'The entry was approved, added to the JSON file, and the GitHub issue was closed.',
          type: 'success'
        })
      } catch (error) {
        console.error('Error approving entry:', error);
        notify({
          title: 'Error while moderating entry',
          text: error.message || error,
          type: 'error'
        })
      }
    },
    changeModerationViewMode(newValue) {
      this.moderationViewMode = newValue;
    },
    forceRerender() {
      this.componentKey += 1;
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    }
  },
  mounted() {
    // Fetch pending GitHub issues when component loads
    this.fetchPendingIssues();
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
  background-color: var(--failure-tone);
}

#entryApprove {
  background-color: var(--success-tone);
}

.loading-message {
  padding: 20px;
  text-align: center;
  color: var(--text-color);
  font-size: 16px;
}
</style>
