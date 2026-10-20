<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue'
import OrganizationEntry from '../components/OrganizationEntry.vue'
import NewEntryForm from '../components/NewEntryForm.vue'
import ModerationToolWorkspace from '../components/ModerationToolWorkspace.vue'
import store from '../store'
import { notify } from '@kyvg/vue3-notification'
import emailjs from 'emailjs-com'
import {
  fetchGitHubIssues,
  convertIssueToEntry,
  parseIssueBody,
  addIssueLabel,
  closeIssue,
  addIssueComment,
  fetchRepoFile,
  updateRepoFile,
  updateGitHubIssueEntry,
  createRepoFile,
  extractBase64Image,
  extractFileMetadata,
  stableStringify
} from '../utils/githubFunctions.js'

defineProps({
  micronationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
  },
  supranationalMicronations: {
    type: Array,
    required: false,
    default: store.getters.micronations.filter((element) => element.supranational)
  },
  organizationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.organizations
  },
  visibleOrganizations: {
    type: Array,
    required: false,
    default: store.getters.organizations.filter(
      (element) => element.approved && element.searchDisplay && element.filterDisplay
    )
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
})
</script>

<template>
  <section class="site-section site-section--flush site-section--flat-top">
    <ModerationToolWorkspace v-if="userIsModerator">
      <template #description>
        <p class="workspace-description">
          Review unpublished entries submitted by users. Approve entries that meet the requirements
          to publish them in the directory, or reject them. Authors are notified by email after each
          decision.
        </p>
      </template>
      <template #summary>
        <strong>{{
          micronationsModerationDirectory.length + organizationsModerationDirectory.length
        }}</strong>
        <span class="summary-label">entries waiting for review</span>
        <span v-if="loadingIssues" class="summary-status">Refreshing…</span>
      </template>

      <template #main>
        <div id="moderationMicronationsContainer">
          <div v-if="loadingIssues" class="loading-message">
            Loading pending entries from GitHub...
          </div>
          <div
            v-else-if="
              githubIssues.length === 0 ||
              (micronationsModerationDirectory.length === 0 &&
                organizationsModerationDirectory.length === 0)
            "
            class="loading-message"
          >
            No pending entries found.
          </div>
          <div
            v-else
            class="micronations-list"
            id="moderationMicronations"
            ref="micronationsListModeration"
            :key="componentKey"
            :class="{ 'fixed-height': fixedHeight }"
          >
            <DirectoryEntry
              v-for="item in micronationsModerationDirectory"
              :key="item.id"
              :width="entryWidth"
              :flag-height="entryWidth * 0.6"
              :view-mode="'micronations'"
              :micronations-directory="micronationsDirectory"
              :organizations-directory="organizationsDirectory"
              :visible-organizations="visibleOrganizations"
              :supranational-micronations="supranationalMicronations"
              :inline-profile-preview="true"
              :info="{
                id: item.id,
                name: item.name,
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
              @open-profile="openEntryProfile(item, 'Micronation')"
              @click="selectEntry(item, 'Micronation')"
            />
            <OrganizationEntry
              v-for="item in organizationsModerationDirectory"
              :key="item.id"
              :width="entryWidth"
              :flag-height="entryWidth * 0.6"
              :micronations-directory="micronationsDirectory"
              :inline-profile-preview="true"
              :info="{
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
              @open-profile="openEntryProfile(item, 'Organization')"
              @click="selectEntry(item, 'Organization')"
            />
          </div>
          <Teleport to="body">
            <div
              v-if="selectedProfileEntry"
              class="profile-preview-overlay"
              role="presentation"
              @click.self="closeSelectedPreview"
            >
              <section
                class="selected-entry-details"
                role="dialog"
                aria-modal="true"
                :aria-label="`Full profile for ${selectedProfileEntry.name.main}`"
              >
                <div class="details-heading">
                  <div>
                    <span>Submission #{{ selectedProfileEntry.issueNumber }}</span>
                    <h3>Full submission details</h3>
                  </div>
                  <div class="details-heading-actions">
                    <a
                      v-if="selectedProfileEntry.githubUrl"
                      :href="selectedProfileEntry.githubUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      >Open GitHub issue ↗</a
                    >
                    <button
                      type="button"
                      class="close-preview-button"
                      :disabled="savingProfile || profileImageProcessing"
                      @click="closeSelectedPreview"
                    >
                      <span aria-hidden="true">×</span> Close
                    </button>
                  </div>
                </div>
                <NewEntryForm
                  v-if="profileDraft && moderationFormDraft"
                  :key="selectedProfileEntry.issueNumber"
                  :entry-type="selectedProfileEntry.entryType"
                  :directory-data="
                    selectedProfileEntry.entryType === 'micronation'
                      ? micronationsDirectory
                      : organizationsDirectory
                  "
                  :form-placeholders="moderationFormDraft"
                  :initial-entry="profileDraft"
                  :initial-image-mode="profileImageMode"
                  :is-moderation-editor="true"
                  :saving="savingProfile"
                  :image-processing="profileImageProcessing"
                  @save-corrections="saveProfileEdits"
                  @edit-image-change="updateProfileImage"
                  @image-error="notifyProfileImageError"
                  @image-processing="profileImageProcessing = $event"
                />
              </section>
            </div>
          </Teleport>
        </div>
      </template>

      <template #support>
        <div class="moderation-buttons">
          <header class="selection-header" :class="{ 'is-empty': !selectedEntry }">
            <div class="selection-header-topline">
              <span class="selection-kicker">Submission review</span>
              <span class="selection-status">{{
                selectedEntry ? 'Pending' : 'Select an entry'
              }}</span>
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
              <div class="selection-meta-item selection-meta-item--date">
                <span>Created</span>
                <strong>{{ formatSubmissionDate(selectedEntry?.createdAt) || '—' }}</strong>
              </div>
              <div class="selection-meta-item">
                <span>Issue #</span>
                <strong>
                  <a
                    v-if="selectedEntry?.issueNumber && selectedEntry?.githubUrl"
                    :href="selectedEntry.githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    >#{{ selectedEntry.issueNumber }}</a
                  >
                  <template v-else>{{
                    selectedEntry?.issueNumber ? `#${selectedEntry.issueNumber}` : '—'
                  }}</template>
                </strong>
              </div>
            </div>
          </header>

          <div class="moderation-actions">
            <textarea
              class="login-input"
              v-model="rejectionReason"
              rows="6"
              placeholder="Additional message for rejection/approval"
            ></textarea>
            <button
              id="entryReject"
              class="login-button color-transition"
              :disabled="selectedEntry === undefined || moderationAction !== null"
              @click="entryReject(selectedEntry)"
            >
              <span
                v-if="moderationAction === 'reject'"
                class="action-spinner"
                aria-hidden="true"
              ></span>
              {{ moderationAction === 'reject' ? 'Rejecting…' : 'Reject' }}
            </button>
            <button
              id="entryApprove"
              class="login-button color-transition"
              :disabled="selectedEntry === undefined || moderationAction !== null"
              @click="entryApprove(selectedEntry)"
            >
              <span
                v-if="moderationAction === 'approve'"
                class="action-spinner"
                aria-hidden="true"
              ></span>
              {{ moderationAction === 'approve' ? 'Approving…' : 'Approve' }}
            </button>
          </div>
        </div>
      </template>
    </ModerationToolWorkspace>
    <div
      id="notEnoughPrivileges"
      v-if="!userIsModerator"
      v-show="micronationsDirectory.length !== 0"
    >
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
      selectedProfileEntry: undefined,
      savingProfile: false,
      profileDraft: null,
      moderationFormDraft: null,
      profileSubmissionDraft: null,
      profileImageMode: 'url',
      profileMediaDraft: null,
      profileImageProcessing: false,
      selectedEntryName: 'None selected',
      selectedEntryAuthor: '',
      selectedEntryType: undefined,
      rejectionReason: '',
      moderationAction: null,
      githubIssues: [],
      loadingIssues: false
    }
  },
  computed: {
    micronationsModerationDirectory() {
      return this.githubIssues
        .map((issue) => convertIssueToEntry(issue))
        .filter((entry) => entry && entry.entryType === 'micronation' && !entry.approved)
        .map((entry) => {
          const { issueBody, ...rest } = entry
          return rest
        })
    },
    organizationsModerationDirectory() {
      return this.githubIssues
        .map((issue) => convertIssueToEntry(issue))
        .filter((entry) => entry && entry.entryType === 'organization' && !entry.approved)
        .map((entry) => {
          const { issueBody, ...rest } = entry
          return rest
        })
    }
  },
  methods: {
    async sendDecisionEmail(entry, decision) {
      const authorEmail = entry.author?.email
      if (!authorEmail) {
        console.warn('Skipping moderation email because the entry has no author email.', entry.id)
        return
      }
      if (
        this.moderatorsList.some(
          (moderatorEmail) => moderatorEmail.toLowerCase() === authorEmail.toLowerCase()
        )
      ) {
        return
      }

      try {
        await emailjs.send(
          'service_gd9nz5x',
          'template_w1tt2h5',
          {
            entry_decision: decision,
            entry_decisiond: decision === 'approve' ? 'approved' : 'rejected',
            to_name: entry.author?.name || '',
            to_email: authorEmail,
            entry_name: entry.name?.main || this.selectedEntryName,
            rejection_reason: this.rejectionReason
          },
          'P8-p_r-gTZedo_h84'
        )
      } catch (error) {
        // The moderation decision is already recorded; a mail failure must not undo it.
        console.error('Error sending moderation decision email:', error)
        notify({
          title: 'Moderation email failed',
          text: `The entry was ${
            decision === 'approve' ? 'approved' : 'rejected'
          }, but the author notification could not be sent.`,
          type: 'error'
        })
      }
    },
    findFullIssueEntry(item) {
      // Find the full entry data with issueBody from the original issues
      return this.githubIssues
        .map((issue) => convertIssueToEntry(issue))
        .find((entry) => entry && entry.id === item.id)
    },
    selectEntry(item, type) {
      this.selectedEntry = this.findFullIssueEntry(item) || item
      this.selectedEntryName = item.name?.main || 'Selected entry'
      this.selectedEntryAuthor = item.author?.email || ''
      this.selectedEntryType = type
    },
    formatSubmissionDate(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date)
    },
    openEntryProfile(item, type) {
      this.selectEntry(item, type)
      this.selectedProfileEntry = this.selectedEntry
      this.profileDraft = JSON.parse(JSON.stringify(this.selectedEntry))
      this.profileDraft.name ||= { main: '', mainAlt: '', title: '', titleAlt: '' }
      this.profileDraft.motto ||= ''
      this.profileDraft.type ||= []
      this.profileDraft.languages ||= []
      this.profileDraft.memberships ||= []
      this.profileDraft.contactInfo ||= []
      this.profileDraft.websites ||= []
      this.moderationFormDraft = {
        newEntryName: this.profileDraft.name.main || '',
        newEntryNameAlt: this.profileDraft.name.mainAlt || '',
        newEntryAltNames:
          this.profileDraft.name.alt ||
          (this.profileDraft.name.mainAlt || this.profileDraft.name.titleAlt
            ? [
                {
                  main: this.profileDraft.name.mainAlt || '',
                  title: this.profileDraft.name.titleAlt || ''
                }
              ]
            : []),
        newEntryTitle: this.profileDraft.name.title || '',
        newEntryTitleAlt: this.profileDraft.name.titleAlt || '',
        newEntryTypePhysical: (this.profileDraft.type || []).includes('Physical'),
        newEntryTypeDigital: (this.profileDraft.type || []).includes('Digital'),
        newEntryTypeFictional: (this.profileDraft.type || []).includes('Fictional'),
        newEntryMotto: this.profileDraft.motto || '',
        newEntryCapital: this.profileDraft.capital || '',
        newEntryCurrency: this.profileDraft.currency || '',
        newEntryLanguages: [...this.profileDraft.languages],
        newEntryMemberships: [...this.profileDraft.memberships],
        newEntryEmails: [...this.profileDraft.contactInfo],
        newEntryWebsites: [...this.profileDraft.websites]
      }
      this.profileSubmissionDraft = parseIssueBody(this.selectedEntry?.issueBody)
      this.profileImageMode = extractFileMetadata(this.selectedEntry?.issueBody) ? 'file' : 'url'
      this.profileMediaDraft = null
    },
    closeSelectedPreview() {
      this.selectedProfileEntry = undefined
      this.profileDraft = null
      this.moderationFormDraft = null
      this.profileSubmissionDraft = null
      this.profileMediaDraft = null
    },
    async saveProfileEdits(formData) {
      if (!this.profileDraft || !formData || this.savingProfile || this.profileImageProcessing)
        return
      if (!formData.name?.main?.trim()) {
        notify({
          title: 'Cannot save entry',
          text: 'The official name is required.',
          type: 'error'
        })
        return
      }

      this.savingProfile = true
      try {
        if (!this.profileSubmissionDraft) {
          throw new Error('The original submission data could not be loaded from the issue.')
        }
        const updatedData = JSON.parse(JSON.stringify(this.profileSubmissionDraft))
        Object.assign(updatedData, formData)
        const imageField = this.selectedProfileEntry.entryType === 'micronation' ? 'flag' : 'logo'
        if (this.profileMediaDraft?.mode === 'upload') {
          updatedData[imageField] = this.profileMediaDraft.path
        } else if (this.profileMediaDraft?.mode === 'url') {
          updatedData[imageField] = this.profileMediaDraft.url
        }

        const entryType = this.selectedProfileEntry.entryType
        const updatedIssue = await updateGitHubIssueEntry(
          this.selectedProfileEntry.issueNumber,
          this.selectedProfileEntry.issueBody,
          updatedData,
          entryType,
          this.profileMediaDraft
        )
        this.githubIssues = this.githubIssues.map((issue) =>
          issue.number === updatedIssue.number ? updatedIssue : issue
        )
        const updatedEntry = convertIssueToEntry(updatedIssue)
        this.selectedEntry = updatedEntry
        this.selectedProfileEntry = updatedEntry
        this.selectedEntryName = updatedEntry.name.main
        this.profileDraft = JSON.parse(JSON.stringify(updatedEntry))
        this.profileSubmissionDraft = parseIssueBody(updatedIssue.body)
        this.profileImageMode = extractFileMetadata(updatedIssue.body) ? 'file' : 'url'
        this.profileMediaDraft = null
        notify({
          title: 'Entry updated',
          text: 'The submission and its GitHub issue were updated.',
          type: 'success'
        })
      } catch (error) {
        notify({
          title: 'Could not update entry',
          text: error.message || String(error),
          type: 'error'
        })
      } finally {
        this.savingProfile = false
      }
    },
    updateProfileImage(change) {
      this.profileMediaDraft = change
    },
    notifyProfileImageError(message) {
      notify({ title: 'Could not process image', text: message, type: 'error' })
    },
    async fetchPendingIssues() {
      this.loadingIssues = true
      try {
        const issues = await fetchGitHubIssues(['new-entry', 'review-required'])
        this.githubIssues = issues
        this.forceRerender()
      } catch (error) {
        console.error('Error fetching GitHub issues:', error)
        notify({
          title: 'Error loading pending entries',
          text: 'Failed to fetch pending entries from GitHub issues.',
          type: 'error'
        })
      } finally {
        this.loadingIssues = false
      }
    },
    async entryReject(entry) {
      if (
        !entry ||
        this.moderationAction ||
        !window.confirm(
          `Reject “${entry.name?.main || this.selectedEntryName}”? This will close the submission.`
        )
      ) {
        return
      }

      this.moderationAction = 'reject'
      const that = this

      try {
        // Add rejection comment to the GitHub issue
        const comment = `**Entry Rejected**\n\n${
          that.rejectionReason ? `Reason: ${that.rejectionReason}` : 'No reason provided.'
        }\n\nThe entry was rejected by a moderator.`
        await addIssueComment(entry.issueNumber, comment)

        // Add 'rejected' label and close the issue
        await addIssueLabel(entry.issueNumber, 'rejected')
        await closeIssue(entry.issueNumber)

        await this.sendDecisionEmail(entry, 'reject')

        // Remove from local list
        this.githubIssues = this.githubIssues.filter((issue) => issue.id !== entry.id)
        this.forceRerender()
        this.selectedEntry = undefined
        this.selectedProfileEntry = undefined
        this.selectedEntryName = 'None selected'
        this.selectedEntryAuthor = ''
        this.selectedEntryType = undefined
        this.rejectionReason = ''

        notify({
          title: 'Entry moderation',
          text: 'The entry was rejected and the GitHub issue was closed.',
          type: 'warning'
        })
      } catch (error) {
        console.error('Error rejecting entry:', error)
        notify({
          title: 'Error while moderating entry',
          text: error.message || error,
          type: 'error'
        })
      } finally {
        this.moderationAction = null
      }
    },
    async entryApprove(entry) {
      if (
        !entry ||
        this.moderationAction ||
        !window.confirm(
          `Approve “${
            entry.name?.main || this.selectedEntryName
          }”? This will publish it to the directory.`
        )
      ) {
        return
      }

      this.moderationAction = 'approve'
      const that = this

      try {
        // Determine entry type and file paths
        const isMicronation = this.selectedEntryType === 'Micronation'
        const jsonFilePath = isMicronation
          ? 'public/micronations.json'
          : 'public/organizations.json'
        const entryTypeName = isMicronation ? 'micronation' : 'organization'

        // Fetch the current JSON file
        const { content: currentData, sha: currentSha } = await fetchRepoFile(jsonFilePath)

        // Handle image file if present in the issue
        let base64Image = null
        let fileMetadata = null
        if (entry.issueBody) {
          base64Image = extractBase64Image(entry.issueBody)
          fileMetadata = extractFileMetadata(entry.issueBody)
        }

        // Prepare the entry data for the JSON file
        const entryForJson = { ...entry }
        delete entryForJson.id
        delete entryForJson.issueNumber
        delete entryForJson.githubUrl
        delete entryForJson.issueBody
        delete entryForJson.entryType
        delete entryForJson.searchDisplay
        delete entryForJson.filterDisplay
        entryForJson.approved = true

        // Restore the original flag/logo path (not the data URL) for JSON file
        if (fileMetadata) {
          if (isMicronation) {
            entryForJson.flag = fileMetadata.path
          } else {
            entryForJson.logo = fileMetadata.path
          }
        }

        // Match the JSON representation GitHub will store, excluding undefined fields.
        const persistedEntry = JSON.parse(JSON.stringify(entryForJson))
        const entrySignature = stableStringify(persistedEntry)
        // Keep approval retries idempotent: replace exact copies of this entry
        // instead of publishing another duplicate.
        const updatedData = currentData.filter((item) => stableStringify(item) !== entrySignature)
        updatedData.push(persistedEntry)

        // Update the JSON file
        await updateRepoFile(
          jsonFilePath,
          JSON.stringify(updatedData, null, 2),
          currentSha,
          `Add approved ${entryTypeName}: ${entry.name.main}`
        )

        // Upload image file if present
        if (base64Image && fileMetadata) {
          try {
            await createRepoFile(
              fileMetadata.path,
              base64Image,
              `Add ${entryTypeName} image: ${fileMetadata.name}`
            )
          } catch (imageError) {
            console.error('Error creating image file:', imageError)
            // Continue with the approval even if image fails
          }
        }

        // Add approval comment to the GitHub issue
        const comment = `**Entry Approved**\n\n${
          that.rejectionReason ? `Note: ${that.rejectionReason}` : ''
        }\n\nThe entry has been approved and automatically added to ${jsonFilePath}.`
        await addIssueComment(entry.issueNumber, comment)

        // Close before adding the label so the label-triggered GitHub Action
        // (which handles manual approvals on open issues) does not add it again.
        await closeIssue(entry.issueNumber)
        await addIssueLabel(entry.issueNumber, 'approved')

        await this.sendDecisionEmail(entry, 'approve')

        // Remove from local list
        this.githubIssues = this.githubIssues.filter((issue) => issue.id !== entry.id)
        this.forceRerender()
        this.selectedEntry = undefined
        this.selectedProfileEntry = undefined
        this.selectedEntryName = 'None selected'
        this.selectedEntryAuthor = ''
        this.selectedEntryType = undefined
        this.rejectionReason = ''

        notify({
          title: 'Entry moderation',
          text: 'The entry was approved, added to the JSON file, and the GitHub issue was closed.',
          type: 'success'
        })
      } catch (error) {
        console.error('Error approving entry:', error)
        notify({
          title: 'Error while moderating entry',
          text: error.message || error,
          type: 'error'
        })
      } finally {
        this.moderationAction = null
      }
    },
    forceRerender() {
      this.componentKey += 1
    },
    scrollToTop() {
      window.scrollTo(0, 0)
    }
  },
  mounted() {
    this.fetchPendingIssues()
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
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-accent) 9%, var(--color-surface)),
    var(--color-surface) 72%
  );
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
  text-align: center;
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

.profile-preview-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(10 15 25 / 68%);
}

.selected-entry-details {
  width: min(1100px, 100%);
  max-height: min(90vh, 100%);
  overflow: auto;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.details-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.details-heading span {
  color: var(--color-muted);
  font-size: 12px;
}

.details-heading h3 {
  margin: 2px 0 0;
  color: var(--color-heading);
}

.details-heading a {
  color: var(--color-accent);
  font-weight: 650;
}

.details-heading-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.close-preview-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-muted);
  background: var(--color-surface);
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.close-preview-button:hover {
  color: var(--color-heading);
  border-color: var(--color-accent);
  background: var(--color-surface-raised);
}

.close-preview-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.save-entry-button {
  color: white;
  border-color: var(--success-tone);
  background: var(--success-tone);
}

.close-preview-button span {
  font-size: 19px;
  font-weight: 400;
  line-height: 1;
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
  to {
    transform: rotate(360deg);
  }
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
