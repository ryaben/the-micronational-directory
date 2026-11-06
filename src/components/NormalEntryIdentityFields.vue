<script setup>
import SelectedElement from './SelectedElement.vue'
import UncertaintyToggle from './UncertaintyToggle.vue'

defineProps({
  entryType: { type: String, required: true },
  formPlaceholders: { type: Object, required: true },
  currentAltNameMain: { type: String, default: '' },
  currentAltNameTitle: { type: String, default: '' },
  isUncertain: { type: Function, required: true },
  isPublishedFieldChanged: { type: Function, required: true }
})

const emit = defineEmits([
  'toggle-uncertain',
  'activate-tooltip',
  'update:currentAltNameMain',
  'update:currentAltNameTitle',
  'add-alternative-name',
  'remove-alternative-name'
])

function activateTooltip(index, title, event) {
  emit('activate-tooltip', index, title, event)
}
</script>

<template>
  <div class="normal-entry-identity-fields">
    <label for="newEntryName" class="new-entry-form-text mandatory">
      <span class="new-entry-label-content">{{ $t('entryForm.name') }}</span>
      <img src="/images/info.png" :alt="$t('entryForm.info')" class="tooltip-activator"
        @click="activateTooltip(0, 'Name', $event)" />
    </label>
    <div class="uncertainty-field-control" :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.main') }">
      <UncertaintyToggle :active="isUncertain('name.main')" @toggle="emit('toggle-uncertain', 'name.main')" />
      <input id="newEntryName" v-model="formPlaceholders.newEntryName" required type="text"
        :placeholder="$t(entryType === 'micronation' ? 'entryForm.micronationNamePlaceholder' : 'entryForm.organizationNamePlaceholder')" />
    </div>

    <label v-if="entryType === 'micronation'" for="newEntryTitle" class="new-entry-form-text mandatory">
      <span class="new-entry-label-content">{{ $t('entryForm.title') }}</span>
      <img src="/images/info.png" :alt="$t('entryForm.info')" class="tooltip-activator"
        @click="activateTooltip(1, 'Title', $event)" />
    </label>
    <div v-if="entryType === 'micronation'" class="uncertainty-field-control"
      :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.title') }">
      <UncertaintyToggle :active="isUncertain('name.title')" @toggle="emit('toggle-uncertain', 'name.title')" />
      <input id="newEntryTitle" v-model="formPlaceholders.newEntryTitle" type="text"
        :placeholder="$t('entryForm.titlePlaceholder')" />
    </div>

    <label v-if="entryType === 'organization'" for="newEntryNameAlt" class="new-entry-form-text">
      <span class="new-entry-label-content">{{ $t('entryForm.acronym') }}</span>
      <img src="/images/info.png" :alt="$t('entryForm.info')" class="tooltip-activator"
        @click="activateTooltip(2, 'Alternative name', $event)" />
    </label>
    <div v-if="entryType === 'organization'" class="uncertainty-field-control"
      :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.mainAlt') }">
      <UncertaintyToggle :active="isUncertain('name.mainAlt')" @toggle="emit('toggle-uncertain', 'name.mainAlt')" />
      <input id="newEntryNameAlt" v-model="formPlaceholders.newEntryNameAlt" type="text"
        :placeholder="$t('entryForm.acronymPlaceholder')" />
    </div>

    <template v-if="entryType === 'micronation'">
      <label for="newEntryAltNameMain" class="new-entry-form-text">
        <span class="new-entry-label-content">{{ $t('entryForm.otherNames') }}</span>
        <img src="/images/info.png" :alt="$t('entryForm.info')" class="tooltip-activator"
          @click="activateTooltip(2, 'Other names', $event)" />
      </label>
      <div class="uncertainty-field-control" :class="{ 'moderation-field-changed': isPublishedFieldChanged('name.alt') }">
        <UncertaintyToggle :active="isUncertain('name.alt')" @toggle="emit('toggle-uncertain', 'name.alt')" />
        <div class="new-entry-option-container alternative-name-fields">
          <div class="alternative-name-inputs">
            <input id="newEntryAltNameMain" :value="currentAltNameMain" type="text"
              :placeholder="$t('entryForm.alternativeNameInputPlaceholder')"
              @input="emit('update:currentAltNameMain', $event.target.value)" />
            <input :value="currentAltNameTitle" type="text"
              :placeholder="$t('entryForm.alternativeTitlePlaceholder')"
              @input="emit('update:currentAltNameTitle', $event.target.value)" />
            <button type="button" class="login-button squared-button color-transition new-entry-option-button"
              @click.prevent.stop="emit('add-alternative-name')">{{ $t('entryForm.add') }}</button>
          </div>
          <div class="selected-elements-container">
            <SelectedElement v-for="(name, index) in formPlaceholders.newEntryAltNames" :key="index"
              :element-text="name.title ? `${name.main}, ${name.title}` : name.main"
              @remove-element="emit('remove-alternative-name', index)" />
          </div>
        </div>
      </div>
    </template>

    <label for="newEntryMotto" class="new-entry-form-text mandatory">
      <span class="new-entry-label-content">{{ $t('entryForm.motto') }}</span>
      <img src="/images/info.png" :alt="$t('entryForm.info')" class="tooltip-activator"
        @click="activateTooltip(4, 'Motto', $event)" />
    </label>
    <div class="uncertainty-field-control" :class="{ 'moderation-field-changed': isPublishedFieldChanged('motto') }">
      <UncertaintyToggle :active="isUncertain('motto')" @toggle="emit('toggle-uncertain', 'motto')" />
      <input id="newEntryMotto" v-model="formPlaceholders.newEntryMotto" type="text"
        :placeholder="$t('entryForm.mottoPlaceholder')" />
    </div>
  </div>
</template>

<style scoped>
.normal-entry-identity-fields { display: contents; }
.new-entry-form-text { display: flex; width: fit-content; max-width: 100%; align-items: center; gap: 4px; font-size: 14px; font-weight: 700; color: var(--color-heading); }
.new-entry-label-content { flex: 0 1 auto; min-width: 0; }
.tooltip-activator { display: inline-block; flex: 0 0 16px; width: 16px; cursor: pointer; vertical-align: middle; }
.uncertainty-field-control { display: flex; align-items: center; gap: 7px; width: 100%; min-width: 0; }
.uncertainty-field-control > input,
.uncertainty-field-control > .new-entry-option-container { flex: 1; min-width: 0; }
.uncertainty-field-control :deep(.uncertainty-toggle) { margin: 0; }
.alternative-name-fields { box-sizing: border-box; display: flex; flex-direction: column; min-width: 0; padding: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-background-soft); }
.alternative-name-inputs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.alternative-name-inputs > input { box-sizing: border-box; width: 100%; min-width: 0; min-height: 44px; }
.alternative-name-inputs .new-entry-option-button { box-sizing: border-box; width: auto; min-width: 76px; min-height: 42px; padding: 8px 12px; }
.selected-elements-container { display: flex; flex-wrap: wrap; }
.selected-elements-container:not(:empty) { gap: 6px; margin-top: 8px; }
@media (max-width: 600px) {
  .new-entry-form-text { margin-top: 8px; }
  .alternative-name-inputs { grid-template-columns: minmax(0, 1fr); }
  .alternative-name-inputs .new-entry-option-button { width: 100%; }
}
</style>
