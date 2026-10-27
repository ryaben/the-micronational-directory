<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue'
import OrganizationEntry from '../components/OrganizationEntry.vue'
import NewEntryForm from '../components/NewEntryForm.vue'
import ModerationToolWorkspace from '../components/ModerationToolWorkspace.vue'
import store from '../store'
import { useDirectoryData } from '../composables/useDirectoryData.js'
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
  importExternalImage,
  extractBase64Image,
  extractFileMetadata,
  getPublicAssetPath,
  stableStringify
} from '../utils/githubFunctions.js'

const { micronationsDirectory, supranationalMicronations, organizationsDirectory, visibleOrganizations, userIsModerator } = useDirectoryData()
const findPublishedEntry = (entry) => {
  if (!entry?.isEdit) return null
  const directory = entry.entryType === 'micronation' ? micronationsDirectory.value : organizationsDirectory.value
  const targetId = entry.editTargetId || entry.directoryEntryId
  if (targetId == null) return null
  return directory.find((published) => String(published.id) === String(targetId)) || null
}
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
            :class="{ 'fixed-height': fixedHeight, 'moderation-action-running': moderationAction }"
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
              :moderation-label="item.isEdit ? 'Edit' : 'New'"
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
              :moderation-label="item.isEdit ? 'Edit' : 'New'"
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
                    <h3>{{ selectedProfileEntry.isEdit ? 'Proposed profile edits' : 'Full submission details' }}</h3>
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
                <p v-if="selectedProfileEntry.isEdit" class="edit-difference-legend">
                  <span class="edit-difference-legend-highlight">Highlighted fields</span>
                  differ from the published version.
                </p>
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
                  :published-entry="findPublishedEntry(selectedProfileEntry)"
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
              <div class="selection-label-group">
                <span class="selection-kicker">Submission review</span>
                <span v-if="selectedEntry" class="selection-kind" :class="selectedEntry.isEdit ? 'is-edit' : 'is-new'">
                  {{ selectedEntry.isEdit ? 'Edit' : 'New' }}
                </span>
              </div>
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

          <section v-if="selectedEntry" class="ai-review-card" aria-labelledby="ai-review-title">
            <div class="ai-review-heading">
              <h4 id="ai-review-title">AI preliminary review</h4>
              <span>Not a final decision</span>
            </div>
            <template v-if="selectedEntry.aiReview">
              <p v-if="selectedEntry.aiReview.summary" class="ai-review-summary">
                {{ selectedEntry.aiReview.summary }}
              </p>
              <ul v-if="selectedEntry.aiReview.checks?.length" class="ai-review-checks">
                <li
                  v-for="(check, index) in selectedEntry.aiReview.checks"
                  :key="`${check.criterion}-${index}`"
                  :class="`is-${check.status || 'uncertain'}`"
                >
                  <details class="ai-review-check">
                    <summary>
                      <span class="ai-review-indicator" :class="`is-${check.status || 'uncertain'}`" aria-hidden="true">
                        {{ check.status === 'pass' ? '✓' : check.status === 'fail' ? '×' : '?' }}
                      </span>
                      <span class="ai-review-status" :class="`is-${check.status || 'uncertain'}`">
                        {{ check.status || 'uncertain' }}
                      </span>
                      <strong>{{ check.criterion }}</strong>
                    </summary>
                    <p v-if="check.reason" class="ai-review-reason">{{ check.reason }}</p>
                  </details>
                </li>
              </ul>
              <p class="ai-review-triage">
                Triage: <strong>{{ selectedEntry.aiReview.verdict || 'needs_review' }}</strong>
              </p>
            </template>
            <p v-else class="ai-review-summary">
              No AI analysis was included with this submission.
            </p>
          </section>

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
import { formatDate, dateFormats } from '../i18n.js'

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
    async firestoreStyleIdFromIssueNumber(issueNumber) {
      const namespace = '6ba7b8109dad11d180b400c04fd430c8'
      const namespaceBytes = new Uint8Array(
        namespace.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16))
      )
      const issueBytes = new TextEncoder().encode(`tmd-entry:${issueNumber}`)
      const input = new Uint8Array(namespaceBytes.length + issueBytes.length)
      input.set(namespaceBytes)
      input.set(issueBytes, namespaceBytes.length)
      const digest = new Uint8Array(await crypto.subtle.digest('SHA-1', input))
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      return Array.from(digest, (byte) => alphabet[byte % 62]).join('')
    },
    async sendDecisionEmail(entry, decision) {
      const authorEmail = entry.author?.email
      if (!authorEmail) {
        console.warn('Skipping moderation email because the entry has no author email.', entry.id)
        return
      }
      if (
        store.getters.moderators.some(
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
      if (this.moderationAction) return
      this.selectedEntry = this.findFullIssueEntry(item) || item
      this.selectedEntryName = item.name?.main || 'Selected entry'
      this.selectedEntryAuthor = item.author?.email || ''
      this.selectedEntryType = type
    },
    formatSubmissionDate(value) {
      return value ? formatDate(value, dateFormats.compact) : ''
    },
    openEntryProfile(item, type) {
      if (this.moderationAction) return
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
        const issues = await fetchGitHubIssues(['new-entry', 'edit-entry', 'review-required'])
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
      const isMicronation = entry.entryType
        ? entry.entryType === 'micronation'
        : this.selectedEntryType === 'Micronation'

      try {
        // Determine entry type and file paths
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
        entryForJson.id =
          entry.directoryEntryId ||
          entry.directoryId ||
          (await this.firestoreStyleIdFromIssueNumber(entry.issueNumber || entry.id))
        delete entryForJson.directoryEntryId
        delete entryForJson.directoryId
        delete entryForJson.editTargetId
        delete entryForJson.issueNumber
        delete entryForJson.githubUrl
        delete entryForJson.issueBody
        delete entryForJson.entryType
        // AI triage belongs to the GitHub review issue, not the public directory data.
        delete entryForJson.aiReview
        delete entryForJson.searchDisplay
        delete entryForJson.filterDisplay
        if (isMicronation && entryForJson.location) {
          const latitude = Number(entryForJson.location.latitude)
          const longitude = Number(entryForJson.location.longitude)
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            entryForJson.location = { latitude, longitude }
          }
        }
        entryForJson.approved = true
        const submittedAt = entry.createdAt ? new Date(entry.createdAt) : new Date()
        if (Number.isFinite(submittedAt.getTime())) {
          entryForJson.creationDate = { _seconds: Math.floor(submittedAt.getTime() / 1000) }
        }

        // Restore the original flag/logo path (not the data URL) for JSON file
        if (fileMetadata) {
          if (!base64Image) throw new Error('The issue includes an image path but no image data. Edit the image before approving this entry.')
          if (isMicronation) {
            entryForJson.flag = getPublicAssetPath(fileMetadata.path)
          } else {
            entryForJson.logo = getPublicAssetPath(fileMetadata.path)
          }
        }

        const imageField = isMicronation ? 'flag' : 'logo'
        const imageValue = String(entryForJson[imageField] || '').trim()
        if (!fileMetadata && /^https?:\/\//i.test(imageValue)) {
          const imported = await importExternalImage(imageValue, entryTypeName, entry.name.main)
          entryForJson[imageField] = getPublicAssetPath(imported.path)
        }

        // Match the JSON representation GitHub will store, excluding undefined fields.
        const persistedEntry = JSON.parse(JSON.stringify(entryForJson))
        const entrySignature = stableStringify(persistedEntry)
        // Keep approval retries idempotent: replace exact copies of this entry
        // instead of publishing another duplicate.
        let updatedData
        if (entry.isEdit) {
          const targetId = entry.editTargetId || entry.directoryEntryId
          const targetIndex = currentData.findIndex((item) => String(item.id) === String(targetId))
          if (targetIndex < 0) throw new Error(`The directory entry ${targetId} no longer exists.`)
          const publishedEntry = currentData[targetIndex]
          persistedEntry.id = publishedEntry.id
          persistedEntry.creationDate = publishedEntry.creationDate || persistedEntry.creationDate
          persistedEntry.author = publishedEntry.author || persistedEntry.author
          updatedData = [...currentData]
          updatedData[targetIndex] = { ...currentData[targetIndex], ...persistedEntry }
        } else {
          updatedData = currentData.filter((item) => stableStringify(item) !== entrySignature)
          updatedData.push(persistedEntry)
        }

        // Publish the media before adding a JSON reference to it. If GitHub
        // rejects the upload (for example, during a burst of approvals), stop
        // here so the directory never publishes an entry with a missing image.
        if (base64Image && fileMetadata) {
          await createRepoFile(
            fileMetadata.path,
            base64Image,
            `Add ${entryTypeName} image: ${fileMetadata.name}`
          )
        }

        // Commit the directory reference only after its image is available.
        await updateRepoFile(
          jsonFilePath,
          JSON.stringify(updatedData, null, 2),
          currentSha,
          `${entry.isEdit ? 'Edit approved' : 'Add approved'} ${entryTypeName}: ${entry.name.main}`
        )

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

#moderationMicronations.moderation-action-running {
  pointer-events: none;
  cursor: wait;
  opacity: 0.5;
  filter: grayscale(0.75);
  transition:
    opacity 160ms ease,
    filter 160ms ease;
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

.selection-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-kind {
  padding: 3px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-heading);
  background: var(--color-background-soft);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.selection-kind.is-edit {
  border-color: color-mix(in srgb, #a15ac4 35%, var(--color-border));
  color: color-mix(in srgb, #a15ac4 82%, var(--color-heading));
  background: color-mix(in srgb, #a15ac4 9%, var(--color-surface));
}

.selection-kicker {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;
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

.ai-review-card {
  margin-top: 14px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.5;
}

.ai-review-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px 12px;
}

.ai-review-heading h4 {
  margin: 0;
  color: var(--color-heading);
  font-size: 14px;
}

.ai-review-heading > span,
.ai-review-triage {
  color: var(--color-muted);
  font-size: 12px;
}

.ai-review-summary {
  margin: 8px 0;
}

.ai-review-checks {
  display: grid;
  gap: 4px;
  list-style: none;
  margin: 10px 0;
  padding: 0;
}

.ai-review-checks li {
  min-width: 0;
}

.ai-review-check {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface) 72%, transparent);
  transition:
    border-color var(--transition-base) ease,
    background-color var(--transition-base) ease;
}

.ai-review-check[open] {
  border-color: color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
  background: var(--color-surface);
}

.ai-review-check summary {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 5px 10px;
  color: var(--color-heading);
  cursor: pointer;
  list-style: none;
  transition: background-color var(--transition-base) ease;
}

.ai-review-check summary::-webkit-details-marker {
  display: none;
}

.ai-review-check summary:hover {
  background: var(--navbar-tab-background-color-hover);
}

.ai-review-check summary::after {
  width: 8px;
  height: 8px;
  margin-left: auto;
  border-right: 2px solid var(--color-muted);
  border-bottom: 2px solid var(--color-muted);
  content: '';
  flex: 0 0 8px;
  transform: rotate(-45deg);
  transition: transform var(--transition-base) ease, border-color var(--transition-base) ease;
}

.ai-review-check[open] summary::after {
  border-color: var(--color-accent);
  transform: rotate(45deg);
}

.ai-review-check summary:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  outline-offset: 1px;
}

.ai-review-indicator {
  display: inline-flex;
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.ai-review-indicator.is-pass {
  color: var(--success-tone);
}

.ai-review-indicator.is-uncertain {
  color: var(--color-muted);
}

.ai-review-indicator.is-fail {
  color: var(--failure-tone);
}

.ai-review-status {
  display: inline-block;
  margin-right: 5px;
  font-weight: 750;
  text-transform: capitalize;
}

.ai-review-status.is-pass {
  color: var(--success-tone);
  background: color-mix(in srgb, var(--success-tone) 10%, var(--color-surface));
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}
.ai-review-status.is-fail {
  color: var(--failure-tone);
  background: color-mix(in srgb, var(--failure-tone) 10%, var(--color-surface));
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}
.ai-review-status.is-uncertain {
  color: var(--color-muted);
  background: color-mix(in srgb, var(--color-muted) 10%, var(--color-surface));
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}

.ai-review-reason {
  margin: 0;
  padding: 2px 12px 11px 39px;
  color: var(--color-text);
  line-height: 1.55;
}

.ai-review-triage {
  margin: 10px 0 0;
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

.edit-difference-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: -2px 0 12px;
  color: var(--color-muted);
  font-size: 13px;
}

.edit-difference-legend-highlight {
  padding: 2px 6px;
  border: 1px solid rgb(245 200 74 / 35%);
  border-radius: 4px;
  background: rgb(245 200 74 / 14%);
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
  border-color: var(--failure-tone);
  color: #fff;
}

#entryApprove {
  background-color: var(--success-tone);
  border-color: var(--success-tone);
  color: #fff;
}

#entryReject:hover:not(:disabled),
#entryApprove:hover:not(:disabled) {
  filter: brightness(0.92);
  transform: translateY(-1px);
}

#entryReject:active:not(:disabled),
#entryApprove:active:not(:disabled) {
  transform: translateY(0);
}

#entryReject:focus-visible,
#entryApprove:focus-visible {
  outline: 3px solid color-mix(in srgb, currentColor 45%, transparent);
  outline-offset: 2px;
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
