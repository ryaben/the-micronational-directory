<script setup>
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue'
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue'
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue'
import SettingsPagesIcon from './icons/SettingsPagesIcon.vue'
import SettingsFilterIcon from './icons/SettingsFilterIcon.vue'
import SettingsSortIcon from './icons/SettingsSortIcon.vue'
import SettingsDisplayIcon from './icons/SettingsDisplayIcon.vue'
import SettingsFlagsIcon from './icons/SettingsFlagsIcon.vue'
import MultiSelectDropdown from './MultiSelectDropdown.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import store from '../store'
import { useI18n } from '../i18n'
import { theme } from '../composables/userSettings.js'
import { useUserFavorites } from '../composables/userFavorites.js'

const { locale } = useI18n()
const { currentUser } = useUserFavorites()
const tabIcons = {
  Pages: SettingsPagesIcon,
  Filter: SettingsFilterIcon,
  Sort: SettingsSortIcon,
  Display: SettingsDisplayIcon,
  Flags: SettingsFlagsIcon
}

defineProps({
  storeGetter: {
    type: String,
    required: true,
    default: 'directory'
  },
  elementsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
  },
  subPropForFilter: {
    type: Boolean,
    required: false,
    default: true
  },
  hiddenSubcontainers: {
    type: Array,
    required: false,
    default: ['']
  },
  showUnapproved: {
    type: Boolean,
    required: false,
    default: false
  }
})
</script>

<template>
  <div
    v-if="viewMode === storeGetter || (viewMode === 'collage' && storeGetter === 'micronations')"
  >
    <div
      class="directory-settings"
      :class="{
        floating:
          (viewMode === 'micronations' || viewMode === 'collage' || viewMode === 'organizations') &&
          scrollPosition > 500
      }"
    >
      <div
        class="settings-controls"
        :class="{ 'without-count': hiddenSubcontainers.includes('Total') }"
        v-if="availableSettingsTabs.length"
      >
        <div
          class="settings-tabs"
          role="tablist"
          :aria-label="$t('settingsTabs.Directory settings')"
        >
          <button
            v-for="tab in availableSettingsTabs"
            :key="tab.id"
            type="button"
            role="tab"
            class="settings-tab"
            :class="{ active: activeSettingsTab === tab.id }"
            :id="`settings-tab-${tab.id}`"
            :aria-selected="activeSettingsTab === tab.id"
            :aria-controls="`settings-panel-${tab.id}`"
            :aria-label="$t(`settingsTabs.${tab.id}`)"
            :title="$t(`settingsTabs.${tab.id}`)"
            @click="activeSettingsTab = tab.id"
          >
            <component :is="tabIcons[tab.id]" class="settings-tab-icon" />
            <span class="settings-tab-label">{{ $t(`settingsTabs.${tab.id}`) }}</span>
          </button>
        </div>

        <div class="settings-panel-frame">
          <Transition name="settings-panel" mode="out-in">
            <div
              :id="`settings-panel-${activeSettingsTab}`"
              :key="activeSettingsTab"
              class="settings-panel"
              :class="`settings-panel-${activeSettingsTab.toLowerCase()}`"
              role="tabpanel"
              :aria-labelledby="`settings-tab-${activeSettingsTab}`"
            >
              <SettingsSubcontainer
                v-if="activeSettingsTab === 'Pages'"
                :text="$t('settingsTabs.Pages')"
              >
                <SettingsSubcontainerParameter :centered="true">
                  <label>{{ $t('common.entriesPerPage') }}</label>
                  <input
                    id="entriesPerPageInput"
                    :placeholder="$t('settings.inputAmount')"
                    min="1"
                    :max="maxTotalLoad"
                    type="number"
                    v-model="entriesPerPage"
                    @input="pageElements()"
                  />
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter
                  :centered="true"
                  :border-left="true"
                  :extra-margin-end="true"
                >
                  <div class="page-controls" style="display: flex; align-items: center">
                    <button
                      class="page-button login-button color-transition"
                      :disabled="currentPage === 1"
                      @click="setPage(1)"
                    >
                      &lt;&lt;
                    </button>
                    <button
                      class="page-button login-button color-transition"
                      :disabled="currentPage === 1"
                      @click="setPage(currentPage - 1)"
                    >
                      &lt;
                    </button>
                    <input
                      id="currentPage"
                      :placeholder="$t('settings.page')"
                      min="1"
                      :max="totalPages"
                      type="number"
                      v-model="currentPage"
                      @input="pageElements()"
                    />
                    <label id="totalPages" class="matching-entries">&nbsp;/ {{ totalPages }}</label>
                    <button
                      class="page-button login-button color-transition"
                      :disabled="currentPage === totalPages"
                      @click="setPage(currentPage + 1)"
                    >
                      >
                    </button>
                    <button
                      class="page-button login-button color-transition"
                      :disabled="currentPage === totalPages"
                      @click="setPage(totalPages)"
                    >
                      >>
                    </button>
                  </div>
                </SettingsSubcontainerParameter>
              </SettingsSubcontainer>

              <SettingsSubcontainer
                v-else-if="activeSettingsTab === 'Filter'"
                :text="$t('settingsTabs.Filter')"
              >
                <SettingsSubcontainerParameter class="filter-field">
                  <label for="filterInput">{{ $t('common.search') }}</label>
                  <input
                    id="filterInput"
                    v-model="inputFilter"
                    type="text"
                    :placeholder="$t('settings.searchName')"
                  />
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="filter-field">
                  <label>{{ $t('common.initialLetter') }}</label>
                  <MultiSelectDropdown
                    v-model="initialFilter"
                    :options="filterLetters"
                    :include-select-all="true"
                    :include-select-none="false"
                    :dropdown-height="240"
                    :placeholder="$t('common.all')"
                    :select-all-label="$t('common.all')"
                    :selected-count-label="$t('settings.selectedLetters')"
                    :aria-label="$t('settings.selectInitialLetters')"
                  />
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="filter-field">
                  <label>{{ $t('settings.languages') }}</label>
                  <MultiSelectDropdown
                    v-model="languageFilter"
                    :options="availableLanguages"
                    :include-select-all="true"
                    :include-select-none="false"
                    :searchable="true"
                    :dropdown-height="280"
                    :placeholder="$t('common.all')"
                    :select-all-label="$t('common.all')"
                    :selected-count-label="$t('settings.selectedLanguages')"
                    :aria-label="$t('settings.selectLanguages')"
                    :search-placeholder="$t('settings.searchLanguages')"
                    :no-options-label="$t('settings.noLanguagesFound')"
                  />
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="filter-field foundation-date-range-field">
                  <label>{{ $t('settings.foundationDate') }}</label>
                  <div class="foundation-date-range">
                    <VueDatePicker
                      v-model="foundationDateRangeValue"
                      range
                      :partial-range="true"
                      :locale="locale === 'es' ? 'es-419' : 'en-US'"
                      placeholder="Pick a range"
                      :aria-label="$t('settings.foundationDate')"
                      :cancel-text="$t('common.cancel')"
                      :select-text="$t('common.select')"
                      :dark="theme === 'dark'"
                      :max-date="todayDate"
                      :enable-time-picker="false"
                      :auto-apply="true"
                      :utc="'preserve'"
                      :timezone="'UTC'"
                    />
                  </div>
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="filter-field">
                  <label>{{ $t('settings.favorites') }}</label>
                  <div class="only-favorites-control">
                    <input
                      :id="`${storeGetter}-only-favorites`"
                      v-model="favoritesOnly"
                      type="checkbox"
                      :disabled="!currentUser"
                    />
                    <label :for="`${storeGetter}-only-favorites`">{{
                      $t('settings.onlyFavorites')
                    }}</label>
                  </div>
                </SettingsSubcontainerParameter>
              </SettingsSubcontainer>

              <SettingsSubcontainer
                v-else-if="activeSettingsTab === 'Sort'"
                :text="$t('settingsTabs.Sort')"
              >
                <SettingsSubcontainerParameter class="sort-radio-group">
                  <div>
                    <input
                      type="radio"
                      id="sortA-Z"
                      name="directory-sorting"
                      value="ascending"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortA-Z">{{ $t('settings.nameAZ') }}</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="sortZ-A"
                      name="directory-sorting"
                      value="descending"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortZ-A">{{ $t('settings.nameZA') }}</label>
                  </div>
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="sort-radio-group">
                  <div>
                    <input
                      type="radio"
                      id="sortLatestAdded"
                      name="directory-sorting"
                      value="latestAdded"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortLatestAdded">{{ $t('settings.latest') }}</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="sortOldestAdded"
                      name="directory-sorting"
                      value="oldestAdded"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortOldestAdded">{{ $t('settings.oldest') }}</label>
                  </div>
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="sort-radio-group">
                  <div>
                    <input
                      type="radio"
                      id="sortRandom"
                      name="directory-sorting"
                      value="random"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortRandom">{{ $t('settings.random') }}</label>
                  </div>
                </SettingsSubcontainerParameter>
              </SettingsSubcontainer>

              <SettingsSubcontainer
                v-else-if="activeSettingsTab === 'Display'"
                :text="$t('settingsTabs.Display')"
              >
                <SettingsSubcontainerParameter :centered="true">
                  <label ref="cardSizeLabel">{{ $t('common.cardSize') }}</label>
                  <input
                    type="range"
                    min="50"
                    max="350"
                    class="settings-slider"
                    id="zoomRange"
                    ref="zoomRange"
                    @input="updateZoom"
                    @change="finishedUpdatingZoom"
                    v-model="entryWidth"
                  />
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter :centered="true">
                  <div style="display: flex">
                    <input
                      id="fixedHeightCheckbox"
                      type="checkbox"
                      v-model="fixedHeight"
                      @change="updateFixedHeight"
                    />
                    <label for="fixedHeightCheckbox" ref="fixedHeightLabel">{{
                      $t('common.fixedHeight')
                    }}</label>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1500"
                    class="settings-slider"
                    id="heightRange"
                    ref="heightRange"
                    @input="updateHeight"
                    @change="finishedUpdatingHeight"
                    v-model="fixedHeightValue"
                  />
                </SettingsSubcontainerParameter>
              </SettingsSubcontainer>

              <SettingsSubcontainer
                v-else-if="activeSettingsTab === 'Flags'"
                :text="$t('settingsTabs.Flags')"
              >
                <SettingsSubcontainerParameter :centered="true">
                  <button
                    id="generateCollage"
                    class="login-button squared-button color-transition"
                    :disabled="generatingCollage"
                    @click="generateCollage"
                  >
                    {{ generatingCollage ? $t('settings.generating') : $t('settings.generate') }}
                  </button>
                </SettingsSubcontainerParameter>
              </SettingsSubcontainer>
            </div>
          </Transition>
        </div>

        <div
          v-if="!hiddenSubcontainers.includes('Total')"
          class="matching-entries-container"
          aria-live="polite"
        >
          <span class="matching-entries-label">{{ $t('common.matched') }}</span>
          <strong>{{ visibleElements.length }}</strong>
        </div>
      </div>
    </div>

    <div v-if="!directoryLoaded" class="loading-image-container">
      <img class="loading-image" src="/images/loading.gif" alt="Loading" />
      <label>{{ $t('settings.loading') }}</label>
    </div>

    <p class="no-results" v-if="directoryLoaded && !pagedElements.length">
      {{ $t('settings.noResults') }}
    </p>
  </div>
</template>

<script>
import { notify } from '@kyvg/vue3-notification'
import { favorites } from '../composables/userFavorites.js'

export default {
  name: 'Settings-Bar',
  emits: [
    'updatedEntryWidth',
    'updatedFixedHeight',
    'updatedFixedHeightValue',
    'viewModeChanged',
    'loadedDirectory'
  ],
  components: {
    SettingsSubcontainer,
    SettingsSubcontainerParameter,
    SettingsSubcontainerTitle
  },
  data() {
    return {
      directoryLoaded: false,
      workingDirectory: [],
      activeSettingsTab: 'Pages',
      viewMode: this.storeGetter,
      generatingCollage: false,
      inputFilter: '',
      searchDebounce: null,
      initialFilter: [],
      languageFilter: [],
      foundationDateFrom: null,
      foundationDateTo: null,
      favoritesOnly: false,
      entrySorting: 'latestAdded',
      entriesPerPage: 50,
      currentPage: 1,
      maxTotalLoad: 10000,
      fixedHeight: false,
      fixedHeightValue: 400,
      entryWidth: 180,
      scrollPosition: 0
    }
  },
  watch: {
    inputFilter() {
      clearTimeout(this.searchDebounce)
      this.searchDebounce = setTimeout(() => this.applyFilters(), 300)
    },
    initialFilter() {
      this.applyFilters()
    },
    languageFilter() {
      this.setPage(1)
    },
    foundationDateFrom() {
      this.setPage(1)
    },
    foundationDateTo() {
      this.setPage(1)
    },
    favoritesOnly() {
      this.applyFilters()
    },
    elementsDirectory: {
      immediate: true,
      handler(entries) {
        const query = this.normalizeString(this.inputFilter.toLowerCase())
        this.workingDirectory = (entries || []).map((element) => ({
          ...element,
          name: {
            ...element.name,
            mainAlt: element.name?.mainAlt || '',
            alt: element.name?.alt || []
          },
          searchDisplay:
            !query ||
            [
              element.name.main,
              element.name.mainAlt,
              element.name.title,
              element.name.titleAlt,
              ...(element.name.alt || []).flatMap((name) => [name.main, name.title])
            ].some((name) => this.normalizeString((name || '').toLowerCase()).includes(query)),
          filterDisplay:
            this.initialFilter.length === 0 ||
            this.initialFilter.includes(this.normalizeString(element.name.main.charAt(0)))
        }))
        const availableInitialLetters = this.addFilterLetters(this.workingDirectory, 'main')
        this.initialFilter = this.initialFilter.filter((letter) =>
          availableInitialLetters.includes(letter)
        )
        const availableLanguages = this.collectLanguages(this.workingDirectory)
        this.languageFilter = this.languageFilter.filter((language) =>
          availableLanguages.includes(language)
        )
        if (this.directoryLoaded) {
          this.currentPage = 1
          this.sortMicronations()
        }
      }
    },
    availableSettingsTabs(tabs) {
      if (!tabs.some((tab) => tab.id === this.activeSettingsTab)) {
        this.activeSettingsTab = tabs[0]?.id || ''
      }
    },
    directoryLoaded(newValue) {
      if (newValue === true) {
        this.sortMicronations()
      }
    }
  },
  computed: {
    availableSettingsTabs() {
      const tabs = ['Pages', 'Filter', 'Sort', 'Display']
      if (
        !this.hiddenSubcontainers.includes('Flags') &&
        (this.viewMode === 'micronations' || this.viewMode === 'collage')
      ) {
        tabs.push('Flags')
      }
      return tabs
        .filter((tab) => !this.hiddenSubcontainers.includes(tab))
        .map((tab) => ({ id: tab, label: tab }))
    },
    visibleElements() {
      if (this.workingDirectory.length) {
        this.directoryLoaded = true
      }
      return this.workingDirectory.filter(
        (element) =>
          (this.showUnapproved || element.approved) &&
          element.searchDisplay &&
          element.filterDisplay &&
          this.matchesLanguageFilter(element) &&
          this.matchesFoundationDateFilter(element) &&
          (!this.favoritesOnly ||
            favorites.value[this.storeGetter]?.includes(element.directoryId || element.id))
      )
    },
    pagedElements() {
      const firstVisibleIndex = this.entriesPerPage * (this.currentPage - 1)
      return this.visibleElements.slice(
        firstVisibleIndex,
        firstVisibleIndex + Number(this.entriesPerPage)
      )
    },
    totalPages() {
      return Math.max(Math.ceil(this.visibleElements.length / this.entriesPerPage), 1)
    },
    filterLetters() {
      return this.addFilterLetters(this.workingDirectory, 'main')
    },
    availableLanguages() {
      return this.collectLanguages(this.workingDirectory)
    },
    todayDate() {
      return new Date()
    },
    foundationDateRangeValue: {
      get() {
        const from = this.toValidDate(this.foundationDateFrom)
        const to = this.toValidDate(this.foundationDateTo)
        return from || to ? [from, to] : null
      },
      set(value) {
        if (!Array.isArray(value)) {
          this.foundationDateFrom = null
          this.foundationDateTo = null
          return
        }
        this.foundationDateFrom = this.toValidDate(value[0])
        this.foundationDateTo = this.toValidDate(value[1])
      }
    }
  },
  methods: {
    collectLanguages(elements) {
      return [
        ...new Set(
          (elements || []).flatMap((element) => {
            const languages = Array.isArray(element.languages)
              ? element.languages
              : [element.languages]
            return languages.filter((language) => typeof language === 'string' && language.trim())
          })
        )
      ].sort((a, b) => a.localeCompare(b))
    },
    matchesLanguageFilter(element) {
      if (!this.languageFilter.length) return true
      const languages = Array.isArray(element.languages) ? element.languages : [element.languages]
      return this.languageFilter.some((language) => languages.includes(language))
    },
    matchesFoundationDateFilter(element) {
      const from = this.toValidDate(this.foundationDateFrom)
      const to = this.toValidDate(this.foundationDateTo)
      if (!from && !to) return !this.foundationDateFrom && !this.foundationDateTo
      if ((this.foundationDateFrom && !from) || (this.foundationDateTo && !to)) return false
      const rawDate = element.foundationDate
      const seconds = rawDate?._seconds ?? rawDate?.seconds
      if (seconds != null && (!Number.isFinite(Number(seconds)) || Number(seconds) <= 0))
        return false
      const date =
        seconds != null
          ? new Date(Number(seconds) * 1000)
          : rawDate instanceof Date
          ? rawDate
          : typeof rawDate === 'string' || typeof rawDate === 'number'
          ? new Date(rawDate)
          : null
      if (!date || Number.isNaN(date.getTime())) return false
      const timestamp = date.getTime()
      const start = from
        ? Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
        : null
      const end = to
        ? Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 23, 59, 59, 999)
        : null
      return (start === null || timestamp >= start) && (end === null || timestamp <= end)
    },
    toValidDate(value) {
      if (value == null || value === '') return null
      if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
      const seconds = value?._seconds ?? value?.seconds
      const date = seconds != null ? new Date(Number(seconds) * 1000) : new Date(value)
      return Number.isNaN(date.getTime()) ? null : date
    },
    setPage(result) {
      this.currentPage = result
      this.pageElements()
    },
    pageElements() {
      if (this.entriesPerPage < 1) {
        this.entriesPerPage = 1
      } else if (this.entriesPerPage > this.maxTotalLoad) {
        this.entriesPerPage = this.maxTotalLoad
      }

      this.currentPage = Math.min(Math.max(Number(this.currentPage) || 1, 1), this.totalPages)

      this.emitDirectory()
    },
    sortMicronations() {
      switch (this.entrySorting) {
        case 'ascending':
          this.workingDirectory.sort((a, b) => this.compareEntryNames(a, b))
          break
        case 'descending':
          this.workingDirectory.sort((a, b) => this.compareEntryNames(b, a))
          break
        case 'latestAdded':
          this.workingDirectory.sort((a, b) => this.entryTimestamp(b) - this.entryTimestamp(a))
          break
        case 'oldestAdded':
          this.workingDirectory.sort((a, b) => this.entryTimestamp(a) - this.entryTimestamp(b))
          break
        case 'random':
          this.shuffleArray(this.workingDirectory)
          break
        default:
          break
      }

      this.pageElements()
    },
    addFilterLetters(array, propName) {
      let letters = []
      const that = this

      array.forEach(function (element) {
        if (that.subPropForFilter) {
          if (
            (that.showUnapproved || element.approved) &&
            !letters.includes(that.normalizeString(element.name[propName].charAt(0)))
          ) {
            letters.push(that.normalizeString(element.name[propName].charAt(0)))
          }
        } else {
          if (
            (that.showUnapproved || element.approved) &&
            !letters.includes(that.normalizeString(element.name.charAt(0)))
          ) {
            letters.push(that.normalizeString(element.name.charAt(0)))
          }
        }
      })

      return letters.sort((a, b) => (a > b ? 1 : -1))
    },
    filterEntries() {
      const that = this

      if (this.inputFilter == '') {
        this.workingDirectory.forEach(function (element) {
          element.searchDisplay = true
        })
      } else {
        this.workingDirectory.forEach(function (element) {
          const searchCurated = that.normalizeString(that.inputFilter.toLowerCase())
          const names = [
            element.name.main,
            element.name.mainAlt,
            element.name.title,
            element.name.titleAlt,
            ...(element.name.alt || []).flatMap((name) => [name.main, name.title])
          ]
          const matches = names.some((name) =>
            that.normalizeString((name || '').toLowerCase()).includes(searchCurated)
          )

          if (!matches) {
            element.searchDisplay = false
          } else {
            element.searchDisplay = true
          }
        })
      }
    },
    filterEntriesByLetter() {
      this.workingDirectory.forEach((element) => {
        const firstLetter = this.normalizeString(element.name.main.charAt(0))
        element.filterDisplay =
          this.initialFilter.length === 0 || this.initialFilter.includes(firstLetter)
      })
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
    },
    applyFilters() {
      this.filterEntries()
      this.filterEntriesByLetter()
      this.setPage(1)
    },
    normalizeString(string) {
      return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    },
    compareEntryNames(a, b) {
      const first = this.normalizeString((a.name?.main || '').toLowerCase())
      const second = this.normalizeString((b.name?.main || '').toLowerCase())
      return first.localeCompare(second)
    },
    entryTimestamp(entry) {
      // creationDate is the directory's original addition date. createdAt is
      // the GitHub submission date and changes when an existing entry is edited.
      const creationDate = entry.creationDate
      if (creationDate?._seconds) return creationDate._seconds
      if (creationDate?.seconds) return creationDate.seconds
      const timestamp = new Date(creationDate || 0).getTime()
      if (Number.isFinite(timestamp) && timestamp > 0) return timestamp / 1000

      if (entry.createdAt) {
        const addedAt = new Date(entry.createdAt).getTime()
        if (Number.isFinite(addedAt)) return addedAt / 1000
      }

      return 0
    },
    updateZoom() {
      this.$refs.cardSizeLabel.innerHTML = this.entryWidth + 'px'
      this.$emit('updatedEntryWidth', this.entryWidth)
    },
    finishedUpdatingZoom() {
      this.$refs.cardSizeLabel.innerHTML = 'Card size'
    },
    updateHeight() {
      this.$refs.fixedHeightLabel.innerHTML = this.fixedHeightValue + 'px'
      this.$emit('updatedFixedHeightValue', Number(this.fixedHeightValue))
    },
    updateFixedHeight() {
      this.$emit('updatedFixedHeight', this.fixedHeight)
    },
    finishedUpdatingHeight() {
      this.$refs.fixedHeightLabel.innerHTML = 'Fixed height'
    },
    emitDirectory() {
      this.$emit('loadedDirectory', this.pagedElements)
    },
    async generateCollage() {
      const collage = document.getElementById('micronationsList')
      if (!collage || this.generatingCollage) return

      this.generatingCollage = true
      try {
        // Emitir evento para cambiar a modo bandera
        this.$emit('viewModeChanged', 'collage')
        await this.$nextTick()

        const [{ default: html2canvas }, { saveAs }] = await Promise.all([
          import('html2canvas'),
          import('file-saver')
        ])
        await this.$nextTick()

        // Esperar a que las imágenes carguen
        await Promise.all(
          Array.from(collage.querySelectorAll('img')).map(async (image) => {
            if (image.complete) return
            await new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true })
              image.addEventListener('error', resolve, { once: true })
            })
          })
        )

        const canvas = await html2canvas(collage, {
          backgroundColor: getComputedStyle(collage).backgroundColor || '#ffffff',
          scale: Math.max(2, window.devicePixelRatio || 1),
          useCORS: true,
          logging: false,
          windowWidth: Math.max(document.documentElement.clientWidth, collage.scrollWidth),
          windowHeight: Math.max(document.documentElement.clientHeight, collage.scrollHeight)
        })
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
        if (!blob) throw new Error('Could not create collage image')
        saveAs(blob, 'flag-collage.png')

        // Volver a la normalidad después de la descarga
        this.$emit('viewModeChanged', 'micronations')
        notify({ title: 'Flag collage generated', type: 'success' })
      } catch (error) {
        console.error('Could not generate flag collage:', error)
        notify({
          title: 'Could not generate flag collage',
          text: 'Some flags may not allow export. Try again after the images have loaded.',
          type: 'error'
        })
        // Asegurar volver a la normalidad en caso de error
        this.$emit('viewModeChanged', 'micronations')
      } finally {
        this.generatingCollage = false
      }
    }
  },
  mounted() {
    const that = this
    window.addEventListener('scroll', () => {
      that.scrollPosition = window.scrollY
    })
  },
  beforeUnmount() {
    clearTimeout(this.searchDebounce)
  }
}
</script>

<style scoped>
.directory-settings {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  color: var(--vt-c-text-dark-2);
  width: 100%;
  padding: 0 12px;
  margin: 15px 0 20px 0;
}

.directory-settings :deep(.settings-subcontainer) {
  min-width: 0;
  margin: 0;
}

.directory-settings :deep(.slot-container) {
  width: auto;
  height: auto;
  min-height: 68px;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  padding: 8px 10px;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.directory-settings :deep(.setting-parameter-subcontainer) {
  min-width: 0;
  margin-left: 4px;
  margin-right: 4px;
}

.settings-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
  grid-template-rows: auto auto;
  align-items: stretch;
  column-gap: 12px;
  min-width: 0;
  flex: 1;
}
.settings-controls.without-count {
  grid-template-columns: minmax(0, 1fr);
}

.settings-tabs {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.settings-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 6px 15px;
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 650;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.settings-tab-icon {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
}

.settings-tab:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}
.settings-tab.active {
  border-color: var(--color-accent);
  background: var(--navbar-tab-background-color-selected);
  color: var(--color-accent);
}

.settings-panel-frame {
  position: relative;
  z-index: 50;
  grid-column: 1;
  grid-row: 2;
  height: 104px;
  min-height: 104px;
  overflow: visible;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 8px 12px;
  background: var(--color-background-soft);
}

.settings-panel {
  width: 100%;
  height: 100%;
}
.settings-panel :deep(.settings-subcontainer) {
  width: fit-content;
  max-width: 100%;
  height: 100%;
}
.settings-panel :deep(.subcontainer-title) {
  display: none;
}
.settings-panel :deep(.slot-container) {
  width: auto;
  height: 100%;
  min-height: 0;
  border: 0;
  background: transparent;
  padding: 0 12px;
  gap: 18px;
}
.settings-panel :deep(.setting-parameter-subcontainer) {
  flex: 0 0 auto;
  min-width: 0;
  margin: 0;
}
.settings-panel :deep(.setting-parameter-subcontainer > div) {
  align-items: center;
  gap: 15px;
}
.settings-panel :deep(.setting-parameter-subcontainer input[type='radio']) {
  flex: 0 0 16px;
  align-self: center;
  margin: 0;
}
.settings-panel :deep(.setting-parameter-subcontainer input[type='radio'] + label) {
  display: inline-flex;
  align-items: center;
  line-height: 1.35;
}
.settings-panel :deep(.filter-field) {
  flex: 0 1 240px;
}
.settings-panel :deep(.filter-field > input),
.settings-panel :deep(.filter-field > select) {
  width: 100%;
}
.settings-panel :deep(.setting-parameter-subcontainer.border-left) {
  border: 0;
  padding: 0;
}
.settings-panel :deep(#filterInput) {
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
}
.settings-panel :deep(.filter-field .multi-select-dropdown) {
  width: 100%;
}
.settings-panel :deep(.settings-slider) {
  width: clamp(120px, 22vw, 240px);
}
.settings-panel :deep(.flag-collage-controls),
.settings-panel :deep(.flag-collage-toggle) {
  display: flex;
  align-items: center;
}
.settings-panel :deep(.flag-collage-controls) {
  gap: 12px;
  flex-wrap: nowrap;
  width: max-content;
}
.settings-panel :deep(.flag-collage-toggle) {
  gap: 7px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.settings-panel :deep(#flagViewCheckbox) {
  flex: 0 0 16px;
  margin: 0;
}
.settings-panel :deep(#generateCollage) {
  min-height: 36px;
  white-space: nowrap;
  padding: 12px 18px;
}
.settings-panel :deep(div.page-controls) {
  height: 38px;
  gap: 5px;
}
.settings-panel :deep(.page-button) {
  flex: 0 0 34px;
  width: 34px;
  height: 38px;
  min-height: 38px;
  padding: 0;
  border-radius: 9px;
}
.settings-panel :deep(#currentPage) {
  width: 54px;
}
.settings-panel-pages :deep(.setting-parameter-subcontainer:first-child) {
  align-items: flex-start;
  align-self: center;
  gap: 4px;
}
.settings-panel-pages :deep(.setting-parameter-subcontainer.border-left) {
  align-self: center;
  justify-content: center;
}
.settings-panel-pages :deep(#entriesPerPageInput) {
  width: 120px;
}
.settings-panel-filter :deep(.settings-subcontainer) {
  width: 100%;
}
.settings-panel-filter :deep(.slot-container) {
  display: grid;
  width: 100%;
  max-width: 100%;
  grid-template-columns: 160px 160px 160px 190px max-content;
  align-items: center;
  gap: 18px;
}
.settings-panel-filter :deep(.filter-field) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: center;
  gap: 4px;
  min-width: 0;
}
.settings-panel-filter :deep(.filter-field > input),
.settings-panel-filter :deep(.filter-field > select) {
  width: 100%;
  min-width: 0;
}
.settings-panel-filter :deep(.filter-field > input) {
  max-width: 160px;
}
.settings-panel-filter :deep(.filter-field select) {
  max-width: 160px;
}
.settings-panel-filter :deep(#filterInput) {
  width: 160px;
  max-width: 160px;
}
.settings-panel-filter :deep(.multi-select-dropdown) {
  width: 160px;
  min-width: 110px;
}
.settings-panel-filter :deep(.foundation-date-range) {
  width: 100%;
  min-width: 0;
}
.settings-panel-filter :deep(.foundation-date-range .dp__main) {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.settings-panel-filter :deep(.foundation-date-range .dp__input_wrap) {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
.settings-panel-filter :deep(.foundation-date-range .dp__input) {
  width: 100%;
  min-width: 0;
  padding: 7px 8px 7px 32px;
  font-size: 13px;
  box-sizing: border-box;
}
.settings-panel-filter :deep(.only-favorites-control) {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.settings-panel-filter :deep(.only-favorites-control input[type='checkbox']) {
  flex: 0 0 16px;
  margin: 0;
}

@media (min-width: 681px) and (max-width: 1050px) {
  .settings-panel-frame {
    height: auto;
    min-height: 104px;
  }
  .settings-panel-filter {
    height: auto;
  }
  .settings-panel-filter :deep(.settings-subcontainer) {
    width: 100%;
    min-width: 0;
    height: auto;
  }
  .settings-panel-filter :deep(.slot-container) {
    box-sizing: border-box;
    height: auto;
    min-height: 58px;
    grid-template-columns: repeat(3, minmax(140px, 1fr));
    align-items: center;
    gap: 10px;
    padding: 8px;
  }
  .settings-panel-filter :deep(.foundation-date-range-field) {
    grid-column: span 2;
  }
  .settings-panel-filter :deep(.filter-field) {
    min-width: 0;
    margin: 0;
  }
}
.settings-panel-flags :deep(.settings-subcontainer),
.settings-panel-flags :deep(.slot-container) {
  width: 100%;
}
.settings-panel-flags :deep(.slot-container) {
  align-items: center;
}

.settings-panel-enter-active,
.settings-panel-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.settings-panel-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.settings-panel-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.matching-entries-container {
  grid-column: 2;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  min-height: 72px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.25;
  text-align: center;
}
.matching-entries-container strong {
  color: var(--color-heading);
  font-size: 18px;
}
.settings-panel :deep(.sort-options) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
}
.settings-panel :deep(.sort-options > div) {
  display: flex;
  gap: 5px;
  align-items: center;
}
.settings-panel :deep(div.sort-radio-group > div) {
  gap: 5px;
}
.settings-panel :deep(.sort-radio-group > div + div) {
  margin-top: 6px;
}

.directory-settings.floating {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 8px 16px;
  margin: 0;
  background: var(--color-background);
  box-shadow: var(--shadow-soft);
  z-index: 20;
}

.settings-subcontainer div {
  display: flex;
}

.matching-entries-title {
  text-align: center;
  line-height: 12px;
}

.matching-entries {
  /* border-left: 2px dashed var(--vt-c-white); */
  font-size: 17px;
  font-weight: bold;
}

#filterInput {
  width: 100%;
  min-width: 0;
}

#entriesPerPageInput {
  width: 60px;
}

#currentPage {
  width: 54px;
  margin-left: 5px;
}

#totalPages {
  margin-right: 5px;
}

.page-button {
  border-radius: 9px;
  height: 40px;
  width: 34px;
  font-weight: bold;
}

.tools-container {
  width: fit-content;
}

.settings-slider {
  width: clamp(120px, 22vw, 240px);
}

.no-results {
  margin-left: 15px;
}

@media (max-width: 680px) {
  .directory-settings {
    flex-direction: column;
    padding: 0;
  }
  .settings-controls {
    width: 100%;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    column-gap: 8px;
  }
  .settings-controls.without-count {
    grid-template-columns: minmax(0, 1fr);
  }
  .settings-tabs {
    display: flex;
    grid-column: 1;
    grid-row: 1;
    flex-wrap: nowrap;
    gap: 4px;
  }
  .settings-tab {
    flex: 1 1 0;
    min-width: 0;
    padding: 6px 4px;
  }
  .settings-tab-label {
    display: none;
  }
  .settings-tab-icon {
    width: 20px;
    height: 20px;
    flex-basis: 20px;
  }
  .settings-panel-frame {
    grid-column: 1;
    grid-row: 2;
    height: auto;
    min-height: 0;
    overflow: visible;
    padding: 8px;
  }
  .settings-panel {
    height: auto;
  }
  .settings-panel :deep(.settings-subcontainer),
  .settings-panel :deep(.slot-container) {
    height: auto;
  }
  .settings-panel :deep(.slot-container) {
    flex-wrap: wrap;
    gap: 10px;
    padding: 0;
  }
  .settings-panel :deep(div.page-controls) {
    flex-wrap: wrap;
    height: auto;
  }
  .settings-panel-sort :deep(.slot-container) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
  .settings-panel-sort :deep(.setting-parameter-subcontainer) {
    width: 100%;
    margin: 0;
  }
  .settings-panel-pages :deep(.setting-parameter-subcontainer:first-child) {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .matching-entries-container {
    grid-column: 1;
    grid-row: 3;
    flex-direction: row;
    gap: 8px;
    min-height: 48px;
    margin-top: 8px;
  }
  .matching-entries-container br {
    display: none;
  }
  .matching-entries-label {
    white-space: nowrap;
  }
  .settings-panel :deep(.slot-container) {
    align-items: stretch;
  }
  .settings-panel :deep(.setting-parameter-subcontainer) {
    flex: 0 1 auto;
  }
  .settings-panel :deep(.filter-field) {
    width: 100%;
    min-width: 0;
    margin: 0;
  }
  .settings-panel-filter :deep(.slot-container) {
    width: 100%;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
  .settings-panel-filter :deep(.filter-field) {
    grid-template-columns: 1fr;
    gap: 3px;
  }
  .settings-panel-filter :deep(.foundation-date-range-field) {
    width: 100% !important;
    flex: 1 1 100%;
    align-items: stretch;
  }
  .settings-panel-filter :deep(.multi-select-dropdown) {
    width: 100%;
    min-width: 0;
  }
  .settings-panel-filter :deep(#filterInput) {
    width: 100%;
    max-width: 100%;
  }
  .settings-panel-filter :deep(.foundation-date-range) {
    display: block !important;
    width: 100% !important;
    align-self: stretch;
  }
  .settings-panel-filter :deep(.foundation-date-range .dp__main),
  .settings-panel-filter :deep(.foundation-date-range .dp__main > div) {
    width: 100% !important;
    min-width: 0;
  }
  .settings-panel-filter :deep(.foundation-date-range .dp__input_wrap),
  .settings-panel-filter :deep(.foundation-date-range .dp__input) {
    width: 100% !important;
    max-width: none !important;
  }
  .settings-panel-filter :deep(.foundation-date-range .dp__input_wrap) {
    box-sizing: border-box !important;
  }
  .settings-panel :deep(.setting-parameter-subcontainer > div) {
    flex-wrap: wrap;
  }
  .directory-settings.floating {
    position: sticky;
    top: 0;
  }
}

@media (max-width: 400px) {
  .matching-entries-container {
    font-size: 11px;
  }
  .settings-panel :deep(.setting-parameter-subcontainer) {
    flex-basis: 100%;
  }
  .settings-panel :deep(.settings-slider) {
    width: 100%;
  }
  .settings-panel-filter :deep(.slot-container) {
    grid-template-columns: minmax(0, 1fr);
  }
  .settings-panel-filter :deep(#filterInput),
  .settings-panel-filter :deep(.multi-select-dropdown) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
}
</style>
