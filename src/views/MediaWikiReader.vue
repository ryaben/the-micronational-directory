<script setup>
import MediaWikiReaderSettings from '../components/MediaWikiReaderSettings.vue';
import NewEntryForm from '../components/NewEntryForm.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import Sectionbar from '../components/Sectionbar.vue';
import ModerationToolWorkspace from '../components/ModerationToolWorkspace.vue';
import { Timestamp } from "firebase/firestore";
import { animateDirectoryCardEnter, animateDirectoryCardLeave, positionLeavingDirectoryCard } from '../utils/directoryCardTransitions.js';
import axios from 'axios';
import $ from 'jquery';
import { useDirectoryData } from '../composables/useDirectoryData.js';

const { micronationsDirectory, supranationalMicronations, organizationsDirectory, visibleOrganizations, user } = useDirectoryData();
</script>

<template>
  <section id="responseText" class="site-section site-section--flush site-section--flat-top">
    <Sectionbar id="moderationBar" :sections="moderationbarTabs" initial-selected-section="micras"
      @section-change="loadSource">
      <template #micras>
        <ModerationToolWorkspace>
          <template #description>
            <p class="workspace-description">Render potential entries from articles gathered through a MediaWiki API category request. The reader extracts available article data, though differences in wiki formatting can leave some fields incomplete.</p>
          </template>
          <template #summary>
            <strong class="source-count">{{ micrasDirectory.length }}</strong>
            <span>MicrasWiki articles</span>
            <span class="summary-separator">·</span>
            <span><strong>{{ micrasPresentMicronations }}</strong> may already be in the directory</span>
          </template>
          <template #support>
            <MediaWikiReaderSettings :elements-directory="micrasDirectory"
              @loaded-directory="loadPagedMicrasMicronations" />
          </template>
          <template #main>
            <p v-if="loadedSources.micras === 'loading'" class="empty-source">Loading MicrasWiki articles…</p>
            <p v-else-if="loadedSources.micras === 'error'" class="empty-source">MicrasWiki articles could not load. Switch tabs and try again.</p>
            <p v-else-if="loadedSources.micras === 'loaded' && micrasArray.filter(el => el.assignedModerator === user.email).length === 0" class="empty-source">
              There are no available cases.
            </p>
            <div class="micronations-list" ref="micronationsList">
              <TransitionGroup :css="false" @before-leave="positionLeavingDirectoryCard"
                @enter="animateDirectoryCardEnter" @leave="animateDirectoryCardLeave">
                <DirectoryEntry v-for="(item, i) in pagedMicrasDirectory" :key="item.websites?.[0] || item.name || i" :disable-full-profile-button="true"
                  :class="{ 'selected': selectedMicronation === i, 'present': micronationsDirectory.find(mic => [mic.name.main, ...(mic.name.alt || []).map(name => name.main), mic.name.mainAlt].some(name => name && item.name.includes(name))), 'assigned': item.assignedModerator === user.email }"
                  :info="{
                    id: `id${i}`, name: { main: item.name, mainAlt: '', title: '', titleAlt: '' }, flag: item.flag,
                    motto: item.motto, type: ['Digital', 'Fictional'], languages: item.languages, capital: item.capital,
                    currency: item.currency, foundationDate: item.foundation, location: { _lat: 0, _long: 0 },
                    memberships: [], contactInfo: item.contactInfo, websites: item.websites,
                    author: item.assignedModerator, approved: item.approved, creationDate: item.creationDate
                  }" @click="selectMicronation(i); updateFormMicronationData(item, 'micras')" />
              </TransitionGroup>
            </div>
          </template>
        </ModerationToolWorkspace>
      </template>

      <template #microwiki>
        <ModerationToolWorkspace>
          <template #description>
            <p class="workspace-description">Render potential entries from articles gathered through a MediaWiki API category request. The reader extracts available article data, though differences in wiki formatting can leave some fields incomplete.</p>
          </template>
          <template #summary>
            <strong class="source-count">{{ microWikiDirectory.length }}</strong>
            <span>filtered MicroWiki articles</span>
            <span class="summary-separator">·</span>
            <span>{{ getMicronationsStub(microWikiDirectory) }} stubs · {{ getMicronationsPoor(microWikiDirectory) }} poor</span>
          </template>
          <template #support>
            <MediaWikiReaderSettings :elements-directory="microWikiDirectory"
              @loaded-directory="loadPagedMicroWikiMicronations" />
          </template>
          <template #main>
            <p v-if="loadedSources.microwiki === 'loading'" class="empty-source">Loading MicroWiki articles…</p>
            <p v-else-if="loadedSources.microwiki === 'error'" class="empty-source">MicroWiki articles could not load. Switch tabs and try again.</p>
            <p v-else-if="loadedSources.microwiki === 'loaded' && microWikiArray.filter(el => el.assignedModerator === user.email).length === 0" class="empty-source">
              There are no available cases.
            </p>
            <div class="micronations-list" ref="micronationsListMicroWiki">
              <TransitionGroup :css="false" @before-leave="positionLeavingDirectoryCard"
                @enter="animateDirectoryCardEnter" @leave="animateDirectoryCardLeave">
                <DirectoryEntry v-for="(item, i) in pagedMicroWikiDirectory" :key="item.websites?.[0] || item.name || i" :disable-full-profile-button="true"
                  :class="{ 'selected': selectedMicronation === i, 'present': micronationsDirectory.find(mic => [mic.name.main, ...(mic.name.alt || []).map(name => name.main), mic.name.mainAlt].some(name => name && item.name.includes(name))) }"
                  :info="{
                    id: `id${i}`, name: { main: item.name, mainAlt: '', title: '', titleAlt: '' }, flag: item.flag,
                    motto: item.motto, type: [], languages: item.languages, capital: item.capital, currency: item.currency,
                    foundationDate: item.foundation, location: { _lat: 0, _long: 0 }, memberships: [],
                    contactInfo: item.contactInfo, websites: item.websites, author: item.assignedModerator,
                    approved: item.approved, creationDate: item.creationDate
                  }" @click="selectMicronation(i); updateFormMicronationData(item, 'microwiki')" />
              </TransitionGroup>
            </div>
          </template>
        </ModerationToolWorkspace>
      </template>
    </Sectionbar>

    <div class="wiki-form-follow-up">
      <p class="area-title">Click a card above to automatically complete the form:</p>
      <NewEntryForm class="new-entry-container" :entry-type="'micronation'" :directory-data="micronationsDirectory"
        :form-placeholders="formMicronationData" :micronations-directory="micronationsDirectory"
        :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
        :supranational-micronations="supranationalMicronations" />
    </div>
  </section>
</template>

<script>
export default {
  components: {
    MediaWikiReaderSettings, DirectoryEntry, NewEntryForm
  },
  data() {
    return {
      selectedMicronation: undefined,
      formMicronationData: {
        newEntryFlag: '',
        newEntryName: '',
        newEntryNameAlt: '',
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
      },
      componentKey: 0,
      moderationbarTabs: [
        { text: 'MicrasWiki', target: 'micras', display: true },
        { text: 'MicroWiki', target: 'microwiki', display: true }
      ],
      micrasArray: [],
      microWikiArray: [],
      loadedSources: {},
      pagedMicrasDirectory: [],
      pagedMicroWikiDirectory: [],
      wikiRequestedMicronations: []
    }
  },
  computed: {
    micrasDirectory() {
      return this.addSettingsbarPropsToArray(this.micrasArray);
    },
    microWikiDirectory() {
      return this.addSettingsbarPropsToArray(this.microWikiArray);
    },
    micrasPresentMicronations() {
      return this.countMicronationsInBothSources(this.micrasArray);
    },
    microWikiPresentMicronations() {
      return this.countMicronationsInBothSources(this.microWikiArray);
    }
  },
  methods: {
    async loadSource(source) {
      if (this.loadedSources[source] === 'loading' || this.loadedSources[source] === 'loaded') return;
      this.loadedSources[source] = 'loading';
      try {
        if (source === 'micras') {
          const { micrasWikiMicronations } = await import('../assets/micrasWikiSources.js');
          this.micrasArray = [...micrasWikiMicronations];
        } else if (source === 'microwiki') {
          const { microWikiMicronations } = await import('../assets/microWikiSources.js');
          this.microWikiArray = [...microWikiMicronations];
        }
        this.loadedSources[source] = 'loaded';
      } catch (error) {
        this.loadedSources[source] = 'error';
        console.error(`Could not load ${source} source data:`, error);
      }
    },
    addSettingsbarPropsToArray(array) {
      const that = this;
      return array.map(function (element) {
        return {
          approved: true,
          pageDisplay: true,
          filterDisplay: true,
          searchDisplay: true,
          creationDate: Timestamp.fromDate(that.convertTZ(new Date(), 'Etc/UTC')),
          ...element
        }
      });
    },
    getWikiInfo(apiPrefix, articlesArray) {
      const that = this;
      const axiosInstance = axios.create({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });
      function iterateArray(articlesArrayPart) {
        let infoArray = [];

        articlesArrayPart.forEach(function (element) {
          axiosInstance
            .get(apiPrefix + element.title + '?action=edit&veswitched=1')
            .then(response => {
              const textarea = $(response.data).find('#wpTextbox1').text();

              let articleData = {}

              //MicrasWiki:
              if (textarea.indexOf('{{Infobox Nation Comprehensive') !== -1 || textarea.indexOf('{{Infobox Nation2 Comprehensive') !== -1 || textarea.indexOf('{{Infobox Republic') !== -1) {
                articleData.capital = that.cleanString(that.extractSubstring(/\|*capital*=*/i, '\n|', textarea)),
                  articleData.currency = that.cleanString(that.extractSubstring(/\|*currency*=*/i, '\n|', textarea)),
                  articleData.motto = that.cleanString(that.extractSubstring(/\|*motto*=*/i, '\n|', textarea)).split('<br>')[0],
                  articleData.contactInfo = [
                    that.cleanString(that.extractSubstring(/\|*forum*=*/i, '\n|', textarea)),
                  ],
                  articleData.websites = [
                    `https://micras.org/mwiki/${element.title}`
                  ]

                articleData.name = that.cleanString(that.extractSubstring(/\|*fullname*=*/i, '\n|', textarea)).split('<br>')[0];
                articleData.flag = 'https://micras.org/mwiki/' + that.extractSubstring(/\|*flag*=*/i, '\n|', textarea).replace(/ /g, '%20');
                articleData.languages = that.cleanString(that.extractSubstring(/\|*lang*=*/i, '\n|', textarea)).split(', ');
                articleData.foundation = that.extractSubstring(/\|*estdate*=*/i, '\n|', textarea);
                articleData.websites.push(that.cleanString(that.extractSubstring(/\|*site*=*/i, '\n|', textarea)));

                //MicrasWiki:
              } else if (textarea.indexOf('{{Nation') !== -1 || textarea.indexOf('{{Nation2') !== -1) {
                articleData.capital = that.cleanString(that.extractSubstring(/\|*capital*=*/i, '\n|', textarea)),
                  articleData.currency = that.cleanString(that.extractSubstring(/\|*currency*=*/i, '\n|', textarea)),
                  articleData.motto = that.cleanString(that.extractSubstring(/\|*motto*=*/i, '\n|', textarea)),
                  articleData.contactInfo = [
                    that.cleanString(that.extractSubstring(/\|*forum*=*/i, '\n|', textarea)),
                  ],
                  articleData.websites = [
                    `https://micras.org/mwiki/${element.title}`
                  ]

                articleData.name = that.cleanString(that.extractSubstring(/\|*country*=*/i, '\n|', textarea));
                articleData.flag = 'https://micras.org/mwiki/' + that.extractSubstring(/\|*image_flag*=*/i, '\n|', textarea).replace(/ /g, '%20');
                articleData.languages = that.cleanString(that.extractSubstring(/\|*language*=*/i, '\n|', textarea)).split(', ');
                articleData.foundation = that.extractSubstring(/\|*date_founded*=*/i, '\n|', textarea);
                articleData.websites.push(that.cleanString(that.extractSubstring(/\|*website*=*/i, '\n|', textarea)));

                //MicroWiki: if (textarea.indexOf('{{Infobox country') !== -1):
              } else {
                articleData.capital = that.cleanString(that.extractSubstring(/\|*capital*=*/i, '\n|', textarea)),
                  articleData.currency = that.cleanString(that.extractSubstring(/\|*currency*=*/i, '\n|', textarea)),
                  articleData.motto = that.cleanString(that.extractSubstring(/\|*national_motto*=*/i, '\n|', textarea)),
                  articleData.contactInfo = [
                    that.cleanString(that.extractSubstring(/\|*forum*=*/i, '\n|', textarea)),
                  ],
                  articleData.websites = [
                    `https://micronations.wiki/wiki/${element.title}`
                  ]

                articleData.name = that.cleanString(that.extractSubstring(/\|*conventional_long_name*=*/i, '\n|', textarea));
                articleData.flag = 'https://micronations.wiki/wiki/' + that.extractSubstring(/\|*image_flag*=*/i, '\n|', textarea).replace(/ /g, '%20');
                articleData.languages = that.cleanString(that.extractSubstring(/\|*official_languages*=*/i, '\n|', textarea)).split(', ');
                articleData.foundation = that.extractSubstring(/\|*established_date1*=*/i, '\n|', textarea);
                articleData.websites.push(that.cleanString(that.extractSubstring(/\|*official_website*=*/i, '\n|', textarea)));
              }

              infoArray.push(articleData);
            })
            .catch(e => console.error(e));
        });

        return infoArray;
      }

      const articlesArrayPart = iterateArray(articlesArray);
      return articlesArrayPart;
    },
    getFlagImage(array) {
      const axiosInstance = axios.create({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });
      let newFlagArray = []

      array.forEach(function (element) {
        axiosInstance
          .get(element.flag)
          .then(response => {
            const flagFile = $(response.data).find('.fullImageLink a').attr("href");
            element.flag = 'https://micronations.wiki/' + flagFile;
            newFlagArray.push(element);
          })
          .catch(e => newFlagArray.push(element));
      });

      return newFlagArray;
    },
    wikiArticleRequest(articleURL) {
      const axiosInstance = axios.create({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });

      axiosInstance
        .get(articleURL)
        .then(response => {
          const textarea = $(response.data).find('#wpTextbox1').text();
          return textarea;
        })
        .catch(e => console.error(e));
    },
    updateFormMicronationData(arrayObject, source) {
      let membershipsArray = [];
      let fictionalType = false;

      if (source === 'micras') {
        membershipsArray.push('Micronational Cartography Society');
        fictionalType = true;
      }

      this.formMicronationData = {
        newEntryFlag: arrayObject.flag,
        newEntryName: arrayObject.name,
        newEntryNameAlt: '',
        newEntryTitle: '',
        newEntryTitleAlt: '',
        newEntryTypePhysical: false,
        newEntryTypeDigital: true,
        newEntryTypeFictional: fictionalType,
        newEntryMotto: arrayObject.motto,
        newEntryCapital: arrayObject.capital,
        newEntryCurrency: arrayObject.currency,
        newEntryLanguages: arrayObject.languages,
        newEntryMemberships: membershipsArray,
        newEntryEmails: arrayObject.contactInfo,
        newEntryWebsites: arrayObject.websites
      }
    },
    countMicronationsInBothSources(arrayComputed) {
      const that = this;
      let micronationCounter = 0;

      arrayComputed.forEach(function (element) {
        const check = that.micronationsDirectory.find(mic => [mic.name.main, ...(mic.name.alt || []).map(name => name.main), mic.name.mainAlt]
          .some(name => name && element.name.includes(name)));

        if (check !== undefined) {
          micronationCounter++
        }
      });

      return micronationCounter;
    },
    extractSubstring(start, end, str) {
      const initialIndex = str.search(start);
      const result = str.substring(
        initialIndex,
        str.indexOf(end, initialIndex)
      );
      return result;
    },
    getMicronationsStub(array) {
      length = array.filter(function (item) {
        return item.stub;
      }).length;

      return length;
    },
    getMicronationsPoor(array) {
      length = array.filter(function (item) {
        return item.poor;
      }).length;

      return length;
    },
    selectMicronation(index) {
      this.selectedMicronation = index;
    },
    loadPagedMicrasMicronations(payload) {
      this.pagedMicrasDirectory = payload;
      // this.forceRerender();
    },
    loadPagedMicroWikiMicronations(payload) {
      this.pagedMicroWikiDirectory = payload;
      // this.forceRerender();
    },
    convertTZ(date, tzString) {
      return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
    },
    cleanString(string) {
      return string.replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '');
    },
    forceRerender() {
      this.componentKey += 1;
    }
  },
  mounted() {
    this.loadSource('micras');
  },
}
</script>

<style scoped>
#moderationBar:deep(.section-bar) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.micronations-list {
  position: relative;
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
}

.page-area.micronations-list {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.source-count {
  margin-right: 8px;
  color: var(--color-accent);
  font-size: 19px;
}

.summary-separator {
  margin: 0 9px;
  color: var(--color-muted);
}

.empty-source {
  padding: 12px 14px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  background: var(--color-surface-raised);
}

.wiki-form-follow-up {
  margin: 4px 16px 18px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.area-title {
  font-size: 22px;
}

.login-button.settingsbar-margin {
  margin: auto auto 5px 5px;
}

</style>
