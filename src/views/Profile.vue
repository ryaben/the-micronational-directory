<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, sendEmailVerification, signOut, updatePassword, linkWithCredential } from 'firebase/auth';
import { notify } from '@kyvg/vue3-notification';
import { auth } from '../firebase/auth.js';
import router from '../router/index';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import OrganizationEntry from '../components/OrganizationEntry.vue';
import Sectionbar from '../components/Sectionbar.vue';
import Settingsbar from '../components/Settingsbar.vue';
import store from '../store';
import { convertIssueToEntry, fetchGitHubIssues } from '../utils/githubFunctions.js';

const props = defineProps({
  micronationsDirectory: { type: Array, default: () => store.getters.micronations },
  organizationsDirectory: { type: Array, default: () => store.getters.organizations },
  moderatorsList: { type: Array, default: () => store.getters.moderators },
  userIsModerator: { type: Boolean, default: false },
  user: { type: Object, default: () => ({}) }
});

const activeSection = ref('profile');
const profileSections = [
  { text: 'Account data', target: 'profile', display: true },
  { text: 'Update password', target: 'password', display: true },
  { text: 'Contributions', target: 'contributions', display: true }
];
const currentUser = ref(auth.currentUser || props.user || {});
const pagedEntries = ref([]);
const issueSubmissions = ref([]);
const oldPassword = ref('');
const newPassword = ref('');
const repeatNewPassword = ref('');
const hasPasswordProvider = computed(() => currentUser.value?.providerData?.some(provider => provider.providerId === 'password') ?? false);

watch(() => props.user, user => {
  if (user?.email) currentUser.value = user;
}, { immediate: true });

const authoredEntries = computed(() => {
  const email = currentUser.value?.email?.toLowerCase();
  if (!email) return [];
  const micronations = props.micronationsDirectory
    .filter(entry => entry.author?.email?.toLowerCase() === email)
    .map(entry => ({ ...entry, entryType: 'micronation' }));
  const organizations = props.organizationsDirectory
    .filter(entry => entry.author?.email?.toLowerCase() === email)
    .map(entry => ({ ...entry, entryType: 'organization' }));
  const issueEntries = issueSubmissions.value
    .map(issue => {
      const entry = convertIssueToEntry(issue);
      return entry ? { ...entry, creationDate: issue.created_at } : null;
    })
    .filter(entry => entry?.author?.email?.toLowerCase() === email);
  return [...micronations, ...organizations, ...issueEntries];
});

const approvedMicronations = computed(() => props.micronationsDirectory.filter(entry => entry.approved));
const approvedOrganizations = computed(() => props.organizationsDirectory.filter(entry => entry.approved));
const userContributions = computed(() => authoredEntries.value.filter(entry => entry.entryType === 'micronation' && entry.approved).length);
const userOrganizationContributions = computed(() => authoredEntries.value.filter(entry => entry.entryType === 'organization' && entry.approved).length);
const percentageContributions = computed(() => approvedMicronations.value.length ? (userContributions.value * 100 / approvedMicronations.value.length).toFixed(2) : '0.00');
const percentageOrganizationContributions = computed(() => approvedOrganizations.value.length ? (userOrganizationContributions.value * 100 / approvedOrganizations.value.length).toFixed(2) : '0.00');
const settingsEntries = computed(() => authoredEntries.value.map(entry => ({
  ...entry,
  name: { ...entry.name, mainAlt: entry.name?.mainAlt || '' },
  searchDisplay: true,
  filterDisplay: true
})));

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
    author: entry.author,
    approved: entry.approved,
    creationDate: entry.creationDate
  };
}

function formatFoundationDate(date) {
  if (!date) return 'Unknown';
  const seconds = date._seconds || date.seconds;
  const parsedDate = seconds ? new Date(seconds * 1000) : new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Unknown'
    : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(parsedDate);
}

function updatePagedEntries(entries) {
  pagedEntries.value = entries;
}

async function loadUserIssueSubmissions() {
  try {
    issueSubmissions.value = await fetchGitHubIssues(['new-entry', 'review-required']);
  } catch (error) {
    console.error('Unable to load the current user’s GitHub submissions:', error);
  }
}

async function resendVerification() {
  try {
    await sendEmailVerification(auth.currentUser);
    notify({ title: 'Session status', text: 'An email was sent to your address. Verify your account to add directory entries.', type: 'success' });
  } catch (error) {
    notify({ title: 'Unable to send email', text: error.message, type: 'error' });
  }
}

async function changePassword() {
  const addingPassword = !hasPasswordProvider.value;
  if (newPassword.value !== repeatNewPassword.value) {
    notify({ title: 'Password mismatch', text: "The values entered don't match. Please check your new password.", type: 'error' });
    return;
  }
  try {
    if (!addingPassword) {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword.value);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword.value);
    } else {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, newPassword.value);
      await linkWithCredential(auth.currentUser, credential);
      currentUser.value = auth.currentUser;
    }
    oldPassword.value = '';
    newPassword.value = '';
    repeatNewPassword.value = '';
    notify({
      title: addingPassword ? 'Password added' : 'Password updated',
      text: addingPassword ? 'You can now sign in with Google or your email and password.' : 'Your password was successfully updated.',
      type: 'success'
    });
  } catch (error) {
    const messages = {
      'auth/invalid-credential': 'The current password you entered is not valid.',
      'auth/credential-already-in-use': 'This email and password are already linked to another account.',
      'auth/email-already-in-use': 'This email is already linked to another account.',
      'auth/weak-password': 'Choose a stronger password with at least 6 characters.'
    };
    notify({ title: addingPassword ? 'Unable to add password' : 'Unable to update password', text: messages[error.code] || error.message, type: 'error' });
  }
}

async function signOutCall() {
  localStorage.removeItem('firebase-auth-user');
  await signOut(auth);
  notify({ title: 'Session status', text: 'You have logged out from your account.', type: 'warning' });
  router.push('/login');
}

onAuthStateChanged(auth, user => {
  if (user) currentUser.value = user;
  else if (!props.user?.email && localStorage.getItem('firebase-auth-user') === null) router.push('/login');
});

onMounted(loadUserIssueSubmissions);
</script>

<template>
  <section class="site-section profile-shell">
    <div class="profile-heading">
      <div class="profile-avatar" aria-hidden="true">{{ (currentUser.displayName || currentUser.email || 'U').slice(0,
        1).toUpperCase() }}</div>
      <div>
        <h1>Hello, {{ currentUser.displayName || 'there' }}!</h1>
        <p class="profile-intro">Manage your account and see what you’ve added to the directory.</p>
      </div>
    </div>

    <Sectionbar :sections="profileSections" :initial-selected-section="activeSection"
      @section-change="activeSection = $event">
      <template #profile>
        <div class="section-content profile-data">
          <div class="panel-heading">
            <div>
              <h2>Your data</h2>
            </div><span class="status-pill" :class="currentUser.emailVerified ? 'verified' : 'unverified'">{{
              currentUser.emailVerified ? 'Email verified' : 'Verification needed' }}</span>
          </div>
          <div class="data-grid">
            <div class="data-card"><span class="data-label">Display name</span><strong>{{ currentUser.displayName ||
                'Not set' }}</strong></div>
            <div class="data-card"><span class="data-label">Email address</span><strong>{{ currentUser.email ||
                'Loading…' }}</strong></div>
            <div class="data-card"><span class="data-label">Account status</span><strong>{{ currentUser.emailVerified ?
              'Verified' : 'Not verified' }}</strong><button v-if="!currentUser.emailVerified" class="text-action"
                type="button" @click="resendVerification">Resend verification email</button></div>
            <div class="data-card moderator-card">
              <span class="data-label">Role</span>
              <strong :class="(userIsModerator || moderatorsList.includes(currentUser.email)) ? 'verified-text' : 'contributor-text'">
                {{ (userIsModerator || moderatorsList.includes(currentUser.email)) ? 'Moderator' : 'Contributor' }}
              </strong>
              <span>{{ (userIsModerator || moderatorsList.includes(currentUser.email))
                ? 'Moderation privileges are enabled for your account.'
                : 'You can contribute entries to the directory.' }}</span>
            </div>
          </div>
          <div class="profile-footer"><span>Sign out of your account on this device.</span><button class="logout-button"
              type="button" @click="signOutCall">Log out <span aria-hidden="true">↗</span></button></div>
        </div>
      </template>

      <template #password>
        <form class="section-content password-content" @submit.prevent="changePassword">
          <div class="password-fields">
            <div class="panel-heading">
              <div>
                <h2>Update password</h2>
              </div>
            </div>
            <p class="section-description">{{ hasPasswordProvider
              ? 'Choose a strong password you don’t use elsewhere. Confirm your current password to make this change.'
              : 'Add a password to this Google account so you can sign in with either Google or email and password.' }}</p>
            <label v-if="hasPasswordProvider">Current password<input v-model="oldPassword" class="login-input" type="password"
                autocomplete="current-password" required placeholder="Enter current password"></label>
            <label>{{ hasPasswordProvider ? 'New password' : 'Password' }}<input v-model="newPassword" class="login-input" type="password"
                autocomplete="new-password" required minlength="6" placeholder="At least 6 characters"></label>
            <label>{{ hasPasswordProvider ? 'Confirm new password' : 'Confirm password' }}<input v-model="repeatNewPassword" class="login-input" type="password"
                autocomplete="new-password" required minlength="6" placeholder="Re-enter new password"></label>
            <button class="primary-action" type="submit">{{ hasPasswordProvider ? 'Save new password' : 'Add password' }}</button>
          </div>
        </form>
      </template>

      <template #contributions>
        <div class="section-content contributions-content">
          <div class="panel-heading">
            <div>
              <h2>Contributions</h2>
              <p class="section-description">Approved entries count toward your totals. Your full submission list
                includes entries awaiting approval.</p>
            </div>
          </div>
          <div class="stats-grid">
            <article class="stat-card"><span>Micronations</span><strong>{{ userContributions }}</strong><small>{{
                percentageContributions }}% of approved directory</small></article>
            <article class="stat-card"><span>Organizations</span><strong>{{ userOrganizationContributions
                }}</strong><small>{{ percentageOrganizationContributions }}% of approved directory</small></article>
            <article class="stat-card total-stat"><span>Total submissions</span><strong>{{ authoredEntries.length
                }}</strong><small>{{authoredEntries.filter(entry => !entry.approved).length}} awaiting
                approval</small></article>
          </div>

          <div class="listing-header">
            <div>
              <h3>Your directory entries</h3>
            </div>
          </div>
          <Settingsbar v-if="authoredEntries.length" view-mode="micronations" store-getter="micronations" :elements-directory="settingsEntries"
            :show-unapproved="true" :hidden-subcontainers="['Display', 'Flags']"
            @loaded-directory="updatePagedEntries" />
          <p v-if="!authoredEntries.length" class="empty-state">You haven’t added any directory entries yet.</p>
          <p v-else-if="!pagedEntries.length" class="empty-state">No entries match these settings.</p>
          <div v-else class="entries-list">
            <div v-for="entry in pagedEntries" :key="`${entry.entryType}-${entry.id || entry.name.main}`"
              class="entry-wrapper">
              <span class="entry-status" :class="entry.approved ? 'approved' : 'pending'">{{ entry.approved ? 'Approved'
                : 'Pending' }}</span>
              <DirectoryEntry v-if="entry.entryType === 'micronation'" :info="entryInfo(entry)" :width="190"
                :flag-height="114" :micronations-directory="micronationsDirectory"
                :organizations-directory="organizationsDirectory" :disable-full-profile-button="!entry.approved" />
              <OrganizationEntry v-else :info="entryInfo(entry)" :width="190" :logo-height="114"
                :micronations-directory="micronationsDirectory" />
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

.status-pill.verified,
.entry-status.approved {
  color: #2f855a;
  background: #35a66c1c;
}

.status-pill.unverified,
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

.data-card>span:last-child {
  color: var(--color-muted);
  font-size: 13px;
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
  transition: .18s ease;
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

.password-fields>label {
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
  background: linear-gradient(140deg, var(--color-background-soft), var(--navbar-tab-background-color-selected));
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.listing-header>div {
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
