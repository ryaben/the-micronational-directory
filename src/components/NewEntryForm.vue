<script setup>
import { auth, db } from '../firebase/init.js';
import { doc, setDoc, Timestamp, GeoPoint } from "firebase/firestore";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { notify } from "@kyvg/vue3-notification";
import store from '../store';
import emailjs from 'emailjs-com';
import languages from 'language-list';
import VueDatePicker from '@vuepic/vue-datepicker';
import LocationPicker from '../components/LocationPicker.vue';
import Recaptcha from '../components/ReCaptcha.vue';
import SelectedLanguage from '../components/SelectedLanguage.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import OrganizationEntry from '../components/OrganizationEntry.vue';

defineProps({
    entryType: {
        type: String,
        required: false,
        default: 'micronation'
    },
    directoryData: {
        type: Array,
        required: true,
        default: [
            {}
        ]
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
        default: store.getters.organizations.filter(element => element.approved && element.searchDisplay && element.filterDisplay)
    },
    supranationalMicronations: {
        type: Array,
        required: false,
        default: store.getters.micronations.filter(element => element.supranational)
    }
});
</script>

<template>
    <Transition name="opacity">
        <div class="new-entry-container">
            <div style="display: flex; flex-direction: column; width: 70%;">
                <p>Please, carefully read instructions for all fields. Help us save moderation efforts! <a
                        href="mailto:themicronationaldirectory@gmail.com">Ask any question</a> if needed.</p>

                <form class="listing-new-entry" @submit.prevent="addEntry">
                    <div class="new-entry-form">
                        <label for="newEntryName" class="new-entry-form-text mandatory">Name*</label>
                        <input type="text" id="newEntryName" v-model="newEntryForm.newEntryName" required
                            :placeholder="entryType === 'micronation' ? `E.g. 'Sealand' (just the short form)` : `E.g. League of Micronations (full name)`">

                        <label v-if="entryType === 'micronation'" for="newEntryTitle"
                            class="new-entry-form-text mandatory">Title</label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryTitle"
                            v-model="newEntryForm.newEntryTitle"
                            placeholder="E.g. 'Principality of' (just the descriptive name only)">

                        <label for="newEntryNameAlt" class="new-entry-form-text">{{ entryType === 'micronation' ?
                            'Alternative name' : 'Acronym*' }}</label>
                        <input type="text" id="newEntryNameAlt" v-model="newEntryForm.newEntryNameAlt"
                            :placeholder="entryType === 'micronation' ? 'Second option for name, e.g. in another language' : 'Acronym of the organization, e.g. LoM'">

                        <label v-if="entryType === 'micronation'" for="newEntryTitleAlt"
                            class="new-entry-form-text">Alternative title</label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryTitleAlt"
                            v-model="newEntryForm.newEntryTitleAlt"
                            placeholder="Second option for title, e.g. in another language">

                        <label for="newEntryMotto" class="new-entry-form-text mandatory">Motto</label>
                        <input type="text" id="newEntryMotto" v-model="newEntryForm.newEntryMotto"
                            placeholder="E.g. 'In God we trust' (add without quotes)">

                        <label v-if="entryType === 'micronation'" class="new-entry-form-text mandatory">Type*</label>
                        <div v-if="entryType === 'micronation'" class="new-entry-type">
                            <input type="checkbox" id="typePhysical" v-model="newEntryForm.newEntryTypePhysical"
                                name="new-entry-type" value="physical" @change="updatePhysicalType"
                                @click="renderedMapboxNewEntry = true">
                            <label for="typePhysical">Physical</label>
                            <input type="checkbox" id="typeDigital" v-model="newEntryForm.newEntryTypeDigital"
                                name="new-entry-type" value="digital" checked>
                            <label for="typeDigital">Digital</label>
                            <input type="checkbox" id="typeFictional" v-model="newEntryForm.newEntryTypeFictional"
                                name="new-entry-type" value="fictional">
                            <label for="typeFictional">Fictional</label>
                        </div>

                        <label for="newEntryLanguages" class="new-entry-form-text mandatory">Languages*</label>
                        <div style="display: flex; flex-direction: column; margin-bottom: 3px;">
                            <div style="display: flex;">
                                <select name="newEntryLanguages" id="newEntryLanguagesSelect" @change="addLanguage"
                                    required>
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

                        <label v-if="entryType === 'micronation'" for="newEntryCapital"
                            class="new-entry-form-text">Capital</label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryCapital"
                            v-model="newEntryForm.newEntryCapital"
                            placeholder="City, place or building officiating as capital">

                        <label v-if="entryType === 'micronation'" for="newEntryCurrency"
                            class="new-entry-form-text">Currency</label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryCurrency"
                            v-model="newEntryForm.newEntryCurrency"
                            placeholder="Official currency of the micronation, just name and not symbol">

                        <label for="newEntryFoundation" class="new-entry-form-text mandatory">Foundation*</label>
                        <VueDatePicker v-model="foundationDate" month-name-format="long"
                            :flow="['year', 'month', 'calendar']" :utc="'preserve'" :timezone="'UTC'"
                            now-button-label="Today" :required="true" :max-date="new Date()" />

                        <label v-if="entryType === 'micronation'" v-show="physicalType"
                            class="new-entry-form-text mandatory">Location<br>
                            (leave as is if unknown or N/A)</label>
                        <div v-if="entryType === 'micronation'" v-show="physicalType">
                            <label v-show="physicalType">Drag and drop the blue pin to the location of the
                                micronation:</label>
                            <LocationPicker v-if="renderedMapboxNewEntry" :visible="!physicalType" ref="locationPicker"
                                mode="picker" width="100%" height="300px" @dragged-marker="draggedMarker" />
                        </div>

                        <label v-if="entryType === 'micronation'" for="newEntryMemberships"
                            class="new-entry-form-text">Memberships<br>(capitals, not full name)</label>
                        <textarea v-if="entryType === 'micronation'" id="newEntryMemberships"
                            v-model="newEntryForm.newEntryMemberships" name="newEntryMemberships" cols="50" rows="3"
                            placeholder="Enter one organization or institution per line (press Enter after each value)"></textarea>

                        <label for="newEntryEmails" class="new-entry-form-text mandatory">Contact media*</label>
                        <textarea id="newEntryEmails" v-model="newEntryForm.newEntryEmails" name="newEntryEmails" cols="50"
                            rows="3" required
                            placeholder="Enter one email or social media link per line (don't add usernames, insert full link to profile please) (press Enter after each value)"></textarea>

                        <label for="newEntryWebsites" class="new-entry-form-text mandatory">Info sources*<br>(official + ideally
                            wiki article)</label>
                        <textarea id="newEntryWebsites" v-model="newEntryForm.newEntryWebsites" name="newEntryWebsites"
                            cols="50" rows="3" required
                            placeholder="Enter one website or article link per line (press Enter after each value)"></textarea>

                        <label for="newEntryFlag" class="new-entry-form-text mandatory">
                            {{ entryType === 'micronation' ? 'Flag*' : 'Logo*' }}<br>(if N/A or unobtainable:
                            <br><a href="/images/missing-flag.png" target="_blank">use this template</a>)</label>
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
            </div>

            <div class="new-entry-preview">
                <h2 id="previewTitle">Entry preview</h2>
                <p>(Click on 'Expand' to toggle the display)</p>

                <DirectoryEntry v-if="entryType === 'micronation'" :initial-info-view="true" :width="180"
                    :flag-height="180 * 0.6" view-mode="micronations" :micronations-directory="micronationsDirectory"
                    :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
                    :supranational-micronations="supranationalMicronations" :info="{
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
                <OrganizationEntry v-if="entryType === 'organization'" :initial-info-view="true" :width="180"
                    :flag-height="180 * 0.6" view-mode="micronations" :micronations-directory="micronationsDirectory" :info="{
                        name: {
                            main: newEntryForm.newEntryName,
                            mainAlt: newEntryForm.newEntryNameAlt
                        },
                        logo: flagPreview,
                        motto: newEntryForm.newEntryMotto,
                        languages: newEntryForm.newEntryLanguages,
                        foundationDate: Timestamp.fromDate(convertTZ(new Date(foundationDate), 'Etc/UTC')),
                        contactInfo: newEntryForm.newEntryEmails.split('\n'),
                        websites: newEntryForm.newEntryWebsites.split('\n'),
                        approved: true
                    }" />
            </div>
        </div>
    </Transition>
</template>

<script>
export default {
    name: 'NewEntryForm',
    components: {
        VueDatePicker,
        LocationPicker,
        Recaptcha,
        SelectedLanguage,
        DirectoryEntry,
        OrganizationEntry
    },
    data: () => {
        return {
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
            foundationDate: null,
            flagSource: '',
            flagPreview: '',
            passedRecaptcha: false,
            customLanguage: '',
            locationPickerMarkerPosition: [0, 0],
            renderedMapboxNewEntry: false,
            physicalType: false
        };
    },
    computed: {
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
    },
    methods: {
        async addEntry() {
            const that = this;

            if (this.searchElement(this.newEntryForm.newEntryName) === undefined) {
                switch (this.entryType) {
                    case 'micronation':
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

                        this.uploadFlag(this.newEntryForm.newEntryName, 'flags', function (fileName) {
                            that.generateFlagReference(fileName, 'flags', async function (flagReference) {
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
                                    author: { name: auth.currentUser.displayName, email: auth.currentUser.email },
                                    approved: false,
                                    creationDate: Timestamp.fromDate(that.convertTZ(new Date(), 'Etc/UTC'))
                                });

                                that.emailNotice();
                                that.successNotification();
                            });
                        });
                        break;
                    case 'organization':
                        this.uploadFlag(this.newEntryForm.newEntryName, 'organizations', function (fileName) {
                            that.generateFlagReference(fileName, 'organizations', async function (flagReference) {
                                await setDoc(doc(db, "organizations", that.newEntryForm.newEntryName), {
                                    name: {
                                        main: that.newEntryForm.newEntryName,
                                        mainAlt: that.newEntryForm.newEntryNameAlt
                                    },
                                    logo: flagReference,
                                    motto: that.newEntryForm.newEntryMotto,
                                    languages: that.newEntryForm.newEntryLanguages,
                                    foundationDate: Timestamp.fromDate(that.convertTZ(new Date(that.foundationDate), 'Etc/UTC')),
                                    contactInfo: that.readTextarea('newEntryEmails'),
                                    websites: that.readTextarea('newEntryWebsites'),
                                    author: { name: auth.currentUser.displayName, email: auth.currentUser.email },
                                    approved: false,
                                    creationDate: Timestamp.fromDate(that.convertTZ(new Date(), 'Etc/UTC'))
                                });

                                that.emailNotice();
                                that.successNotification();
                            });
                        });
                        break;
                    default:
                        break;
                }
            } else {
                notify({
                    title: "Error when submitting",
                    text: "This micronation or organization is already present in the directory! If not, then an entry for it was recently submitted and is still under review.",
                    type: "error"
                });
            }
        },
        async uploadFlag(fileName, folder, callback) {
            const storage = getStorage();
            const storageRef = ref(storage, 'images/' + folder + '/' + fileName + '.png');

            uploadBytes(storageRef, this.flagSource).then((snapshot) => {
                console.log('Flag file uploaded with ID ' + fileName);
                callback(fileName);
            });
        },
        async generateFlagReference(fileName, folder, callback) {
            const storage = getStorage();

            getDownloadURL(ref(storage, 'images/' + folder + '/' + fileName + '.png'))
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
        searchElement(value) {
            return this.directoryData.find(function (entry) {
                return entry.name.main === value;
            });
        },
        async checkRecaptcha(value) {
            this.passedRecaptcha = value;
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
        readTextarea(elementRef) {
            if (this.newEntryForm[elementRef]) {
                var arrayOfLines = this.newEntryForm[elementRef].split("\n");
                return arrayOfLines;
            } else {
                return '';
            }
        },
        emailNotice() {
            const that = this;
            if (auth.currentUser.email !== 'themicronationaldirectory@gmail.com') {
                emailjs.send("service_gd9nz5x", "template_wnd0ghn", {
                    user: auth.currentUser.email,
                    micronation: that.newEntryForm.newEntryName,
                },
                    "P8-p_r-gTZedo_h84");
            }
        },
        successNotification() {
            notify({
                title: "Submission successful",
                text: "The entry was successfully submitted! Now awaits approval from the admin (please allow up to 72 hours).",
                type: "success"
            });
        },
        removeLanguage(value) {
            this.newEntryForm.newEntryLanguages.splice(this.newEntryForm.newEntryLanguages.indexOf(value), 1);
        },
        draggedMarker(newPosition) {
            this.locationPickerMarkerPosition = newPosition;
        },
        updatePhysicalType() {
            this.physicalType = !this.physicalType;
        },
        previewImage(event) {
            this.flagSource = event.target.files[0];
            this.flagPreview = URL.createObjectURL(this.flagSource);
        },
        convertTZ(date, tzString) {
            return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
        },
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
</style>