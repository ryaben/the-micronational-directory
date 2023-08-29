<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import LocationPicker from '../components/LocationPicker.vue';
import Recaptcha from '../components/ReCaptcha.vue';
import store from '../store';
</script>

<template>
  <section class="site-section">
    <div class="dropdown-info-box color-transition">
      <h3 @click="toggleDropdown">⚠️ Important notes on new entries (click to open/close):</h3>
      <p>
        We invite the community to contribute to the directory and add micronations to it.
        <b>It's important to highlight that:</b>
      </p>
      <ul class="notes-list">
        <li>
          Please provide <b>truthful, appropriate and precise information</b>. Entries without a basis on veridical proof
          like an official website or article will be surely rejected. Also, cases of micronations that promote Nazi
          symbology, adult 18+ content and/or any kind of illegal activity will be immediately rejected as well.
        </li>
        <li>
          Physical and digital micronations
          can be included alike, as well as fictional countries as long as they also demonstrate activity as a proper
          micronation (news, diplomacy, activity) with imaginary elements (e.g., <a
            href="https://en.wikipedia.org/wiki/Babar%27s_Kingdom" target="_blank">Babar's Kingdom</a>
          is not a valid case, while the <a href="https://en.wikipedia.org/wiki/Kingdom_of_Redonda"
            target="_blank">Kingdom
            of
            Redonda</a> indeed is).
        </li>
        <li>
          Micronations submitted should have <b>at least 3 months of proven existence.</b> This way we avoid lightning
          entries that may only be games or premature/fake experiments.
        </li>
        <li>
          Ideally and whenever possible, please input the entry data in English. If not, then in the micronation's main
          official language.
        </li>
        <li>
          If a micronation's website is closed or inactive, you can check it on the <b><a
              href="http://web.archive.org/">Wayback
              Machine</a></b> because it may have a past snapshot saved. If so, you can add the link the service generates
          instead.
        </li>
        <li>
          All submissions will first <b>require approval from the administrator</b> before they are posted on the
          definitive
          public online directory.
        </li>
      </ul>
      <p>
        Thanks for understanding and for helping to create this digital database museum!
      </p>

      <Transition name="opacity">
        <form class="listing-new-entry" v-show="newEntryView" @submit.prevent="addEntry">
          <div class="new-entry-form">
            <label for="newEntryName" class="new-entry-form-text mandatory">Name*</label>
            <input type="text" id="newEntryName" ref="newEntryName" required
              placeholder="E.g. 'Sealand' (just the main name)">

            <label for="newEntryTitle" class="new-entry-form-text mandatory">Title*</label>
            <input type="text" id="newEntryTitle" ref="newEntryTitle" required
              placeholder="E.g. 'Principality of' (the rest of the official name)">

            <label for="newEntryNameAlt" class="new-entry-form-text">Alternative name</label>
            <input type="text" id="newEntryNameAlt" ref="newEntryNameAlt"
              placeholder="Second option for name, like in another language">

            <label for="newEntryTitleAlt" class="new-entry-form-text">Alternative title</label>
            <input type="text" id="newEntryTitleAlt" ref="newEntryTitleAlt"
              placeholder="Second option for title, like in another language">

            <label for="newEntryMotto" class="new-entry-form-text mandatory">Motto</label>
            <input type="text" id="newEntryMotto" ref="newEntryMotto"
              placeholder="E.g. 'In God we trust', motto from the micronation">

            <label class="new-entry-form-text mandatory">Type*</label>
            <div class="new-entry-type">
              <input type="checkbox" id="typePhysical" ref="newEntryTypePhysical" name="new-entry-type" value="physical"
                @change="updatePhysicalType">
              <label for="typePhysical">Physical</label>
              <input type="checkbox" id="typeDigital" ref="newEntryTypeDigital" name="new-entry-type" value="digital"
                checked>
              <label for="typeDigital">Digital</label>
              <input type="checkbox" id="typeFictional" ref="newEntryTypeFictional" name="new-entry-type"
                value="fictional">
              <label for="typeFictional">Fictional</label>
            </div>

            <label for="newEntryLanguages" class="new-entry-form-text mandatory">Languages*</label>
            <textarea id="newEntryLanguages" ref="newEntryLanguages" name="newEntryLanguages" cols="50" rows="3" required
              placeholder="Enter one language per line"></textarea>

            <label for="newEntryCapital" class="new-entry-form-text">Capital</label>
            <input type="text" id="newEntryCapital" ref="newEntryCapital"
              placeholder="City, place or building officiating as capital">

            <label for="newEntryCurrency" class="new-entry-form-text">Currency</label>
            <input type="text" id="newEntryCurrency" ref="newEntryCurrency"
              placeholder="E.g. 'Sealandic dollar', official currency of the micronation">

            <label for="newEntryFoundation" class="new-entry-form-text mandatory">Foundation*</label>
            <input type="date" id="newEntryFoundation" ref="newEntryFoundation" name="newEntryFoundation" required>

            <label v-show="physicalType" class="new-entry-form-text mandatory">Location<br><span class="underlined">(leave
                as
                is if
                N/A)</span></label>
            <LocationPicker ref="locationPicker" mode="picker" :visible="!physicalType" width="100%" height="200px"
              @dragged-marker="draggedMarker" />

            <label for="newEntryMemberships" class="new-entry-form-text">Memberships</label>
            <textarea id="newEntryMemberships" ref="newEntryMemberships" name="newEntryMemberships" cols="50" rows="3"
              placeholder="Enter one organization per line"></textarea>

            <label for="newEntryEmails" class="new-entry-form-text mandatory">Contact info*</label>
            <textarea id="newEntryEmails" ref="newEntryEmails" name="newEntryEmails" cols="50" rows="3" required
              placeholder="Enter one email or social media link per line"></textarea>

            <label for="newEntryWebsites" class="new-entry-form-text mandatory">Websites*</label>
            <textarea id="newEntryWebsites" ref="newEntryWebsites" name="newEntryWebsites" cols="50" rows="3" required
              placeholder="Enter one website link per line"></textarea>

            <label for="newEntryFlag" class="new-entry-form-text mandatory">Flag*</label>
            <div class="flag-preview-container">
              <input type="file" @change="previewImage" accept="image/png" required>
              <img v-show="flagSource != ''" class="flag-preview" :src="flagPreview">
            </div>

            <div class="wide-row">
              <Recaptcha @checkbox="checkRecaptcha" />
              <input id="addEntryButton" type="submit" value="Add new entry" :disabled="!passedRecaptcha"
                class="login-button short color-transition">
              <label>(wait a few seconds for notification)</label>
            </div>
          </div>
        </form>
      </Transition>

      <button v-show="!newEntryView" id="newEntryOpener" class="login-button short color-transition"
        :disabled="!this.user.emailVerified" @click="newEntryView = true" :key="this.componentKey">Add new entry</button>
      <label v-if="!this.user.emailVerified" :key="this.componentKey">(Available for <a href="/login">registered users
          with verified email</a> only)</label>
    </div>

    <hr class="divider" id="mainDivider">

    <section class="directory-container">
      <div class="directory-settings">
        <div class="settings-subcontainer">
          <label>Initial letter and search:</label>
          <div>
            <select name="initialLetter" id="initialLetter" @change="filterEntriesByLetter">
              <optgroup>
                <option value="none">No filter</option>
              </optgroup>
              <optgroup class="letters-group">
                <option :value="letter" v-for="(letter, i) in this.filterLetters" :key="i">{{ letter }}</option>
              </optgroup>
            </select>
            <input id="filterInput" ref="filterInput" type="text" @input="filterEntries">
          </div>
        </div>
        <div class="settings-subcontainer">
          <label>Sort:</label>
          <div>
            <input type="radio" id="sortA-Z" name="directory-sorting" value="ascending" checked
              @change="sortMicronations(this.micronationsDirectory, 'ascending'); forceRerender()">
            <label for="sortA-Z">A-Z</label>
            <input type="radio" id="sortZ-A" name="directory-sorting" value="descending"
              @change="sortMicronations(this.micronationsDirectory, 'descending'); forceRerender()">
            <label for="sortZ-A">Z-A</label>
            <input type="radio" id="sortRandom" name="directory-sorting" value="random"
              @change="sortMicronations(this.micronationsDirectory, 'random'); forceRerender()">
            <label for="sortRandom">Random</label>
          </div>
        </div>
        <div class="settings-subcontainer">
          <label>Views:</label>
          <div>
            <button class="custom-button" @click="changeViewMode('cards')">Cards</button>
            <button class="custom-button" @click="changeViewMode('collage')">Flags</button>
            <button class="custom-button" @click="changeViewMode('map')">Map</button>
          </div>
        </div>
        <div class="settings-subcontainer">
          <label>Card size:</label>
          <div>
            <input type="range" min="50" max="350" value="180" class="slider" id="zoomRange" ref="zoomRange"
              @change="updateZoom">
            <label>{{ this.entryWidth }}px</label>
          </div>
        </div>
      </div>

      <div v-show="this.micronationsDirectory.length === 0" class="loading-image-container">
        <img src="/images/loading.gif" alt="Loading">
        <label>Loading Directory...</label>
      </div>

      <div v-show="this.viewMode !== 'map'" class="micronations-list" ref="micronationsList" :key="this.componentKey">
        <TransitionGroup name="opacity">
          <DirectoryEntry
            v-for="(item, i) in this.micronationsDirectory.filter(element => element.searchDisplay && element.filterDisplay)"
            :key="i" :width="entryWidth" :flag-height="this.entryWidth * 0.6" :view-mode="this.viewMode" :info="{
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
              author: item.author
            }" />
        </TransitionGroup>
      </div>

      <LocationPicker v-show="this.viewMode === 'map'" ref="micronationsMap" mode="locationMap"
        :collection="physicalMicronationsDirectory" width="90%" height="40vw" />
    </section>
  </section>
</template>

<script>
import { doc, setDoc, Timestamp, GeoPoint } from "firebase/firestore";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/init.js';
import { notify } from "@kyvg/vue3-notification";

export default {
  data: () => {
    return {
      user: {},
      componentKey: 0,
      entryWidth: 180,
      newEntryView: false,
      viewMode: 'cards',
      physicalType: false,
      locationPickerMarkerPosition: [0, 0],
      flagSource: '',
      flagPreview: '',
      passedRecaptcha: false
    };
  },
  components: {
    DirectoryEntry,
    LocationPicker,
    Recaptcha
  },
  computed: {
    checkUser() {
      return auth.currentUser;
    },
    micronationsDirectory() {
      return store.getters.directory;
    },
    physicalMicronationsDirectory() {
      return store.getters.physicalDirectory;
    },
    filterLetters() {
      return this.addFilterLetters(this.micronationsDirectory);
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
    async checkRecaptcha(value) {
      this.passedRecaptcha = value;
    },
    async addEntry() {
      let that = this;

      if (this.searchMicronation(this.$refs.newEntryName.value) === undefined) {
        // data to send
        let typesArray = [];
        if (this.$refs.newEntryTypePhysical.checked) {
          typesArray.push('Physical');
        }
        if (this.$refs.newEntryTypeDigital.checked) {
          typesArray.push('Digital');
        }
        if (this.$refs.newEntryTypeFictional.checked) {
          typesArray.push('Fictional');
        }

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

        this.uploadFlag(this.$refs.newEntryName.value, function (fileName) {
          that.generateFlagReference(fileName, async function (flagReference) {
            await setDoc(doc(db, "micronations", that.$refs.newEntryName.value), {
              name: {
                main: that.$refs.newEntryName.value,
                mainAlt: that.$refs.newEntryNameAlt.value,
                title: that.$refs.newEntryTitle.value,
                titleAlt: that.$refs.newEntryTitleAlt.value
              },
              flag: flagReference,
              motto: that.$refs.newEntryMotto.value,
              type: typesArray,
              languages: that.readTextarea('newEntryLanguages'),
              capital: that.$refs.newEntryCapital.value,
              currency: that.$refs.newEntryCurrency.value,
              foundationDate: Timestamp.fromDate(new Date(that.$refs.newEntryFoundation.value)),
              location: physicalLocation,
              memberships: that.readTextarea('newEntryMemberships'),
              contactInfo: that.readTextarea('newEntryEmails'),
              websites: that.readTextarea('newEntryWebsites'),
              author: { name: that.checkUser.displayName, email: that.checkUser.email },
              approved: false
            });

            notify({
              title: "Submission successful",
              text: "The micronation was successfully submitted! Now awaits approval from the admin to become an entry in the Directory.",
              type: "success"
            });
          });
        });
      } else {
        notify({
          title: "Error when submitting",
          text: "This micronation is already present in the directory!",
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
          array.sort((a, b) => (a.name.main > b.name.main) ? 1 : -1);
          break;
        case 'descending':
          array.sort((a, b) => b.name.main - a.name.main);
          break;
        case 'random':
          this.shuffleArray(array);
          break;
        default:
          break;
      }
    },
    addFilterLetters(array) {
      let letters = [];

      array.forEach(function (element) {
        if (!letters.includes(element.name.main.charAt(0))) {
          letters.push(element.name.main.charAt(0));
        }
      });

      return letters;
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
      if (e.target.value == '') {
        this.micronationsDirectory.forEach(function (element) {
          element.searchDisplay = true;
        });
      } else {
        this.micronationsDirectory.forEach(function (element) {
          let entryCurated = element.name.main.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let searchCurated = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          if (!entryCurated.includes(searchCurated)) {
            element.searchDisplay = false;
          } else {
            element.searchDisplay = true;
          }
        });
      }
    },
    filterEntriesByLetter(e) {
      if (e.target.value === 'none') {
        this.micronationsDirectory.forEach(function (element) {
          element.filterDisplay = true;
        });
      } else {
        this.micronationsDirectory.forEach(function (element) {
          if (element.name.main.charAt(0) === e.target.value) {
            element.filterDisplay = true;
          } else {
            element.filterDisplay = false;
          }
        });
      }
    },
    updateZoom(e) {
      return this.entryWidth = parseInt(e.target.value);
    },
    changeViewMode(newValue) {
      this.viewMode = newValue;
    },
    updatePhysicalType() {
      this.physicalType = !this.physicalType;
    },
    previewImage(event) {
      this.flagSource = event.target.files[0];
      this.flagPreview = URL.createObjectURL(this.flagSource);
    },
    readTextarea(elementRef) {
      if (this.$refs[elementRef].value) {
        var arrayOfLines = this.$refs[elementRef].value.split("\n");
        return arrayOfLines;
      } else {
        return '';
      }
    },
    draggedMarker(newPosition) {
      this.locationPickerMarkerPosition = newPosition;
    },
    toggleDropdown(e) {
      e.target.parentNode.classList.toggle('open');
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
.listing-new-entry {
  display: flex;
  flex-direction: column;
  width: 50%;
  background-color: var(--directory-settings-background-color);
  color: var(--vt-c-text-dark-2);
  border-radius: 6px;
  border: 2px solid var(--navbar-tab-border-color);
  padding: 12px;
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

.success-message {
  margin-bottom: 10px;
  background-color: var(--success-tone);
  border-radius: 18px;
  padding: 8px;
}

.directory-settings {
  display: flex;
  justify-content: space-between;
  background-color: var(--directory-settings-background-color);
  color: var(--vt-c-text-dark-2);
  width: auto;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 25px;
}

#mainDivider {
  margin-block-start: 25px;
}

.settings-subcontainer,
.new-entry-type {
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-subcontainer {
  flex-direction: column;
}

.settings-subcontainer div {
  display: flex;
}

.settings-subcontainer>label {
  font-weight: bold;
}

#filterInput {
  width: 150px;
}

.tools-container {
  width: fit-content;
}

#initialLetter {
  width: 90px;
}

#zoomRange {
  width: 90px;
}

.loading-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: black;
  width: auto;
  padding-bottom: 55px;
}

.loading-image-container img {
  filter: invert(100);
  width: 300px;
}

.loading-image-container label {
  color: white;
  float: bottom;
  font-size: 20px;
}

.micronations-list {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  /* max-height: 40vw;
  overflow-y: scroll; */
}

@media only screen and (max-width: 960px) {
  .directory-settings {
    flex-direction: column;
    align-items: center;
  }

  .directory-settings>div:not(div:last-of-type) {
    margin-bottom: 15px;
  }
}

/* Vue transitions */

.opacity-enter-active,
.opacity-leave-active {
  transition: opacity 0.5s ease;
}

.opacity-enter-from,
.opacity-fast-enter-from {
  opacity: 0;
}
</style>
