<script setup>
import NewEntryForm from '../components/NewEntryForm.vue'
import { useDirectoryData } from '../composables/useDirectoryData.js'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({ theme: { type: String, default: 'dark' } })
const { micronationsDirectory, organizationsDirectory, visibleOrganizations, user } = useDirectoryData()
</script>

<template>
  <section class="site-section">
    <div class="dropdown-info-box color-transition new-entry-guidelines">
      <div class="guidelines-heading">
        <span class="guidelines-icon" aria-hidden="true">⚠️</span>
        <h3>{{ $t('newEntry.title') }}</h3>
      </div>
      <p class="guidelines-resource">
        {{ $t('newEntry.resourceIntro') }}
        <a href="https://docs.google.com/spreadsheets/d/1jwekLc1EpbVfznTbMrqiM8KUJW_ra3vywcMpiLTJrEs/edit?usp=sharing" target="_blank">{{ $t('newEntry.resourceLink') }}</a>.
      </p>
      <div class="guidelines-content notes-list guidelines-list" v-html="$t('newEntry.content')"></div>

      <div v-if="user.emailVerified" class="entry-actions">
        <button
          class="login-button short color-transition"
          :class="{ active: newMicronationView }"
          :disabled="!user.emailVerified"
          @click="setEntryView('micronation')"
        >
          {{ $t('newEntry.addMicronation') }}
        </button>
        <button
          class="login-button short color-transition"
          :class="{ active: newOrganizationView }"
          :disabled="!user.emailVerified"
          @click="setEntryView('organization')"
        >
          {{ $t('newEntry.addOrganization') }}
        </button>
      </div>
      <div v-else class="entry-actions">
        <p class="entry-availability-note" v-html="$t('newEntry.verifiedOnly')"></p>
      </div>

      <!-- los containers de new entry van acá con v-show="newEntryView" -->
      <Transition name="entry-form" mode="out-in">
        <NewEntryForm
          v-if="user.emailVerified && (newMicronationView || newOrganizationView)"
          :key="`${newMicronationView ? 'micronation' : 'organization'}-${componentKey}`"
          class="new-entry-container"
          :entry-type="newMicronationView ? 'micronation' : 'organization'"
          :directory-data="newMicronationView ? micronationsDirectory : organizationsDirectory"
          :organizations-directory="organizationsDirectory"
          :visible-organizations="visibleOrganizations"
          :theme="props.theme"
          :form-placeholders="formPlaceholder"
          @submission-success="resetEntryForm"
        />
      </Transition>
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
      newMicronationView: false,
      newOrganizationView: false,
      componentKey: 0,
      formPlaceholder: {
        newEntryFlag: '',
        newEntryName: '',
        newEntryNameAlt: '',
        newEntryAltNames: [],
        newEntryTitle: '',
        newEntryTitleAlt: '',
        newEntryTypePhysical: false,
        newEntryTypeDigital: true,
        newEntryTypeFictional: false,
        newEntryMotto: '',
        newEntryCapital: '',
        newEntryCurrency: '',
        newEntryLanguages: [],
        newEntryMemberships: [],
        newEntryEmails: [],
        newEntryWebsites: []
      }
    }
  },
  methods: {
    setEntryView(entryType) {
      this.newMicronationView = entryType === 'micronation'
      this.newOrganizationView = entryType === 'organization'
    },
    resetEntryForm() {
      this.formPlaceholder = {
        newEntryFlag: '',
        newEntryName: '',
        newEntryNameAlt: '',
        newEntryAltNames: [],
        newEntryTitle: '',
        newEntryTitleAlt: '',
        newEntryTypePhysical: false,
        newEntryTypeDigital: true,
        newEntryTypeFictional: false,
        newEntryMotto: '',
        newEntryCapital: '',
        newEntryCurrency: '',
        newEntryLanguages: [],
        newEntryMemberships: [],
        newEntryEmails: [],
        newEntryWebsites: []
      }
      this.componentKey += 1
    }
  }
}
</script>

<style scoped>
.entry-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
  margin-top: 25px;
  width: fit-content;
  max-width: 100%;
}

.entry-availability-note {
  grid-column: 1 / -1;
  align-items: center;
  margin: 2px 0 0;
  padding: 8px 12px;
  border: 1px solid rgba(65, 105, 225, 0.2);
  border-radius: 8px;
  background: rgba(65, 105, 225, 0.07);
  color: #46536b;
  font-size: 0.92rem;
  line-height: 1.45;
}

.entry-availability-note a {
  margin: 0 0.25em;
}

.dropdown-info-box {
  border-top: none;
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
}

.new-entry-guidelines {
  padding: 8px 16px 16px;
}

.guidelines-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.guidelines-icon {
  display: grid;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  border-radius: 15px;
  background: color-mix(in srgb, var(--color-accent) 12%, var(--color-surface));
  font-size: 23px;
}

.guidelines-eyebrow {
  margin: 0 0 4px;
  color: var(--color-accent);
  font-size: 0.76rem;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.guidelines-heading h3 {
  margin: 0;
  font-size: clamp(21px, 2.4vw, 28px);
  letter-spacing: -0.025em;
}

.new-entry-guidelines > .guidelines-content :deep(p) {
  line-height: 1.7;
}

.guidelines-resource {
  padding: 13px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-background-soft) 72%, transparent);
}

.guidelines-list {
  margin: 0;
}

.guidelines-content :deep(p) {
  margin: 16px 0;
  line-height: 1.65;
}

.guidelines-content :deep(ul) {
  display: grid;
  gap: 0;
  margin: 14px 0 18px;
  padding: 0;
  list-style: none;
  counter-reset: guidelines;
}

.guidelines-content :deep(li) {
  position: relative;
  padding: 12px 10px 12px 38px;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.65;
  counter-increment: guidelines;
}

.guidelines-content :deep(li:last-child) {
  border-bottom: 0;
}

.guidelines-content :deep(li::before) {
  position: absolute;
  top: 13px;
  left: 2px;
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 13%, var(--color-surface));
  color: var(--color-accent);
  content: counter(guidelines);
  font-size: 0.75rem;
  font-weight: 750;
}

.guidelines-content :deep(p:last-child) {
  margin-bottom: 0;
  color: var(--color-muted);
}

@media (max-width: 600px) {
  .new-entry-guidelines {
    padding: 8px 16px 16px;
  }

  .guidelines-heading {
    align-items: flex-start;
    gap: 12px;
  }

  .guidelines-icon {
    flex-basis: 40px;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    font-size: 19px;
  }

  .guidelines-content :deep(li) {
    padding-right: 0;
  }
}

.new-entry-container {
  margin-top: 10px;
}

.entry-form-enter-active,
.entry-form-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.entry-form-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.entry-form-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.login-button.short {
  padding: 10px 20px;
}

@media (prefers-reduced-motion: reduce) {
  .entry-form-enter-active,
  .entry-form-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
