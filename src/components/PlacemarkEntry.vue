<script setup>
import EntrySource from '../components/EntrySource.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import { notify } from "@kyvg/vue3-notification";
import { fetchRepoFile, updateRepoFile } from '../utils/githubFunctions.js'

defineProps({
    present: {
        type: Boolean,
        required: false,
        default: false,
    },
    placemarkInfo: {
        type: Object,
        required: true,
        default: {}
    }
});
</script>

<template>
    <div class="map-micronation-container" :class="{ 'present': present }">
        <div>
            <EntrySource class="entry-source gmaps" v-if="placemarkInfo.micronationalMap.location.applicable"
                :flag-source="''" :size="36" :micronation-name="''" :icon="'Google Maps'"
                :href="'https://maps.google.com/?q=' + placemarkInfo.micronationalMap.location.lat + ',' + placemarkInfo.micronationalMap.location.long" />
            <span>({{ Math.floor(placemarkInfo.micronationalMap.location.lat * 100) / 100 }},{{
        Math.floor(placemarkInfo.micronationalMap.location.long * 100) / 100 }})</span>
        </div>

        <h3>{{ placemarkInfo.micronationalMap.name }}</h3>
        <p class="source-origin">From: {{ placemarkInfo.micronationalMap.source.name }}</p>

        <hr class="light-divider">

        <p class="micronation-description">{{ placemarkInfo.micronationalMap.description }}<span
            v-if="!placemarkInfo.micronationalMap.description">No description.</span></p>

        <hr class="light-divider">

        <p v-if="present && placemarkInfo.location.latitude === 0">An entry seems to exist on TMD but does not have any
            location data:</p>
        <p v-if="present && placemarkInfo.location.latitude !== 0">It seems that exists an entry on TMD that already
            contains location data:</p>
        <p v-if="!present">Seems that there is no entry for this micronation on TMD. But here is the location info!</p>

        <DirectoryEntry v-if="present" :info="{
        id: placemarkInfo.id,
        name: placemarkInfo.name,
        flag: placemarkInfo.flag,
        motto: placemarkInfo.motto,
        type: placemarkInfo.type,
        languages: placemarkInfo.languages,
        capital: placemarkInfo.capital,
        currency: placemarkInfo.currency,
        foundationDate: placemarkInfo.foundationDate,
        location: placemarkInfo.location,
        memberships: placemarkInfo.memberships,
        contactInfo: placemarkInfo.contactInfo,
        websites: placemarkInfo.websites,
        author: placemarkInfo.author,
        approved: placemarkInfo.approved,
        creationDate: placemarkInfo.creationDate
    }" />
        <button v-if="present" class="login-button color-transition" style="width: auto; margin-top: 10px;"
            :disabled="isSavingLocation"
            @click="saveLocation(placemarkInfo)">
            <span v-if="isSavingLocation">Saving location…</span>
            <span v-else-if="placemarkInfo.location.latitude === 0">Save location on TMD</span>
            <span v-else>Update location on TMD</span>
        </button>
    </div>
</template>

<script>
export default {
    name: 'PlacemarkEntry',
    components: {
        EntrySource, DirectoryEntry
    },
    data: () => {
        return {
            isSavingLocation: false
        };
    },
    methods: {
        async saveLocation(micronation) {
            this.isSavingLocation = true
            try {
                const jsonPath = 'public/micronations.json'
                const { content, sha } = await fetchRepoFile(jsonPath)
                const entry = content.find(item => item.id === micronation.id)
                if (!entry) throw new Error('The micronation could not be found in the source JSON.')

                const latitude = Number(micronation.micronationalMap.location.lat)
                const longitude = Number(micronation.micronationalMap.location.long)
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                    throw new Error('The map location does not contain valid coordinates.')
                }

                entry.location = { latitude, longitude }
                const types = Array.isArray(entry.type) ? entry.type : []
                if (!types.includes('Physical')) types.push('Physical')
                entry.type = types

                await updateRepoFile(
                    jsonPath,
                    JSON.stringify(content, null, 2),
                    sha,
                    `Update map location: ${entry.name.main}`
                )
                notify({
                    title: "Update successful",
                    text: `The location data was added to the entry ${entry.name.main} in the source JSON.`,
                    type: "success"
                });
            } catch (error) {
                notify({
                    title: "Could not update location",
                    text: error.message || String(error),
                    type: "error"
                });
            } finally {
                this.isSavingLocation = false
            }
        },
    }
}
</script>

<style scoped>
.map-micronation-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--directory-entry-background-color);
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 4px;
    margin-right: 4px;
    width: auto;
    height: min-content;
    overflow: hidden;
}

.map-micronation-container div {
    display: flex;
    align-items: center;
}

.map-micronation-container p,
.map-micronation-container h3 {
    text-align: center;
}

.micronation-description {
    word-break: break-word;
    text-align: justify;
    text-justify: auto;
}

.source-origin {
    margin-top: -5px;
}

.entry-source {
    margin-right: 5px;
}

.light-divider {
    width: 100%;
}
</style>
