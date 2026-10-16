<script setup>
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue'
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue'
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue'
import store from '../store'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

defineProps({
  storeGetter: {
    type: String,
    required: true,
    default: 'directory'
  },
  viewMode: {
    type: String,
    required: true,
    default: 'micronations'
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
        <div class="settings-tabs" role="tablist" aria-label="Directory settings">
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
            @click="activeSettingsTab = tab.id"
          >
            {{ tab.label }}
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
              <SettingsSubcontainer v-if="activeSettingsTab === 'Pages'" text="Pages">
                <SettingsSubcontainerParameter :centered="true">
                  <label>Entries/page</label>
                  <input
                    id="entriesPerPageInput"
                    placeholder="Input an amount"
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
                      placeholder="Page"
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

              <SettingsSubcontainer v-else-if="activeSettingsTab === 'Filter'" text="Filter">
                <SettingsSubcontainerParameter class="filter-field">
                  <label for="filterInput">Search</label>
                  <input
                    id="filterInput"
                    v-model="inputFilter"
                    type="text"
                    placeholder="Search name..."
                  />
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="filter-field">
                  <label for="initialLetter">Initial</label>
                  <select name="initialLetter" id="initialLetter" v-model="initialFilter">
                    <optgroup>
                      <option value="none">No filter</option>
                    </optgroup>
                    <optgroup class="letters-group">
                      <option :value="letter" v-for="(letter, i) in filterLetters" :key="i">
                        {{ letter }}
                      </option>
                    </optgroup>
                  </select>
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter class="filter-action">
                  <button
                    id="applyFilters"
                    class="login-button squared-button color-transition"
                    @click="applyFilters"
                  >
                    Apply
                  </button>
                </SettingsSubcontainerParameter>
              </SettingsSubcontainer>

              <SettingsSubcontainer v-else-if="activeSettingsTab === 'Sort'" text="Sort">
                <SettingsSubcontainerParameter>
                  <div>
                    <input
                      type="radio"
                      id="sortA-Z"
                      name="directory-sorting"
                      value="ascending"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortA-Z">Name (A-Z)</label>
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
                    <label for="sortZ-A">Name (Z-A)</label>
                  </div>
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter>
                  <div>
                    <input
                      type="radio"
                      id="sortLatestAdded"
                      name="directory-sorting"
                      value="latestAdded"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortLatestAdded">Latest added</label>
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
                    <label for="sortOldestAdded">Oldest added</label>
                  </div>
                </SettingsSubcontainerParameter>
                <SettingsSubcontainerParameter>
                  <div>
                    <input
                      type="radio"
                      id="sortRandom"
                      name="directory-sorting"
                      value="random"
                      v-model="entrySorting"
                      @change="sortMicronations"
                    />
                    <label for="sortRandom">Random</label>
                  </div>
                </SettingsSubcontainerParameter>
              </SettingsSubcontainer>

              <SettingsSubcontainer v-else-if="activeSettingsTab === 'Display'" text="Display">
                <SettingsSubcontainerParameter :centered="true">
                  <label ref="cardSizeLabel">Card size</label>
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
                    <input id="fixedHeightCheckbox" type="checkbox" v-model="fixedHeight" />
                    <label for="fixedHeightCheckbox" ref="fixedHeightLabel">Fixed height</label>
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

              <SettingsSubcontainer v-else-if="activeSettingsTab === 'Flags'" text="Flags">
                <SettingsSubcontainerParameter :centered="true">
                  <div style="display: flex">
                    <input
                      id="flagViewCheckbox"
                      type="checkbox"
                      v-model="flagView"
                      @input="checkFlagView"
                    />
                    <label for="flagViewCheckbox" ref="fixedHeightLabel">Flag collage</label>
                  </div>
                  <button
                    id="generateCollage"
                    class="login-button squared-button color-transition"
                    :disabled="viewMode !== 'collage'"
                    @click="generateCollage"
                  >
                    Generate
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
          <span>Matched<br />entries</span>
          <strong>{{ visibleElements.length }}</strong>
        </div>
      </div>
    </div>

    <div v-if="!directoryLoaded" class="loading-image-container">
      <img class="loading-image" src="/images/loading.gif" alt="Loading" />
      <label>Loading Directory...</label>
    </div>

    <p class="no-results" v-if="directoryLoaded && !pagedElements.length">
      There are no matching results for this filter.
    </p>
  </div>
</template>

<script>
export default {
  name: 'Settings-Bar',
  emits: ['updatedEntryWidth', 'viewModeChanged', 'loadedDirectory'],
  components: {
    SettingsSubcontainer,
    SettingsSubcontainerParameter,
    SettingsSubcontainerTitle
  },
  data: () => {
    return {
      directoryLoaded: false,
      activeSettingsTab: 'Pages',
      flagView: false,
      inputFilter: '',
      initialFilter: 'none',
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
      if (this.elementsDirectory.length) {
        this.directoryLoaded = true
      }
      return this.elementsDirectory.filter(
        (element) => element.approved && element.searchDisplay && element.filterDisplay
      )
    },
    pagedElements() {
      return this.elementsDirectory.filter(
        (element) =>
          element.approved && element.pageDisplay && element.searchDisplay && element.filterDisplay
      )
    },
    totalPages() {
      return Math.ceil(this.visibleElements.length / this.entriesPerPage)
    },
    filterLetters() {
      return this.addFilterLetters(this.elementsDirectory, 'main')
    }
  },
  methods: {
    setPage(result) {
      this.currentPage = result
      this.pageElements()
    },
    pageElements() {
      const that = this

      this.visibleElements.forEach(function (entry, index) {
        if (
          that.entriesPerPage * that.currentPage - 1 >= index &&
          index >= that.entriesPerPage * (that.currentPage - 1)
        ) {
          entry.pageDisplay = true
        } else {
          entry.pageDisplay = false
        }
      })

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
      if (this.entriesPerPage < 1) {
        this.entriesPerPage = 1
      } else if (this.entriesPerPage > this.maxTotalLoad) {
        this.entriesPerPage = this.maxTotalLoad
      }

      this.emitDirectory()
    },
    sortMicronations() {
      switch (this.entrySorting) {
        case 'ascending':
          this.elementsDirectory.sort((a, b) =>
            this.normalizeString(a.name.main) > this.normalizeString(b.name.main) ? 1 : -1
          )
          break
        case 'descending':
          this.elementsDirectory.sort((a, b) =>
            this.normalizeString(a.name.main) > this.normalizeString(b.name.main) ? 1 : -1
          )
          this.elementsDirectory.reverse()
          break
        case 'latestAdded':
          this.elementsDirectory.sort((a, b) =>
            a.creationDate._seconds > b.creationDate._seconds ? 1 : -1
          )
          this.elementsDirectory.reverse()
          break
        case 'oldestAdded':
          this.elementsDirectory.sort((a, b) =>
            a.creationDate._seconds > b.creationDate._seconds ? 1 : -1
          )
          break
        case 'random':
          this.shuffleArray(this.elementsDirectory)
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
            element.approved &&
            !letters.includes(that.normalizeString(element.name[propName].charAt(0)))
          ) {
            letters.push(that.normalizeString(element.name[propName].charAt(0)))
          }
        } else {
          if (element.approved && !letters.includes(that.normalizeString(element.name.charAt(0)))) {
            letters.push(that.normalizeString(element.name.charAt(0)))
          }
        }
      })

      return letters.sort((a, b) => (a > b ? 1 : -1))
    },
    filterEntries() {
      const that = this

      if (this.inputFilter == '') {
        this.elementsDirectory.forEach(function (element) {
          element.searchDisplay = true
        })
      } else {
        this.elementsDirectory.forEach(function (element) {
          const entryCurated = that.normalizeString(element.name.main.toLowerCase())
          const entryAltCurated = that.normalizeString(element.name.mainAlt.toLowerCase())
          const searchCurated = that.normalizeString(that.inputFilter.toLowerCase())

          if (!entryCurated.includes(searchCurated) && !entryAltCurated.includes(searchCurated)) {
            element.searchDisplay = false
          } else {
            element.searchDisplay = true
          }
        })
      }

      this.setPage(1)
    },
    filterEntriesByLetter() {
      const that = this

      if (this.initialFilter === 'none') {
        this.elementsDirectory.forEach(function (element) {
          element.filterDisplay = true
        })
      } else {
        this.elementsDirectory.forEach(function (element) {
          if (that.normalizeString(element.name.main.charAt(0)) === that.initialFilter) {
            element.filterDisplay = true
          } else {
            element.filterDisplay = false
          }
        })
      }

      this.setPage(1)
    },
    checkFlagView() {
      if (this.flagView === true) {
        this.$emit('viewModeChanged', 'micronations')
      } else {
        this.$emit('viewModeChanged', 'collage')
      }
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
    },
    normalizeString(string) {
      return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
    },
    finishedUpdatingHeight() {
      this.$refs.fixedHeightLabel.innerHTML = 'Fixed height'
    },
    emitDirectory() {
      this.$emit('loadedDirectory', this.pagedElements)
    },
    async generateCollage() {
      const canvas = await html2canvas(document.getElementById('micronationsList'), {
        useCORS: true
      })
      canvas.toBlob(async function (blob) {
        await saveAs(blob, 'flag-collage.png')
      })
    }
  },
  mounted() {
    const that = this
    window.addEventListener('scroll', () => {
      that.scrollPosition = window.scrollY
    })
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
  grid-column: 1;
  grid-row: 2;
  height: 104px;
  min-height: 104px;
  overflow: hidden;
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
  gap: 12px;
}
.settings-panel :deep(.setting-parameter-subcontainer) {
  flex: 0 0 auto;
  min-width: 0;
  margin: 0;
}
.settings-panel :deep(.setting-parameter-subcontainer > div) {
  align-items: center;
  gap: 7px;
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
.settings-panel :deep(.filter-field input),
.settings-panel :deep(.filter-field select) {
  width: 100%;
}
.settings-panel :deep(.filter-action) {
  flex: 0 0 auto;
  align-self: center;
}
.settings-panel :deep(.setting-parameter-subcontainer.border-left) {
  border: 0;
  padding: 0;
}
.settings-panel :deep(#filterInput),
.settings-panel :deep(#initialLetter) {
  width: 100%;
}
.settings-panel :deep(#applyFilters) {
  height: 38px;
  min-height: 38px;
}
.settings-panel :deep(.settings-slider) {
  width: clamp(120px, 22vw, 240px);
}
.settings-panel :deep(.page-controls) {
  height: 38px;
  gap: 7px;
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
  flex: 0 0 145px;
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
  width: fit-content;
  max-width: 100%;
  grid-template-columns: 160px 160px max-content;
  align-items: center;
  gap: 12px;
}
.settings-panel-filter :deep(.filter-field) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: center;
  gap: 4px;
  min-width: 0;
}
.settings-panel-filter :deep(.filter-field input),
.settings-panel-filter :deep(.filter-field select) {
  width: 100%;
  min-width: 0;
}
.settings-panel-filter :deep(.filter-field input) {
  max-width: 160px;
}
.settings-panel-filter :deep(.filter-field select) {
  max-width: 160px;
}
.settings-panel-filter :deep(#filterInput) {
  width: 160px;
  max-width: 160px;
}
.settings-panel-filter :deep(#initialLetter) {
  width: 160px;
  min-width: 110px;
}
.settings-panel-filter :deep(.filter-action) {
  margin: 0;
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

#initialLetter {
  width: 100%;
  min-width: 0;
}

#applyFilters {
  height: 42px;
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
    grid-template-columns: minmax(0, 1fr) 78px;
    column-gap: 8px;
  }
  .settings-controls.without-count {
    grid-template-columns: minmax(0, 1fr);
  }
  .settings-tabs {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  .settings-tab {
    padding: 6px 9px;
  }
  .settings-panel-frame {
    padding: 8px;
  }
  .matching-entries-container {
    min-height: 72px;
  }
  .settings-panel :deep(.slot-container) {
    align-items: stretch;
  }
  .settings-panel :deep(.setting-parameter-subcontainer) {
    flex: 0 1 auto;
  }
  .settings-panel :deep(.filter-field) {
    flex: 1 1 160px;
  }
  .settings-panel-filter :deep(.slot-container) {
    width: fit-content;
    grid-template-columns: 130px 130px max-content;
    gap: 12px;
  }
  .settings-panel-filter :deep(.filter-field) {
    grid-template-columns: 1fr;
    gap: 3px;
  }
  .settings-panel-filter :deep(#initialLetter) {
    width: 130px;
    min-width: 110px;
  }
  .settings-panel-filter :deep(#filterInput) {
    width: 130px;
    max-width: 130px;
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
  .settings-panel-frame {
    height: 128px;
    min-height: 128px;
  }
  .settings-controls {
    grid-template-columns: minmax(0, 1fr) 68px;
  }
  .settings-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .settings-panel-filter :deep(#filterInput),
  .settings-panel-filter :deep(#initialLetter) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
  .settings-panel-filter :deep(.filter-action) {
    grid-column: 1 / -1;
    justify-self: end;
  }
}
</style>
