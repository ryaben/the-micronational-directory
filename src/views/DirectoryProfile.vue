<script setup>
import DirectoryArticle from '../components/DirectoryArticle.vue';
import store from '../store';

defineProps({
    micronationName: {
        id: String
    },
    micronationsDirectory: {
        type: Array,
        required: false,
        default: store.getters.micronations
    },
    micronationsApprovedDirectory: {
        type: Array,
        required: false,
        default: store.getters.micronations.filter(element => element.approved)
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
});
</script>

<template>
    <div class="animation-error-avoider">
        <div v-show="micronationsDirectory.length === 0" class="loading-image-container">
            <img class="loading-image" src="/images/loading.gif" alt="Loading">
            <label>Loading Directory...</label>
        </div>

        <DirectoryArticle v-if="requestedMicronation.info !== undefined" id="entryPreview" class="info-displayed"
            :micronations-directory="micronationsDirectory" :organizations-directory="organizationsDirectory"
            :visible-organizations="visibleOrganizations" :supranational-micronations="supranationalMicronations" :info="{
            name: {
                main: requestedMicronation.info.name.main,
                mainAlt: requestedMicronation.info.name.mainAlt,
                title: requestedMicronation.info.name.title,
                titleAlt: requestedMicronation.info.name.titleAlt
            },
            flag: requestedMicronation.info.flag,
            motto: requestedMicronation.info.motto,
            type: requestedMicronation.info.type,
            languages: requestedMicronation.info.languages,
            capital: requestedMicronation.info.capital,
            currency: requestedMicronation.info.currency,
            location: requestedMicronation.info.location,
            foundationDate: requestedMicronation.info.foundationDate,
            memberships: requestedMicronation.info.memberships,
            contactInfo: requestedMicronation.info.contactInfo,
            websites: requestedMicronation.info.websites,
            approved: true,
            author: requestedMicronation.info.author.name,
            creationDate: requestedMicronation.info.creationDate,
            previous: previousMicronation,
            next: nextMicronation
        }" />

        <p class="no-entries" v-if="micronationsDirectory.length && requestedMicronation.info === undefined">There is no
            entry for a micronation with that name.</p>
    </div>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    computed: {
        requestedMicronation() {
            const that = this;
            return {
                info: this.micronationsApprovedDirectory.find(element => element.name.main === that.micronationName),
                index: this.micronationsApprovedDirectory.findIndex(element => element.name.main === that.micronationName)
            }
        },
        previousMicronation() {
            try {
                return this.micronationsApprovedDirectory[this.requestedMicronation.index - 1].name.main;
            } catch {
                return false;
            }
        },
        nextMicronation() {
            try {
                return this.micronationsApprovedDirectory[this.requestedMicronation.index + 1].name.main;
            } catch {
                return false;
            }
        }
    }
}
</script>

<style scoped>
.no-entries {
    width: auto;
    font-size: 22px;
    text-align: center;
}
</style>