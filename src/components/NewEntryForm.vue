<script setup>
import { auth, db } from '../firebase/init.js';
import { doc, setDoc, Timestamp, GeoPoint } from "firebase/firestore";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { notify } from "@kyvg/vue3-notification";
import { checkHref, checkIcon, cleanString } from '../assets/EntrySourceFunctions';
import store from '../store';
import emailjs from 'emailjs-com';
import languages from 'language-list';
import VueDatePicker from '@vuepic/vue-datepicker';
import LocationPicker from '../components/LocationPicker.vue';
import Recaptcha from '../components/ReCaptcha.vue';
import HelpTooltip from '../components/HelpTooltip.vue';
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
                <p>Please, carefully read instructions for all fields. Fields with an asterisk (*) are mandatory to fill,
                    the others can be blank.
                    <br>Help us save moderation efforts! <a
                        href="mailto:themicronationaldirectory@gmail.com">Ask any question</a> if needed, and check the
                    preview on the right.</p>

                <form class="listing-new-entry" @submit.prevent="addEntry">
                    <div class="new-entry-form">
                        <Transition name="fade">
                            <HelpTooltip v-if="tooltipDisplay" @closed-tooltip="deactivateTooltip"
                                :position="{ y: tooltipPosition.y, x: tooltipPosition.x }"
                                :help-text="tooltipTexts[activeTooltipText]" :title="tooltipTitle" />
                        </Transition>

                        <label for="newEntryName" class="new-entry-form-text mandatory">
                            Name* <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 0 ? '' : activateTooltip(0, 'Name', $event)">
                        </label>
                        <input type="text" id="newEntryName" v-model="newEntryForm.newEntryName" required
                            :placeholder="entryType === 'micronation' ? `E.g. 'Sealand' (just the short form)` : `E.g. League of Micronations (full name)`">

                        <label v-if="entryType === 'micronation'" for="newEntryTitle"
                            class="new-entry-form-text mandatory">
                            Title <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 1 ? '' : activateTooltip(1, 'Title', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryTitle"
                            v-model="newEntryForm.newEntryTitle"
                            placeholder="E.g. 'Principality of' (just the descriptive name only)">

                        <label for="newEntryNameAlt" class="new-entry-form-text">
                            {{ entryType === 'micronation' ? 'Alternative name' : 'Acronym*' }}
                            <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 2 ? '' : activateTooltip(2, 'Alternative name', $event)">
                        </label>
                        <input type="text" id="newEntryNameAlt" v-model="newEntryForm.newEntryNameAlt"
                            :placeholder="entryType === 'micronation' ? 'Second option for name, e.g. in another language' : 'Acronym of the organization, e.g. LoM'">

                        <label v-if="entryType === 'micronation'" for="newEntryTitleAlt"
                            class="new-entry-form-text">
                            Alternative title <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 3 ? '' : activateTooltip(3, 'Alternative title', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryTitleAlt"
                            v-model="newEntryForm.newEntryTitleAlt"
                            placeholder="Second option for title, e.g. in another language">

                        <label for="newEntryMotto" class="new-entry-form-text mandatory">
                            Motto <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 4 ? '' : activateTooltip(4, 'Motto', $event)">
                        </label>
                        <input type="text" id="newEntryMotto" v-model="newEntryForm.newEntryMotto"
                            placeholder="E.g. 'In God we trust' (add without quotes)">

                        <label v-if="entryType === 'micronation'" class="new-entry-form-text mandatory">
                            Type* <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 5 ? '' : activateTooltip(5, 'Type', $event)">
                        </label>
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

                        <label for="newEntryLanguages" class="new-entry-form-text mandatory">
                            Official languages* <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 6 ? '' : activateTooltip(6, 'Official languages', $event)">
                        </label>
                        <div class="new-entry-option-container">
                            <div style="display: flex;">
                                <select name="newEntryLanguages" class="new-entry-option-select" @change="addLanguage"
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
                                <SelectedLanguage class="selection margin-top"
                                    v-for="(language, i) in newEntryForm.newEntryLanguages" :key="i"
                                    :lang-text="language" @remove-language="removeLanguage(language)" />
                            </div>
                        </div>

                        <label v-if="entryType === 'micronation'" for="newEntryCapital"
                            class="new-entry-form-text">
                            Capital <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 7 ? '' : activateTooltip(7, 'Capital', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryCapital"
                            v-model="newEntryForm.newEntryCapital"
                            placeholder="City, place or building officiating as capital">

                        <label v-if="entryType === 'micronation'" for="newEntryCurrency"
                            class="new-entry-form-text">
                            Currency <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 8 ? '' : activateTooltip(8, 'Currency', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryCurrency"
                            v-model="newEntryForm.newEntryCurrency"
                            placeholder="Official currency of the micronation, just name and not symbol">

                        <label for="newEntryFoundation" class="new-entry-form-text mandatory">
                            Foundation* <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 9 ? '' : activateTooltip(9, 'Foundation', $event)">
                        </label>
                        <VueDatePicker v-model="foundationDate" month-name-format="long"
                            :flow="['year', 'month', 'calendar']" :utc="'preserve'" :timezone="'UTC'"
                            now-button-label="Today" :required="true" :max-date="new Date()" />

                        <label v-if="entryType === 'micronation'" v-show="physicalType"
                            class="new-entry-form-text mandatory">
                            Location <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 10 ? '' : activateTooltip(10, 'Location', $event)">
                        </label>
                        <div v-if="entryType === 'micronation'" v-show="physicalType">
                            <label v-show="physicalType">Drag and drop the blue pin to the location of the
                                micronation (leave as is if unknown or not applicable, for large territories you can
                                mark the capital):</label>
                            <LocationPicker v-if="renderedMapboxNewEntry" :visible="!physicalType" ref="locationPicker"
                                mode="picker" width="100%" height="300px" @dragged-marker="draggedMarker" />
                        </div>

                        <label v-if="entryType === 'micronation'" for="newEntryMemberships"
                            class="new-entry-form-text">
                            Memberships <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 11 ? '' : activateTooltip(11, 'Memberships', $event)">
                        </label>
                        <div v-if="entryType === 'micronation'" class="new-entry-option-container">
                            <div style="display: flex;">
                                <select name="newEntryMemberships" class="new-entry-option-select"
                                    @change="addMembership">
                                    <optgroup>
                                        <option value="custom">Other (manual input)</option>
                                    </optgroup>
                                    <optgroup>
                                        <option
                                            v-for="(membership, i) in organizationsDirectory.filter(element => element.approved)"
                                            :key="i" :value="membership.name.main">
                                            {{ membership.name.main }} ({{ membership.name.mainAlt }})
                                        </option>
                                    </optgroup>
                                </select>
                                <input type="text" placeholder="Other (full name, no acronym)"
                                    v-model="customMembership">
                            </div>
                            <div class="selected-languages-container">
                                <SelectedLanguage class="selection margin-top"
                                    v-for="(membership, i) in newEntryForm.newEntryMemberships" :key="i"
                                    :lang-text="membership" @remove-language="removeMembership" />
                            </div>
                        </div>

                        <label for="newEntryEmails" class="new-entry-form-text mandatory">
                            Contact media* <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 12 ? '' : activateTooltip(12, 'Contact media', $event)">
                        </label>
                        <div class="new-entry-option-container">
                            <div style="display: flex;">
                                <input type="text" id="newEntryEmail" class="new-entry-option-select"
                                    v-model="currentEmail" placeholder="Email, forum or social media (full URL!)">
                                <button @click="addEmail(currentEmail)" type="button"
                                    class="login-button squared-button color-transition new-entry-option-button">Add</button>
                            </div>
                            <div class="selected-languages-container">
                                <SelectedLanguage class="selection margin-top"
                                    v-for="(contact, i) in newEntryForm.newEntryEmails" :key="i"
                                    :lang-text="checkIcon(contact)" @remove-language="removeEmail(contact)" />
                            </div>
                        </div>

                        <label for="newEntryWebsites" class="new-entry-form-text mandatory">
                            Info sources* <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 13 ? '' : activateTooltip(13, 'Info sources', $event)">
                        </label>
                        <div class="new-entry-option-container">
                            <div style="display: flex;">
                                <input type="text" id="newEntryWebsite" class="new-entry-option-select"
                                    v-model="currentWebsite" placeholder="URL to website (include HTTP or HTTPS)">
                                <button @click="addWebsite(currentWebsite)" type="button"
                                    class="login-button squared-button color-transition new-entry-option-button">Add</button>
                            </div>
                            <div class="selected-languages-container">
                                <SelectedLanguage class="selection margin-top"
                                    v-for="(website, i) in newEntryForm.newEntryWebsites" :key="i"
                                    :lang-text="checkIcon(website)" @remove-language="removeWebsite(website)" />
                            </div>
                        </div>

                        <label for="newEntryFlag" class="new-entry-form-text mandatory">
                            {{ entryType === 'micronation' ? 'Flag*' : 'Logo*' }}
                            <img src="/images/info.png" alt='info' class="tooltip-activator" @click="activeTooltipIndex === 14 ? '' : activateTooltip(14, 'Flag', $event)">
                        </label>
                        <div class="flag-preview-container">
                            <input type="file" @change="previewImage" accept="image/png" required>
                            <br>
                            <label for="">(if N/A or unobtainable: <a href="/images/missing-flag.png"
                                    target="_blank">download and apply this template</a>)
                            </label>
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
                    memberships: newEntryForm.newEntryMemberships,
                    contactInfo: newEntryForm.newEntryEmails,
                    websites: newEntryForm.newEntryWebsites,
                    approved: true
                }" />
                <OrganizationEntry v-if="entryType === 'organization'" :initial-info-view="true" :width="180"
                    :flag-height="180 * 0.6" view-mode="micronations" :micronations-directory="micronationsDirectory"
                    :info="{
                    name: {
                        main: newEntryForm.newEntryName,
                        mainAlt: newEntryForm.newEntryNameAlt
                    },
                    logo: flagPreview,
                    motto: newEntryForm.newEntryMotto,
                    languages: newEntryForm.newEntryLanguages,
                    foundationDate: Timestamp.fromDate(convertTZ(new Date(foundationDate), 'Etc/UTC')),
                    contactInfo: newEntryForm.newEntryEmails,
                    websites: newEntryForm.newEntryWebsites,
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
        OrganizationEntry,
        HelpTooltip
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
                newEntryMemberships: [],
                newEntryEmails: [],
                newEntryWebsites: []
            },
            foundationDate: null,
            flagSource: '',
            flagPreview: '',
            passedRecaptcha: false,
            customLanguage: '',
            customMembership: '',
            currentEmail: '',
            currentWebsite: '',
            locationPickerMarkerPosition: [0, 0],
            renderedMapboxNewEntry: false,
            physicalType: false,
            tooltipDisplay: false,
            tooltipPosition: {
                x: 0,
                y: 0
            },
            tooltipTitle: '',
            tooltipTexts: [
                "This should be the most common, shortest variant of the name, barely the proper name itself. Take 'Sealand', 'Hutt River' or 'Denmark' as examples. Ideally, use the main official language version or an English one if available.",
                "Here, the descriptive rest of the full name's composition should be added, excluding the main name added above. Barely 'Principality of' or 'Republic of' are some examples of proper cases. There may be some cases, like 'Athenian Republic', in which this field remains blank and only 'Name' is filled.",
                "An additional, secondary version of the main name. This field is useful when a micronation has several official names in different languages. A clear example would be 'Insulo de la Rozoj' (while 'Rose Island' goes on 'Name')",
                "Same as 'Title', but input it in another language. To follow above's example, 'Respubliko de la' could be placed here.",
                "Official, national motto. Be sure to NOT add quotes of any kind. The proper way to populate the field is placing the motto in whatever language it is, and then adding the English translation between parenthesis if available. For instance, a valid input is: Vivat Rex (Long Live the King).",
                "The 'Type' of the micronation applies in regard of its kind of (non) territorial claim. Micronations that claim territory on Earth or other real-world elements are 'Physical', the ones that exist solely on the Internet and don't have actual land pretensions are 'Digital', while cases that live on simulated or fantasy worlds are 'Fictional'. More than one type can be checked, for sure.",
                "Official languages spoken. Can be also extended to other national and/or recognized languages. If there isn't any, place the de facto language or the one used by representatives on websites and social media.",
                "Physical, digital or fictional city or any kind of place officiating as the micronation's capital. If there's more than one, then add all of them separated by commas.",
                "Currency (or currencies) legally adopted and accepted, they could be purported as well, either physical and digital. Some micronations even include macronational fiat currencies, and they are applicable as well. If there's more than one, then add all of them separated by commas.",
                "The full founding date. If there's not enough information to input a full date, select the first day of the available timespan data. For instance, if it's only known that it was founded on 1997, input January 1, 1997. If a foundation is stated on August, 2004, select August 1, 2004.",
                "The micronation's location of its territorial claims. There is no possibility for selecting polygonal ranges, only geopoint pins. So, for large territorial claims, you can mark the capital or even the leader's approximate location. In any case not applicable, just leave the blue pin as is.",
                "Supramicronational organizations that this micronation is currently a member of AND also was a member of in the past. There is no possibility to indicate membership type, so full members, partial members, observer members and any other kind of distinction cases should be added alike. On the 'Other' subfield you can add organizations that are not present on our directory, and also the main name of another micronation in case this one is a constituent country/nation.",
                "Any communication media should be added here. This includes email addresses, social media profiles (adding the full URL, not just the username), links to chat or group invitation, forums and other similar platforms.",
                "Complete the field by adding websites that contain relevant info. This should always include official websites (if available), wiki or news articles, and unofficial websites where data was gathered from. If you come across a dead website, check it out using https://web.archive.org/ and if there is a saved snapshot, add its link here instead.",
                "Only .png files, it would be great if you first compress it at https://tinypng.com/. In the majority of cases, the national flag should be chosen here, but it could be that the State flag or even civil flag is the prevalent one. There is no possibility for adding more than one flag (e.g. co-official flags), so the most prevalent one should be added. Always add the latest and current version."
            ],
            activeTooltipText: 0
        };
    },
    computed: {
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

            if (this.newEntryForm.newEntryWebsites.length === 0) {
                return notify({
                    title: "Error when submitting",
                    text: "No info source link was provided. It's mandatory to include at least one to validate all the info that was input.",
                    type: "error"
                });
            }

            if (this.newEntryForm.newEntryLanguages.length === 0) {
                return notify({
                    title: "Error when submitting",
                    text: "No official languages were added. If there aren't any, add the main one used within the micronation.",
                    type: "error"
                });
            }

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
                                    memberships: that.newEntryForm.newEntryMemberships,
                                    contactInfo: that.newEntryForm.newEntryEmails,
                                    websites: that.newEntryForm.newEntryWebsites,
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
                                    contactInfo: that.newEntryForm.newEntryEmails,
                                    websites: that.newEntryForm.newEntryWebsites,
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
        addMembership(event) {
            const lang = event.target.value;

            if (this.newEntryForm.newEntryMemberships.find(e => e === lang || (lang === 'custom' && e === this.customMembership)) === undefined) {
                if (lang === 'custom') {
                    this.newEntryForm.newEntryMemberships.push(this.customMembership);
                } else {
                    this.newEntryForm.newEntryMemberships.push(lang);
                }
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
        activateTooltip(tooltipIndex, title, event) {
            this.tooltipDisplay = true;
            this.tooltipPosition = {
                x: event.pageX,
                y: event.pageY
            }
            this.tooltipTitle = title;
            this.activeTooltipText = tooltipIndex;
        },
        deactivateTooltip() {
            this.tooltipDisplay = false;
            this.tooltipPosition = {
                x: 0,
                y: 0
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
        removeMembership(value) {
            this.newEntryForm.newEntryMemberships.splice(this.newEntryForm.newEntryMemberships.indexOf(value), 1);
        },
        removeEmail(value) {
            this.newEntryForm.newEntryEmails.splice(this.newEntryForm.newEntryEmails.indexOf(value), 1);
        },
        removeWebsite(value) {
            this.newEntryForm.newEntryWebsites.splice(this.newEntryForm.newEntryWebsites.indexOf(value), 1);
        },
        addEmail(value) {
            this.newEntryForm.newEntryEmails.push(value);
            this.currentEmail = "";
        },
        addWebsite(value) {
            this.newEntryForm.newEntryWebsites.push(value);
            this.currentWebsite = "";
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
    row-gap: 8px;
    grid-template-columns: 30% 60%;
    margin-bottom: 15px;
    margin-top: 15px;
    /* border-right: 3px solid var(--vt-c-white-soft); */
}

.new-entry-option-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 3px;
    padding: 6px;
    border-radius: 8px;
    background-color: var(--vt-c-divider-dark-1);
}

.new-entry-option-select {
    width: 100%;
    margin-right: 3px;
}

.new-entry-option-button {
    width: 20%;
}

.selected-languages-container {
    display: flex;
    flex-wrap: wrap;
}

.new-entry-form-text {
    display: flex;
    align-items: center;
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
    width: 30%;
}

.new-entry-preview p {
    text-align: center;
}

#previewTitle {
    margin-block-end: 0px;
}

.tooltip-activator {
    margin-left: 4px;
    width: 16px;
    cursor: pointer;
}
</style>