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
import UncertaintyToggle from './UncertaintyToggle.vue'
import { createGitHubIssue } from '../utils/githubFunctions.js'
import { createFirestoreStyleId } from '../utils/firestoreStyleId.js'
import { buildTooltipTexts } from '../utils/entryFieldGuidance.js'
import {
  matchesWholeWords as matchWholeNameWords,
  micronationNameVariants
} from '../utils/nameMatching.mjs'
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
  publishedEntry: { type: Object, default: null },
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
          {{ $t('entryForm.readInstructionsBeforeUncertainty') }}
          <UncertaintyToggle :active="true" disabled style="margin: 0 4px" />
          <span v-html="$t('entryForm.readInstructionsAfterUncertainty')"></span>
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
            <span>{{ $t('entryForm.aiTitle') }}</span>
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
                {{ $t('entryForm.aiDescription') }}
              </p>
              <div class="ai-assistant-inputs">
                <textarea
                  v-model="aiSourceText"
                  rows="4"
                  maxlength="12000"
                  :placeholder="$t('entryForm.aiPlaceholder')"
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
                  $t(aiBusy ? 'entryForm.analyzing' : 'entryForm.suggestValues')
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
              {{ $t('entryForm.duplicateStart') }}
              <router-link
                class="duplicate-entry-link"
                :to="`/directory/${duplicateMicronation.name.main}`"
              >
                {{ duplicateMicronation.name.main }}
              </router-link>
              {{ $t('entryForm.duplicateEnd') }}
            </strong>
            <span>{{ $t('entryForm.checkExisting') }}</span>
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

            <label for="newEntryName" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t('entryForm.name') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 0 ? '' : activateTooltip(0, 'Name', $event)"
              />
            </label>
            <div
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.main') }"
            >
              <UncertaintyToggle
                :active="isUncertain('name.main')"
                @toggle="toggleUncertain('name.main')"
              />
              <input
                type="text"
                id="newEntryName"
                v-model="formPlaceholders.newEntryName"
                required
                :placeholder="
                  entryType === 'micronation'
                    ? $t('entryForm.micronationNamePlaceholder')
                    : $t('entryForm.organizationNamePlaceholder')
                "
              />
            </div>

            <label
              v-if="entryType === 'micronation'"
              for="newEntryTitle"
              class="new-entry-form-text mandatory"
            ><span class="new-entry-label-content">
              {{ $t('entryForm.title') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 1 ? '' : activateTooltip(1, 'Title', $event)"
              />
            </label>
            <div
              v-if="entryType === 'micronation'"
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.title') }"
            >
              <UncertaintyToggle
                :active="isUncertain('name.title')"
                @toggle="toggleUncertain('name.title')"
              />
              <input
                type="text"
                id="newEntryTitle"
                v-model="formPlaceholders.newEntryTitle"
                :placeholder="$t('entryForm.titlePlaceholder')"
              />
            </div>

            <label
              v-if="entryType !== 'micronation'"
              for="newEntryNameAlt"
              class="new-entry-form-text"
            ><span class="new-entry-label-content">
              {{
                $t(entryType === 'micronation' ? 'entryForm.alternativeName' : 'entryForm.acronym')
              }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 2 ? '' : activateTooltip(2, 'Alternative name', $event)
                "
              />
            </label>
            <div
              v-if="entryType !== 'micronation'"
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.mainAlt') }"
            >
              <UncertaintyToggle
                :active="isUncertain('name.mainAlt')"
                @toggle="toggleUncertain('name.mainAlt')"
              />
              <input
                type="text"
                id="newEntryNameAlt"
                v-model="formPlaceholders.newEntryNameAlt"
                :placeholder="
                  entryType === 'micronation'
                    ? $t('entryForm.alternativeNamePlaceholder')
                    : $t('entryForm.acronymPlaceholder')
                "
              />
            </div>

            <template v-if="entryType === 'micronation'">
              <label for="newEntryAltNameMain" class="new-entry-form-text"><span class="new-entry-label-content">
                {{ $t('entryForm.otherNames') }}</span>
                <img
                  src="/images/info.png"
                  :alt="$t('entryForm.info')"
                  class="tooltip-activator"
                  @click="activeTooltipIndex === 2 ? '' : activateTooltip(2, 'Other names', $event)"
                />
              </label>
              <div
                class="uncertainty-field-control"
                :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.alt') }"
              >
                <UncertaintyToggle
                  :active="isUncertain('name.alt')"
                  @toggle="toggleUncertain('name.alt')"
                />
                <div class="new-entry-option-container alternative-name-fields">
                  <div class="alternative-name-inputs">
                    <input
                      id="newEntryAltNameMain"
                      v-model="currentAltNameMain"
                      type="text"
                      :placeholder="$t('entryForm.alternativeNameInputPlaceholder')"
                    />
                    <input
                      v-model="currentAltNameTitle"
                      type="text"
                      :placeholder="$t('entryForm.alternativeTitlePlaceholder')"
                    />
                    <button
                      type="button"
                      class="login-button squared-button color-transition new-entry-option-button"
                      @click="addAlternativeName"
                    >
                      {{ $t('entryForm.add') }}
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
              </div>
            </template>

            <label for="newEntryMotto" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t('entryForm.motto') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 4 ? '' : activateTooltip(4, 'Motto', $event)"
              />
            </label>
            <div
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('motto') }"
            >
              <UncertaintyToggle
                :active="isUncertain('motto')"
                @toggle="toggleUncertain('motto')"
              />
              <input
                type="text"
                id="newEntryMotto"
                v-model="formPlaceholders.newEntryMotto"
                :placeholder="$t('entryForm.mottoPlaceholder')"
              />
            </div>

            <label v-if="entryType === 'micronation'" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t('entryForm.type') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 5 ? '' : activateTooltip(5, 'Type', $event)"
              />
            </label>
            <div
              v-if="entryType === 'micronation'"
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('type') }"
            >
              <UncertaintyToggle :active="isUncertain('type')" @toggle="toggleUncertain('type')" />
              <div class="new-entry-type">
                <input
                  type="checkbox"
                  id="typePhysical"
                  v-model="formPlaceholders.newEntryTypePhysical"
                  name="new-entry-type"
                  value="physical"
                  @change="updatePhysicalType"
                  @click="renderedMapboxNewEntry = true"
                />
                <label for="typePhysical">{{ $t('entryForm.physical') }}</label>
                <input
                  type="checkbox"
                  id="typeDigital"
                  v-model="formPlaceholders.newEntryTypeDigital"
                  name="new-entry-type"
                  value="digital"
                  checked
                />
                <label for="typeDigital">{{ $t('entryForm.digital') }}</label>
                <input
                  type="checkbox"
                  id="typeFictional"
                  v-model="formPlaceholders.newEntryTypeFictional"
                  name="new-entry-type"
                  value="fictional"
                />
                <label for="typeFictional">{{ $t('entryForm.fictional') }}</label>
              </div>
            </div>

            <label for="newEntryLanguages" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t('entryForm.languages') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 6 ? '' : activateTooltip(6, 'Official languages', $event)
                "
              />
            </label>
            <div
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('languages') }"
            >
              <UncertaintyToggle
                :active="isUncertain('languages')"
                @toggle="toggleUncertain('languages')"
              />
              <div class="new-entry-option-container">
                <div class="new-entry-select-controls">
                  <select
                    name="newEntryLanguages"
                    class="new-entry-option-select"
                    @change="addLanguage"
                  >
                    <option value="" disabled selected>{{ $t('entryForm.selectLanguage') }}</option>
                    <optgroup>
                      <option
                        v-for="(language, i) in listLanguages"
                        :key="i"
                        :value="language.name"
                      >
                        {{ language.name }}
                      </option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    :placeholder="$t('entryForm.customLanguage')"
                    v-model="customLanguage"
                  />
                  <button
                    type="button"
                    class="login-button squared-button color-transition new-entry-option-button"
                    @click="addCustomLanguage"
                  >
                    {{ $t('entryForm.add') }}
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
            </div>

            <label
              v-if="entryType === 'micronation'"
              for="newEntryCapital"
              class="new-entry-form-text"
            ><span class="new-entry-label-content">
              {{ $t('entryForm.capital') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 7 ? '' : activateTooltip(7, 'Capital', $event)"
              />
            </label>
            <div
              v-if="entryType === 'micronation'"
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('capital') }"
            >
              <UncertaintyToggle
                :active="isUncertain('capital')"
                @toggle="toggleUncertain('capital')"
              />
              <input
                type="text"
                id="newEntryCapital"
                v-model="formPlaceholders.newEntryCapital"
                :placeholder="$t('entryForm.capitalPlaceholder')"
              />
            </div>

            <label
              v-if="entryType === 'micronation'"
              for="newEntryCurrency"
              class="new-entry-form-text"
            ><span class="new-entry-label-content">
              {{ $t('entryForm.currency') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 8 ? '' : activateTooltip(8, 'Currency', $event)"
              />
            </label>
            <div
              v-if="entryType === 'micronation'"
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('currency') }"
            >
              <UncertaintyToggle
                :active="isUncertain('currency')"
                @toggle="toggleUncertain('currency')"
              />
              <input
                type="text"
                id="newEntryCurrency"
                v-model="formPlaceholders.newEntryCurrency"
                :placeholder="$t('entryForm.currencyPlaceholder')"
              />
            </div>

            <label for="newEntryFoundation" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t('entryForm.foundation') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 9 ? '' : activateTooltip(9, 'Foundation', $event)"
              />
            </label>
            <div
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('foundationDate') }"
            >
              <UncertaintyToggle
                :active="isUncertain('foundationDate')"
                @toggle="toggleUncertain('foundationDate')"
              />
              <VueDatePicker
                v-model="foundationDate"
                :enable-time-picker="false"
                :dark="theme === 'dark'"
                month-name-format="long"
                :flow="['year', 'month', 'calendar']"
                :utc="'preserve'"
                :timezone="'UTC'"
                :now-button-label="$t('common.today')"
                :required="true"
                :max-date="new Date()"
              />
            </div>

            <label
              v-if="entryType === 'micronation'"
              v-show="physicalType"
              class="new-entry-form-text mandatory"
            ><span class="new-entry-label-content">
              {{ $t('entryForm.location') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 10 ? '' : activateTooltip(10, 'Location', $event)"
              />
            </label>
            <div
              v-if="entryType === 'micronation'"
              v-show="physicalType"
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('location') }"
            >
              <UncertaintyToggle
                :active="isUncertain('location')"
                @toggle="toggleUncertain('location')"
              />
              <div class="new-entry-option-container">
                <p class="new-entry-location-note">
                  {{ $t('entryForm.locationNote') }}
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
            </div>

            <label
              v-if="entryType === 'micronation'"
              for="newEntryMemberships"
              class="new-entry-form-text"
            ><span class="new-entry-label-content">
              {{ $t('entryForm.memberships') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 11 ? '' : activateTooltip(11, 'Memberships', $event)"
              />
            </label>
            <div
              v-if="entryType === 'micronation'"
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('memberships') }"
            >
              <UncertaintyToggle
                :active="isUncertain('memberships')"
                @toggle="toggleUncertain('memberships')"
              />
              <div class="new-entry-option-container">
                <div class="new-entry-select-controls">
                  <select
                    name="newEntryMemberships"
                    class="new-entry-option-select"
                    @change="addMembership"
                  >
                    <option value="" disabled selected>
                      {{ $t('entryForm.selectOrganization') }}
                    </option>
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
                    :placeholder="$t('entryForm.otherMembershipPlaceholder')"
                    v-model="customMembership"
                  />
                  <button
                    type="button"
                    class="login-button squared-button color-transition new-entry-option-button"
                    @click="addCustomMembership"
                  >
                    {{ $t('entryForm.add') }}
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
            </div>

            <label for="newEntryEmails" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t('entryForm.contact') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 12 ? '' : activateTooltip(12, 'Contact media', $event)
                "
              />
            </label>
            <div
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('contactInfo') }"
            >
              <UncertaintyToggle
                :active="isUncertain('contactInfo')"
                @toggle="toggleUncertain('contactInfo')"
              />
              <div class="new-entry-option-container">
                <div style="display: flex">
                  <input
                    type="text"
                    id="newEntryEmail"
                    class="new-entry-option-select"
                    v-model="currentEmail"
                    :placeholder="$t('entryForm.contactPlaceholder')"
                  />
                  <button
                    @click="addEmail(currentEmail)"
                    type="button"
                    class="login-button squared-button color-transition new-entry-option-button"
                  >
                    {{ $t('entryForm.add') }}
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
            </div>

            <label for="newEntryWebsites" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t('entryForm.sources') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="
                  activeTooltipIndex === 13 ? '' : activateTooltip(13, 'Info sources', $event)
                "
              />
            </label>
            <div
              class="uncertainty-field-control"
              :class="{ 'moderation-field-changed': isPublishedFieldChanged('websites') }"
            >
              <UncertaintyToggle
                :active="isUncertain('websites')"
                @toggle="toggleUncertain('websites')"
              />
              <div class="new-entry-option-container">
                <div style="display: flex">
                  <input
                    type="text"
                    id="newEntryWebsite"
                    class="new-entry-option-select"
                    v-model="currentWebsite"
                    :placeholder="$t('entryForm.sourcePlaceholder')"
                  />
                  <button
                    @click="addWebsite(currentWebsite)"
                    type="button"
                    class="login-button squared-button color-transition new-entry-option-button"
                  >
                    {{ $t('entryForm.add') }}
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
            </div>

            <label for="newEntryFlag" class="new-entry-form-text mandatory"><span class="new-entry-label-content">
              {{ $t(entryType === 'micronation' ? 'entryForm.flag' : 'entryForm.logo') }}</span>
              <img
                src="/images/info.png"
                :alt="$t('entryForm.info')"
                class="tooltip-activator"
                @click="activeTooltipIndex === 14 ? '' : activateTooltip(14, 'Flag', $event)"
              />
            </label>
            <div
              class="uncertainty-field-control flag-input-control"
              :class="{
                'moderation-field-changed': isPublishedFieldChanged(
                  entryType === 'micronation' ? 'flag' : 'logo'
                )
              }"
            >
              <UncertaintyToggle
                :active="isUncertain(entryType === 'micronation' ? 'flag' : 'logo')"
                @toggle="toggleUncertain(entryType === 'micronation' ? 'flag' : 'logo')"
              />
              <div class="new-entry-option-container flag-preview-container">
                <img
                  v-if="isModerationEditor && editImageValue"
                  :src="editImageValue"
                  class="moderation-edit-image-preview"
                  :alt="
                    $t(
                      entryType === 'micronation'
                        ? 'entryForm.currentFlag'
                        : 'entryForm.currentLogo'
                    )
                  "
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
                      <span>{{ $t('entryForm.localFile') }}</span>
                    </label>
                    <label class="flag-radio">
                      <input v-model="flagRadio" type="radio" name="flagRadio" value="url" />
                      <span>{{ $t('entryForm.externalUrl') }}</span>
                    </label>
                  </div>
                  <input
                    v-model="formPlaceholders.newEntryFlag"
                    v-if="flagRadio === 'url'"
                    name="flagImage"
                    type="url"
                    ref="flagURLInput"
                    @input="displayImage($event.target.value)"
                    :placeholder="$t('entryForm.imageUrlPlaceholder')"
                    :required="!directoryEdit"
                  />
                  <input
                    v-if="flagRadio === 'file'"
                    type="file"
                    @input="previewImage"
                    accept="image/*"
                    :required="!directoryEdit"
                  />
                  <small v-if="imagePreviewError" class="flag-image-error" role="alert">{{
                    imagePreviewError
                  }}</small>
                  <label for=""
                    >({{ $t('entryForm.imageUnavailable') }}:
                    <a href="/images/missing-flag.png" target="_blank">{{
                      $t('entryForm.templateLink')
                    }}</a
                    >)
                  </label>
                </template>
              </div>
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
                      ? $t('entryForm.savingCorrections')
                      : $t('entryForm.saveCorrections')
                    : isSubmitting
                    ? directoryEdit
                      ? $t('entryForm.submittingEdit')
                      : $t('entryForm.submitting')
                    : directoryEdit
                    ? $t('entryForm.submitEdit')
                    : $t('entryForm.addEntry')
                }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div v-if="!isModerationEditor" class="new-entry-preview">
        <h3 id="previewTitle">{{ $t('entryForm.preview') }}</h3>

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
      imagePreviewError: '',
      editImageValue: entry.flag || entry.logo || '',
      flagRadio: 'file',
      passedRecaptcha: false,
      isSubmitting: false,
      aiPanelOpen: false,
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
      uncertainFields: Array.isArray(entry.uncertain) ? [...entry.uncertain] : [],
      tooltipDisplay: false,
      tooltipPosition: {
        x: 0,
        y: 0
      },
      tooltipTitle: '',
      activeTooltipText: 0
    }
  },
  watch: {
    formPlaceholders(newValue) {
      if (!this.isModerationEditor) this.displayImage(newValue.newEntryFlag)
    }
  },
  computed: {
    tooltipTexts() {
      return buildTooltipTexts()
    },
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
          micronationNameVariants(entry.name).some((name) =>
            this.matchesWholeWords(name, enteredName)
          )
        ) || null
      )
    }
  },
  methods: {
    isPublishedFieldChanged(field) {
      if (!this.isModerationEditor || !this.publishedEntry) return false
      const read = (entry) => {
        if (field === 'name.alt') return entry.name?.alt || []
        if (field.startsWith('name.'))
          return field
            .split('.')
            .slice(1)
            .reduce((value, key) => value?.[key], entry)
        return entry[field]
      }
      const normalize = (value) => {
        if (Array.isArray(value)) return JSON.stringify(value.map(normalize))
        if (value && typeof value === 'object') {
          if ('_seconds' in value) return String(value._seconds)
          return JSON.stringify(
            Object.fromEntries(
              Object.keys(value)
                .sort()
                .map((key) => [key, normalize(value[key])])
            )
          )
        }
        return String(value ?? '').trim()
      }
      return normalize(read(this.initialEntry || {})) !== normalize(read(this.publishedEntry))
    },
    isUncertain(field) {
      return this.uncertainFields.includes(field)
    },
    toggleUncertain(field) {
      this.uncertainFields = this.isUncertain(field)
        ? this.uncertainFields.filter((item) => item !== field)
        : [...this.uncertainFields, field]
    },
    async addEntry() {
      const that = this

      if (this.isModerationEditor) {
        if (!this.formPlaceholders.newEntryName.trim()) {
          return notify({
            title: this.$t('entryForm.messages.cannotSave'),
            text: this.$t('entryForm.messages.nameRequired'),
            type: 'error'
          })
        }
        if (!this.formPlaceholders.newEntryLanguages.length) {
          return notify({
            title: this.$t('entryForm.messages.cannotSave'),
            text: this.$t('entryForm.messages.languageRequired'),
            type: 'error'
          })
        }
        if (!this.formPlaceholders.newEntryWebsites.length) {
          return notify({
            title: this.$t('entryForm.messages.cannotSave'),
            text: this.$t('entryForm.messages.sourceRequired'),
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
          uncertain: [...this.uncertainFields],
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
          title: this.$t('entryForm.messages.submitError'),
          text: this.$t('entryForm.messages.missingSource'),
          type: 'error'
        })
      }

      if (this.formPlaceholders.newEntryLanguages.length === 0) {
        return notify({
          title: this.$t('entryForm.messages.submitError'),
          text: this.$t('entryForm.messages.missingLanguages'),
          type: 'error'
        })
      }

      if (
        this.directoryEdit ||
        this.searchElement(this.formPlaceholders.newEntryName) === undefined
      ) {
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
            uncertain: [...this.uncertainFields],
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
                fileType: imageFile.type
              }
              const compressedFile =
                imageFile.size <= 35 * 1024 ? imageFile : await imageCompression(imageFile, options)
              const base64Data = await this.fileToBase64(compressedFile)
              entryData.flagFile = {
                name: `${this.formPlaceholders.newEntryName}${
                  this.directoryEdit ? `-${Date.now()}` : ''
                }.${this.getImageExtension(imageFile)}`,
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
                fileType: imageFile.type
              }
              const compressedFile =
                imageFile.size <= 35 * 1024 ? imageFile : await imageCompression(imageFile, options)
              const base64Data = await this.fileToBase64(compressedFile)
              entryData.logoFile = {
                name: `${this.formPlaceholders.newEntryName}${
                  this.directoryEdit ? `-${Date.now()}` : ''
                }.${this.getImageExtension(imageFile)}`,
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
          await createGitHubIssue(
            entryData,
            this.entryType,
            this.directoryEdit ? { editTargetId: this.editTargetId } : {}
          )

          this.emailNotice()
          this.successNotification()
          this.$emit('submission-success')
        } catch (error) {
          console.error('Error submitting entry:', error)
          notify({
            title: this.$t('entryForm.messages.submitError'),
            text: error.message || this.$t('entryForm.messages.failedSubmit'),
            type: 'error'
          })
        } finally {
          this.isSubmitting = false
        }
      } else {
        notify({
          title: this.$t('entryForm.messages.submitError'),
          text: this.$t('entryForm.messages.duplicateEntry'),
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
          title: this.$t('entryForm.messages.aiAssistant'),
          text: this.$t('entryForm.messages.imageTooLarge'),
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

        const entry =
          payload.entry && typeof payload.entry === 'object' && !Array.isArray(payload.entry)
            ? payload.entry
            : {}
        let populatedFields = 0
        const name = typeof entry.name === 'string' ? { main: entry.name } : entry.name || {}
        if (typeof name.main === 'string' && name.main.trim()) {
          this.formPlaceholders.newEntryName = name.main.trim()
          populatedFields++
        }
        if (this.entryType === 'micronation') {
          if (typeof name.title === 'string' && name.title.trim()) {
            this.formPlaceholders.newEntryTitle = name.title.trim()
            populatedFields++
          }
          if (Array.isArray(name.alt)) {
            const altNames = name.alt
              .map((item) => (typeof item === 'string' ? { main: item, title: '' } : item))
              .filter((item) => item && typeof item.main === 'string' && item.main.trim())
            if (altNames.length) {
              this.formPlaceholders.newEntryAltNames = altNames
              populatedFields++
            }
          }
          if (typeof entry.capital === 'string' && entry.capital.trim()) {
            this.formPlaceholders.newEntryCapital = entry.capital.trim()
            populatedFields++
          }
          if (typeof entry.currency === 'string' && entry.currency.trim()) {
            this.formPlaceholders.newEntryCurrency = entry.currency.trim()
            populatedFields++
          }
          if (Array.isArray(entry.memberships)) {
            const memberships = entry.memberships.filter(
              (item) => typeof item === 'string' && item.trim()
            )
            if (memberships.length) {
              this.formPlaceholders.newEntryMemberships = memberships
              populatedFields++
            }
          }
          if (Array.isArray(entry.type)) {
            const types = entry.type.filter((type) =>
              ['Physical', 'Digital', 'Fictional'].includes(type)
            )
            if (types.length) {
              this.formPlaceholders.newEntryTypePhysical = types.includes('Physical')
              this.formPlaceholders.newEntryTypeDigital = types.includes('Digital')
              this.formPlaceholders.newEntryTypeFictional = types.includes('Fictional')
              this.physicalType = this.formPlaceholders.newEntryTypePhysical
              if (this.physicalType) this.renderedMapboxNewEntry = true
              populatedFields++
            }
          }
        } else if (typeof name.mainAlt === 'string' && name.mainAlt.trim()) {
          this.formPlaceholders.newEntryNameAlt = name.mainAlt.trim()
          populatedFields++
        }
        if (typeof entry.motto === 'string' && entry.motto.trim()) {
          this.formPlaceholders.newEntryMotto = entry.motto.trim()
          populatedFields++
        }
        if (Array.isArray(entry.languages)) {
          const languages = entry.languages.filter(
            (item) => typeof item === 'string' && item.trim()
          )
          if (languages.length) {
            this.formPlaceholders.newEntryLanguages = languages
            populatedFields++
          }
        }
        if (Array.isArray(entry.contactInfo)) {
          const contacts = entry.contactInfo.filter(
            (item) => typeof item === 'string' && item.trim()
          )
          if (contacts.length) {
            this.formPlaceholders.newEntryEmails = contacts
            populatedFields++
          }
        }
        if (Array.isArray(entry.websites)) {
          const websites = entry.websites.filter((item) => typeof item === 'string' && item.trim())
          if (websites.length) {
            this.formPlaceholders.newEntryWebsites = websites
            populatedFields++
          }
        }
        if (entry.foundationDate) {
          const date = new Date(entry.foundationDate)
          if (!Number.isNaN(date.getTime())) {
            this.foundationDate = date
            populatedFields++
          }
        }

        const imageUrl = this.entryType === 'micronation' ? entry.flag : entry.logo
        if (typeof imageUrl === 'string' && imageUrl.trim()) {
          this.flagRadio = 'url'
          this.formPlaceholders.newEntryFlag = imageUrl.trim()
          await this.displayImage(imageUrl.trim())
          populatedFields++
        }

        if (!populatedFields) {
          notify({
            title: this.$t('entryForm.messages.aiAssistant'),
            text: this.$t('entryForm.messages.invalidAiFields'),
            type: 'error'
          })
          return
        }

        this.uncertainFields = [
          ...new Set([
            ...this.uncertainFields,
            ...(Array.isArray(entry.uncertain) ? entry.uncertain : [])
          ])
        ]
        notify({
          title: this.$t('entryForm.messages.suggestionsReady'),
          text: this.$t('entryForm.messages.reviewSuggestions'),
          type: 'success'
        })
      } catch (error) {
        notify({
          title: this.$t('entryForm.messages.aiAssistant'),
          text: error.message || this.$t('entryForm.messages.couldNotAnalyze'),
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
          return micronationNameVariants(entry.name).some((name) =>
            this.matchesWholeWords(name, normalizedName)
          )
        }
        return entry.name?.main?.trim().toLocaleLowerCase() === normalizedName
      })
    },
    matchesWholeWords(existingName, query) {
      return matchWholeNameWords(existingName, query)
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
      const titleKeys = {
        Name: 'name',
        Title: 'title',
        'Alternative name': 'alternativeName',
        'Other names': 'otherNames',
        Motto: 'motto',
        Type: 'type',
        'Official languages': 'languages',
        Capital: 'capital',
        Currency: 'currency',
        Foundation: 'foundation',
        Location: 'location',
        Memberships: 'memberships',
        'Contact media': 'contact',
        'Info sources': 'sources',
        Flag: 'flag'
      }
      this.tooltipTitle = this.$t(`entryForm.tooltipTitles.${titleKeys[title] || 'name'}`)
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
        title: this.$t(
          this.directoryEdit
            ? 'entryForm.messages.editSubmitted'
            : 'entryForm.messages.submissionSuccessful'
        ),
        text: this.directoryEdit
          ? this.$t('entryForm.messages.editAwaitingApproval')
          : this.$t('entryForm.messages.entryAwaitingApproval'),
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
      if (!url) throw new Error(this.$t('entryForm.messages.imageUrlRequired'))
      let parsedUrl
      try {
        parsedUrl = new URL(url)
      } catch {
        throw new Error(this.$t('entryForm.messages.invalidImageUrl'))
      }
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error(this.$t('entryForm.messages.imageProtocol'))
      }

      const response = await fetch(parsedUrl.href)
      if (!response.ok)
        throw new Error(
          this.$t('entryForm.messages.imageDownloadFailed', { status: response.status })
        )
      const blob = await response.blob()
      if (!blob.type.startsWith('image/') || !blob.size) {
        throw new Error(this.$t('entryForm.messages.imageResponseInvalid'))
      }
      const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type.split('/')[1].split('+')[0]
      return new File([blob], `image.${extension || 'png'}`, { type: blob.type })
    },
    getImageExtension(file) {
      const sourceExtension = file.name?.match(/\.([^.]+)$/)?.[1]?.toLowerCase()
      if (sourceExtension) return sourceExtension

      const subtype = file.type?.split('/')[1]?.toLowerCase() || 'png'
      return subtype === 'jpeg' ? 'jpg' : subtype.replace(/\+.*/, '')
    },
    previewImage(event) {
      this.flagSource = event.target.files[0]
      this.flagPreview = URL.createObjectURL(this.flagSource)
    },
    async displayImage(value) {
      this.imagePreviewError = ''
      if (!value) {
        this.flagSource = ''
        this.flagPreview = ''
        return
      }
      try {
        const file = await this.getImageFileForSubmission()
        this.flagSource = file
        this.flagPreview = URL.createObjectURL(file)
      } catch (error) {
        this.imagePreviewError = `The image could not be loaded for the preview (${
          error.message || 'network or CORS restriction'
        }). Upload the image as a local file instead, or use a direct URL that allows downloading.`
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
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-heading);
}

.new-entry-label-content {
  flex: 0 1 auto;
  min-width: 0;
}

.uncertainty-field-control {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-width: 0;
}
.new-entry-container--moderation .uncertainty-field-control.moderation-field-changed {
  background: transparent;
}
.new-entry-container--moderation .uncertainty-field-control.moderation-field-changed > input,
.new-entry-container--moderation .uncertainty-field-control.moderation-field-changed > select,
.new-entry-container--moderation
  .uncertainty-field-control.moderation-field-changed
  > .new-entry-option-container,
.new-entry-container--moderation
  .uncertainty-field-control.moderation-field-changed
  > .new-entry-type,
.new-entry-container--moderation
  .uncertainty-field-control.moderation-field-changed
  > .vue-datepicker {
  background-color: rgb(245 200 74 / 14%);
}
.new-entry-container--moderation
  .uncertainty-field-control.moderation-field-changed
  input:not([type='checkbox']),
.new-entry-container--moderation .uncertainty-field-control.moderation-field-changed select {
  background-color: rgb(245 200 74 / 14%);
}

.uncertainty-field-control > input,
.uncertainty-field-control > .new-entry-option-container,
.uncertainty-field-control > .new-entry-type,
.uncertainty-field-control > .vue-datepicker,
.uncertainty-field-control > div {
  flex: 1;
  min-width: 0;
}

.uncertainty-field-control :deep(.uncertainty-toggle) {
  margin-left: 0;
  margin-right: 0;
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

#previewTitle {
  text-align: center;
  margin: 0 0 20px 0;
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
  display: inline-block;
  flex: 0 0 16px;
  margin-left: 0;
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

.flag-image-error {
  color: var(--color-danger, #c0392b);
  font-size: 12px;
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
