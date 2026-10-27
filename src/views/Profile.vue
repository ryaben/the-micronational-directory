<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  signOut,
  updatePassword,
  linkWithCredential,
  linkWithPopup
} from 'firebase/auth'
import { notify } from '@kyvg/vue3-notification'
import { auth } from '../firebase/auth.js'
import router from '../router/index'
import DirectoryEntry from '../components/DirectoryEntry.vue'
import OrganizationEntry from '../components/OrganizationEntry.vue'
import Sectionbar from '../components/Sectionbar.vue'
import Settingsbar from '../components/Settingsbar.vue'
import PreferenceControls from '../components/PreferenceControls.vue'
import { useDirectoryData } from '../composables/useDirectoryData.js'
import { convertIssueToEntry, fetchGitHubIssues } from '../utils/githubFunctions.js'
import { language, setLanguage } from '../composables/userSettings.js'
import { formatDate, translate } from '../i18n.js'

defineProps({
  theme: { type: String, default: 'dark' },
})
const { micronationsDirectory, organizationsDirectory, moderatorsList, userIsModerator, user } = useDirectoryData()
const emit = defineEmits(['update:theme'])

const activeSection = ref('profile')
const profileSections = computed(() => [
  { text: translate('profile.accountData'), target: 'profile', display: true },
  { text: translate('profile.updatePassword'), target: 'password', display: true },
  { text: translate('profile.contributions'), target: 'contributions', display: true }
])
const currentUser = ref(auth.currentUser || user.value || {})
const pagedEntries = ref([])
const issueSubmissions = ref([])
const oldPassword = ref('')
const newPassword = ref('')
const repeatNewPassword = ref('')
const hasPasswordProvider = computed(
  () =>
    currentUser.value?.providerData?.some((provider) => provider.providerId === 'password') ?? false
)
const hasGoogleProvider = computed(
  () =>
    currentUser.value?.providerData?.some((provider) => provider.providerId === 'google.com') ??
    false
)

watch(
  user,
  (currentUserValue) => {
    if (currentUserValue?.email) currentUser.value = currentUserValue
  },
  { immediate: true }
)

const authoredEntries = computed(() => {
  const email = currentUser.value?.email?.toLowerCase()
  if (!email) return []
  const micronations = micronationsDirectory.value
    .filter((entry) => entry.author?.email?.toLowerCase() === email)
    .map((entry) => ({ ...entry, entryType: 'micronation' }))
  const organizations = organizationsDirectory.value
    .filter((entry) => entry.author?.email?.toLowerCase() === email)
    .map((entry) => ({ ...entry, entryType: 'organization' }))
  const issueEntries = issueSubmissions.value
    .map((issue) => {
      const entry = convertIssueToEntry(issue)
      return entry ? { ...entry, creationDate: issue.created_at } : null
    })
    .filter((entry) => entry?.author?.email?.toLowerCase() === email)
  return [...micronations, ...organizations, ...issueEntries]
})

const approvedMicronations = computed(() =>
  micronationsDirectory.value.filter((entry) => entry.approved)
)
const approvedOrganizations = computed(() =>
  organizationsDirectory.value.filter((entry) => entry.approved)
)
const userContributions = computed(
  () =>
    authoredEntries.value.filter((entry) => entry.entryType === 'micronation' && entry.approved)
      .length
)
const userOrganizationContributions = computed(
  () =>
    authoredEntries.value.filter((entry) => entry.entryType === 'organization' && entry.approved)
      .length
)
const percentageContributions = computed(() =>
  approvedMicronations.value.length
    ? ((userContributions.value * 100) / approvedMicronations.value.length).toFixed(2)
    : '0.00'
)
const percentageOrganizationContributions = computed(() =>
  approvedOrganizations.value.length
    ? ((userOrganizationContributions.value * 100) / approvedOrganizations.value.length).toFixed(2)
    : '0.00'
)
const settingsEntries = computed(() =>
  authoredEntries.value.map((entry) => ({
    ...entry,
    name: { ...entry.name, mainAlt: entry.name?.mainAlt || '' },
    searchDisplay: true,
    filterDisplay: true
  }))
)

function entryInfo(entry) {
  return {
    id: entry.id,
    name: entry.name,
    flag: entry.flag,
    logo: entry.logo,
    motto: entry.motto,
    type: entry.type,
    languages: entry.languages,
    capital: entry.capital,
    currency: entry.currency,
    foundationDate: entry.foundationDate,
    foundationDateDisplay: formatFoundationDate(entry.foundationDate),
    location: entry.location,
    memberships: entry.memberships || [],
    contactInfo: entry.contactInfo || [],
    websites: entry.websites || [],
    uncertain: entry.uncertain || [],
    author: entry.author,
    approved: entry.approved,
    creationDate: entry.creationDate,
    editHistory: Array.isArray(entry.editHistory) ? entry.editHistory : []
  }
}

function formatFoundationDate(date) {
  return formatDate(date)
}

function updatePagedEntries(entries) {
  pagedEntries.value = entries
}

async function loadUserIssueSubmissions() {
  try {
    issueSubmissions.value = await fetchGitHubIssues(['new-entry', 'edit-entry', 'review-required'])
  } catch (error) {
    console.error('Unable to load the current user’s GitHub submissions:', error)
  }
}

async function resendVerification() {
  try {
    await sendEmailVerification(auth.currentUser)
    notify({
      title: translate('profile.messages.session'),
      text: translate('profile.messages.emailSent'),
      type: 'success'
    })
  } catch (error) {
    notify({ title: translate('profile.messages.emailFailed'), text: error.message, type: 'error' })
  }
}

async function linkGoogleAccount() {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account',
      ...(auth.currentUser?.email ? { login_hint: auth.currentUser.email } : {})
    })
    const result = await linkWithPopup(auth.currentUser, provider)
    currentUser.value = result.user
    notify({
      title: translate('profile.messages.googleLinked'),
      text: translate('profile.messages.googleReady'),
      type: 'success'
    })
  } catch (error) {
    const messages = {
      'auth/credential-already-in-use': translate('profile.messages.googleInUse'),
      'auth/provider-already-linked': translate('profile.messages.googleExists'),
      'auth/popup-closed-by-user': translate('profile.messages.googleCancelled'),
      'auth/popup-blocked':
        translate('profile.messages.googlePopupBlocked')
    }
    notify({
      title: translate('profile.messages.googleFailed'),
      text: messages[error.code] || error.message,
      type: 'error'
    })
  }
}

async function changePassword() {
  const addingPassword = !hasPasswordProvider.value
  if (newPassword.value !== repeatNewPassword.value) {
    notify({
      title: translate('profile.messages.passwordMismatch'),
      text: translate('profile.messages.passwordMismatchText'),
      type: 'error'
    })
    return
  }
  try {
    if (!addingPassword) {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword.value)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPassword.value)
    } else {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, newPassword.value)
      await linkWithCredential(auth.currentUser, credential)
      currentUser.value = auth.currentUser
    }
    oldPassword.value = ''
    newPassword.value = ''
    repeatNewPassword.value = ''
    notify({
      title: translate(addingPassword ? 'profile.messages.passwordAdded' : 'profile.messages.passwordUpdated'),
      text: addingPassword
        ? translate('profile.messages.passwordAddedText')
        : translate('profile.messages.passwordUpdatedText'),
      type: 'success'
    })
  } catch (error) {
    const messages = {
      'auth/invalid-credential': translate('profile.messages.invalidCredential'),
      'auth/credential-already-in-use':
        translate('profile.messages.credentialsUsed'),
      'auth/email-already-in-use': translate('profile.messages.emailUsed'),
      'auth/weak-password': translate('profile.messages.weakPassword')
    }
    notify({
      title: translate(addingPassword ? 'profile.messages.passwordAddFailed' : 'profile.messages.passwordUpdateFailed'),
      text: messages[error.code] || error.message,
      type: 'error'
    })
  }
}

async function signOutCall() {
  localStorage.removeItem('firebase-auth-user')
  await signOut(auth)
  notify({
    title: translate('profile.messages.session'),
    text: translate('profile.messages.signedOut'),
    type: 'warning'
  })
  router.push('/login')
}

onAuthStateChanged(auth, (authUser) => {
  if (authUser) currentUser.value = authUser
  else if (!user.value?.email && localStorage.getItem('firebase-auth-user') === null)
    router.push('/login')
})

onMounted(loadUserIssueSubmissions)
</script>

<template>
  <section class="site-section profile-shell">
    <div class="profile-heading">
      <div class="profile-avatar" aria-hidden="true">
        {{ (currentUser.displayName || currentUser.email || 'U').slice(0, 1).toUpperCase() }}
      </div>
      <div>
        <h1>{{ $t('profile.hello', { name: currentUser.displayName || $t('profile.there') }) }}</h1>
        <p class="profile-intro">{{ $t('profile.intro') }}</p>
      </div>
    </div>

    <Sectionbar
      :sections="profileSections"
      :initial-selected-section="activeSection"
      @section-change="activeSection = $event"
    >
      <template #profile>
        <div class="section-content profile-data">
          <div class="panel-heading">
            <div>
              <h2>{{ $t('profile.yourData') }}</h2>
            </div>
          </div>
          <div class="data-grid">
            <div class="data-card">
              <span class="data-label">{{ $t('profile.displayName') }}</span
              ><strong>{{ currentUser.displayName || $t('profile.notSet') }}</strong>
            </div>
            <div class="data-card email-data-card">
              <span class="data-label">{{ $t('profile.email') }}</span>
              <strong>{{ currentUser.email || $t('settings.loading') }}</strong>
            </div>
            <div class="data-card">
              <span class="data-label">{{ $t('profile.accountStatus') }}</span
              ><span
                class="status-pill"
                :class="currentUser.emailVerified ? 'verified' : 'unverified'"
                >{{ $t(currentUser.emailVerified ? 'profile.verified' : 'profile.notVerified') }}</span
              ><button
                v-if="!currentUser.emailVerified"
                class="text-action"
                type="button"
                @click="resendVerification"
              >
                {{ $t('profile.resend') }}
              </button>
            </div>
            <div class="data-card moderator-card">
              <span class="data-label">Role</span>
              <strong
                :class="
                  userIsModerator || moderatorsList.includes(currentUser.email)
                    ? 'verified-text'
                    : 'contributor-text'
                "
              >
                {{
                  userIsModerator || moderatorsList.includes(currentUser.email)
                    ? $t('profile.moderator')
                    : $t('profile.contributor')
                }}
              </strong>
              <span>{{
                userIsModerator || moderatorsList.includes(currentUser.email)
                  ? $t('profile.modDescription')
                  : $t('profile.contributorDescription')
              }}</span>
            </div>
          </div>
          <section class="profile-settings" aria-labelledby="profileSettingsTitle">
            <h3 id="profileSettingsTitle">{{ $t('profile.settings') }}</h3>
            <div class="profile-settings-grid">
              <div class="settings-card">
                <div>
                  <span class="data-label">{{ $t('profile.google') }}</span>
                  <strong>{{ $t(hasGoogleProvider ? 'profile.connected' : 'profile.notConnected') }}</strong>
                </div>
                <button
                  v-if="!hasGoogleProvider"
                  class="text-action"
                  type="button"
                  @click="linkGoogleAccount"
                >
                  {{ $t('profile.connectGoogle') }}
                </button>
              </div>
              <div class="settings-card settings-preferences">
                <PreferenceControls
                  :theme="theme"
                  :language="language"
                  @update:theme="emit('update:theme', $event)"
                  @update:language="setLanguage"
                />
              </div>
            </div>
          </section>
          <div class="profile-footer">
            <span>{{ $t('profile.signOut') }}</span
            ><button class="logout-button" type="button" @click="signOutCall">
              {{ $t('profile.logout') }} <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </template>

      <template #password>
        <form class="section-content password-content" @submit.prevent="changePassword">
          <div class="password-fields">
            <div class="panel-heading">
              <div>
                <h2>{{ $t('profile.updatePassword') }}</h2>
              </div>
            </div>
            <p class="section-description">
              {{
                hasPasswordProvider
                  ? $t('profile.passwordDescription')
                  : $t('profile.addPasswordDescription')
              }}
            </p>
            <label v-if="hasPasswordProvider"
              >{{ $t('profile.currentPassword') }}<input
                v-model="oldPassword"
                class="login-input"
                type="password"
                autocomplete="current-password"
                required
                :placeholder="$t('profile.enterCurrent')"
            /></label>
            <label
              >{{ hasPasswordProvider ? $t('profile.newPassword') : $t('login.password')
              }}<input
                v-model="newPassword"
                class="login-input"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                :placeholder="$t('profile.minPassword')"
            /></label>
            <label
              >{{ hasPasswordProvider ? $t('profile.confirmNewPassword') : $t('profile.confirmPassword')
              }}<input
                v-model="repeatNewPassword"
                class="login-input"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                :placeholder="$t('profile.reenter')"
            /></label>
            <button class="primary-action" type="submit">
              {{ hasPasswordProvider ? $t('profile.savePassword') : $t('profile.addPassword') }}
            </button>
          </div>
        </form>
      </template>

      <template #contributions>
        <div class="section-content contributions-content">
          <div class="panel-heading">
            <div>
              <h2>{{ $t('profile.contributions') }}</h2>
              <p class="section-description">
                {{ $t('profile.contributionDescription') }}
              </p>
            </div>
          </div>
          <div class="stats-grid">
            <article class="stat-card">
              <span>{{ $t('profile.micronations') }}</span><strong>{{ userContributions }}</strong
              ><small>{{ percentageContributions }}{{ $t('profile.approvedPercent') }}</small>
            </article>
            <article class="stat-card">
              <span>{{ $t('profile.organizations') }}</span><strong>{{ userOrganizationContributions }}</strong
              ><small>{{ percentageOrganizationContributions }}{{ $t('profile.approvedPercent') }}</small>
            </article>
            <article class="stat-card total-stat">
              <span>{{ $t('profile.total') }}</span><strong>{{ authoredEntries.length }}</strong
              ><small
                >{{ authoredEntries.filter((entry) => !entry.approved).length }} {{ $t('profile.awaiting') }}</small
              >
            </article>
          </div>

          <div class="listing-header">
            <div>
              <h3>{{ $t('profile.entries') }}</h3>
            </div>
          </div>
          <Settingsbar
            v-if="authoredEntries.length"
            view-mode="micronations"
            store-getter="micronations"
            :elements-directory="settingsEntries"
            :show-unapproved="true"
            :hidden-subcontainers="['Display', 'Flags']"
            @loaded-directory="updatePagedEntries"
          />
          <p v-if="!authoredEntries.length" class="empty-state">
            {{ $t('profile.noEntries') }}
          </p>
          <p v-else-if="!pagedEntries.length" class="empty-state">
            {{ $t('profile.noMatch') }}
          </p>
          <div v-else class="entries-list">
            <div
              v-for="entry in pagedEntries"
              :key="`${entry.entryType}-${entry.id || entry.name.main}`"
              class="entry-wrapper"
            >
              <span class="entry-status" :class="entry.approved ? 'approved' : 'pending'">{{
                $t(entry.approved ? 'profile.approvedStatus' : 'profile.pendingStatus')
              }}</span>
              <DirectoryEntry
                v-if="entry.entryType === 'micronation'"
                :info="entryInfo(entry)"
                :width="190"
                :flag-height="114"
                :micronations-directory="micronationsDirectory"
                :organizations-directory="organizationsDirectory"
                :disable-full-profile-button="!entry.approved"
              />
              <OrganizationEntry
                v-else
                :info="entryInfo(entry)"
                :width="190"
                :logo-height="114"
                :micronations-directory="micronationsDirectory"
              />
            </div>
          </div>
        </div>
      </template>
    </Sectionbar>
  </section>
</template>

<style scoped>
.profile-shell {
  margin-inline: auto;
  padding: clamp(18px, 4vw, 42px);
}

.profile-heading {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px 4px 28px;
}

.profile-avatar {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  border-radius: 20px;
  color: white;
  font-size: 26px;
  font-weight: 750;
  background: linear-gradient(145deg, #7194ef, #4268cb);
  box-shadow: 0 10px 26px #4268cb38;
}

.profile-heading h1 {
  margin: 0;
  color: var(--color-heading);
  font-size: clamp(25px, 4vw, 34px);
}

.profile-intro,
.section-description {
  margin: 6px 0 0;
  color: var(--color-muted);
  line-height: 1.55;
}

.section-content {
  width: 100%;
  margin: 0;
  padding: clamp(20px, 4vw, 32px);
  border: 1px solid var(--color-border);
  border-top: 0;
  border-radius: 0 0 18px 18px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.panel-heading h2 {
  margin: 0;
  color: var(--color-heading);
  font-size: 23px;
}

.status-pill,
.entry-status {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
}

.status-pill.verified {
  color: #16834b;
  background: #22c55e24;
}

.entry-status.approved {
  color: #2f855a;
  background: #35a66c1c;
}

.status-pill.unverified {
  color: #c62828;
  background: #ef444426;
}

.entry-status.pending {
  color: #a86b10;
  background: #e9a3291f;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.data-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  min-height: 90px;
  padding: 17px;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  background: var(--color-background-soft);
}

.data-label {
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 650;
}

.data-card strong {
  color: var(--color-heading);
  overflow-wrap: anywhere;
}

.data-card > span:last-child {
  color: var(--color-muted);
  font-size: 13px;
}

.profile-settings {
  margin-top: 24px;
}

.profile-settings h3 {
  margin: 0 0 12px;
  color: var(--color-heading);
  font-size: 18px;
}

.profile-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 12px;
}

.settings-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 90px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-background-soft);
}

.settings-card > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.settings-preferences {
  display: block;
}

.verified-text {
  color: var(--success-tone) !important;
}

.text-action {
  padding: 0;
  border: 0;
  color: var(--color-link);
  background: transparent;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.profile-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 14px;
}

.logout-button,
.primary-action {
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  background: #bd4852;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
}

.logout-button:hover {
  background: #a63943;
  transform: translateY(-1px);
}

.password-content {
  max-width: none;
}

.password-fields {
  width: 50%;
}

.password-fields > label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 17px;
  color: var(--color-heading);
  font-size: 14px;
  font-weight: 650;
}

.password-fields .login-input {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.primary-action {
  margin-top: 22px;
  background: var(--vt-c-indigo);
}

.primary-action:hover {
  background: var(--vt-c-indigo-dark);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-background-soft);
}

.stat-card span {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 650;
}

.stat-card strong {
  color: var(--color-heading);
  font-size: 30px;
  line-height: 1;
}

.stat-card small {
  color: var(--color-muted);
  font-size: 12px;
}

.total-stat {
  background: linear-gradient(
    140deg,
    var(--color-background-soft),
    var(--navbar-tab-background-color-selected)
  );
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.listing-header > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.listing-header h3 {
  margin: 0;
  color: var(--color-heading);
  font-size: 18px;
}

.listing-header span {
  color: var(--color-muted);
  font-size: 13px;
}

.entries-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 18px;
  padding-top: 20px;
}

.entry-wrapper {
  position: relative;
  padding-top: 14px;
}

.entry-status {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 7px;
  padding: 4px 8px;
  box-shadow: 0 2px 8px #0002;
}

.empty-state {
  padding: 30px 16px;
  color: var(--color-muted);
  text-align: center;
}

@media (max-width: 560px) {
  .profile-shell {
    padding: 14px;
  }

  .profile-heading {
    align-items: flex-start;
    gap: 12px;
  }

  .profile-avatar {
    width: 48px;
    height: 48px;
    border-radius: 15px;
  }

  .data-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .settings-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-settings-grid {
    grid-template-columns: 1fr;
  }

  .settings-preferences {
    align-items: stretch;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-footer {
    align-items: flex-start;
    flex-direction: column;
  }
  .password-fields {
    width: 100%;
  }
}
</style>
