<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import LocationPicker from '../components/LocationPicker.vue';
import Recaptcha from '../components/ReCaptcha.vue';
import Sectionbar from '../components/Sectionbar.vue';
import SelectedLanguage from '../components/SelectedLanguage.vue';
import store from '../store';
import { auth, db, storage } from '../firebase/init.js';
import { doc, setDoc, Timestamp, GeoPoint, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';
import { notify } from "@kyvg/vue3-notification";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import languages from 'language-list';
import emailjs from 'emailjs-com';
// import html2canvas from 'html2canvas';
// import { saveAs } from 'file-saver';
</script>

<template>
  <div class="animation-error-avoider">
    <section class="site-section">
      <Sectionbar :sections="sectionbarTabs" @show-target-tab="changeViewMode" :initial-selected-tab="'cardsTab0'"
        @click="renderMapbox" />

      <section v-show="viewMode === 'cards' || viewMode === 'collage' || viewMode === 'moderation'"
        class="directory-container">
        <div class="directory-settings">
          <div class="settings-subcontainer">
            <div class="subcontainer-title">
              <label>Filter</label>
            </div>
            <div class="setting-parameter-subcontainer centered">
              <label>Search</label>
              <input id="filterInput" ref="filterInput" type="text" placeholder="Search name..." @input="filterEntries">
            </div>
            <div class="setting-parameter-subcontainer centered">
              <label>Initial</label>
              <select name="initialLetter" id="initialLetter" @change="filterEntriesByLetter">
                <optgroup>
                  <option value="none">No initial filter</option>
                </optgroup>
                <optgroup class="letters-group">
                  <option :value="letter" v-for="(letter, i) in filterLetters" :key="i">{{ letter }}</option>
                </optgroup>
              </select>
            </div>
            <div class="setting-parameter-subcontainer centered border-left extra-margin-end">
              <label>Matches</label>
              <label class="matching-entries">{{ approvedMicronations.length }}</label>
            </div>
          </div>
          <div class="settings-subcontainer">
            <div class="subcontainer-title">
              <label>Sort</label>
            </div>
            <div class="setting-parameter-subcontainer">
              <div>
                <input type="radio" id="sortA-Z" name="directory-sorting" value="ascending" checked
                  @change="sortMicronations(micronationsDirectory, 'ascending'); forceRerender()">
                <label for="sortA-Z">Name (A-Z)</label>
              </div>
              <div>
                <input type="radio" id="sortZ-A" name="directory-sorting" value="descending"
                  @change="sortMicronations(micronationsDirectory, 'descending'); forceRerender()">
                <label for="sortZ-A">Name (Z-A)</label>
              </div>
            </div>
            <div class="setting-parameter-subcontainer">
              <div>
                <input type="radio" id="sortLatestAdded" name="directory-sorting" value="latestAdded"
                  @change="sortMicronations(micronationsDirectory, 'latestAdded'); forceRerender()">
                <label for="sortLatestAdded">Latest added</label>
              </div>
              <div>
                <input type="radio" id="sortOldestAdded" name="directory-sorting" value="oldestAdded"
                  @change="sortMicronations(micronationsDirectory, 'oldestAdded'); forceRerender()">
                <label for="sortOldestAdded">Oldest added</label>
              </div>
            </div>
            <div class="setting-parameter-subcontainer extra-margin-end">
              <div>
                <input type="radio" id="sortRandom" name="directory-sorting" value="random"
                  @change="sortMicronations(micronationsDirectory, 'random'); forceRerender()">
                <label for="sortRandom">Random</label>
              </div>
            </div>
          </div>
          <div class="settings-subcontainer">
            <div class="subcontainer-title">
              <label>Display</label>
            </div>
            <div class="setting-parameter-subcontainer centered">
              <label ref="cardSizeLabel">Card size</label>
              <input type="range" min="50" max="350" class="settings-slider" id="zoomRange" ref="zoomRange"
                @input="updateZoom" @change="finishedUpdatingZoom" v-model="entryWidth">
            </div>
            <div class="setting-parameter-subcontainer centered">
              <div style="display: flex;">
                <input id="fixedHeightCheckbox" type="checkbox" v-model="fixedHeight">
                <label for="fixedHeightCheckbox" ref="fixedHeightLabel">Fixed height</label>
              </div>
              <input type="range" min="200" max="1500" class="settings-slider" id="heightRange" ref="heightRange"
                @input="updateHeight" @change="finishedUpdatingHeight" v-model="fixedHeightValue">
            </div>
          </div>
          <!-- <div class="settings-subcontainer" v-show="viewMode === 'collage'">
          <button id="generateCollage" class="login-button color-transition" @click="generateCollage">Generate flag
            collage</button>
        </div> -->
        </div>

        <div v-show="micronationsDirectory.length === 0" class="loading-image-container">
          <img src="/images/loading.gif" alt="Loading">
          <label>Loading Directory...</label>
        </div>

        <div id="micronationsList" class="micronations-list" v-show="viewMode === 'cards' || viewMode === 'collage'"
          ref="micronationsList" :key="componentKey" :class="{ 'fixed-height': fixedHeight }">
          <DirectoryEntry v-for="(item, i) in approvedMicronations" :key="i" :width="entryWidth"
            :flag-height="entryWidth * 0.6" :view-mode="viewMode" :info="{
              id: item.id,
              name: {
                main: item.name.main,
                mainAlt: item.name.mainAlt,
                title: item.name.title,
                titleAlt: item.name.titleAlt
              },
              flag: item.flag,
              motto: item.motto,
              type: item.type,
              languages: item.languages,
              capital: item.capital,
              currency: item.currency,
              foundationDate: item.foundationDate,
              location: item.location,
              memberships: item.memberships,
              contactInfo: item.contactInfo,
              websites: item.websites,
              author: item.author,
              approved: item.approved,
              creationDate: item.creationDate
            }" />
        </div>
        <div class="moderation-menu" v-if="userIsModerator" v-show="viewMode === 'moderation'">
          <div class="micronations-list" id="moderationMicronations" ref="micronationsListModeration" :key="componentKey"
            :class="{ 'fixed-height': fixedHeight }">
            <DirectoryEntry v-for="(item, i) in micronationsModerationDirectory" :key="i" :width="entryWidth"
              :flag-height="entryWidth * 0.6" :view-mode="'cards'" :info="{
                id: item.id,
                name: {
                  main: item.name.main,
                  mainAlt: item.name.mainAlt,
                  title: item.name.title,
                  titleAlt: item.name.titleAlt
                },
                flag: item.flag,
                motto: item.motto,
                type: item.type,
                languages: item.languages,
                capital: item.capital,
                currency: item.currency,
                foundationDate: item.foundationDate,
                location: item.location,
                memberships: item.memberships,
                contactInfo: item.contactInfo,
                websites: item.websites,
                author: item.author,
                approved: item.approved,
                creationDate: item.creationDate
              }"
              @click="selectedEntry = i; selectedEntryName = item.name.main; selectedEntryAuthor = item.author.email" />
          </div>
          <div class="moderation-buttons" v-if="userIsModerator" v-show="micronationsDirectory.length !== 0">
            <label class="selected-entry-name">{{ selectedEntryName }}</label>
            <label class="selected-entry-author">Author: {{ selectedEntryAuthor }}</label>

            <Sectionbar id="moderationBar" :sections="moderationbarTabs" @show-target-tab="changeModerationViewMode"
              :initial-selected-tab="'moderateTab0'" />

            <div v-show="moderationViewMode === 'moderate'" class="moderation-tab">
              <textarea class="login-input" v-model="rejectionReason" rows="6"
                placeholder="Additional message for rejection/approval"></textarea>
              <button id="entryReject" class="login-button color-transition" :disabled="selectedEntry === undefined"
                @click="entryReject(selectedEntry, false)">
                Reject
              </button>
              <button id="entryReject" class="login-button color-transition" :disabled="selectedEntry === undefined"
                @click="entryReject(selectedEntry, true)">
                Reject and delete
              </button>
              <button id="entryApprove" class="login-button color-transition" :disabled="selectedEntry === undefined"
                @click="entryApprove(selectedEntry)">
                Approve
              </button>
            </div>
            <div v-show="moderationViewMode === 'edit'" class="moderation-tab">
              <p>Work in progress.</p>
            </div>
          </div>
        </div>
        <div v-if="!userIsModerator" v-show="micronationsDirectory.length !== 0">
          You don't have sufficient privileges in order to moderate pending submissions.
        </div>
      </section>

      <LocationPicker v-if="renderedMapbox" v-show="viewMode === 'map'" ref="micronationsMap" mode="locationMap"
        :collection="physicalMicronationsDirectory.filter(element => element.approved)" width="100%" height="40vw" />

      <div v-show="viewMode === 'addEntry'" class="dropdown-info-box color-transition">
        <h3 @click="toggleDropdown">⚠️ Important notes on new entries and to add your own:</h3>
        <p>
          Don't know what micronations to add? <a
            href="https://docs.google.com/spreadsheets/d/1jwekLc1EpbVfznTbMrqiM8KUJW_ra3vywcMpiLTJrEs/edit?usp=sharing"
            target="_blank">Check out this list with many sources that we've composed</a>.
        </p>
        <p>
          We invite the community to contribute to the directory and add micronations to it.
          <b>It's important to highlight that:</b>
        </p>
        <ul class="notes-list">
          <li>
            Please provide <b>truthful, appropriate and precise information</b>. Additionally, cases of micronations that
            promote Nazi
            symbology, adult 18+ content and/or any kind of illegal activity will be immediately rejected.
          </li>
          <li>
            Micronations submitted should have <b>at least one (1) month of proven existence.</b> This way we avoid
            lightning
            entries that may only be games or premature/fake experiments.
          </li>
          <li>
            It's <b>mandatory</b> that all entries have an official website (<b>NOT</b> a social media account) of the
            micronation and/or (preferably
            <b>and</b>) an info article on any wiki. This way, a veridical source for the information entered is
            specified,
            and we can avoid
            entries that could be jokes, games, fake, misleading or cheating for contests.
          </li>
          <li>
            Physical and digital micronations
            can be included alike, as well as fictional countries as long as they also demonstrate activity as a proper
            micronation (news, diplomacy, activity) with imaginary elements (e.g., <a
              href="https://en.wikipedia.org/wiki/Babar%27s_Kingdom" target="_blank">Babar's Kingdom</a>
            is not a valid case, while the <a href="https://en.wikipedia.org/wiki/Kingdom_of_Redonda"
              target="_blank">Kingdom of Redonda</a> or most of the micronations from <a
              href="https://micras.org/mwiki/Main_Page" target="_blank">Micras</a> indeed are).
          </li>
          <li>
            Ideally and whenever possible, please input the entry data in English. If not, then in the micronation's main
            official language.
          </li>
          <li>
            If a micronation's website is closed or inactive, you can check it on the <b><a
                href="http://web.archive.org/">Wayback
                Machine</a></b> because it may have a past snapshot saved. If so, you can add the link the service
            generates
            instead.
          </li>
          <li>
            All submissions will first <b>require approval from the administrator</b> (can take up to 24 hours) before
            they
            are posted on the
            definitive public online directory.
          </li>
        </ul>
        <p>
          Thanks for understanding and for helping to create this digital database museum!
        </p>

        <Transition name="opacity">
          <div class="new-entry-container" v-show="newEntryView">
            <form class="listing-new-entry" @submit.prevent="addEntry">
              <p>Please, carefully read instructions for all fields. Help us save moderation efforts! <a
                  href="mailto:themicronationaldirectory@gmail.com">Ask any question</a> if needed.</p>
              <div class="new-entry-form">
                <label for="newEntryName" class="new-entry-form-text mandatory">Name*</label>
                <input type="text" id="newEntryName" v-model="newEntryForm.newEntryName" required
                  placeholder="E.g. 'Sealand' (just the short, main name)">

                <label for="newEntryTitle" class="new-entry-form-text mandatory">Title</label>
                <input type="text" id="newEntryTitle" v-model="newEntryForm.newEntryTitle"
                  placeholder="E.g. 'Principality of' (just the full State description only)">

                <label for="newEntryNameAlt" class="new-entry-form-text">Alternative name</label>
                <input type="text" id="newEntryNameAlt" v-model="newEntryForm.newEntryNameAlt"
                  placeholder="Second option for name, like in another language">

                <label for="newEntryTitleAlt" class="new-entry-form-text">Alternative title</label>
                <input type="text" id="newEntryTitleAlt" v-model="newEntryForm.newEntryTitleAlt"
                  placeholder="Second option for title, like in another language">

                <label for="newEntryMotto" class="new-entry-form-text mandatory">Motto</label>
                <input type="text" id="newEntryMotto" v-model="newEntryForm.newEntryMotto"
                  placeholder="E.g. 'In God we trust' (don't add quotes)">

                <label class="new-entry-form-text mandatory">Type*</label>
                <div class="new-entry-type">
                  <input type="checkbox" id="typePhysical" v-model="newEntryForm.newEntryTypePhysical"
                    name="new-entry-type" value="physical" @change="updatePhysicalType"
                    @click="renderedMapboxNewEntry = true">
                  <label for="typePhysical">Physical</label>
                  <input type="checkbox" id="typeDigital" v-model="newEntryForm.newEntryTypeDigital" name="new-entry-type"
                    value="digital" checked>
                  <label for="typeDigital">Digital</label>
                  <input type="checkbox" id="typeFictional" v-model="newEntryForm.newEntryTypeFictional"
                    name="new-entry-type" value="fictional">
                  <label for="typeFictional">Fictional</label>
                </div>

                <label for="newEntryLanguages" class="new-entry-form-text mandatory">Languages*</label>
                <div style="display: flex; flex-direction: column; margin-bottom: 3px;">
                  <div style="display: flex;">
                    <select name="newEntryLanguages" id="newEntryLanguagesSelect" @change="addLanguage" required>
                      <optgroup>
                        <option value="custom">Other (custom)</option>
                      </optgroup>
                      <optgroup>
                        <option v-for="(language, i) in listLanguages" :key="i" :value="language.name">
                          {{ language.name }}
                        </option>
                      </optgroup>
                    </select>
                    <input type="text" placeholder="Custom language name" v-model="customLanguage">
                  </div>
                  <div class="selected-languages-container">
                    <SelectedLanguage v-for="(language, i) in newEntryForm.newEntryLanguages" :key="i"
                      :lang-text="language" @remove-language="removeLanguage" />
                  </div>
                </div>

                <label for="newEntryCapital" class="new-entry-form-text">Capital</label>
                <input type="text" id="newEntryCapital" v-model="newEntryForm.newEntryCapital"
                  placeholder="City, place or building officiating as capital">

                <label for="newEntryCurrency" class="new-entry-form-text">Currency</label>
                <input type="text" id="newEntryCurrency" v-model="newEntryForm.newEntryCurrency"
                  placeholder="Official currency of the micronation, just name and not symbol">

                <label for="newEntryFoundation" class="new-entry-form-text mandatory">Foundation*</label>
                <VueDatePicker v-model="foundationDate" month-name-format="long" :flow="['year', 'month', 'calendar']"
                  :utc="'preserve'" :timezone="'UTC'" now-button-label="Today" :required="true" :max-date="new Date()" />

                <label v-show="physicalType" class="new-entry-form-text mandatory">Location<br>
                  (leave as is if unknown or N/A)</label>
                <div v-show="physicalType">
                  <label v-show="physicalType">Drag and drop the blue pin to the location of the micronation:</label>
                  <LocationPicker v-if="renderedMapboxNewEntry" :visible="!physicalType" ref="locationPicker"
                    mode="picker" width="100%" height="300px" @dragged-marker="draggedMarker" />
                </div>

                <label for="newEntryMemberships" class="new-entry-form-text">Memberships<br>(capitals, not full
                  name)</label>
                <textarea id="newEntryMemberships" v-model="newEntryForm.newEntryMemberships" name="newEntryMemberships"
                  cols="50" rows="3"
                  placeholder="Enter one organization or institution per line (press Enter after each value)"></textarea>

                <label for="newEntryEmails" class="new-entry-form-text mandatory">Contact info*</label>
                <textarea id="newEntryEmails" v-model="newEntryForm.newEntryEmails" name="newEntryEmails" cols="50"
                  rows="3" required
                  placeholder="Enter one email or social media link per line (don't add usernames, insert full link to profile please) (press Enter after each value)"></textarea>

                <label for="newEntryWebsites" class="new-entry-form-text mandatory">Websites*<br>(official + ideally wiki
                  article)</label>
                <textarea id="newEntryWebsites" v-model="newEntryForm.newEntryWebsites" name="newEntryWebsites" cols="50"
                  rows="3" required
                  placeholder="Enter one website or article link per line (press Enter after each value)"></textarea>

                <label for="newEntryFlag" class="new-entry-form-text mandatory">Flag*<br>(if N/A or unobtainable:<br><a
                    href="/images/missing-flag.png" target="_blank">use this template</a>)</label>
                <div class="flag-preview-container">
                  <input type="file" @change="previewImage" accept="image/png" required>
                </div>

                <div class="wide-row">
                  <Recaptcha @checkbox="checkRecaptcha" />
                  <input id="addEntryButton" type="submit" value="Add new entry" :disabled="!passedRecaptcha"
                    class="login-button short color-transition">
                  <label>(wait a few seconds for notification)</label>
                </div>
              </div>
            </form>
            <div class="new-entry-preview">
              <h2 id="previewTitle">Entry preview</h2>
              <p>(Click on the card to toggle the display)</p>
              <DirectoryEntry id="entryPreview" ref="entryPreview" :initial-info-view="true" :width="180"
                :flag-height="180 * 0.6" view-mode="cards" :info="{
                  name: {
                    main: newEntryForm.newEntryName,
                    mainAlt: newEntryForm.newEntryNameAlt,
                    title: newEntryForm.newEntryTitle,
                    titleAlt: newEntryForm.newEntryTitleAlt
                  },
                  flag: flagPreview,
                  motto: newEntryForm.newEntryMotto,
                  type: checkTypes,
                  languages: newEntryForm.newEntryLanguages,
                  capital: newEntryForm.newEntryCapital,
                  currency: newEntryForm.newEntryCurrency,
                  foundationDate: Timestamp.fromDate(convertTZ(new Date(foundationDate), 'Etc/UTC')),
                  memberships: newEntryForm.newEntryMemberships.split('\n'),
                  contactInfo: newEntryForm.newEntryEmails.split('\n'),
                  websites: newEntryForm.newEntryWebsites.split('\n'),
                  approved: true
                }" />
            </div>
          </div>
        </Transition>

        <button v-show="!newEntryView" id="newEntryOpener" class="login-button short color-transition"
          :disabled="!user.emailVerified" @click="newEntryView = true" :key="componentKey">Add new entry</button>
        <label v-if="!user.emailVerified" :key="componentKey">(Available for <a href="/login">registered users
            with verified email</a> only)</label>
      </div>
    </section>

    <Transition name="opacity">
      <div id="goToTopButton" v-show="!fixedHeight" @click="scrollToTop">⬆️</div>
    </Transition>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      user: {},
      sectionbarTabs: [
        { text: 'Info cards', target: 'cards', display: true },
        { text: 'Flags', target: 'collage', display: true },
        { text: 'Map', target: 'map', display: true },
        { text: 'Add entry', target: 'addEntry', display: true },
        { text: 'Moderate entries', target: 'moderation', display: true }
      ],
      moderationbarTabs: [
        { text: 'Moderate', target: 'moderate', display: true },
        { text: 'Edit', target: 'edit', display: true },
      ],
      newEntryForm: {
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
        newEntryMemberships: '',
        newEntryEmails: '',
        newEntryWebsites: ''
      },
      componentKey: 0,
      entryWidth: 180,
      newEntryView: false,
      viewMode: 'cards',
      moderationViewMode: 'moderate',
      physicalType: false,
      foundationDate: null,
      customLanguage: '',
      locationPickerMarkerPosition: [0, 0],
      fixedHeight: false,
      fixedHeightValue: 400,
      flagSource: '',
      flagPreview: '',
      passedRecaptcha: false,
      selectedEntry: undefined,
      selectedEntryName: 'None selected',
      selectedEntryAuthor: '',
      rejectionReason: "",
      renderedMapbox: false,
      renderedMapboxNewEntry: false
    };
  },
  components: {
    DirectoryEntry,
    LocationPicker,
    Recaptcha,
    VueDatePicker,
    Sectionbar,
    SelectedLanguage
  },
  computed: {
    checkUser() {
      return auth.currentUser;
    },
    moderatorsList() {
      return store.getters.moderators;
    },
    userIsModerator() {
      return this.moderatorsList.includes(this.user.email);
    },
    micronationsDirectory() {
      return store.getters.directory;
    },
    physicalMicronationsDirectory() {
      return store.getters.physicalDirectory;
    },
    approvedMicronations() {
      return this.micronationsDirectory.filter(element => element.approved && element.searchDisplay && element.filterDisplay);
    },
    micronationsModerationDirectory() {
      return this.micronationsDirectory.filter((element) => !element.approved && element.searchDisplay && element.filterDisplay);
    },
    filterLetters() {
      return this.addFilterLetters(this.micronationsDirectory);
    },
    checkTypes() {
      let typesArray = [];
      if (this.newEntryForm.newEntryTypePhysical) {
        typesArray.push('Physical');
      }
      if (this.newEntryForm.newEntryTypeDigital) {
        typesArray.push('Digital');
      }
      if (this.newEntryForm.newEntryTypeFictional) {
        typesArray.push('Fictional');
      }

      return typesArray;
    },
    returnLanguagesValues() {
      try {
        return this.newEntryForm.newMembershipsLanguages.split('\n');
      } catch {
        return this.newEntryForm.newMembershipsLanguages;
      }
    },
    returnMembershipsValues() {
      return this.readTextarea(this.newEntryForm.newEntryMemberships);
    },
    returnEmailsValues() {
      return this.readTextarea(this.newEntryForm.newEntryEmails);
    },
    returnWebsitesValues() {
      return this.readTextarea(this.newEntryForm.newEntryWebsites);
    },
    listLanguages() {
      let languagesArray = [];
      const sortedLanguageCodes = languages().getLanguageCodes().sort();

      sortedLanguageCodes.forEach(function (element) {
        languagesArray.push({
          code: element,
          name: languages().getLanguageName(element)
        });
      });

      return languagesArray;
    },
    countSearchedEntries() {
      let count = 0;

      this.micronationsDirectory.forEach(element => {
        if (element.searchDisplay) {
          count += 1;
        }
      });

      return count;
    },
    countFilteredEntries() {
      let count = 0;

      this.micronationsDirectory.forEach(element => {
        if (element.filterDisplay) {
          count += 1;
        }
      });

      return count;
    },
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
    async checkRecaptcha(value) {
      this.passedRecaptcha = value;
    },
    async addEntry() {
      const that = this;

      if (this.searchMicronation(this.newEntryForm.newEntryName) === undefined) {
        // data to send
        let physicalLocation;
        switch (this.physicalType) {
          case true:
            physicalLocation = new GeoPoint(this.locationPickerMarkerPosition[1], this.locationPickerMarkerPosition[0])
            break;
          case false:
            physicalLocation = new GeoPoint(0, 0);
            break;
          default:
            physicalLocation = new GeoPoint(0, 0);
            break;
        }

        this.uploadFlag(this.newEntryForm.newEntryName, function (fileName) {
          that.generateFlagReference(fileName, async function (flagReference) {
            await setDoc(doc(db, "micronations", that.newEntryForm.newEntryName), {
              name: {
                main: that.newEntryForm.newEntryName,
                mainAlt: that.newEntryForm.newEntryNameAlt,
                title: that.newEntryForm.newEntryTitle,
                titleAlt: that.newEntryForm.newEntryTitleAlt
              },
              flag: flagReference,
              motto: that.newEntryForm.newEntryMotto,
              type: that.checkTypes,
              languages: that.newEntryForm.newEntryLanguages,
              capital: that.newEntryForm.newEntryCapital,
              currency: that.newEntryForm.newEntryCurrency,
              foundationDate: Timestamp.fromDate(that.convertTZ(new Date(that.foundationDate), 'Etc/UTC')),
              location: physicalLocation,
              memberships: that.readTextarea('newEntryMemberships'),
              contactInfo: that.readTextarea('newEntryEmails'),
              websites: that.readTextarea('newEntryWebsites'),
              author: { name: that.checkUser.displayName, email: that.checkUser.email },
              approved: false,
              creationDate: Timestamp.fromDate(that.convertTZ(new Date(), 'Etc/UTC'))
            });

            if (that.checkUser.email !== 'themicronationaldirectory@gmail.com') {
              emailjs.send("service_gd9nz5x", "template_wnd0ghn", {
                user: that.checkUser.email,
                micronation: that.newEntryForm.newEntryName,
              },
                "P8-p_r-gTZedo_h84");
            }

            notify({
              title: "Submission successful",
              text: "The micronation was successfully submitted! Now awaits approval from the admin (please allow a maximum of 24 hours).",
              type: "success"
            });
          });
        });
      } else {
        notify({
          title: "Error when submitting",
          text: "This micronation is already present in the directory! If not, then an entry for it was recently submitted and is under review.",
          type: "error"
        });
      }
    },
    async uploadFlag(fileName, callback) {
      const storage = getStorage();
      const storageRef = ref(storage, 'images/flags/' + fileName + '.png');

      uploadBytes(storageRef, this.flagSource).then((snapshot) => {
        console.log('Flag file uploaded with ID ' + fileName);
        callback(fileName);
      });
    },
    async generateFlagReference(fileName, callback) {
      const storage = getStorage();

      getDownloadURL(ref(storage, 'images/flags/' + fileName + '.png'))
        .then((url) => {
          console.log('Reference link for ' + fileName + ' is:' + url);
          callback(url);
        })
        .catch((error) => {
          notify({
            title: "Error on getting image",
            text: error,
            type: "error"
          });
        });
    },
    sortMicronations(array, sorting) {
      switch (sorting) {
        case 'ascending':
          array.sort((a, b) => (this.normalizeString(a.name.main) > this.normalizeString(b.name.main)) ? 1 : -1);
          break;
        case 'descending':
          array.sort((a, b) => (this.normalizeString(a.name.main) > this.normalizeString(b.name.main)) ? 1 : -1);
          array.reverse();
          break;
        case 'latestAdded':
          array.sort((a, b) => (a.creationDate.seconds > b.creationDate.seconds) ? 1 : -1);
          array.reverse();
          break;
        case 'oldestAdded':
          array.sort((a, b) => (a.creationDate.seconds > b.creationDate.seconds) ? 1 : -1);
          break;
        case 'random':
          this.shuffleArray(array);
          break;
        default:
          break;
      }
    },
    addLanguage(event) {
      const lang = event.target.value;

      if (this.newEntryForm.newEntryLanguages.find(e => e === lang || (lang === 'custom' && e === this.customLanguage)) === undefined) {
        if (lang === 'custom') {
          this.newEntryForm.newEntryLanguages.push(this.customLanguage);
        } else {
          this.newEntryForm.newEntryLanguages.push(lang);
        }
      }
    },
    removeLanguage(value) {
      this.newEntryForm.newEntryLanguages.splice(this.newEntryForm.newEntryLanguages.indexOf(value), 1);
    },
    addFilterLetters(array) {
      let letters = [];
      const that = this;

      array.forEach(function (element) {
        if (element.approved && !letters.includes(that.normalizeString(element.name.main.charAt(0)))) {
          letters.push(that.normalizeString(element.name.main.charAt(0)));
        }
      });

      return letters.sort((a, b) => (a > b) ? 1 : -1);
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    searchMicronation(value) {
      return this.micronationsDirectory.find(function (entry) {
        return entry.name.main === value;
      });
    },
    filterEntries(e) {
      const that = this;

      if (e.target.value == '') {
        this.micronationsDirectory.forEach(function (element) {
          element.searchDisplay = true;
        });
      } else {
        this.micronationsDirectory.forEach(function (element) {
          const entryCurated = that.normalizeString(element.name.main.toLowerCase());
          const entryAltCurated = that.normalizeString(element.name.mainAlt.toLowerCase());
          const searchCurated = that.normalizeString(e.target.value.toLowerCase());

          if (!entryCurated.includes(searchCurated) && !entryAltCurated.includes(searchCurated)) {
            element.searchDisplay = false;
          } else {
            element.searchDisplay = true;
          }
        });
      }
    },
    filterEntriesByLetter(e) {
      const that = this;

      if (e.target.value === 'none') {
        this.micronationsDirectory.forEach(function (element) {
          element.filterDisplay = true;
        });
      } else {
        this.micronationsDirectory.forEach(function (element) {
          if (that.normalizeString(element.name.main.charAt(0)) === e.target.value) {
            element.filterDisplay = true;
          } else {
            element.filterDisplay = false;
          }
        });
      }
    },
    updateZoom() {
      this.$refs.cardSizeLabel.innerHTML = this.entryWidth + 'px';
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
    changeViewMode(newValue) {
      this.viewMode = newValue;
    },
    changeModerationViewMode(newValue) {
      this.moderationViewMode = newValue;
    },
    updatePhysicalType() {
      this.physicalType = !this.physicalType;
    },
    previewImage(event) {
      this.flagSource = event.target.files[0];
      this.flagPreview = URL.createObjectURL(this.flagSource);
    },
    readTextarea(elementRef) {
      if (this.newEntryForm[elementRef]) {
        var arrayOfLines = this.newEntryForm[elementRef].split("\n");
        return arrayOfLines;
      } else {
        return '';
      }
    },
    async entryReject(entryIndex, deletionRequest) {
      const that = this;

      try {
        if (!this.moderatorsList.includes(that.micronationsModerationDirectory[entryIndex].author.email)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            entry_decision: 'reject',
            entry_decisiond: 'rejected',
            to_name: that.micronationsModerationDirectory[entryIndex].author.name,
            to_email: that.micronationsModerationDirectory[entryIndex].author.email,
            entry_name: that.micronationsModerationDirectory[entryIndex].name.main,
            rejection_reason: that.rejectionReason
          },
            "P8-p_r-gTZedo_h84");
        }

        if (deletionRequest === true) {
          await deleteDoc(doc(db, "micronations", that.micronationsModerationDirectory[entryIndex].id));

          const flagRef = ref(storage, "images/flags/" + that.micronationsModerationDirectory[entryIndex].name.main + ".png");
          deleteObject(flagRef).then(() => {
            that.micronationsModerationDirectory.splice(entryIndex, 1);

            notify({
              title: 'Entry moderation',
              text: 'The rejected entry was successfully deleted from the database.',
              type: 'success'
            })
          }).catch((error) => {
            notify({
              title: 'Entry moderation',
              text: error,
              type: 'error'
            })
          });
        }

        this.micronationsModerationDirectory.splice(entryIndex, 1)
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.rejectionReason = '';

        notify({
          title: 'Entry moderation',
          text: 'The author was notified that their entry was rejected.',
          type: 'warning'
        })
      } catch (error) {
        notify({
          title: 'Error while moderating entry',
          text: error,
          type: 'error'
        })
      }
    },
    async entryApprove(entryIndex) {
      const that = this;

      try {
        if (!this.moderatorsList.includes(that.micronationsModerationDirectory[entryIndex].author.email)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            entry_decision: 'approve',
            entry_decisiond: 'approved',
            to_name: that.micronationsModerationDirectory[entryIndex].author.name,
            to_email: that.micronationsModerationDirectory[entryIndex].author.email,
            entry_name: that.micronationsModerationDirectory[entryIndex].name.main,
            rejection_reason: that.rejectionReason
          },
            "P8-p_r-gTZedo_h84");
        }

        const entryRef = doc(db, "micronations", that.micronationsModerationDirectory[entryIndex].id);
        await updateDoc(entryRef, {
          approved: true
        });

        this.micronationsModerationDirectory[entryIndex].approved = true;
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.rejectionReason = '';

        notify({
          title: 'Entry moderation',
          text: 'The entry was successfully approved, the author was notified and it will now be available in the Directory.',
          type: 'success'
        })
      } catch (error) {
        notify({
          title: 'Error while moderating entry',
          text: error,
          type: 'error'
        })
      }
    },
    // async generateCollage() {
    //   const canvas = await html2canvas(document.getElementById("micronationsList"), { useCORS: true })
    //   canvas.toBlob(async function (blob) {
    //     await saveAs(blob, 'flag-collage.png');
    //   });
    // },
    normalizeString(string) {
      return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    convertTZ(date, tzString) {
      return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
    },
    draggedMarker(newPosition) {
      this.locationPickerMarkerPosition = newPosition;
    },
    toggleDropdown(e) {
      e.target.parentNode.classList.toggle('open');
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    renderMapbox(event) {
      if (event.target.id === 'mapTab2') {
        this.renderedMapbox = true;
      }
    },
    forceRerender() {
      this.componentKey += 1;
    }
  },
  mounted() {
    this.authListener();
  }
}
</script>

<style scoped>
.new-entry-container {
  display: flex;
  justify-content: space-between;
  background-color: var(--directory-settings-background-color);
  color: var(--vt-c-text-dark-2);
  border-radius: 6px;
  border: 2px solid var(--navbar-tab-border-color);
  padding: 12px;
}

.listing-new-entry {
  display: flex;
  flex-direction: column;
  width: 70%;
}

#newEntryOpener {
  margin-right: 10px;
  margin-top: 15px;
}

.new-entry-form {
  display: grid;
  row-gap: 5px;
  grid-template-columns: 40% 60%;
  margin-bottom: 15px;
  margin-top: 15px;
}

#newEntryLanguagesSelect {
  width: 70%;
}

.selected-languages-container {
  display: flex;
  flex-wrap: wrap;
}

.new-entry-form-text {
  font-size: 16px;
  font-weight: bold;
  color: var(--directory-entry-text-color);
}

div.new-entry-type {
  justify-content: left;
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
  margin-top: 15px;
}

#addEntryButton {
  margin-top: 20px;
}

.new-entry-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28%;
}

.new-entry-preview p {
  text-align: center;
}

#previewTitle {
  margin-block-end: 0px;
}

.directory-settings {
  display: flex;
  background-color: var(--directory-settings-background-color);
  color: var(--vt-c-text-dark-2);
  width: auto;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 12px;
  margin-bottom: 25px;
}

.settings-subcontainer,
.new-entry-type {
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-subcontainer {
  border: 2px solid var(--vt-c-white);
  border-radius: 8px;
  margin-right: 8px;
}

.settings-subcontainer:hover .subcontainer-title:not(.right-side) {
  background-color: var(--vt-c-white);
}

.settings-subcontainer div {
  display: flex;
}

.settings-subcontainer .subcontainer-title {
  display: flex;
  align-items: center;
  text-align: center;
  font-weight: bold;
  padding-left: 4px;
  padding-right: 4px;
  border-right: 2px solid var(--vt-c-white);
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  background-color: var(--vt-c-text-dark-2);
  color: var(--vt-c-black);
  height: 100%;
}

.settings-subcontainer .subcontainer-title.right-side {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  border-right: none;
  border-left: 2px solid var(--vt-c-white);
  background-color: var(--pale-tone);
}

.matching-entries {
  /* border-left: 2px dashed var(--vt-c-white); */
  font-size: 17px;
  font-weight: bold;
}

.setting-parameter-subcontainer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  margin: 3px;
}

.setting-parameter-subcontainer.extra-margin-end {
  margin-right: 6px;
}

.setting-parameter-subcontainer.border-left {
  padding-left: 6px;
  border-left: 2px solid var(--vt-c-white);
}

.setting-parameter-subcontainer.centered {
  align-items: center;
}

#filterInput {
  width: 150px;
}

.tools-container {
  width: fit-content;
}

#initialLetter {
  width: 80px;
}

#generateCollage {
  width: fit-content;
}

.settings-slider {
  width: 100px;
}

.micronations-list {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
}

.moderation-menu {
  display: flex;
}

#moderationMicronations {
  width: 80%;
}

.micronations-list.fixed-height {
  max-height: calc(v-bind('fixedHeightValue') * 1px);
  overflow-y: scroll;
}

.dropdown-info-box {
  border-top: none;
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
}

.moderation-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  background-color: var(--profile-left-side-background-color);
  border-right: none;
  border-left: 4px solid var(--site-section-border-color);
  border-radius: 0px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  min-height: fit-content;
  height: auto;
  width: 30%;
}

#moderationBar {
  width: 100%;
  justify-content: center;
  border-radius: 0px;
}

.moderation-buttons .moderation-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.moderation-buttons .selected-entry-name {
  font-size: 20px;
  font-weight: bold;
}

.moderation-buttons .selected-entry-author {
  font-size: 14px;
}

.moderation-buttons .login-button {
  width: 70%;
  margin-bottom: 25px;
}

.moderation-buttons .login-button:last-child {
  margin-bottom: 0;
}

.moderation-buttons .login-input {
  margin-top: 15px;
  width: 100%;
}

#entryReject {
  background-color: var(--intense-tone);
}

#entryApprove {
  background-color: var(--success-tone);
}

#goToTopButton {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: 50px;
  height: 50px;
  right: 10px;
  bottom: 10px;
  border-radius: 50%;
  font-size: 30px;
  background-color: var(--vt-c-text-dark-2);
  color: var(--vt-c-indigo);
  cursor: pointer;
}

@media only screen and (max-width: 960px) {
  .directory-settings {
    flex-direction: column;
    align-items: center;
  }

  .directory-settings>div:not(div:last-of-type) {
    margin-bottom: 15px;
  }
}</style>
