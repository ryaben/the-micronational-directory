<script setup>
import Settingsbar from '../components/Settingsbar.vue';
import NewEntryForm from '../components/NewEntryForm.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import Sectionbar from '../components/Sectionbar.vue';
import { Timestamp } from "firebase/firestore";
import store from '../store';
import { micrasOriginalAPIArray, micrasWikiMicronations } from '../assets/micrasWikiSources';
import { microWikiOriginalAPIArray, microWikiMicronations } from '../assets/microWikiSources';
import axios from 'axios';
import $ from 'jquery';

defineProps({
  micronationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
  },
  supranationalMicronations: {
    type: Array,
    required: false,
    default: store.getters.micronations.filter(element => element.supranational)
  },
  organizationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.organizations
  },
  visibleOrganizations: {
    type: Array,
    required: false,
    default: store.getters.organizations.filter(element => element.approved && element.searchDisplay && element.filterDisplay)
  },
  moderatorsList: {
    type: Array,
    required: true,
    default: store.getters.moderators
  },
  userIsModerator: {
    type: Boolean,
    required: false,
    default: false
  },
  user: {
    type: Object,
    required: true,
    default: {}
  }
});
</script>

<template>
  <div id="responseText">
    <Sectionbar id="moderationBar" :sections="moderationbarTabs" @show-target-tab="changeModerationViewMode"
      :initial-selected-tab="'micrasTab0'" />

    <div class="page-area micronations-list">
      <p
        v-show="moderationViewMode === 'micras' && micrasArray.filter(el => el.assignedModerator === user.email).length === 0">
        There are no available cases.
      </p>
      <p
        v-show="moderationViewMode === 'microwiki' && micrasArray.filter(el => el.assignedModerator === user.email).length === 0">
        There are no available cases.
      </p>

      <div v-show="moderationViewMode === 'micras'" style="display: flex; align-items: flex-end;">
        <Settingsbar class="settingsbar" :view-mode="'micronations'" :store-getter="'micronations'"
          :sub-prop-for-filter="false" :elements-directory="micrasDirectory"
          @loaded-directory="loadPagedMicrasMicronations" :hidden-subcontainers="['Display', 'Flags']" />
        <!-- <button
          @click="wikiRequestedMicronations = getFlagImage(microWikiMicronations.filter(el => el.flag.includes('https://micronations.wiki/wiki/File:')).slice(301))"
          class="login-button color-transition short settingsbar-margin">
          Request articles data
        </button> -->
      </div>

      <Settingsbar v-show="moderationViewMode === 'microwiki'" class="settingsbar" :view-mode="'micronations'"
        :store-getter="'micronations'" :sub-prop-for-filter="false" :elements-directory="microWikiDirectory"
        @loaded-directory="loadPagedMicroWikiMicronations" :hidden-subcontainers="['Display', 'Flags']" />

      <div v-show="moderationViewMode === 'micras'">
        <p class="micronations-stats">
          There are <span class="underlined">{{ micrasDirectory.length }}</span> articles within category
          'Nations' on MicrasWiki (that doesn't mean strictly micronations):<br>
          - At least <span class="underlined">{{ micrasPresentMicronations }}</span> may be <b
            style="color: var(--success-tone)">present</b> on TMD.
        </p>
        <p class="area-title">The following articles have been assigned to you:</p>
      </div>
      <div v-show="moderationViewMode === 'microwiki'">
        <p class="micronations-stats">
          There are <span class="underlined">{{ microWikiDirectory.length }}</span> (filtered) articles within
          category 'Micronations' on MicroWiki (that doesn't strictly mean micronations):<br>
          - Out of them, <span class="underlined">{{ getMicronationsStub(microWikiDirectory) }}</span> are marked as
          <b style="color: indianred">stubs</b>, and <span class="underlined">{{
      getMicronationsPoor(microWikiDirectory) }}</span>
          are marked as <b style="color: red">poor</b>, so probably they don't have enough info to create a valid and
          compliant entry.<br>
          - At least <span class="underlined">{{ microWikiPresentMicronations }}</span> may be <b
            style="color: var(--success-tone)">present</b> on TMD.
        </p>
        <p class="area-title">The following articles have been assigned to you:</p>
      </div>

      <div v-show="moderationViewMode === 'micras'" class="micronations-list" ref="micronationsList">
        <TransitionGroup>
          <DirectoryEntry v-for="(item, i) in pagedMicrasDirectory" :key="i + componentKey" :disable-full-profile-button="true"
            :class="{ 'selected': selectedMicronation === i, 'present': micronationsDirectory.find(mic => item.name.includes(mic.name.main)), 'assigned': item.assignedModerator === user.email }"
            :info="{
      id: `id${i}`,
      name: {
        main: item.name,
        mainAlt: '',
        title: '',
        titleAlt: ''
      },
      flag: item.flag,
      motto: item.motto,
      type: ['Digital', 'Fictional'],
      languages: item.languages,
      capital: item.capital,
      currency: item.currency,
      foundationDate: item.foundation,
      location: { _lat: 0, _long: 0 },
      memberships: [],
      contactInfo: item.contactInfo,
      websites: item.websites,
      author: item.assignedModerator,
      approved: item.approved,
      creationDate: item.creationDate
    }" @click="selectMicronation(i); updateFormMicronationData(item)" />
        </TransitionGroup>
      </div>
      <div v-show="moderationViewMode === 'microwiki'" class="micronations-list" ref="micronationsListMicroWiki">
        <TransitionGroup>
          <DirectoryEntry v-for="(item, i) in pagedMicroWikiDirectory" :key="i + componentKey" :disable-full-profile-button="true"
            :class="{ 'selected': selectedMicronation === i, 'present': micronationsDirectory.find(mic => item.name.includes(mic.name.main)) }"
            :info="{
      id: `id${i}`,
      name: {
        main: item.name,
        mainAlt: '',
        title: '',
        titleAlt: ''
      },
      flag: item.flag,
      motto: item.motto,
      type: [],
      languages: item.languages,
      capital: item.capital,
      currency: item.currency,
      foundationDate: item.foundation,
      location: { _lat: 0, _long: 0 },
      memberships: [],
      contactInfo: item.contactInfo,
      websites: item.websites,
      author: item.assignedModerator,
      approved: item.approved,
      creationDate: item.creationDate
    }" @click="selectMicronation(i); updateFormMicronationData(item)" />
        </TransitionGroup>
      </div>
    </div>

    <p class="area-title">Click on a card from above to automatically complete the form:</p>
    <NewEntryForm class="new-entry-container" :entry-type="'micronation'" :directory-data="micronationsDirectory"
      :form-placeholders="formMicronationData" :micronations-directory="micronationsDirectory"
      :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
      :supranational-micronations="supranationalMicronations" />
  </div>
</template>

<script>
export default {
  components: {
    Settingsbar, DirectoryEntry, NewEntryForm
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
      moderationViewMode: 'micras',
      moderationbarTabs: [
        { text: 'MicrasWiki', target: 'micras', display: true },
        { text: 'MicroWiki', target: 'microwiki', display: true }
      ],
      micrasArray: [],
      microWikiArray: [],
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
            .catch(e => console.log(e));
        });

        console.log(infoArray);
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
        .catch(e => console.log(e));
    },
    updateFormMicronationData(arrayObject) {
      let membershipsArray = [];
      let fictionalType = false;

      if (this.moderationViewMode === 'micras') {
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
        const check = that.micronationsDirectory.find(mic => element.name.includes(mic.name.main));

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
    changeModerationViewMode(newValue) {
      this.moderationViewMode = newValue;
    },
    selectMicronation(index) {
      this.selectedMicronation = index;
    },
    loadPagedMicrasMicronations(payload) {
    console.log(payload)
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
  async mounted() {
    await store.dispatch('getMicrasPotentialEntries');
    this.micrasArray = [...micrasWikiMicronations];
    this.microWikiArray = [...microWikiMicronations];
  },
}
</script>

<style scoped>
.micronations-list {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
}

.page-area.micronations-list {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.area-title {
  font-size: 22px;
}

.login-button.settingsbar-margin {
  margin: auto auto 5px 5px;
}

.settingsbar:deep(.floating) {
  position: relative;
  width: auto;
  padding: 0;
}

.settingsbar:deep(.directory-settings) {
  padding: 0;
  margin: 5px auto 5px auto;
}
</style>
