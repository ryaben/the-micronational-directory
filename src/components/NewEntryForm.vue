<script setup>
import { defineAsyncComponent } from 'vue';
import { auth } from '../firebase/auth.js';
import { notify } from "@kyvg/vue3-notification";
import { checkHref, checkIcon, cleanString } from '../utils/EntrySourceFunctions';
import store from '../store';
import emailjs from 'emailjs-com';
import languages from 'language-list';
import VueDatePicker from '@vuepic/vue-datepicker';
import Recaptcha from '../components/ReCaptcha.vue';
import HelpTooltip from '../components/HelpTooltip.vue';
import SelectedElement from '../components/SelectedElement.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import OrganizationEntry from '../components/OrganizationEntry.vue';
import { createGitHubIssue } from '../utils/githubFunctions.js';
import imageCompression from 'browser-image-compression';

const LocationPicker = defineAsyncComponent(() => import('../components/LocationPicker.vue'));

defineProps({
    entryType: {
        type: String,
        required: false,
        default: 'micronation'
    },
    directoryData: {
        type: Array,
        required: true,
        default: []
    },
    formPlaceholders: {
        type: Object,
        required: false,
        default: {
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
            <div class="new-entry-content">
                <p class="new-entry-intro">Please, carefully read instructions for all fields. Fields with an asterisk (*) are mandatory to
                    fill,
                    the others can be blank.
                    <br>Help us save moderation efforts! <a href="mailto:themicronationaldirectory@gmail.com">Ask any
                        question</a> if needed, and check the
                    preview on the right.
                </p>

                <form class="listing-new-entry" @submit.prevent="addEntry">
                    <div class="new-entry-form">
                        <Transition name="fade">
                            <HelpTooltip v-if="tooltipDisplay" @closed-tooltip="deactivateTooltip"
                                :position="{ y: tooltipPosition.y, x: tooltipPosition.x }"
                                :help-text="tooltipTexts[activeTooltipText]" :title="tooltipTitle" />
                        </Transition>

                        <label for="newEntryName" class="new-entry-form-text mandatory">
                            Name* <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 0 ? '' : activateTooltip(0, 'Name', $event)">
                        </label>
                        <input type="text" id="newEntryName" v-model="formPlaceholders.newEntryName" required
                            :placeholder="entryType === 'micronation' ? `E.g. 'Sealand' (just the short form)` : `E.g. League of Micronations (full name)`">

                        <label v-if="entryType === 'micronation'" for="newEntryTitle"
                            class="new-entry-form-text mandatory">
                            Title <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 1 ? '' : activateTooltip(1, 'Title', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryTitle"
                            v-model="formPlaceholders.newEntryTitle"
                            placeholder="E.g. 'Principality of' (just the descriptive name only)">

                        <label for="newEntryNameAlt" class="new-entry-form-text">
                            {{ entryType === 'micronation' ? 'Alternative name' : 'Acronym*' }}
                            <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 2 ? '' : activateTooltip(2, 'Alternative name', $event)">
                        </label>
                        <input type="text" id="newEntryNameAlt" v-model="formPlaceholders.newEntryNameAlt"
                            :placeholder="entryType === 'micronation' ? 'Second option for name, e.g. in another language' : 'Acronym of the organization, e.g. LoM'">

                        <label v-if="entryType === 'micronation'" for="newEntryTitleAlt" class="new-entry-form-text">
                            Alternative title <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 3 ? '' : activateTooltip(3, 'Alternative title', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryTitleAlt"
                            v-model="formPlaceholders.newEntryTitleAlt"
                            placeholder="Second option for title, e.g. in another language">

                        <label for="newEntryMotto" class="new-entry-form-text mandatory">
                            Motto <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 4 ? '' : activateTooltip(4, 'Motto', $event)">
                        </label>
                        <input type="text" id="newEntryMotto" v-model="formPlaceholders.newEntryMotto"
                            placeholder="E.g. 'In God we trust' (add without quotes)">

                        <label v-if="entryType === 'micronation'" class="new-entry-form-text mandatory">
                            Type* <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 5 ? '' : activateTooltip(5, 'Type', $event)">
                        </label>
                        <div v-if="entryType === 'micronation'" class="new-entry-type">
                            <input type="checkbox" id="typePhysical" v-model="formPlaceholders.newEntryTypePhysical"
                                name="new-entry-type" value="physical" @change="updatePhysicalType"
                                @click="renderedMapboxNewEntry = true">
                            <label for="typePhysical">Physical</label>
                            <input type="checkbox" id="typeDigital" v-model="formPlaceholders.newEntryTypeDigital"
                                name="new-entry-type" value="digital" checked>
                            <label for="typeDigital">Digital</label>
                            <input type="checkbox" id="typeFictional" v-model="formPlaceholders.newEntryTypeFictional"
                                name="new-entry-type" value="fictional">
                            <label for="typeFictional">Fictional</label>
                        </div>

                        <label for="newEntryLanguages" class="new-entry-form-text mandatory">
                            Official languages* <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 6 ? '' : activateTooltip(6, 'Official languages', $event)">
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
                            <div class="selected-elements-container">
                                <SelectedElement class="selection margin-top"
                                    v-for="(language, i) in formPlaceholders.newEntryLanguages" :key="i"
                                    :element-text="language" @remove-element="removeLanguage" />
                            </div>
                        </div>

                        <label v-if="entryType === 'micronation'" for="newEntryCapital" class="new-entry-form-text">
                            Capital <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 7 ? '' : activateTooltip(7, 'Capital', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryCapital"
                            v-model="formPlaceholders.newEntryCapital"
                            placeholder="City, place or building officiating as capital">

                        <label v-if="entryType === 'micronation'" for="newEntryCurrency" class="new-entry-form-text">
                            Currency <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 8 ? '' : activateTooltip(8, 'Currency', $event)">
                        </label>
                        <input v-if="entryType === 'micronation'" type="text" id="newEntryCurrency"
                            v-model="formPlaceholders.newEntryCurrency"
                            placeholder="Official currency of the micronation, just name and not symbol">

                        <label for="newEntryFoundation" class="new-entry-form-text mandatory">
                            Foundation* <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 9 ? '' : activateTooltip(9, 'Foundation', $event)">
                        </label>
                        <VueDatePicker v-model="foundationDate" month-name-format="long"
                            :flow="['year', 'month', 'calendar']" :utc="'preserve'" :timezone="'UTC'"
                            now-button-label="Today" :required="true" :max-date="new Date()" />

                        <label v-if="entryType === 'micronation'" v-show="physicalType"
                            class="new-entry-form-text mandatory">
                            Location <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 10 ? '' : activateTooltip(10, 'Location', $event)">
                        </label>
                        <div v-if="entryType === 'micronation'" v-show="physicalType">
                            <label v-show="physicalType">Drag and drop the blue pin to the location of the
                                micronation (leave as is if unknown or not applicable, for large territories you can
                                mark the capital):</label>
                            <LocationPicker v-if="renderedMapboxNewEntry" :visible="!physicalType" ref="locationPicker"
                                mode="picker" width="100%" height="300px" @dragged-marker="draggedMarker" />
                        </div>

                        <label v-if="entryType === 'micronation'" for="newEntryMemberships" class="new-entry-form-text">
                            Memberships <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 11 ? '' : activateTooltip(11, 'Memberships', $event)">
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
                                            v-for="(membership, i) in organizationsDirectory"
                                            :key="i" :value="membership.name.main">
                                            {{ membership.name.main }} ({{ membership.name.mainAlt }})
                                        </option>
                                    </optgroup>
                                </select>
                                <input type="text" placeholder="Other (full name, no acronym)"
                                    v-model="customMembership">
                            </div>
                            <div class="selected-elements-container">
                                <SelectedElement class="selection margin-top"
                                    v-for="(membership, i) in formPlaceholders.newEntryMemberships" :key="i"
                                    :element-text="membership" @remove-element="removeMembership" />
                            </div>
                        </div>

                        <label for="newEntryEmails" class="new-entry-form-text mandatory">
                            Contact media* <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 12 ? '' : activateTooltip(12, 'Contact media', $event)">
                        </label>
                        <div class="new-entry-option-container">
                            <div style="display: flex;">
                                <input type="text" id="newEntryEmail" class="new-entry-option-select"
                                    v-model="currentEmail" placeholder="Email, forum or social media (full URL!)">
                                <button @click="addEmail(currentEmail)" type="button"
                                    class="login-button squared-button color-transition new-entry-option-button">Add</button>
                            </div>
                            <div class="selected-elements-container">
                                <SelectedElement class="selection margin-top"
                                    v-for="(contact, i) in formPlaceholders.newEntryEmails" :key="i"
                                    :element-text="checkIcon(contact)" @remove-element="removeEmail" />
                            </div>
                        </div>

                        <label for="newEntryWebsites" class="new-entry-form-text mandatory">
                            Info sources* <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 13 ? '' : activateTooltip(13, 'Info sources', $event)">
                        </label>
                        <div class="new-entry-option-container">
                            <div style="display: flex;">
                                <input type="text" id="newEntryWebsite" class="new-entry-option-select"
                                    v-model="currentWebsite" placeholder="URL to website (include HTTP or HTTPS)">
                                <button @click="addWebsite(currentWebsite)" type="button"
                                    class="login-button squared-button color-transition new-entry-option-button">Add</button>
                            </div>
                            <div class="selected-elements-container">
                                <SelectedElement class="selection margin-top"
                                    v-for="(website, i) in formPlaceholders.newEntryWebsites" :key="i"
                                    :element-text="checkIcon(website)" @remove-element="removeWebsite" />
                            </div>
                        </div>

                        <label for="newEntryFlag" class="new-entry-form-text mandatory">
                            {{ entryType === 'micronation' ? 'Flag*' : 'Logo*' }}
                            <img src="/images/info.png" alt='info' class="tooltip-activator"
                                @click="activeTooltipIndex === 14 ? '' : activateTooltip(14, 'Flag', $event)">
                        </label>
                        <div class="flag-preview-container">
                            <div style="display: flex; margin-bottom: 5px;">
                                <label class="flag-radio">
                                    <input v-model="flagRadio" type="radio" name="flagRadio" value="file">
                                    <span>Local file</span>
                                </label>
                                <label class="flag-radio">
                                    <input v-model="flagRadio" type="radio" name="flagRadio" value="url">
                                    <span>External URL</span>
                                </label>
                            </div>
                            <input v-model="formPlaceholders.newEntryFlag" v-if="flagRadio === 'url'"
                                name="flagImage" type="url" ref="flagURLInput" @input="displayImage($event.target.value)"
                                placeholder="Input a direct link to an external image" required>
                            <input v-if="flagRadio === 'file'" type="file" @input="previewImage" accept="image/png"
                                required>
                            <label for="">(if N/A or unobtainable: <a href="/images/missing-flag.png"
                                    target="_blank">download or use the URL to this template</a>)
                            </label>
                        </div>

                        <div class="wide-row">
                            <Recaptcha @checkbox="checkRecaptcha" />
                            <button id="addEntryButton" type="submit"
                                :disabled="!passedRecaptcha || isSubmitting" :aria-busy="isSubmitting"
                                class="login-button short color-transition">
                                <span v-if="isSubmitting" class="submit-spinner" aria-hidden="true"></span>
                                <span>{{ isSubmitting ? 'Submitting…' : 'Add new entry' }}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="new-entry-preview">
                <h3 id="previewTitle">Entry preview</h3>

                <DirectoryEntry v-if="entryType === 'micronation'" :initial-info-view="true" :width="180"
                    :flag-height="180 * 0.6" view-mode="micronations" :micronations-directory="micronationsDirectory"
                    :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
                    :supranational-micronations="supranationalMicronations" :disable-full-profile-button="true" :info="{
                    name: {
                        main: formPlaceholders.newEntryName,
                        mainAlt: formPlaceholders.newEntryNameAlt,
                        title: formPlaceholders.newEntryTitle,
                        titleAlt: formPlaceholders.newEntryTitleAlt
                    },
                    flag: flagPreview,
                    motto: formPlaceholders.newEntryMotto,
                    type: checkTypes,
                    languages: formPlaceholders.newEntryLanguages,
                    capital: formPlaceholders.newEntryCapital,
                    currency: formPlaceholders.newEntryCurrency,
                    foundationDate: { seconds: Math.floor(new Date(foundationDate).getTime() / 1000) },
                    memberships: formPlaceholders.newEntryMemberships,
                    contactInfo: formPlaceholders.newEntryEmails,
                    websites: formPlaceholders.newEntryWebsites,
                    approved: true
                }" />
                <OrganizationEntry v-if="entryType === 'organization'" :initial-info-view="true" :width="180"
                    :flag-height="180 * 0.6" view-mode="micronations" :micronations-directory="micronationsDirectory"
                    :info="{
                    name: {
                        main: formPlaceholders.newEntryName,
                        mainAlt: formPlaceholders.newEntryNameAlt
                    },
                    logo: flagPreview,
                    motto: formPlaceholders.newEntryMotto,
                    languages: formPlaceholders.newEntryLanguages,
                    foundationDate: { seconds: Math.floor(new Date(foundationDate).getTime() / 1000) },
                    contactInfo: formPlaceholders.newEntryEmails,
                    websites: formPlaceholders.newEntryWebsites,
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
        Recaptcha,
        SelectedElement,
        DirectoryEntry,
        OrganizationEntry,
        HelpTooltip
    },
    data: () => {
        return {
            foundationDate: null,
            flagSource: '',
            flagPreview: '',
            flagRadio: 'file',
            passedRecaptcha: false,
            isSubmitting: false,
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
                "Here, the descriptive rest of the full name's composition should be added, excluding the main name added above. Barely 'Principality of' or 'Republic of' are some examples of proper cases. There may be some cases, like 'Athenian Republic', in which this field remains blank and only 'Name' is filled. Avoid adding 'The' and words that serve the same meaning at the beginning.",
                "An additional, secondary version of the main name. This field is useful when a micronation has several official names in different languages. A clear example would be 'Insulo de la Rozoj' (while 'Rose Island' goes on 'Name')",
                "Same as 'Title', but input it in another language. To follow above's example, 'Respubliko de la' could be placed here.",
                "Official, national motto. Be sure to NOT add quotes of any kind. The proper way to populate the field is placing the motto in whatever language it is, and then adding the English translation between parenthesis if available. For instance, a valid input is: Vivat Rex (Long Live the King).",
                "The 'Type' of the micronation applies in regard of its kind of (non) territorial claim. Micronations that claim territory on Earth or other real-world elements are 'Physical', the ones that exist solely on the Internet and don't have actual land pretensions are 'Digital', while cases that live on simulated or fantasy worlds are 'Fictional'. More than one type can be checked, for sure.",
                "Official languages spoken. Can be also extended to other national and/or recognized languages. If there isn't any, place the de facto language or the one used by representatives on websites and social media.",
                "Physical, digital or fictional city or any kind of place officiating as the micronation's capital. If there's more than one, then add all of them separated by commas.",
                "Currency (or currencies) legally adopted and accepted, they could be purported as well, either physical and digital. Some micronations even include macronational fiat currencies, and they are applicable as well. If there's more than one, then add all of them separated by commas. DO NOT include their symbols between parenthesis, e.g. (K$).",
                "The full founding date. If there's not enough information to input a full date, select the first day of the available timespan data. For instance, if it's only known that it was founded on 1997, input January 1, 1997. If a foundation is stated on August, 2004, select August 1, 2004.",
                "The micronation's location of its territorial claims. There is no possibility for selecting polygonal ranges, only geopoint pins. So, for large territorial claims, you can mark the capital or even the leader's approximate location. In any case not applicable, just leave the blue pin as is.",
                "Supramicronational organizations that this micronation is currently a member of AND also was a member of in the past. There is no possibility to indicate membership type, so full members, partial members, observer members and any other kind of distinctive cases should be added alike. On the 'Other' subfield you can add organizations that are not present on our directory, and also the main name of another micronation in case this one is a constituent country/nation.",
                "Any communication media should be added here. This includes email addresses, social media profiles (adding the full URL, not just the username), links to chat or group invitation, forums and other similar platforms.",
                "Complete the field by adding websites that contain relevant info. This should always include official websites (if available), wiki or news articles, and unofficial websites where data was gathered from. If you come across a dead website, check it out using https://web.archive.org/ and if there is a saved snapshot, add its link here instead.",
                "Only .png files, a maximum of 35 Kb so you'll probably have to first compress it at https://tinypng.com/ and use files with small dimensions. In the majority of cases, the national flag should be chosen here, but it could be that the State flag or even civil flag is the prevalent one. There is no possibility for adding more than one flag (e.g. co-official flags), so the most prevalent one should be added. Always add the latest and current version."
            ],
            activeTooltipText: 0
        };
    },
    watch: {
        formPlaceholders(newValue) {
            this.displayImage(newValue.newEntryFlag);
        }
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
            if (this.formPlaceholders.newEntryTypePhysical) {
                typesArray.push('Physical');
            }
            if (this.formPlaceholders.newEntryTypeDigital) {
                typesArray.push('Digital');
            }
            if (this.formPlaceholders.newEntryTypeFictional) {
                typesArray.push('Fictional');
            }

            return typesArray;
        }
    },
    methods: {
        async addEntry() {
            const that = this;

            if (this.isSubmitting) return;

            if (this.formPlaceholders.newEntryWebsites.length === 0) {
                return notify({
                    title: "Error when submitting",
                    text: "No info source link was provided. It's mandatory to include at least one to validate all the info that was input.",
                    type: "error"
                });
            }

            if (this.formPlaceholders.newEntryLanguages.length === 0) {
                return notify({
                    title: "Error when submitting",
                    text: "No official languages were added. If there aren't any, add the main one used within the micronation.",
                    type: "error"
                });
            }

            if (this.searchElement(this.formPlaceholders.newEntryName) === undefined) {
                this.isSubmitting = true;
                try {
                    // Prepare entry data
                    const entryData = {
                        name: {
                            main: this.formPlaceholders.newEntryName,
                            mainAlt: this.formPlaceholders.newEntryNameAlt,
                            title: this.formPlaceholders.newEntryTitle,
                            titleAlt: this.formPlaceholders.newEntryTitleAlt
                        },
                        motto: this.formPlaceholders.newEntryMotto,
                        languages: this.formPlaceholders.newEntryLanguages,
                        contactInfo: this.formPlaceholders.newEntryEmails,
                        websites: this.formPlaceholders.newEntryWebsites,
                        author: { name: auth.currentUser.displayName, email: auth.currentUser.email },
                        foundationDate: this.foundationDate
                    };

                    if (this.entryType === 'micronation') {
                        entryData.type = this.checkTypes;
                        entryData.capital = this.formPlaceholders.newEntryCapital;
                        entryData.currency = this.formPlaceholders.newEntryCurrency;
                        entryData.memberships = this.formPlaceholders.newEntryMemberships;

                        if (this.physicalType) {
                            entryData.location = {
                                latitude: this.locationPickerMarkerPosition[1],
                                longitude: this.locationPickerMarkerPosition[0]
                            };
                        }

                        // Handle flag file
                        if (this.flagSource) {
                            // Compress image before converting to base64
                            const options = {
                                maxSizeMB: 0.03, // 30 KB (under the 37 KB limit)
                                maxWidthOrHeight: 1920,
                                useWebWorker: true,
                                initialQuality: 0.7
                            };
                            const compressedFile = await imageCompression(this.flagSource, options);
                            const base64Data = await this.fileToBase64(compressedFile);
                            entryData.flagFile = {
                                name: `${this.formPlaceholders.newEntryName}.png`,
                                data: base64Data
                            };
                        } else if (this.formPlaceholders.newEntryFlag) {
                            entryData.flag = this.formPlaceholders.newEntryFlag;
                        }
                    } else if (this.entryType === 'organization') {
                        // Handle logo file
                        if (this.flagSource) {
                            // Compress image before converting to base64
                            const options = {
                                maxSizeMB: 0.03, // 30 KB (under the 37 KB limit)
                                maxWidthOrHeight: 1920,
                                useWebWorker: true,
                                initialQuality: 0.7
                            };
                            const compressedFile = await imageCompression(this.flagSource, options);
                            const base64Data = await this.fileToBase64(compressedFile);
                            entryData.logoFile = {
                                name: `${this.formPlaceholders.newEntryName}.png`,
                                data: base64Data
                            };
                        } else if (this.formPlaceholders.newEntryFlag) {
                            entryData.logo = this.formPlaceholders.newEntryFlag;
                        }
                    }

                    // Create GitHub issue
                    await createGitHubIssue(entryData, this.entryType);

                    this.emailNotice();
                    this.successNotification();
                } catch (error) {
                    console.error('Error submitting entry:', error);
                    notify({
                        title: "Error when submitting",
                        text: error.message || "Failed to submit entry. Please try again.",
                        type: "error"
                    });
                } finally {
                    this.isSubmitting = false;
                }
            } else {
                notify({
                    title: "Error when submitting",
                    text: "This micronation or organization is already present in the directory! If not, then an entry for it was recently submitted and is still under review.",
                    type: "error"
                });
            }
        },
        async fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
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

            if (this.formPlaceholders.newEntryLanguages.find(e => e === lang || (lang === 'custom' && e === this.customLanguage)) === undefined) {
                if (lang === 'custom') {
                    this.formPlaceholders.newEntryLanguages.push(this.customLanguage);
                } else {
                    this.formPlaceholders.newEntryLanguages.push(lang);
                }
            }
        },
        addMembership(event) {
            const lang = event.target.value;

            if (this.formPlaceholders.newEntryMemberships.find(e => e === lang || (lang === 'custom' && e === this.customMembership)) === undefined) {
                if (lang === 'custom') {
                    this.formPlaceholders.newEntryMemberships.push(this.customMembership);
                } else {
                    this.formPlaceholders.newEntryMemberships.push(lang);
                }
            }
        },
        emailNotice() {
            const that = this;
            if (auth.currentUser && auth.currentUser.email !== 'themicronationaldirectory@gmail.com') {
                emailjs.send("service_gd9nz5x", "template_wnd0ghn", {
                    user: auth.currentUser.email,
                    micronation: that.formPlaceholders.newEntryName,
                },
                    "P8-p_r-gTZedo_h84");
            }
        },
        activateTooltip(tooltipIndex, title, event) {
            this.tooltipDisplay = true;
            this.tooltipPosition = {
                x: Math.max(12, Math.min(event.clientX + 12, window.innerWidth - 352)),
                y: Math.max(12, Math.min(event.clientY + 12, window.innerHeight * 0.3))
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
            this.formPlaceholders.newEntryLanguages.splice(this.formPlaceholders.newEntryLanguages.indexOf(value), 1);
        },
        removeMembership(value) {
            this.formPlaceholders.newEntryMemberships.splice(this.formPlaceholders.newEntryMemberships.indexOf(value), 1);
        },
        removeEmail(value) {
            this.formPlaceholders.newEntryEmails.splice(this.formPlaceholders.newEntryEmails.indexOf(value), 1);
        },
        removeWebsite(value) {
            this.formPlaceholders.newEntryWebsites.splice(this.formPlaceholders.newEntryWebsites.indexOf(value), 1);
        },
        addEmail(value) {
            this.formPlaceholders.newEntryEmails.push(value);
            this.currentEmail = "";
        },
        addWebsite(value) {
            this.formPlaceholders.newEntryWebsites.push(value);
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
        displayImage(value) {
            fetch(value)
                .then(response => response.blob())
                .then(blob => {
                    const blobURL = URL.createObjectURL(blob);
                    this.flagPreview = blobURL;
                    this.flagSource = new File([blob], 'image.png', { type: blob.type });
                });
        },
    }
}
</script>

<style scoped>
.new-entry-container {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
    align-items: start;
    gap: clamp(20px, 3vw, 40px);
    margin-top: 18px;
    padding: clamp(18px, 3vw, 32px);
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-soft);
}

.new-entry-content {
    display: flex;
    min-width: 0;
    flex-direction: column;
}

.new-entry-intro {
    margin: 0 0 10px;
    padding: 14px 16px;
    color: var(--color-muted);
    background: var(--color-background-soft);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
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
    grid-template-columns: minmax(150px, 0.32fr) minmax(0, 1fr);
    align-items: center;
    column-gap: clamp(14px, 2vw, 26px);
    row-gap: 12px;
    margin: 8px 0 15px;
}

.new-entry-option-container {
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin-bottom: 0;
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background-soft);
}

.new-entry-option-select {
    width: 100%;
    min-width: 0;
    margin-right: 6px;
}

.new-entry-option-button {
    width: auto;
    min-width: 76px;
    min-height: 42px;
    padding: 7px 16px;
}

.selected-elements-container {
    display: flex;
    flex-wrap: wrap;
}

.selected-elements-container:not(:empty) {
    gap: 6px;
    margin-top: 8px;
}

.new-entry-form-text {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--color-heading);
}

div.new-entry-type {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 0;
    row-gap: 8px;
    padding: 8px 0;
}

.new-entry-type label,
.flag-radio {
    cursor: pointer;
}

.new-entry-type input[type='checkbox'] {
    margin-right: 5px;
}

.new-entry-type label {
    margin-right: 14px;
}

.new-entry-form > input[type='text'],
.new-entry-form > input[type='url'],
.new-entry-form > input[type='email'],
.new-entry-form > input[type='date'] {
    width: 100%;
    min-height: 44px;
}

.new-entry-form :deep(.dp__main) {
    width: 100%;
}

.new-entry-form :deep(.dp__input) {
    min-height: 44px;
    border-radius: var(--radius-md);
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
    margin-top: 10px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
}

#addEntryButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 16px;
    min-height: 48px;
    box-shadow: var(--shadow-soft);
}

#addEntryButton:disabled {
    cursor: wait;
    opacity: 0.78;
}

.submit-spinner {
    width: 17px;
    height: 17px;
    flex: 0 0 17px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: submit-spin 0.7s linear infinite;
}

@keyframes submit-spin {
    to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
    .submit-spinner { animation-duration: 1.8s; }
}

.new-entry-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: sticky;
    top: 18px;
    width: 100%;
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    background: var(--color-background-soft);
}

.new-entry-preview p {
    text-align: center;
}

.tooltip-activator {
    margin-left: 4px;
    width: 16px;
    cursor: pointer;
    vertical-align: middle;
}

.flag-preview-container {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
}

.flag-preview-container input[type='file'] {
    width: 100%;
    padding: 10px;
    border: 1px dashed var(--color-border-hover);
    border-radius: var(--radius-md);
    background: var(--color-background-soft);
}

.flag-preview-container > label {
    color: var(--color-muted);
    font-size: 13px;
}

.flag-radio {
    display: flex;
    align-items: center;
    margin-right: 10px;
}

@media (max-width: 900px) {
    .new-entry-container {
        grid-template-columns: minmax(0, 1fr);
    }

    .new-entry-preview {
        position: static;
        align-items: flex-start;
    }
}

@media (max-width: 600px) {
    .new-entry-container {
        gap: 18px;
        padding: 14px;
        border-radius: var(--radius-xl);
    }

    .new-entry-form {
        grid-template-columns: minmax(0, 1fr);
        row-gap: 6px;
    }

    .new-entry-form-text {
        margin-top: 8px;
    }

    .new-entry-form > input,
    .new-entry-form > :deep(.dp__main),
    .new-entry-form > .new-entry-option-container,
    .new-entry-form > .new-entry-type,
    .new-entry-form > div,
    .wide-row {
        grid-column: 1;
    }

    .new-entry-option-container > div:first-child {
        flex-wrap: wrap;
        gap: 6px;
    }

    .new-entry-option-container > div:first-child > * {
        flex: 1 1 100%;
        margin: 0;
    }

    .new-entry-option-button {
        width: 100%;
    }
}
</style>
