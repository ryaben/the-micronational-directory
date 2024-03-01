<script setup>
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue';
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue';
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';
import store from '../store';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

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
});
</script>

<template>
  <div v-if="viewMode === storeGetter || (viewMode === 'collage' && storeGetter === 'micronations')">
    <div class="directory-settings"
      :class="{ 'floating': (viewMode === 'micronations' || viewMode === 'collage' || viewMode === 'organizations') && scrollPosition > 500 }">

      <SettingsSubcontainer class="matching-entries-container no-title no-min-width" text="Total">
        <SettingsSubcontainerParameter :centered="true">
          <label class="matching-entries-title">Matched<br>entries</label>
          <label class="matching-entries" style="height: 20px;">{{ visibleElements.length }}</label>
        </SettingsSubcontainerParameter>
      </SettingsSubcontainer>

      <SettingsSubcontainer text="Pages">
        <SettingsSubcontainerParameter :centered="true">
          <label>Entries/page</label>
          <input id="entriesPerPageInput" placeholder="Input an amount" min="1" max="1000" type="number"
            v-model="entriesPerPage" @input="pageElements()">
        </SettingsSubcontainerParameter>
        <SettingsSubcontainerParameter :centered="true" :border-left="true" :extra-margin-end="true">
          <label>Page control</label>
          <div style="display: flex; align-items: center;">
            <button class="page-button login-button color-transition" :disabled="currentPage === 1"
              @click="setPage(1)">&lt;&lt;</button>
            <button class="page-button login-button color-transition" :disabled="currentPage === 1"
              @click="setPage(currentPage - 1)">&lt;</button>
            <input id="currentPage" placeholder="Page" min="1" :max="totalPages" type="number" v-model="currentPage"
              @input="pageElements()">
            <label id="totalPages" class="matching-entries">&nbsp;/ {{ totalPages }}</label>
            <button class="page-button login-button color-transition" :disabled="currentPage === totalPages"
              @click="setPage(currentPage + 1)">></button>
            <button class="page-button login-button color-transition" :disabled="currentPage === totalPages"
              @click="setPage(totalPages)">>></button>
          </div>
        </SettingsSubcontainerParameter>
      </SettingsSubcontainer>

      <SettingsSubcontainer text="Filter">
        <SettingsSubcontainerParameter>
          <label>Search</label>
          <label>Initial</label>
        </SettingsSubcontainerParameter>
        <SettingsSubcontainerParameter>
          <input id="filterInput" v-model="inputFilter" type="text" placeholder="Search name...">
          <select name="initialLetter" id="initialLetter" v-model="initialFilter">
            <optgroup>
              <option value="none">No filter</option>
            </optgroup>
            <optgroup class="letters-group">
              <option :value="letter" v-for="(letter, i) in filterLetters" :key="i">{{ letter }}</option>
            </optgroup>
          </select>
        </SettingsSubcontainerParameter>
        <SettingsSubcontainerParameter>
          <button id="applyFilters" class="login-button squared-button color-transition"
            @click="applyFilters">Apply</button>
        </SettingsSubcontainerParameter>
      </SettingsSubcontainer>

      <SettingsSubcontainer text="Sort">
        <SettingsSubcontainerParameter>
          <div>
            <input type="radio" id="sortA-Z" name="directory-sorting" value="ascending" v-model="entrySorting"
              @change="sortMicronations(); forceRerender()">
            <label for="sortA-Z">Name (A-Z)</label>
          </div>
          <div>
            <input type="radio" id="sortZ-A" name="directory-sorting" value="descending" v-model="entrySorting"
              @change="sortMicronations(); forceRerender()">
            <label for="sortZ-A">Name (Z-A)</label>
          </div>
        </SettingsSubcontainerParameter>
        <SettingsSubcontainerParameter>
          <div>
            <input type="radio" id="sortLatestAdded" name="directory-sorting" value="latestAdded" v-model="entrySorting"
              @change="sortMicronations(); forceRerender()">
            <label for="sortLatestAdded">Latest added</label>
          </div>
          <div>
            <input type="radio" id="sortOldestAdded" name="directory-sorting" value="oldestAdded" v-model="entrySorting"
              @change="sortMicronations(); forceRerender()">
            <label for="sortOldestAdded">Oldest added</label>
          </div>
        </SettingsSubcontainerParameter>
        <SettingsSubcontainerParameter>
          <div>
            <input type="radio" id="sortRandom" name="directory-sorting" value="random" v-model="entrySorting"
              @change="sortMicronations(); forceRerender()">
            <label for="sortRandom">Random</label>
          </div>
        </SettingsSubcontainerParameter>
      </SettingsSubcontainer>

      <SettingsSubcontainer text="Display">
        <SettingsSubcontainerParameter :centered="true">
          <label ref="cardSizeLabel">Card size</label>
          <input type="range" min="50" max="350" class="settings-slider" id="zoomRange" ref="zoomRange"
            @input="updateZoom" @change="finishedUpdatingZoom" v-model="entryWidth">
        </SettingsSubcontainerParameter>
        <SettingsSubcontainerParameter :centered="true">
          <div style="display: flex;">
            <input id="fixedHeightCheckbox" type="checkbox" v-model="fixedHeight">
            <label for="fixedHeightCheckbox" ref="fixedHeightLabel">Fixed height</label>
          </div>
          <input type="range" min="200" max="1500" class="settings-slider" id="heightRange" ref="heightRange"
            @input="updateHeight" @change="finishedUpdatingHeight" v-model="fixedHeightValue">
        </SettingsSubcontainerParameter>
      </SettingsSubcontainer>

      <SettingsSubcontainer text="Flags" v-if="viewMode === 'micronations' || viewMode === 'collage'">
        <SettingsSubcontainerParameter :centered="true">
          <div style="display: flex;">
            <input id="flagViewCheckbox" type="checkbox" v-model="flagView" @input="checkFlagView">
            <label for="flagViewCheckbox" ref="fixedHeightLabel">Flag collage</label>
          </div>
          <button id="generateCollage" class="login-button squared-button color-transition"
            :disabled="viewMode !== 'collage'" @click="generateCollage">Generate</button>
        </SettingsSubcontainerParameter>
      </SettingsSubcontainer>
    </div>

    <div v-if="!directoryLoaded" class="loading-image-container">
      <img src="/images/loading.gif" alt="Loading">
      <label>Loading Directory...</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settingsbar',
  emits: [
    'updatedEntryWidth', 'viewModeChanged', 'loadedDirectory'
  ],
  components: {
    SettingsSubcontainer,
    SettingsSubcontainerParameter,
    SettingsSubcontainerTitle
  },
  data: () => {
    return {
      directoryLoaded: false,
      flagView: false,
      inputFilter: '',
      initialFilter: 'none',
      entrySorting: 'latestAdded',
      entriesPerPage: 50,
      currentPage: 1,
      fixedHeight: false,
      fixedHeightValue: 400,
      entryWidth: 180,
      scrollPosition: 0
    };
  },
  watch: {
    directoryLoaded(newValue) {
      if (newValue === true) {
        this.sortMicronations();
        this.forceRerender();
      }
    },
  },
  computed: {
    visibleElements() {
      if (this.elementsDirectory.length) {
        this.directoryLoaded = true;
      }
      return this.elementsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    pagedElements() {
      return this.elementsDirectory.filter(element => element.approved && element.pageDisplay && element.searchDisplay && element.filterDisplay);
    },
    totalPages() {
      return Math.ceil(this.visibleElements.length / this.entriesPerPage);
    },
    filterLetters() {
      return this.addFilterLetters(this.elementsDirectory, 'main');
    }
  },
  methods: {
    setPage(result) {
      this.currentPage = result;
      this.pageElements();
    },
    pageElements() {
      const that = this;

      this.visibleElements.forEach(function (entry, index) {
        if (((that.entriesPerPage * that.currentPage) - 1) >= index && index >= (that.entriesPerPage * (that.currentPage - 1))) {
          entry.pageDisplay = true;
        } else {
          entry.pageDisplay = false;
        }
      });

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      if (this.entriesPerPage < 1) {
        this.entriesPerPage = 1;
      } else if (this.entriesPerPage > 1000) {
        this.entriesPerPage = 1000;
      }

      this.emitDirectory();
    },
    sortMicronations() {
      switch (this.entrySorting) {
        case 'ascending':
          this.elementsDirectory.sort((a, b) => (this.normalizeString(a.name.main) > this.normalizeString(b.name.main)) ? 1 : -1);
          break;
        case 'descending':
          this.elementsDirectory.sort((a, b) => (this.normalizeString(a.name.main) > this.normalizeString(b.name.main)) ? 1 : -1);
          this.elementsDirectory.reverse();
          break;
        case 'latestAdded':
          this.elementsDirectory.sort((a, b) => (a.creationDate.seconds > b.creationDate.seconds) ? 1 : -1);
          this.elementsDirectory.reverse();
          break;
        case 'oldestAdded':
          this.elementsDirectory.sort((a, b) => (a.creationDate.seconds > b.creationDate.seconds) ? 1 : -1);
          break;
        case 'random':
          this.shuffleArray(this.elementsDirectory);
          break;
        default:
          break;
      }

      this.pageElements();
    },
    addFilterLetters(array, propName) {
      let letters = [];
      const that = this;

      array.forEach(function (element) {
        if (element.approved && !letters.includes(that.normalizeString(element.name[propName].charAt(0)))) {
          letters.push(that.normalizeString(element.name[propName].charAt(0)));
        }
      });

      return letters.sort((a, b) => (a > b) ? 1 : -1);
    },
    filterEntries() {
      const that = this;

      if (this.inputFilter == '') {
        this.elementsDirectory.forEach(function (element) {
          element.searchDisplay = true;
        });
      } else {
        this.elementsDirectory.forEach(function (element) {
          const entryCurated = that.normalizeString(element.name.main.toLowerCase());
          const entryAltCurated = that.normalizeString(element.name.mainAlt.toLowerCase());
          const searchCurated = that.normalizeString(that.inputFilter.toLowerCase());

          if (!entryCurated.includes(searchCurated) && !entryAltCurated.includes(searchCurated)) {
            element.searchDisplay = false;
          } else {
            element.searchDisplay = true;
          }
        });
      }

      this.setPage(1);
    },
    filterEntriesByLetter() {
      const that = this;

      if (this.initialFilter === 'none') {
        this.elementsDirectory.forEach(function (element) {
          element.filterDisplay = true;
        });
      } else {
        this.elementsDirectory.forEach(function (element) {
          if (that.normalizeString(element.name.main.charAt(0)) === that.initialFilter) {
            element.filterDisplay = true;
          } else {
            element.filterDisplay = false;
          }
        });
      }

      this.setPage(1);
    },
    checkFlagView() {
      if (this.flagView === true) {
        this.$emit('viewModeChanged', 'micronations');
      } else {
        this.$emit('viewModeChanged', 'collage');
      }
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    applyFilters() {
      this.filterEntries();
      this.filterEntriesByLetter();
    },
    normalizeString(string) {
      return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    updateZoom() {
      this.$refs.cardSizeLabel.innerHTML = this.entryWidth + 'px';
      this.$emit('updatedEntryWidth', this.entryWidth);
    },
    finishedUpdatingZoom() {
      this.$refs.cardSizeLabel.innerHTML = 'Card size';
    },
    updateHeight() {
      this.$refs.fixedHeightLabel.innerHTML = this.fixedHeightValue + 'px';
    },
    finishedUpdatingHeight() {
      this.$refs.fixedHeightLabel.innerHTML = 'Fixed height';
    },
    emitDirectory() {
      this.$emit('loadedDirectory', this.pagedElements);
    },
    async generateCollage() {
      const canvas = await html2canvas(document.getElementById("micronationsList"), { useCORS: true })
      canvas.toBlob(async function (blob) {
        await saveAs(blob, 'flag-collage.png');
      });
    },
    forceRerender() {
      this.componentKey += 1;
    }
  },
  mounted() {
    const that = this;
    window.addEventListener("scroll", (event) => {
      that.scrollPosition = window.scrollY;
    });
  }
}
</script>

<style scoped>
.directory-settings {
  display: flex;
  flex-wrap: wrap;
  color: var(--vt-c-text-dark-2);
  width: auto;
  padding: 0 15px 0 15px;
  margin: 15px 0 20px 0;
}

.directory-settings.floating {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 6px 0 6px 6px;
  margin: 0;
  background: var(--directory-settings-background-color);
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
  width: 100px;
}

#entriesPerPageInput {
  width: 60px;
}

#currentPage {
  width: 30px;
  margin-left: 5px;
}

#totalPages {
  margin-right: 5px;
}

.page-button {
  border-radius: 0px;
  height: auto;
  width: 30px;
  font-weight: bold;
}

.tools-container {
  width: fit-content;
}

#initialLetter {
  width: 100px;
}

.squared-button {
  width: fit-content;
  height: 25px;
  border-radius: 0px;
}

#applyFilters {
  height: 42px;
}

.settings-slider {
  width: 100px;
}
</style>