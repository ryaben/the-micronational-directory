<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import NewEntryForm from '../components/NewEntryForm.vue'
import DirectoryArticle from '../components/DirectoryArticle.vue'
import OrganizationArticle from '../components/OrganizationArticle.vue'
import store from '../store'
import { auth } from '../firebase/auth.js'

const props = defineProps({ entryId: { type: String, required: true }, entryType: { type: String, required: true } })
const router = useRouter()
const user = ref(auth.currentUser)
const directoryLoaded = ref(props.entryType === 'micronation' ? store.getters.micronations.length > 0 : store.getters.organizations.length > 0)
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, value => { user.value = value })
  const loads = []
  if (!store.getters.micronations.length) loads.push(store.dispatch('getMicronations'))
  if (!store.getters.organizations.length) loads.push(store.dispatch('getOrganizations'))
  Promise.all(loads).finally(() => { directoryLoaded.value = true })
})
onUnmounted(() => unsubscribe?.())

const directory = computed(() => props.entryType === 'micronation' ? store.getters.micronations : store.getters.organizations)
const entry = computed(() => directory.value.find(item => String(item.id) === props.entryId && item.approved))
const initialEntry = computed(() => entry.value ? JSON.parse(JSON.stringify(entry.value)) : null)
const placeholders = ref(null)
function setFormValues(item) {
  if (!item) return
  const name = item.name || {}
  placeholders.value = {
    newEntryFlag: item.flag || item.logo || '',
    newEntryName: name.main || '',
    newEntryNameAlt: name.mainAlt || '',
    newEntryAltNames: name.alt?.length
      ? JSON.parse(JSON.stringify(name.alt))
      : (name.mainAlt || name.titleAlt ? [{ main: name.mainAlt || '', title: name.titleAlt || '' }] : []),
    newEntryTitle: name.title || '',
    newEntryTitleAlt: name.titleAlt || '',
    newEntryTypePhysical: (item.type || []).includes('Physical'),
    newEntryTypeDigital: (item.type || []).includes('Digital'),
    newEntryTypeFictional: (item.type || []).includes('Fictional'),
    newEntryMotto: item.motto || '',
    newEntryCapital: item.capital || '',
    newEntryCurrency: item.currency || '',
    newEntryLanguages: [...(item.languages || [])],
    newEntryMemberships: [...(item.memberships || [])],
    newEntryEmails: [...(item.contactInfo || [])],
    newEntryWebsites: [...(item.websites || [])]
  }
}
watch(entry, setFormValues, { immediate: true })
function onSuccess() {
  router.push(props.entryType === 'micronation' ? `/directory/${encodeURIComponent(entry.value.name.main)}` : `/organizations/${encodeURIComponent(entry.value.name.main)}`)
}
</script>

<template>
  <section class="site-section">
    <div v-if="!user?.emailVerified" class="edit-entry-message">
      <h2>{{ $t('editEntry.verifyTitle') }}</h2>
      <p>{{ $t('editEntry.verifyBody') }}</p>
      <router-link to="/login">{{ $t('common.signIn') }}</router-link>
    </div>
    <div v-else-if="!directoryLoaded" class="edit-entry-message">{{ $t('editEntry.loading') }}</div>
    <div v-else-if="!entry" class="edit-entry-message">
      <h2>{{ $t('common.notFound') }}</h2>
      <p>{{ $t('editEntry.notFoundBody') }}</p>
    </div>
    <div v-else>
      <h2>{{ $t('editEntry.suggest', { name: entry.name.main }) }}</h2>
      <p>{{ $t('editEntry.approval') }}</p>
      <section class="approved-entry-reference" aria-labelledby="approved-entry-heading">
      <h3 id="approved-entry-heading">{{ $t('editEntry.current') }}</h3>
        <DirectoryArticle v-if="entryType === 'micronation'" :info="entry" :preview="true" />
        <OrganizationArticle
          v-else
          :info="entry"
          :micronations-directory="store.getters.micronations"
          :preview="true"
        />
      </section>
      <NewEntryForm
        v-if="placeholders"
        :key="entry.id"
        :entry-type="entryType"
        :directory-edit="true"
        :edit-target-id="entry.id"
        :initial-entry="initialEntry"
        :form-placeholders="placeholders"
        :directory-data="directory"
        :organizations-directory="store.getters.organizations"
        :visible-organizations="store.getters.organizations.filter(item => item.approved && item.searchDisplay && item.filterDisplay)"
        @submission-success="onSuccess"
      />
    </div>
  </section>
</template>

<style scoped>
.edit-entry-message { max-width: 720px; margin: 2rem auto; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.approved-entry-reference { margin: 1.5rem 0 2rem; }
.approved-entry-reference h3 { margin: 0 0 0.75rem; color: var(--color-heading); }
</style>
