<script setup>
import DirectoryArticle from '../components/DirectoryArticle.vue';
import store from '../store';
import { useDirectoryData } from '../composables/useDirectoryData.js';

defineProps({ micronationName: String });
const { micronationsDirectory, supranationalMicronations, visibleOrganizations } = useDirectoryData();
</script>

<template>
    <div class="animation-error-avoider">
        <div v-show="micronationsDirectory.length === 0" class="loading-image-container">
            <img class="loading-image" src="/images/loading.gif" alt="Loading">
            <label>Loading Directory...</label>
        </div>

        <DirectoryArticle v-if="requestedMicronation.info !== undefined" id="entryPreview" class="info-displayed"
            :visible-organizations="visibleOrganizations" :supranational-micronations="supranationalMicronations" :info="{
            id: requestedMicronation.info.id,
            name: requestedMicronation.info.name,
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
                info: store.getters.micronations.filter(element => element.approved).find(element => element.name.main === that.micronationName),
                index: store.getters.micronations.filter(element => element.approved).findIndex(element => element.name.main === that.micronationName)
            }
        },
        previousMicronation() {
            try {
                return store.getters.micronations.filter(element => element.approved)[this.requestedMicronation.index - 1].name.main;
            } catch {
                return false;
            }
        },
        nextMicronation() {
            try {
                return store.getters.micronations.filter(element => element.approved)[this.requestedMicronation.index + 1].name.main;
            } catch {
                return false;
            }
        }
    }
}
</script>

