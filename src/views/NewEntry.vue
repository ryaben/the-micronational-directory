<script setup>
import NewEntryForm from '../components/NewEntryForm.vue'
import store from '../store'
import '@vuepic/vue-datepicker/dist/main.css'

defineProps({
  theme: {
    type: String,
    default: 'dark'
  },
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
  user: {
    type: Object,
    required: true,
    default: {}
  }
})
</script>

<template>
  <section class="site-section">
    <div class="dropdown-info-box color-transition new-entry-guidelines">
      <div class="guidelines-heading">
        <span class="guidelines-icon" aria-hidden="true">⚠️</span>
        <h3>Important notes on new entries and how to add your own</h3>
      </div>
      <p class="guidelines-resource">
        Don't know what micronations to add?
        <a
          href="https://docs.google.com/spreadsheets/d/1jwekLc1EpbVfznTbMrqiM8KUJW_ra3vywcMpiLTJrEs/edit?usp=sharing"
          target="_blank"
          >Check out this list with many sources that we've composed</a
        >.
      </p>
      <p class="guidelines-intro">
        We invite the community to contribute to the directory and add entries to it.
        <b>It's important to highlight that:</b>
      </p>
      <ul class="notes-list guidelines-list">
        <li>
          Please provide <b>truthful, appropriate and precise information</b>. Additionally, cases
          of micronations/organizations that promote Nazi symbology, adult 18+ content and/or any
          kind of illegal activity will be immediately rejected.
        </li>
        <li>
          Micronations/organizations submitted should have
          <b>at least one (1) month of proven existence.</b> This way we avoid lightning entries
          that may only be games or premature/fake experiments.
        </li>
        <li>
          It's <b>mandatory</b> that all entries have a website source of the
          micronation/organization and/or (preferably <b>and</b>) an info article on any wiki. This
          way, a veridical source for the information entered is specified, and we can avoid entries
          that could be jokes, games, fake, misleading or cheating for contests.
        </li>
        <li>
          Physical and digital micronations can be included alike, as well as fictional countries as
          long as they also demonstrate activity as a proper micronation (news, diplomacy, activity)
          with imaginary elements (e.g.,
          <a href="https://en.wikipedia.org/wiki/Babar%27s_Kingdom" target="_blank"
            >Babar's Kingdom</a
          >
          is not a valid case, while the
          <router-link :to="'/directory/Redonda'">Kingdom of Redonda</router-link> or most of the
          micronations from
          <router-link :to="'/organizations/Micras Cartography Society'">Micras</router-link> indeed
          are).
        </li>
        <li>
          Ideally and whenever possible, please input the entry data in English. If not, then in the
          micronation's/organization's main official language.
        </li>
        <li>
          If a micronation's/organization's website is down or inactive, you can check it on the
          <b><a href="http://web.archive.org/">Wayback Machine</a></b> because it may have a past
          snapshot saved. If so, you can add the link the service generates instead.
        </li>
        <li>
          All submissions will first <b>require approval from the administrator</b> (can take up to
          72 hours) before they are posted on the definitive public online directory.
        </li>
      </ul>
      <p class="guidelines-thanks">Thanks for understanding and for helping to create this digital database museum!</p>

      <div v-if="user.emailVerified" class="entry-actions">
        <button
          class="login-button short color-transition"
          :class="{ active: newMicronationView }"
          :disabled="!user.emailVerified"
          @click="setEntryView('micronation')"
        >
          Add new micronation
        </button>
        <button
          class="login-button short color-transition"
          :class="{ active: newOrganizationView }"
          :disabled="!user.emailVerified"
          @click="setEntryView('organization')"
        >
          Add new organization
        </button>
      </div>
      <div v-else class="entry-actions">
        <p class="entry-availability-note">
          Available to
          <router-link :to="'/login'">registered users with a verified email</router-link> only.
        </p>
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
          :theme="theme"
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
  display: flex;
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

.new-entry-guidelines > p {
  line-height: 1.7;
}

.guidelines-resource {
  padding: 13px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-background-soft) 72%, transparent);
}

.guidelines-intro {
  margin-top: 20px;
}

.guidelines-list {
  display: grid;
  gap: 0;
  margin: 14px 0 18px;
  padding: 0;
  list-style: none;
  counter-reset: guidelines;
}

.guidelines-list li {
  position: relative;
  padding: 12px 10px 12px 38px;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.65;
  counter-increment: guidelines;
}

.guidelines-list li:last-child {
  border-bottom: 0;
}

.guidelines-list li::before {
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

.guidelines-thanks {
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

  .guidelines-list li {
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
