<script setup>
import { defineAsyncComponent } from 'vue'
import { auth } from '../firebase/auth.js'
import { notify } from '@kyvg/vue3-notification'
import { checkHref, checkIcon, cleanString } from '../utils/EntrySourceFunctions'
import store from '../store'
import emailjs from 'emailjs-com'
import languages from 'language-list'
import VueDatePicker from '@vuepic/vue-datepicker'
import Recaptcha from '../components/ReCaptcha.vue'
import HelpTooltip from '../components/HelpTooltip.vue'
import SelectedElement from '../components/SelectedElement.vue'
import DirectoryEntry from '../components/DirectoryEntry.vue'
import OrganizationEntry from '../components/OrganizationEntry.vue'
import ModerationImageEditor from './ModerationImageEditor.vue'
import { createGitHubIssue } from '../utils/githubFunctions.js'
import { createFirestoreStyleId } from '../utils/firestoreStyleId.js'
import imageCompression from 'browser-image-compression'
import ChevronDownIcon from './icons/ChevronDownIcon.vue'
import '@vuepic/vue-datepicker/dist/main.css'

const LocationPicker = defineAsyncComponent(() => import('../components/LocationPicker.vue'))

defineProps({
  theme: {
    type: String,
    default: 'dark'
  },
  entryType: {
    type: String,
    required: false,
    default: 'micronation'
  },
  isModerationEditor: { type: Boolean, default: false },
  initialEntry: { type: Object, default: null },
  directoryEdit: { type: Boolean, default: false },
  editTargetId: { type: String, default: '' },
  initialImageMode: { type: String, default: 'url' },
  saving: { type: Boolean, default: false },
  imageProcessing: { type: Boolean, default: false },
  directoryData: {
    type: Array,
    required: true,
    default: []
  },
  formPlaceholders: {
    type: Object,
    required: false,
    default: () => ({
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
    })
  },
  micronationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
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
  supranationalMicronations: {
    type: Array,
    required: false,
    default: store.getters.micronations.filter((element) => element.supranational)
  }
})
const emit = defineEmits([
  'save-corrections',
  'edit-image-change',
  'image-error',
  'image-processing',
  'submission-success'
])
</script>

<template>
  <Transition name="opacity">
    <div
      class="new-entry-container"
      :class="{ 'new-entry-container--moderation': isModerationEditor }"
    >
      <div class="new-entry-content">
        <p v-if="!isModerationEditor" class="new-entry-intro">
          Please, carefully read instructions for all fields. Fields with an asterisk (*) are
          mandatory to fill, the others can be blank. <br />Help us save moderation efforts!
          <a href="mailto:themicronationaldirectory@gmail.com">Ask any question</a> if needed, and
          check the preview on the right.
        </p>
        <section v-if="!isModerationEditor" class="ai-assistant">
          <button
            type="button"
            class="ai-assistant-title"
            :aria-expanded="aiPanelOpen"
            aria-controls="ai-assistant-panel"
            @click="aiPanelOpen = !aiPanelOpen"
          >
            <span aria-hidden="true">✨</span>
            <span>AI-powered autocomplete</span>
            <ChevronDownIcon
              class="ai-assistant-chevron"
              :class="{ 'is-open': aiPanelOpen }"
              aria-hidden="true"
            />
          </button>
          <div
            id="ai-assistant-panel"
            class="ai-assistant-collapse"
            :class="{ 'is-open': aiPanelOpen }"
            :aria-hidden="!aiPanelOpen"
            :inert="!aiPanelOpen"
          >
            <div class="ai-assistant-content">
              <p>
                Paste a source URL or text, or upload an image/PDF. The assistant suggests fields
                for you to review.
              </p>
              <div class="ai-assistant-inputs">
                <textarea
                  v-model="aiSourceText"
                  rows="4"
                  maxlength="12000"
                  placeholder="Paste source text or a webpage URL"
                ></textarea>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.pdf"
                  @change="onAiFileChange"
                />
              </div>
              <button
                type="button"
                class="login-button short color-transition ai-action-button"
                :disabled="aiBusy || (!aiSourceText.trim() && !aiSourceFile)"
                @click="extractEntryWithAI"
              >
                <span v-if="aiBusy" class="submit-spinner" aria-hidden="true"></span>
                <span :role="aiBusy ? 'status' : null">{{
                  aiBusy ? 'Analyzing…' : 'Suggest form values'
                }}</span>
              </button>
            </div>
          </div>
        </section>
        <Transition name="duplicate-alert">
          <div
            v-if="!isModerationEditor && duplicateMicronation"
            class="entry-name-duplicate-alert"
            role="alert"
          >
            <strong>
              A micronation named
              <router-link
                class="duplicate-entry-link"
                :to="`/directory/${duplicateMicronation.name.main}`"
              >
                {{ duplicateMicronation.name.main }}
              </router-link>
              is already in the directory.
            </strong>
            <span>Check the existing entry before submitting this form.</span>
          </div>
        </Transition>

        <form class="listing-new-entry" @submit.prevent="addEntry">
          <div class="new-entry-form">
            <Transition name="fade">
              <HelpTooltip
                v-if="tooltipDisplay"
                @closed-tooltip="deactivateTooltip"
                :position="{ y: tooltipPosition.y, x: tooltipPosition.x }"
                :help-text="tooltipTexts[activeTooltipText]"
                :title="tooltipTitle"
              />
            </Transition>

            <label for="newEntryName" class="new-entry-form-text mandatory">
              Name*
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 0 ? '' : activateTooltip(0, 'Name', $event)"
              />
            </label>
            <input
              type="text"
              id="newEntryName"
              v-model="formPlaceholders.newEntryName"
              required
              :placeholder="
                entryType === 'micronation'
                  ? `E.g. 'Sealand' (just the short form)`
                  : `E.g. League of Micronations (full name)`
              "
            />

            <label
              v-if="entryType === 'micronation'"
              for="newEntryTitle"
              class="new-entry-form-text mandatory"
            >
              Title
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 1 ? '' : activateTooltip(1, 'Title', $event)"
              />
            </label>
            <input
              v-if="entryType === 'micronation'"
              type="text"
              id="newEntryTitle"
              v-model="formPlaceholders.newEntryTitle"
              placeholder="E.g. 'Principality of' (just the descriptive name only)"
            />

            <label
              v-if="entryType !== 'micronation'"
              for="newEntryNameAlt"
              class="new-entry-form-text"
            >
              {{ entryType === 'micronation' ? 'Alternative name' : 'Acronym*' }}
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 2 ? '' : activateTooltip(2, 'Alternative name', $event)
                "
              />
            </label>
            <input
              v-if="entryType !== 'micronation'"
              type="text"
              id="newEntryNameAlt"
              v-model="formPlaceholders.newEntryNameAlt"
              :placeholder="
                entryType === 'micronation'
                  ? 'Second option for name, e.g. in another language'
                  : 'Acronym of the organization, e.g. LoM'
              "
            />

            <template v-if="entryType === 'micronation'">
              <label for="newEntryAltNameMain" class="new-entry-form-text">
                Other names
                <img
                  src="/images/info.png"
                  alt="info"
                  class="tooltip-activator"
                  @click="activeTooltipIndex === 2 ? '' : activateTooltip(2, 'Other names', $event)"
                />
              </label>
              <div class="new-entry-option-container alternative-name-fields">
                <div class="alternative-name-inputs">
                  <input
                    id="newEntryAltNameMain"
                    v-model="currentAltNameMain"
                    type="text"
                    placeholder="Alternative name"
                  />
                  <input
                    v-model="currentAltNameTitle"
                    type="text"
                    placeholder="Alternative title (optional)"
                  />
                  <button
                    type="button"
                    class="login-button squared-button color-transition new-entry-option-button"
                    @click="addAlternativeName"
                  >
                    Add
                  </button>
                </div>
                <div class="selected-elements-container">
                  <SelectedElement
                    v-for="(name, i) in formPlaceholders.newEntryAltNames"
                    :key="i"
                    :element-text="name.title ? `${name.main}, ${name.title}` : name.main"
                    @remove-element="removeAlternativeName(i)"
                  />
                </div>
              </div>
            </template>

            <label for="newEntryMotto" class="new-entry-form-text mandatory">
              Motto
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 4 ? '' : activateTooltip(4, 'Motto', $event)"
              />
            </label>
            <input
              type="text"
              id="newEntryMotto"
              v-model="formPlaceholders.newEntryMotto"
              placeholder="E.g. 'In God we trust' (add without quotes)"
            />

            <label v-if="entryType === 'micronation'" class="new-entry-form-text mandatory">
              Type*
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 5 ? '' : activateTooltip(5, 'Type', $event)"
              />
            </label>
            <div v-if="entryType === 'micronation'" class="new-entry-type">
              <input
                type="checkbox"
                id="typePhysical"
                v-model="formPlaceholders.newEntryTypePhysical"
                name="new-entry-type"
                value="physical"
                @change="updatePhysicalType"
                @click="renderedMapboxNewEntry = true"
              />
              <label for="typePhysical">Physical</label>
              <input
                type="checkbox"
                id="typeDigital"
                v-model="formPlaceholders.newEntryTypeDigital"
                name="new-entry-type"
                value="digital"
                checked
              />
              <label for="typeDigital">Digital</label>
              <input
                type="checkbox"
                id="typeFictional"
                v-model="formPlaceholders.newEntryTypeFictional"
                name="new-entry-type"
                value="fictional"
              />
              <label for="typeFictional">Fictional</label>
            </div>

            <label for="newEntryLanguages" class="new-entry-form-text mandatory">
              Official languages*
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 6 ? '' : activateTooltip(6, 'Official languages', $event)
                "
              />
            </label>
            <div class="new-entry-option-container">
              <div class="new-entry-select-controls">
                <select
                  name="newEntryLanguages"
                  class="new-entry-option-select"
                  @change="addLanguage"
                >
                  <option value="" disabled selected>Select language</option>
                  <optgroup>
                    <option v-for="(language, i) in listLanguages" :key="i" :value="language.name">
                      {{ language.name }}
                    </option>
                  </optgroup>
                </select>
                <input type="text" placeholder="Custom language name" v-model="customLanguage" />
                <button
                  type="button"
                  class="login-button squared-button color-transition new-entry-option-button"
                  @click="addCustomLanguage"
                >
                  Add
                </button>
              </div>
              <div class="selected-elements-container">
                <SelectedElement
                  class="selection margin-top"
                  v-for="(language, i) in formPlaceholders.newEntryLanguages"
                  :key="i"
                  :element-text="language"
                  @remove-element="removeLanguage"
                />
              </div>
            </div>

            <label
              v-if="entryType === 'micronation'"
              for="newEntryCapital"
              class="new-entry-form-text"
            >
              Capital
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 7 ? '' : activateTooltip(7, 'Capital', $event)"
              />
            </label>
            <input
              v-if="entryType === 'micronation'"
              type="text"
              id="newEntryCapital"
              v-model="formPlaceholders.newEntryCapital"
              placeholder="City, place or building officiating as capital"
            />

            <label
              v-if="entryType === 'micronation'"
              for="newEntryCurrency"
              class="new-entry-form-text"
            >
              Currency
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 8 ? '' : activateTooltip(8, 'Currency', $event)"
              />
            </label>
            <input
              v-if="entryType === 'micronation'"
              type="text"
              id="newEntryCurrency"
              v-model="formPlaceholders.newEntryCurrency"
              placeholder="Official currency of the micronation, just name and not symbol"
            />

            <label for="newEntryFoundation" class="new-entry-form-text mandatory">
              Foundation*
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 9 ? '' : activateTooltip(9, 'Foundation', $event)"
              />
            </label>
            <VueDatePicker
              v-model="foundationDate"
              :enable-time-picker="false"
              :dark="theme === 'dark'"
              month-name-format="long"
              :flow="['year', 'month', 'calendar']"
              :utc="'preserve'"
              :timezone="'UTC'"
              now-button-label="Today"
              :required="true"
              :max-date="new Date()"
            />

            <label
              v-if="entryType === 'micronation'"
              v-show="physicalType"
              class="new-entry-form-text mandatory"
            >
              Location
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 10 ? '' : activateTooltip(10, 'Location', $event)"
              />
            </label>
            <div v-if="entryType === 'micronation'" v-show="physicalType">
              <p class="new-entry-location-note">
                Drag the pin to the micronation's location. Leave it at the default location (0, 0)
                if unknown.
              </p>
              <LocationPicker
                v-if="renderedMapboxNewEntry"
                :visible="!physicalType"
                ref="locationPicker"
                mode="picker"
                width="100%"
                height="300px"
                :initial-position="locationPickerMarkerPosition"
                @dragged-marker="draggedMarker"
              />
            </div>

            <label
              v-if="entryType === 'micronation'"
              for="newEntryMemberships"
              class="new-entry-form-text"
            >
              Memberships
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 11 ? '' : activateTooltip(11, 'Memberships', $event)"
              />
            </label>
            <div v-if="entryType === 'micronation'" class="new-entry-option-container">
              <div class="new-entry-select-controls">
                <select
                  name="newEntryMemberships"
                  class="new-entry-option-select"
                  @change="addMembership"
                >
                  <option value="" disabled selected>Select organization</option>
                  <optgroup>
                    <option
                      v-for="(membership, i) in organizationsDirectory"
                      :key="i"
                      :value="membership.name.main"
                    >
                      {{ membership.name.main }} ({{ membership.name.mainAlt }})
                    </option>
                  </optgroup>
                </select>
                <input
                  type="text"
                  placeholder="Other (full name, no acronym)"
                  v-model="customMembership"
                />
                <button
                  type="button"
                  class="login-button squared-button color-transition new-entry-option-button"
                  @click="addCustomMembership"
                >
                  Add
                </button>
              </div>
              <div class="selected-elements-container">
                <SelectedElement
                  class="selection margin-top"
                  v-for="(membership, i) in formPlaceholders.newEntryMemberships"
                  :key="i"
                  :element-text="membership"
                  @remove-element="removeMembership"
                />
              </div>
            </div>

            <label for="newEntryEmails" class="new-entry-form-text mandatory">
              Contact media*
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 12 ? '' : activateTooltip(12, 'Contact media', $event)
                "
              />
            </label>
            <div class="new-entry-option-container">
              <div style="display: flex">
                <input
                  type="text"
                  id="newEntryEmail"
                  class="new-entry-option-select"
                  v-model="currentEmail"
                  placeholder="Email, forum or social media (full URL!)"
                />
                <button
                  @click="addEmail(currentEmail)"
                  type="button"
                  class="login-button squared-button color-transition new-entry-option-button"
                >
                  Add
                </button>
              </div>
              <div class="selected-elements-container">
                <SelectedElement
                  class="selection margin-top"
                  v-for="(contact, i) in formPlaceholders.newEntryEmails"
                  :key="i"
                  :element-text="contact"
                  :icon="checkIcon(contact)"
                  @remove-element="removeEmail"
                />
              </div>
            </div>

            <label for="newEntryWebsites" class="new-entry-form-text mandatory">
              Info sources*
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 13 ? '' : activateTooltip(13, 'Info sources', $event)
                "
              />
            </label>
            <div class="new-entry-option-container">
              <div style="display: flex">
                <input
                  type="text"
                  id="newEntryWebsite"
                  class="new-entry-option-select"
                  v-model="currentWebsite"
                  placeholder="URL to website (include HTTP or HTTPS)"
                />
                <button
                  @click="addWebsite(currentWebsite)"
                  type="button"
                  class="login-button squared-button color-transition new-entry-option-button"
                >
                  Add
                </button>
              </div>
              <div class="selected-elements-container">
                <SelectedElement
                  class="selection margin-top"
                  v-for="(website, i) in formPlaceholders.newEntryWebsites"
                  :key="i"
                  :element-text="website"
                  :icon="checkIcon(website)"
                  @remove-element="removeWebsite"
                />
              </div>
            </div>

            <label for="newEntryFlag" class="new-entry-form-text mandatory">
              {{ entryType === 'micronation' ? 'Flag*' : 'Logo*' }}
              <img
                src="/images/info.png"
                alt="info"
                class="tooltip-activator"
                @click="activeTooltipIndex === 14 ? '' : activateTooltip(14, 'Flag', $event)"
              />
            </label>
            <div class="flag-preview-container">
              <img
                v-if="isModerationEditor && editImageValue"
                :src="editImageValue"
                class="moderation-edit-image-preview"
                :alt="entryType === 'micronation' ? 'Current flag' : 'Current logo'"
              />
              <ModerationImageEditor
                v-if="isModerationEditor"
                v-model="editImageValue"
                :initial-mode="initialImageMode"
                :image-name="formPlaceholders.newEntryName"
                :asset-type="entryType === 'micronation' ? 'flag' : 'logo'"
                @image-change="emit('edit-image-change', $event)"
                @image-error="emit('image-error', $event)"
                @image-processing="emit('image-processing', $event)"
              />
              <template v-else>
                <div style="display: flex; margin-bottom: 5px">
                  <label class="flag-radio">
                    <input v-model="flagRadio" type="radio" name="flagRadio" value="file" />
                    <span>Local file</span>
                  </label>
                  <label class="flag-radio">
                    <input v-model="flagRadio" type="radio" name="flagRadio" value="url" />
                    <span>External URL</span>
                  </label>
                </div>
                <input
                  v-model="formPlaceholders.newEntryFlag"
                  v-if="flagRadio === 'url'"
                  name="flagImage"
                  type="url"
                  ref="flagURLInput"
                  @input="displayImage($event.target.value)"
                  placeholder="Input a direct link to an external image"
                  :required="!directoryEdit"
                />
                <input
                  v-if="flagRadio === 'file'"
                  type="file"
                  @input="previewImage"
                  accept="image/png"
                  :required="!directoryEdit"
                />
                <label for=""
                  >(if N/A or unobtainable:
                  <a href="/images/missing-flag.png" target="_blank"
                    >download or use the URL to this template</a
                  >)
                </label>
              </template>
            </div>

            <div class="wide-row">
              <Recaptcha v-if="!isModerationEditor" @checkbox="checkRecaptcha" />
              <button
                id="addEntryButton"
                type="submit"
                :disabled="
                  isModerationEditor ? saving || imageProcessing : !passedRecaptcha || isSubmitting
                "
                :aria-busy="isModerationEditor ? saving : isSubmitting"
                class="login-button short color-transition"
              >
                <span
                  v-if="isSubmitting || (isModerationEditor && saving)"
                  class="submit-spinner"
                  aria-hidden="true"
                ></span>
                <span>{{
                  isModerationEditor
                    ? saving
                      ? 'Saving corrections…'
                      : 'Save corrections'
                    : isSubmitting
                    ? directoryEdit ? 'Submitting edit…' : 'Submitting…'
                    : directoryEdit ? 'Submit edit for approval' : 'Add new entry'
                }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div v-if="!isModerationEditor" class="new-entry-preview">
        <h3 id="previewTitle">Entry preview</h3>

        <DirectoryEntry
          v-if="entryType === 'micronation'"
          :always-expanded="true"
          :width="180"
          :flag-height="180 * 0.6"
          view-mode="micronations"
          :micronations-directory="micronationsDirectory"
          :organizations-directory="organizationsDirectory"
          :visible-organizations="visibleOrganizations"
          :supranational-micronations="supranationalMicronations"
          :disable-full-profile-button="true"
          :info="{
            name: {
              main: formPlaceholders.newEntryName,
              alt: formPlaceholders.newEntryAltNames,
              title: formPlaceholders.newEntryTitle,
              titleAlt: formPlaceholders.newEntryTitleAlt
            },
            flag: flagPreview,
            motto: formPlaceholders.newEntryMotto,
            type: checkTypes,
            languages: formPlaceholders.newEntryLanguages,
            capital: formPlaceholders.newEntryCapital,
            currency: formPlaceholders.newEntryCurrency,
            foundationDate: { seconds: Math.floor(new Date(foundationDate).getTime() / 1000) },
            memberships: formPlaceholders.newEntryMemberships,
            contactInfo: formPlaceholders.newEntryEmails,
            websites: formPlaceholders.newEntryWebsites,
            approved: true
          }"
        />
        <OrganizationEntry
          v-if="entryType === 'organization'"
          :always-expanded="true"
          :width="180"
          :flag-height="180 * 0.6"
          view-mode="micronations"
          :micronations-directory="micronationsDirectory"
          :info="{
            name: {
              main: formPlaceholders.newEntryName,
              mainAlt: formPlaceholders.newEntryNameAlt
            },
            logo: flagPreview,
            motto: formPlaceholders.newEntryMotto,
            languages: formPlaceholders.newEntryLanguages,
            foundationDate: { seconds: Math.floor(new Date(foundationDate).getTime() / 1000) },
            contactInfo: formPlaceholders.newEntryEmails,
            websites: formPlaceholders.newEntryWebsites,
            approved: true
          }"
        />
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'NewEntryForm',
  components: {
    VueDatePicker,
    Recaptcha,
    SelectedElement,
    DirectoryEntry,
    OrganizationEntry,
    HelpTooltip
  },
  data() {
    const entry = this.initialEntry || {}
    const location = entry.location || {}
    const foundationDate = entry.foundationDate
    const foundationSeconds = foundationDate?._seconds ?? foundationDate?.seconds
    return {
      foundationDate:
        foundationDate == null
          ? null
          : foundationSeconds != null
          ? new Date(foundationSeconds * 1000)
          : new Date(foundationDate),
      flagSource: '',
      flagPreview: entry.flag || entry.logo || '',
      editImageValue: entry.flag || entry.logo || '',
      flagRadio: 'file',
      passedRecaptcha: false,
      isSubmitting: false,
      aiPanelOpen: true,
      aiSourceText: '',
      aiSourceFile: null,
      aiBusy: false,
      customLanguage: '',
      customMembership: '',
      currentAltNameMain: '',
      currentAltNameTitle: '',
      currentEmail: '',
      currentWebsite: '',
      locationPickerMarkerPosition: [
        Number(location.longitude ?? 0),
        Number(location.latitude ?? 0)
      ],
      renderedMapboxNewEntry: !!this.isModerationEditor && (entry.type || []).includes('Physical'),
      physicalType: !!this.isModerationEditor && (entry.type || []).includes('Physical'),
      tooltipDisplay: false,
      tooltipPosition: {
        x: 0,
        y: 0
      },
      tooltipTitle: '',
      tooltipTexts: [
        "This should be the most common, shortest variant of the name, barely the proper name itself. Take 'Sealand', 'Hutt River' or 'Denmark' as examples. Ideally, use the main official language version or an English one if available.",
        "Here, the descriptive rest of the full name's composition should be added, excluding the main name added above. Barely 'Principality of' or 'Republic of' are some examples of proper cases. There may be some cases, like 'Athenian Republic', in which this field remains blank and only 'Name' is filled. Avoid adding 'The' and words that serve the same meaning at the beginning.",
        'Other official or commonly used names, including names in other languages. Add the corresponding title when applicable.',
        "Same as 'Title', but input it in another language. To follow above's example, 'Respubliko de la' could be placed here.",
        'Official, national motto. Be sure to NOT add quotes of any kind. The proper way to populate the field is placing the motto in whatever language it is, and then adding the English translation between parenthesis if available. For instance, a valid input is: Vivat Rex (Long Live the King).',
        "The 'Type' of the micronation applies in regard of its kind of (non) territorial claim. Micronations that claim territory on Earth or other real-world elements are 'Physical', the ones that exist solely on the Internet and don't have actual land pretensions are 'Digital', while cases that live on simulated or fantasy worlds are 'Fictional'. More than one type can be checked, for sure.",
        "Official languages spoken. Can be also extended to other national and/or recognized languages. If there isn't any, place the de facto language or the one used by representatives on websites and social media.",
        "Physical, digital or fictional city or any kind of place officiating as the micronation's capital. If there's more than one, then add all of them separated by commas.",
        "Currency (or currencies) legally adopted and accepted, they could be purported as well, either physical and digital. Some micronations even include macronational fiat currencies, and they are applicable as well. If there's more than one, then add all of them separated by commas. DO NOT include their symbols between parenthesis, e.g. (K$).",
        "The full founding date. If there's not enough information to input a full date, select the first day of the available timespan data. For instance, if it's only known that it was founded on 1997, input January 1, 1997. If a foundation is stated on August, 2004, select August 1, 2004.",
        "The micronation's location of its territorial claims. There is no possibility for selecting polygonal ranges, only geopoint pins. So, for large territorial claims, you can mark the capital or even the leader's approximate location. In any case not applicable, just leave the blue pin as is.",
        "Supramicronational organizations that this micronation is currently a member of AND also was a member of in the past. There is no possibility to indicate membership type, so full members, partial members, observer members and any other kind of distinctive cases should be added alike. On the 'Other' subfield you can add organizations that are not present on our directory, and also the main name of another micronation in case this one is a constituent country/nation.",
        'Any communication media should be added here. This includes email addresses, social media profiles (adding the full URL, not just the username), links to chat or group invitation, forums and other similar platforms.',
        'Complete the field by adding websites that contain relevant info. This should always include official websites (if available), wiki or news articles, and unofficial websites where data was gathered from. If you come across a dead website, check it out using https://web.archive.org/ and if there is a saved snapshot, add its link here instead.',
        'Upload a PNG or provide a direct image URL. External PNG, JPEG, and WebP images are downloaded and converted to PNG when submitted, then compressed to fit within the ~35 KB limit. In the majority of cases, the national flag should be chosen here, but it could be that the State flag or even civil flag is the prevalent one. There is no possibility for adding more than one flag (e.g. co-official flags), so the most prevalent one should be added. Always add the latest and current version.'
      ],
      activeTooltipText: 0
    }
  },
  watch: {
    formPlaceholders(newValue) {
      if (!this.isModerationEditor) this.displayImage(newValue.newEntryFlag)
    }
  },
  computed: {
    listLanguages() {
      let languagesArray = []
      const sortedLanguageCodes = languages().getLanguageCodes().sort()

      sortedLanguageCodes.forEach(function (element) {
        languagesArray.push({
          code: element,
          name: languages().getLanguageName(element)
        })
      })

      return languagesArray
    },
    checkTypes() {
      let typesArray = []
      if (this.formPlaceholders.newEntryTypePhysical) {
        typesArray.push('Physical')
      }
      if (this.formPlaceholders.newEntryTypeDigital) {
        typesArray.push('Digital')
      }
      if (this.formPlaceholders.newEntryTypeFictional) {
        typesArray.push('Fictional')
      }

      return typesArray
    },
    duplicateMicronation() {
      const enteredName = this.formPlaceholders.newEntryName.trim()
      if (this.entryType !== 'micronation' || !enteredName) return null
      return (
        this.directoryData.find((entry) =>
          [
            entry.name?.main,
            ...(entry.name?.alt || []).map((name) => name.main),
            entry.name?.mainAlt
          ].some((name) => this.matchesWholeWords(name, enteredName))
        ) || null
      )
    }
  },
  methods: {
    async addEntry() {
      const that = this

      if (this.isModerationEditor) {
        if (!this.formPlaceholders.newEntryName.trim()) {
          return notify({
            title: 'Cannot save entry',
            text: 'The official name is required.',
            type: 'error'
          })
        }
        if (!this.formPlaceholders.newEntryLanguages.length) {
          return notify({
            title: 'Cannot save entry',
            text: 'Add at least one official language.',
            type: 'error'
          })
        }
        if (!this.formPlaceholders.newEntryWebsites.length) {
          return notify({
            title: 'Cannot save entry',
            text: 'Add at least one information source.',
            type: 'error'
          })
        }
        const entryData = {
          name:
            this.entryType === 'micronation'
              ? {
                  main: this.formPlaceholders.newEntryName,
                  title: this.formPlaceholders.newEntryTitle,
                  alt: [...(this.formPlaceholders.newEntryAltNames || [])]
                }
              : {
                  main: this.formPlaceholders.newEntryName,
                  mainAlt: this.formPlaceholders.newEntryNameAlt
                },
          motto: this.formPlaceholders.newEntryMotto,
          languages: [...this.formPlaceholders.newEntryLanguages],
          contactInfo: [...this.formPlaceholders.newEntryEmails],
          websites: [...this.formPlaceholders.newEntryWebsites],
          foundationDate: this.foundationDate
            ? { seconds: Math.floor(new Date(this.foundationDate).getTime() / 1000) }
            : null
        }
        if (this.entryType === 'micronation') {
          entryData.type = this.checkTypes
          entryData.capital = this.formPlaceholders.newEntryCapital
          entryData.currency = this.formPlaceholders.newEntryCurrency
          entryData.memberships = [...this.formPlaceholders.newEntryMemberships]
          entryData.location = this.physicalType
            ? {
                latitude: Number(this.locationPickerMarkerPosition[1]),
                longitude: Number(this.locationPickerMarkerPosition[0])
              }
            : null
        }
        this.$emit('save-corrections', entryData)
        return
      }

      if (this.isSubmitting) return

      if (this.formPlaceholders.newEntryWebsites.length === 0) {
        return notify({
          title: 'Error when submitting',
          text: "No info source link was provided. It's mandatory to include at least one to validate all the info that was input.",
          type: 'error'
        })
      }

      if (this.formPlaceholders.newEntryLanguages.length === 0) {
        return notify({
          title: 'Error when submitting',
          text: "No official languages were added. If there aren't any, add the main one used within the micronation.",
          type: 'error'
        })
      }

      if (this.directoryEdit || this.searchElement(this.formPlaceholders.newEntryName) === undefined) {
        this.isSubmitting = true
        try {
          // Prepare entry data
          const entryData = {
            ...(this.directoryEdit ? JSON.parse(JSON.stringify(this.initialEntry || {})) : {}),
            id: this.directoryEdit ? this.editTargetId : createFirestoreStyleId(),
            name:
              this.entryType === 'micronation'
                ? {
                    main: this.formPlaceholders.newEntryName,
                    title: this.formPlaceholders.newEntryTitle,
                    titleAlt: this.formPlaceholders.newEntryTitleAlt,
                    alt: [...(this.formPlaceholders.newEntryAltNames || [])]
                  }
                : {
                    main: this.formPlaceholders.newEntryName,
                    mainAlt: this.formPlaceholders.newEntryNameAlt
                  },
            motto: this.formPlaceholders.newEntryMotto,
            languages: this.formPlaceholders.newEntryLanguages,
            contactInfo: this.formPlaceholders.newEntryEmails,
            websites: this.formPlaceholders.newEntryWebsites,
            author: { name: auth.currentUser.displayName, email: auth.currentUser.email },
            foundationDate: this.foundationDate
          }

          if (this.entryType === 'micronation') {
            entryData.type = this.checkTypes
            entryData.capital = this.formPlaceholders.newEntryCapital
            entryData.currency = this.formPlaceholders.newEntryCurrency
            entryData.memberships = this.formPlaceholders.newEntryMemberships

            entryData.location = this.physicalType
              ? {
                latitude: this.locationPickerMarkerPosition[1],
                longitude: this.locationPickerMarkerPosition[0]
              }
              : null

            // Handle flag file
            const imageFile = await this.getImageFileForSubmission()
            if (imageFile) {
              // Preserve more source detail while keeping the encoded image
              // below githubFunctions' 50,000 character issue-body limit.
              const options = {
                maxSizeMB: 0.035,
                maxWidthOrHeight: 2560,
                useWebWorker: true,
                fileType: 'image/png'
              }
              const compressedFile = await imageCompression(imageFile, options)
              const base64Data = await this.fileToBase64(compressedFile)
              entryData.flagFile = {
                name: `${this.formPlaceholders.newEntryName}${this.directoryEdit ? `-${Date.now()}` : ''}.png`,
                data: base64Data
              }
            }
          } else if (this.entryType === 'organization') {
            // Handle logo file
            const imageFile = await this.getImageFileForSubmission()
            if (imageFile) {
              // Preserve more source detail while keeping the encoded image
              // below githubFunctions' 50,000 character issue-body limit.
              const options = {
                maxSizeMB: 0.035,
                maxWidthOrHeight: 2560,
                useWebWorker: true,
                fileType: 'image/png'
              }
              const compressedFile = await imageCompression(imageFile, options)
              const base64Data = await this.fileToBase64(compressedFile)
              entryData.logoFile = {
                name: `${this.formPlaceholders.newEntryName}${this.directoryEdit ? `-${Date.now()}` : ''}.png`,
                data: base64Data
              }
            }
          }

          // Add an optional AI triage note; it never makes the moderation decision.
          const reviewEntry = { ...entryData }
          delete reviewEntry.author
          delete reviewEntry.flagFile
          delete reviewEntry.logoFile
          try {
            const reviewResponse = await fetch('/api/ai-assistant', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'review',
                entryType: this.entryType,
                entry: reviewEntry
              })
            })
            const reviewPayload = await reviewResponse.json().catch(() => ({}))
            if (!reviewResponse.ok) {
              throw new Error(
                reviewPayload.error ||
                  `AI preliminary review failed (HTTP ${reviewResponse.status}).`
              )
            }
            if (!reviewPayload.review || !Array.isArray(reviewPayload.review.checks)) {
              throw new Error('The AI preliminary review returned an invalid response.')
            }
            entryData.aiReview = reviewPayload.review
          } catch (reviewError) {
            console.warn(
              'AI preliminary review was unavailable; submitting without it.',
              reviewError
            )
          }

          // Create GitHub issue
          await createGitHubIssue(entryData, this.entryType, this.directoryEdit ? { editTargetId: this.editTargetId } : {})

          this.emailNotice()
          this.successNotification()
          this.$emit('submission-success')
        } catch (error) {
          console.error('Error submitting entry:', error)
          notify({
            title: 'Error when submitting',
            text: error.message || 'Failed to submit entry. Please try again.',
            type: 'error'
          })
        } finally {
          this.isSubmitting = false
        }
      } else {
        notify({
          title: 'Error when submitting',
          text: 'This micronation or organization is already present in the directory! If not, then an entry for it was recently submitted and is still under review.',
          type: 'error'
        })
      }
    },
    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    },
    onAiFileChange(event) {
      const file = event.target.files?.[0] || null
      if (file && file.size > 3 * 1024 * 1024) {
        event.target.value = ''
        this.aiSourceFile = null
        return notify({
          title: 'AI assistant',
          text: 'Choose an image or PDF smaller than 3 MB.',
          type: 'error'
        })
      }
      this.aiSourceFile = file
    },
    async extractEntryWithAI() {
      if (this.aiBusy) return
      this.aiBusy = true
      try {
        let file
        if (this.aiSourceFile) {
          file = {
            name: this.aiSourceFile.name,
            mimeType: this.aiSourceFile.type || 'application/octet-stream',
            data: await this.fileToBase64(this.aiSourceFile)
          }
        }
        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'extract',
            entryType: this.entryType,
            text: this.aiSourceText,
            file
          })
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'AI extraction failed.')

        const entry = payload.entry || {}
        const name = typeof entry.name === 'string' ? { main: entry.name } : entry.name || {}
        if (name.main) this.formPlaceholders.newEntryName = name.main
        if (this.entryType === 'micronation') {
          if (name.title != null) this.formPlaceholders.newEntryTitle = name.title
          if (Array.isArray(name.alt)) this.formPlaceholders.newEntryAltNames = name.alt
          if (entry.capital != null) this.formPlaceholders.newEntryCapital = entry.capital
          if (entry.currency != null) this.formPlaceholders.newEntryCurrency = entry.currency
          if (Array.isArray(entry.memberships))
            this.formPlaceholders.newEntryMemberships = entry.memberships
          if (Array.isArray(entry.type)) {
            this.formPlaceholders.newEntryTypePhysical = entry.type.includes('Physical')
            this.formPlaceholders.newEntryTypeDigital = entry.type.includes('Digital')
            this.formPlaceholders.newEntryTypeFictional = entry.type.includes('Fictional')
            this.physicalType = this.formPlaceholders.newEntryTypePhysical
            if (this.physicalType) this.renderedMapboxNewEntry = true
          }
        } else if (name.mainAlt != null) {
          this.formPlaceholders.newEntryNameAlt = name.mainAlt
        }
        if (entry.motto != null) this.formPlaceholders.newEntryMotto = entry.motto
        if (Array.isArray(entry.languages))
          this.formPlaceholders.newEntryLanguages = entry.languages
        if (Array.isArray(entry.contactInfo))
          this.formPlaceholders.newEntryEmails = entry.contactInfo
        if (Array.isArray(entry.websites)) this.formPlaceholders.newEntryWebsites = entry.websites
        if (entry.foundationDate) {
          const date = new Date(entry.foundationDate)
          if (!Number.isNaN(date.getTime())) this.foundationDate = date
        }

        const imageUrl = this.entryType === 'micronation' ? entry.flag : entry.logo
        if (imageUrl) {
          this.flagRadio = 'url'
          this.formPlaceholders.newEntryFlag = imageUrl
          await this.displayImage(imageUrl)
        }

        notify({
          title: 'AI suggestions ready',
          text: 'Review every suggested value and correct anything inaccurate.',
          type: 'success'
        })
      } catch (error) {
        notify({
          title: 'AI assistant',
          text: error.message || 'Could not analyze this resource.',
          type: 'error'
        })
      } finally {
        this.aiBusy = false
      }
    },
    searchElement(value) {
      const normalizedName = value.trim().toLocaleLowerCase()
      return this.directoryData.find((entry) => {
        if (this.entryType === 'micronation') {
          return [
            entry.name?.main,
            ...(entry.name?.alt || []).map((name) => name.main),
            entry.name?.mainAlt
          ].some((name) => this.matchesWholeWords(name, normalizedName))
        }
        return entry.name?.main?.trim().toLocaleLowerCase() === normalizedName
      })
    },
    matchesWholeWords(existingName, query) {
      if (!existingName || !query) return false
      const normalize = (value) =>
        value
          .normalize('NFKC')
          .toLocaleLowerCase()
          .match(/[\p{L}\p{N}]+/gu)
          ?.join(' ') || ''

      return normalize(existingName) === normalize(query)
    },
    async checkRecaptcha(value) {
      this.passedRecaptcha = value
    },
    addLanguage(event) {
      const lang = event.target.value
      if (lang === 'custom') this.addCustomLanguage()
      else if (lang && !this.formPlaceholders.newEntryLanguages.includes(lang))
        this.formPlaceholders.newEntryLanguages.push(lang)
      event.target.value = ''
    },
    addAlternativeName() {
      const main = this.currentAltNameMain.trim()
      if (!main) return
      this.formPlaceholders.newEntryAltNames.push({ main, title: this.currentAltNameTitle.trim() })
      this.currentAltNameMain = ''
      this.currentAltNameTitle = ''
    },
    removeAlternativeName(index) {
      this.formPlaceholders.newEntryAltNames.splice(index, 1)
    },
    addMembership(event) {
      const membership = event.target.value
      if (membership === 'custom') this.addCustomMembership()
      else if (membership && !this.formPlaceholders.newEntryMemberships.includes(membership))
        this.formPlaceholders.newEntryMemberships.push(membership)
      event.target.value = ''
    },
    addCustomLanguage() {
      const language = this.customLanguage.trim()
      if (language && !this.formPlaceholders.newEntryLanguages.includes(language)) {
        this.formPlaceholders.newEntryLanguages.push(language)
      }
      this.customLanguage = ''
    },
    addCustomMembership() {
      const membership = this.customMembership.trim()
      if (membership && !this.formPlaceholders.newEntryMemberships.includes(membership)) {
        this.formPlaceholders.newEntryMemberships.push(membership)
      }
      this.customMembership = ''
    },
    emailNotice() {
      if (this.directoryEdit) return
      const that = this
      if (auth.currentUser && auth.currentUser.email !== 'themicronationaldirectory@gmail.com') {
        emailjs.send(
          'service_gd9nz5x',
          'template_wnd0ghn',
          {
            user: auth.currentUser.email,
            micronation: that.formPlaceholders.newEntryName
          },
          'P8-p_r-gTZedo_h84'
        )
      }
    },
    activateTooltip(tooltipIndex, title, event) {
      this.tooltipDisplay = true
      this.tooltipPosition = {
        x: Math.max(12, Math.min(event.clientX + 12, window.innerWidth - 352)),
        y: Math.max(12, Math.min(event.clientY + 12, window.innerHeight * 0.3))
      }
      this.tooltipTitle = title
      this.activeTooltipText = tooltipIndex
    },
    deactivateTooltip() {
      this.tooltipDisplay = false
      this.tooltipPosition = {
        x: 0,
        y: 0
      }
    },
    successNotification() {
      notify({
        title: this.directoryEdit ? 'Edit submitted' : 'Submission successful',
        text: this.directoryEdit
          ? 'Your proposed changes are awaiting moderator approval.'
          : 'The entry was successfully submitted! Now awaits approval from the admin (please allow up to 72 hours).',
        type: 'success'
      })
    },
    removeLanguage(value) {
      this.formPlaceholders.newEntryLanguages.splice(
        this.formPlaceholders.newEntryLanguages.indexOf(value),
        1
      )
    },
    removeMembership(value) {
      this.formPlaceholders.newEntryMemberships.splice(
        this.formPlaceholders.newEntryMemberships.indexOf(value),
        1
      )
    },
    removeEmail(value) {
      this.formPlaceholders.newEntryEmails.splice(
        this.formPlaceholders.newEntryEmails.indexOf(value),
        1
      )
    },
    removeWebsite(value) {
      this.formPlaceholders.newEntryWebsites.splice(
        this.formPlaceholders.newEntryWebsites.indexOf(value),
        1
      )
    },
    addEmail(value) {
      this.formPlaceholders.newEntryEmails.push(value)
      this.currentEmail = ''
    },
    addWebsite(value) {
      this.formPlaceholders.newEntryWebsites.push(value)
      this.currentWebsite = ''
    },
    draggedMarker(newPosition) {
      this.locationPickerMarkerPosition = newPosition
    },
    updatePhysicalType() {
      this.physicalType = !this.physicalType
    },
    async getImageFileForSubmission() {
      if (this.flagRadio !== 'url') return this.flagSource || null

      const url = this.formPlaceholders.newEntryFlag.trim()
      if (!url) throw new Error('Enter a direct link to the flag/logo image.')
      let parsedUrl
      try {
        parsedUrl = new URL(url)
      } catch {
        throw new Error('Enter a valid image URL.')
      }
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('The image URL must use HTTP or HTTPS.')
      }

      const response = await fetch(parsedUrl.href)
      if (!response.ok) throw new Error(`Could not download the image (HTTP ${response.status}).`)
      const blob = await response.blob()
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(blob.type) || !blob.size) {
        throw new Error('The URL must return a PNG, JPEG, or WebP image.')
      }
      const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type.split('/')[1].split('+')[0]
      return new File([blob], `image.${extension || 'png'}`, { type: blob.type })
    },
    previewImage(event) {
      this.flagSource = event.target.files[0]
      this.flagPreview = URL.createObjectURL(this.flagSource)
    },
    async displayImage(value) {
      if (!value) {
        this.flagSource = ''
        this.flagPreview = ''
        return
      }
      try {
        const file = await this.getImageFileForSubmission()
        this.flagSource = file
        this.flagPreview = URL.createObjectURL(file)
      } catch {
        // Submission performs the authoritative fetch and reports a useful error.
      }
    }
  }
}
</script>

<style scoped>
.new-entry-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
  align-items: start;
  gap: clamp(20px, 3vw, 40px);
  margin-top: 18px;
  padding: clamp(18px, 3vw, 32px);
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-soft);
}

.new-entry-container--moderation {
  display: block;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.new-entry-container--moderation .new-entry-form {
  margin-bottom: 0;
}

.new-entry-container--moderation .wide-row {
  grid-column: 1 / -1;
}

.moderation-edit-image-preview {
  display: block;
  width: 100%;
  max-height: 260px;
  margin-bottom: 12px;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
}

.new-entry-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.new-entry-intro {
  margin: 0 0 10px;
  padding: 14px 16px;
  color: var(--color-muted);
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.ai-assistant {
  display: grid;
  gap: 0;
  margin: 0 0 14px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background-soft);
}

.ai-assistant p {
  margin: 0;
}
.ai-assistant-title {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-heading);
  font-size: 1.17em;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.ai-assistant-title > span:first-child {
  font-size: 1.1em;
}
.ai-assistant-title:focus-visible {
  outline: 2px solid var(--color-border-hover);
  outline-offset: 4px;
  border-radius: 2px;
}
.ai-assistant-chevron {
  width: 20px;
  height: 20px;
  margin-left: auto;
  color: var(--color-muted);
  transition: transform 220ms ease;
}
.ai-assistant-chevron.is-open {
  transform: rotate(180deg);
}
.ai-assistant-collapse {
  display: grid;
  grid-template-rows: 0fr;
  margin-top: 0;
  opacity: 0;
  transition:
    grid-template-rows 260ms cubic-bezier(0.2, 0.7, 0.2, 1),
    margin-top 220ms ease,
    opacity 180ms ease;
}
.ai-assistant-collapse.is-open {
  grid-template-rows: 1fr;
  margin-top: 8px;
  opacity: 1;
}
.ai-assistant-content {
  display: grid;
  min-height: 0;
  gap: 8px;
  overflow: hidden;
}
.ai-assistant-inputs {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 1fr);
  align-items: start;
  gap: 10px;
}
.ai-assistant textarea {
  width: 100%;
  min-height: 112px;
  box-sizing: border-box;
  resize: vertical;
}
.ai-assistant-inputs input[type='file'] {
  width: 100%;
  height: auto;
  min-height: 0;
  align-self: start;
  box-sizing: border-box;
  padding: 12px;
  border: 1px dashed var(--color-border-hover);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.ai-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ai-review {
  line-height: 1.5;
}

.entry-name-duplicate-alert {
  display: grid;
  gap: 3px;
  margin: 0 0 12px;
  padding: 12px 14px;
  border: 1px solid #f3b2b2;
  border-left: 4px solid #d94b4b;
  border-radius: var(--radius-md);
  color: #8f2929;
  background: #fff0f0;
  font-size: 13px;
  line-height: 1.4;
}

.entry-name-duplicate-alert strong {
  font-weight: 750;
}

.duplicate-entry-link {
  color: #2459b8;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.duplicate-entry-link:hover {
  color: #163d86;
}

.duplicate-alert-enter-active,
.duplicate-alert-leave-active {
  overflow: hidden;
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    margin 180ms ease,
    padding 180ms ease;
}

.duplicate-alert-enter-from,
.duplicate-alert-leave-to {
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .duplicate-alert-enter-active,
  .duplicate-alert-leave-active {
    transition-duration: 1ms;
  }
}

.listing-new-entry {
  display: flex;
  flex-direction: column;
}

#newEntryOpener {
  margin-right: 10px;
  margin-top: 15px;
}

.new-entry-form {
  display: grid;
  grid-template-columns: minmax(150px, 0.32fr) minmax(0, 1fr);
  align-items: center;
  column-gap: clamp(14px, 2vw, 26px);
  row-gap: 12px;
  margin: 8px 0 15px;
}

.new-entry-option-container {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-bottom: 0;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background-soft);
}

.alternative-name-fields {
  min-width: 0;
}

.alternative-name-inputs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.alternative-name-inputs > input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 44px;
}

.new-entry-option-select {
  width: 100%;
  min-width: 0;
  margin-right: 6px;
}

.new-entry-select-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.new-entry-select-controls > * {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  margin: 0;
}

.new-entry-option-button {
  width: auto;
  min-width: 76px;
  min-height: 42px;
  padding: 7px 16px;
}

.selected-elements-container {
  display: flex;
  flex-wrap: wrap;
}

.selected-elements-container:not(:empty) {
  gap: 6px;
  margin-top: 8px;
}

.new-entry-form-text {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-heading);
}

.new-entry-location-note {
  margin: 0 0 8px;
  color: var(--color-muted);
  font-size: 12px;
}

div.new-entry-type {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0;
  row-gap: 8px;
  padding: 8px 0;
}

.new-entry-type label,
.flag-radio {
  cursor: pointer;
}

.new-entry-type input[type='checkbox'] {
  margin-right: 5px;
}

.new-entry-type label {
  margin-right: 14px;
}

.new-entry-form > input[type='text'],
.new-entry-form > input[type='url'],
.new-entry-form > input[type='email'],
.new-entry-form > input[type='date'] {
  width: 100%;
  min-height: 44px;
}

.new-entry-form :deep(.dp__main) {
  width: 100%;
}

.new-entry-form :deep(.dp__input) {
  min-height: 44px;
  border-radius: var(--radius-md);
}

.flag-preview {
  max-width: 100%;
  max-height: 200px;
}

.wide-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-column: span 2;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

#addEntryButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
  min-height: 48px;
  box-shadow: var(--shadow-soft);
}

#addEntryButton:disabled {
  cursor: wait;
  opacity: 0.78;
}

.submit-spinner {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: submit-spin 0.7s linear infinite;
}

@keyframes submit-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .submit-spinner {
    animation-duration: 1.8s;
  }
}

.new-entry-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: sticky;
  top: 18px;
  width: 100%;
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-background-soft);
}

.new-entry-preview p {
  text-align: center;
}

.tooltip-activator {
  margin-left: 4px;
  width: 16px;
  cursor: pointer;
  vertical-align: middle;
}

.flag-preview-container {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.flag-preview-container input[type='file'] {
  width: 100%;
  padding: 10px;
  border: 1px dashed var(--color-border-hover);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
}

.flag-preview-container > label {
  color: var(--color-muted);
  font-size: 13px;
}

.flag-radio {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

@media (max-width: 900px) {
  .new-entry-container {
    grid-template-columns: minmax(0, 1fr);
  }

  .new-entry-preview {
    position: static;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .ai-assistant-inputs {
    grid-template-columns: minmax(0, 1fr);
  }

  .new-entry-container {
    gap: 18px;
    padding: 14px;
    border-radius: var(--radius-xl);
  }

  .new-entry-form {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 6px;
  }

  .new-entry-form-text {
    margin-top: 8px;
  }

  .new-entry-form > input,
  .new-entry-form > :deep(.dp__main),
  .new-entry-form > .new-entry-option-container,
  .new-entry-form > .new-entry-type,
  .new-entry-form > div,
  .wide-row {
    grid-column: 1;
  }

  .new-entry-option-container > div:first-child {
    flex-wrap: wrap;
    gap: 6px;
  }

  .alternative-name-inputs {
    grid-template-columns: minmax(0, 1fr);
  }

  .alternative-name-inputs .new-entry-option-button {
    width: 100%;
  }

  .new-entry-select-controls {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .new-entry-select-controls select {
    grid-column: 1 / -1;
  }

  .new-entry-option-container > div:first-child > * {
    flex: 1 1 100%;
    margin: 0;
  }

  .new-entry-option-button {
    width: 100%;
  }
}
</style>
