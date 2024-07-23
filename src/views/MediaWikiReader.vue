<script setup>
import Settingsbar from '../components/Settingsbar.vue';
import NewEntryForm from '../components/NewEntryForm.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import Sectionbar from '../components/Sectionbar.vue';
import { Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/init.js';
import store from '../store';
import { micrasOriginalAPIArray, micrasWikiMicronations } from '../assets/micrasWikiSources';
import { microWikiMicronations } from '../assets/microWikiSources';
import axios from 'axios';
import $ from 'jquery';
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
      <p
        v-show="moderationViewMode === 'wikipedia' && micrasArray.filter(el => el.assignedModerator === user.email).length === 0">
        There are no available cases.
      </p>

      <Settingsbar v-show="moderationViewMode === 'micras'" class="settingsbar" :view-mode="'micronations'"
        :store-getter="'micronations'" :sub-prop-for-filter="false"
        :elements-directory="micrasArray.filter(el => el.assignedModerator === user.email)"
        @loaded-directory="loadPagedMicrasMicronations" :hidden-subcontainers="['Display', 'Flags']" />
      <!-- <Settingsbar v-show="moderationViewMode === 'microwiki'" class="settingsbar" :view-mode="'micronations'"
        :store-getter="'micronations'" :sub-prop-for-filter="false"
        :elements-directory="microWikiArray.filter(el => el.assignedModerator === user.email)"
        @loaded-directory="loadPagedMicroWikiMicronations" :hidden-subcontainers="['Display', 'Flags']" /> -->

      <div v-show="moderationViewMode === 'micras'">
        <p class="micronations-stats">
          There are <span class="underlined">{{ micrasArray.length }}</span> articles within category
          'Nations' on Micras Wiki (that doesn't mean strictly micronations):<br>
          - At least <span class="underlined">{{ micrasPresentMicronations }}</span> may be <b
            style="color: var(--success-tone)">present</b> on TMD.
        </p>
        <p class="area-title">The following articles have been assigned to you:</p>
      </div>
      <div v-show="moderationViewMode === 'microwiki'">
        <p class="micronations-stats">
          There are <span class="underlined">{{ microWikiMicronations.length }}</span> (filtered) articles within
          category 'Micronations' on MicroWiki (that doesn't strictly mean micronations):<br>
          - Out of them, <span class="underlined">{{ getMicronationsStub(microWikiMicronations) }}</span> are marked as
          <b style="color: indianred">stubs</b>, so probably don't have enough info to create an entry.<br>
          - Out of them, <span class="underlined">{{ getMicronationsPoor(microWikiMicronations) }}</span> are marked as
          <b style="color: red">poor</b>, so probably don't have enough info to create an entry.<br>
          - At least <span class="underlined">{{ microWikiPresentMicronations }}</span> may be <b
            style="color: var(--success-tone)">present</b> on TMD.
        </p>
        <button
          @click="wikiRequestedMicronations = getWikiInfo('https://micronations.wiki/index.php?title=', microWikiMicronations)"
          class="login-button color-transition">
          Request articles data
        </button>
        <textarea name="" id="" cols="30" rows="10">{{ JSON.stringify(wikiRequestedMicronations) }}</textarea>
        <p class="area-title">The following articles have been assigned to you:</p>
      </div>

      <div v-show="moderationViewMode === 'micras'" id="micronationsList" class="micronations-list"
        ref="micronationsList">
        <TransitionGroup>
          <DirectoryEntry v-for="(item, i) in pagedMicrasDirectory" :key="i"
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
    </div>

    <p class="area-title">Click on a card from above to automatically complete the form:</p>
    <NewEntryForm class="new-entry-container" :entry-type="'micronation'" :form-placeholders="formMicronationData"
      :directory-data="micronationsDirectory" :micronations-directory="micronationsDirectory"
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
      user: {},
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
      moderationViewMode: 'micras',
      moderationbarTabs: [
        { text: 'MicrasWiki', target: 'micras', display: true },
        { text: 'MicroWiki', target: 'microwiki', display: true },
        { text: 'Wikipedia', target: 'wikipedia', display: true },
      ],
      micrasPresentMicronations: 'Loading...',
      microWikiPresentMicronations: 'Loading...',
      wikipediaPresentMicronations: 'Loading...',
      pagedMicrasDirectory: [],
      pagedMicroWikiDirectory: [],
      pagedWikipediaDirectory: [],
      wikiRequestedMicronations: []
    }
  },
  watch: {
    pagedMicrasDirectory(newValue) {
      if (newValue.length) {
        this.micrasPresentMicronations = this.countMicronationsInBothSources(this.micrasArray);
      }
    },
    pagedMicroWikiDirectory(newValue) {
      if (newValue.length) {
        this.microWikiPresentMicronations = this.countMicronationsInBothSources(this.microWikiArray);
      }
    },
    pagedWikipediaDirectory(newValue) {
      if (newValue.length) {
        this.wikipediaPresentMicronations = this.countMicronationsInBothSources(this.wikipediaArray);
      }
    },
  },
  computed: {
    moderatorsList() {
      return store.getters.moderators;
    },
    userIsModerator() {
      return this.moderatorsList.includes(this.user.email);
    },
    micronationsDirectory() {
      return store.getters.micronations;
    },
    supranationalMicronations() {
      return this.micronationsDirectory.filter(element => element.supranational);
    },
    organizationsDirectory() {
      return store.getters.organizations;
    },
    visibleOrganizations() {
      return this.organizationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    micrasArray() {
      return this.addSettingsbarPropsToArray(micrasWikiMicronations);
    },
    microWikiArray() {
      return this.addSettingsbarPropsToArray(microWikiMicronations);
    }
  },
  methods: {
    authListener() {
      onAuthStateChanged(auth, user => {
        if (user) {
          this.user = user;
        } else {
          this.user = {
            emailVerified: false
          }
        }
      });
    },
    addSettingsbarPropsToArray(array) {
      const that = this;
      return array.map(function (element) {
        return {
          approved: true,
          pageDisplay: false,
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
      let infoArray = [];

      articlesArray.forEach(function (element) {
        axiosInstance
          .get(apiPrefix + element.title + '&action=edit')
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
              articleData.flag = 'https://micras.org/mwiki/File:' + that.extractSubstring(/\|*image_flag*=*/i, '\n|', textarea).replace(/ /g, '%20');
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
              articleData.flag = 'https://micronations.wiki/wiki/File:' + that.extractSubstring(/\|*image_flag*=*/i, '\n|', textarea).replace(/ /g, '%20');
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
    },
    getFlagImage() {
      const axiosInstance = axios.create({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });
      let newFlagArray = []

      this.micrasArray.forEach(function (element) {
        axiosInstance
          .get(element.flag)
          .then(response => {
            const flagFile = $(response.data).find('.fullImageLink a').attr("href");
            element.flag = 'https://micras.org' + flagFile;
            newFlagArray.push(element);
          })
          .catch(e => newFlagArray.push(element));
      });

      return newFlagArray;
    },
    updateFormMicronationData(arrayObject) {
      this.formMicronationData = {
        newEntryFlag: arrayObject.flag,
        newEntryName: arrayObject.name,
        newEntryNameAlt: '',
        newEntryTitle: '',
        newEntryTitleAlt: '',
        newEntryTypePhysical: false,
        newEntryTypeDigital: true,
        newEntryTypeFictional: true,
        newEntryMotto: arrayObject.motto,
        newEntryCapital: arrayObject.capital,
        newEntryCurrency: arrayObject.currency,
        newEntryLanguages: arrayObject.languages,
        newEntryMemberships: ['Micronational Cartography Society'],
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
      this.pagedMicrasDirectory = payload;
    },
    loadPagedMicroWikiMicronations(payload) {
      this.pagedMicroWikiDirectory = payload;
    },
    loadPagedWikipediaMicronations(payload) {
      this.pagedWikipediaDirectory = payload;
    },
    convertTZ(date, tzString) {
      return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
    },
    cleanString(string) {
      return string.replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '');
    }
  },
  mounted() {
    this.authListener();
  }
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
