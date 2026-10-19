<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import OrganizationEntry from '../components/OrganizationEntry.vue';
import ModerationToolWorkspace from '../components/ModerationToolWorkspace.vue';
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
  <section class="site-section site-section--flush site-section--flat-top">
    <ModerationToolWorkspace v-if="userIsModerator">
      <template #description>
        <p class="workspace-description">Review unpublished entries submitted by users. Approve entries that meet the requirements to publish them in the directory, or reject them. Authors are notified by email after each decision.</p>
      </template>
      <template #summary>
        <strong>{{ micronationsModerationDirectory.length + organizationsModerationDirectory.length }}</strong>
        <span class="summary-label">entries waiting for review</span>
        <span v-if="loadingIssues" class="summary-status">Refreshing…</span>
      </template>

      <template #main>
        <div id="moderationMicronationsContainer">
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
      </template>

      <template #support>
        <div class="moderation-buttons">
          <header class="selection-header" :class="{ 'is-empty': !selectedEntry }">
            <div class="selection-header-topline">
              <span class="selection-kicker">Submission review</span>
              <span class="selection-status">{{ selectedEntry ? 'Pending' : 'Select an entry' }}</span>
            </div>
            <h3 class="selected-entry-name">{{ selectedEntryName }}</h3>
            <div class="selection-meta">
              <div class="selection-meta-item">
                <span>Type</span>
                <strong>{{ selectedEntryType || '—' }}</strong>
              </div>
              <div class="selection-meta-item">
                <span>Author</span>
                <strong>{{ selectedEntryAuthor || '—' }}</strong>
              </div>
            </div>
          </header>

          <div class="moderation-actions">
            <textarea class="login-input" v-model="rejectionReason" rows="6"
              placeholder="Additional message for rejection/approval"></textarea>
            <button id="entryReject" class="login-button color-transition" :disabled="selectedEntry === undefined || moderationAction !== null"
              @click="entryReject(selectedEntry)">
              <span v-if="moderationAction === 'reject'" class="action-spinner" aria-hidden="true"></span>
              {{ moderationAction === 'reject' ? 'Rejecting…' : 'Reject' }}
            </button>
            <button id="entryApprove" class="login-button color-transition" :disabled="selectedEntry === undefined || moderationAction !== null"
              @click="entryApprove(selectedEntry)">
              <span v-if="moderationAction === 'approve'" class="action-spinner" aria-hidden="true"></span>
              {{ moderationAction === 'approve' ? 'Approving…' : 'Approve' }}
            </button>
          </div>
        </div>
      </template>
    </ModerationToolWorkspace>
    <div id="notEnoughPrivileges" v-if="!userIsModerator" v-show="micronationsDirectory.length !== 0">
      You don't have sufficient privileges in order to moderate pending submissions.
    </div>
  </section>
</template>

<script>
export default {
  components: {
    OrganizationEntry,
    DirectoryEntry
  },
  data() {
    return {
      componentKey: 0,
      entryWidth: 180,
      fixedHeight: false,
      selectedEntry: undefined,
      selectedEntryName: 'None selected',
      selectedEntryAuthor: '',
      selectedEntryType: undefined,
      rejectionReason: "",
      moderationAction: null,
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
    async sendDecisionEmail(entry, decision) {
      const authorEmail = entry.author?.email;
      if (!authorEmail) {
        console.warn('Skipping moderation email because the entry has no author email.', entry.id);
        return;
      }
      if (this.moderatorsList.some(moderatorEmail => moderatorEmail.toLowerCase() === authorEmail.toLowerCase())) {
        return;
      }

      try {
        await emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
          entry_decision: decision,
          entry_decisiond: decision === 'approve' ? 'approved' : 'rejected',
          to_name: entry.author?.name || '',
          to_email: authorEmail,
          entry_name: entry.name?.main || this.selectedEntryName,
          rejection_reason: this.rejectionReason
        }, "P8-p_r-gTZedo_h84");
      } catch (error) {
        // The moderation decision is already recorded; a mail failure must not undo it.
        console.error('Error sending moderation decision email:', error);
        notify({
          title: 'Moderation email failed',
          text: `The entry was ${decision === 'approve' ? 'approved' : 'rejected'}, but the author notification could not be sent.`,
          type: 'error'
        });
      }
    },
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
      if (!entry || this.moderationAction || !window.confirm(`Reject “${entry.name?.main || this.selectedEntryName}”? This will close the submission.`)) {
        return;
      }

      this.moderationAction = 'reject';
      const that = this;

      try {
        // Add rejection comment to the GitHub issue
        const comment = `**Entry Rejected**\n\n${that.rejectionReason ? `Reason: ${that.rejectionReason}` : 'No reason provided.'}\n\nThe entry was rejected by a moderator.`;
        await addIssueComment(entry.issueNumber, comment);

        // Add 'rejected' label and close the issue
        await addIssueLabel(entry.issueNumber, 'rejected');
        await closeIssue(entry.issueNumber);

        await this.sendDecisionEmail(entry, 'reject');

        // Remove from local list
        this.githubIssues = this.githubIssues.filter(issue => issue.id !== entry.id);
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.selectedEntryAuthor = '';
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
      } finally {
        this.moderationAction = null;
      }
    },
    async entryApprove(entry) {
      if (!entry || this.moderationAction || !window.confirm(`Approve “${entry.name?.main || this.selectedEntryName}”? This will publish it to the directory.`)) {
        return;
      }

      this.moderationAction = 'approve';
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

        await this.sendDecisionEmail(entry, 'approve');

        // Remove from local list
        this.githubIssues = this.githubIssues.filter(issue => issue.id !== entry.id);
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.selectedEntryAuthor = '';
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
      } finally {
        this.moderationAction = null;
      }
    },
    forceRerender() {
      this.componentKey += 1;
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    }
  },
  mounted() {
    this.fetchPendingIssues();
  }
}
</script>

<style scoped>
#moderationTitle {
  font-size: 20px;
  font-weight: bold;
  width: 100%;
}

#moderationMicronationsContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  padding: 4px;
}

#moderationMicronations {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
}

.moderation-buttons {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 0;
  background: transparent;
  border: 0;
  min-height: fit-content;
  height: auto;
  width: 100%;
}

.selection-header,
.moderation-actions {
  width: 100%;
  box-sizing: border-box;
}

.selection-header {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg,
      color-mix(in srgb, var(--color-accent) 9%, var(--color-surface)),
      var(--color-surface) 72%);
}

.selection-header-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.selection-kicker {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.selection-status {
  padding: 4px 9px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 22%, var(--color-border));
  border-radius: var(--radius-full);
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 9%, var(--color-surface));
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.selection-header.is-empty .selection-status {
  color: var(--color-muted);
  background: var(--color-background-soft);
  border-color: var(--color-border);
}

.moderation-buttons .selected-entry-name {
  margin: 0 0 14px;
  color: var(--color-heading);
  font-size: 20px;
  font-weight: 750;
  line-height: 1.25;
  text-align: left;
  overflow-wrap: anywhere;
}

.selection-meta {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.selection-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface) 85%, transparent);
}

.selection-meta-item span {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.selection-meta-item strong {
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.moderation-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.moderation-buttons .moderation-actions .login-input {
  width: 100%;
  box-sizing: border-box;
  max-width: none;
  min-height: 170px;
  margin: 0;
  resize: none;
}

#notEnoughPrivileges {
  margin: 20px;
}

.moderation-buttons .login-button {
  width: 100%;
  margin: 0;
}

.moderation-buttons .login-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.action-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 8px;
  vertical-align: -2px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: moderation-spinner 0.7s linear infinite;
}

@keyframes moderation-spinner {
  to { transform: rotate(360deg); }
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

.summary-label {
  margin-left: 8px;
}

.summary-status {
  margin-left: auto;
  color: var(--color-muted);
  font-size: 13px;
}

@media (max-width: 520px) {
  .selection-meta {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
