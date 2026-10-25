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
        <div class="placemark-location">
            <EntrySource class="entry-source gmaps" v-if="placemarkInfo.micronationalMap?.location?.applicable"
                :flag-source="''" :size="36" :micronation-name="''" :icon="'Google Maps'"
                :href="'https://maps.google.com/?q=' + placemarkInfo.micronationalMap.location.lat + ',' + placemarkInfo.micronationalMap.location.long" />
            <span v-if="placemarkInfo.micronationalMap?.location">({{ Math.floor(placemarkInfo.micronationalMap.location.lat * 100) / 100 }},{{
        Math.floor(placemarkInfo.micronationalMap.location.long * 100) / 100 }})</span>
        </div>

        <h3 class="placemark-name">{{ placemarkInfo.micronationalMap.name }}</h3>
        <p class="source-origin">From: {{ placemarkInfo.micronationalMap.source?.name || 'Unknown map source' }}</p>

        <hr class="light-divider">

        <p class="micronation-description">{{ placemarkInfo.micronationalMap.description }}<span
            v-if="!placemarkInfo.micronationalMap.description">No description.</span></p>

        <hr class="light-divider">

        <p class="map-status" v-if="present && (placemarkInfo.location?.latitude ?? 0) === 0">An entry seems to exist on TMD but does not have any
            location data:</p>
        <p class="map-status" v-else-if="present">It seems that exists an entry on TMD that already
            contains location data:</p>
        <p class="map-status" v-else>Seems that there is no entry for this micronation on TMD. But here is the location info!</p>

        <DirectoryEntry v-if="present" class="map-directory-entry" :width="180" :flag-height="120"
            :info="{
        id: placemarkInfo.id,
        name: placemarkInfo.name,
        flag: placemarkInfo.flag,
        motto: placemarkInfo.motto,
        type: placemarkInfo.type,
        languages: placemarkInfo.languages,
        capital: placemarkInfo.capital,
        currency: placemarkInfo.currency,
        foundationDate: placemarkInfo.foundationDate,
        location: placemarkInfo.location || { latitude: 0, longitude: 0 },
        memberships: placemarkInfo.memberships,
        contactInfo: placemarkInfo.contactInfo,
        websites: placemarkInfo.websites,
        author: placemarkInfo.author,
        approved: placemarkInfo.approved,
        creationDate: placemarkInfo.creationDate
    }" />
        <button v-if="present" class="login-button color-transition map-location-button"
            :disabled="isSavingLocation || !hasValidMapLocation"
            @click="saveLocation(placemarkInfo)">
            <span v-if="isSavingLocation">Saving location…</span>
            <span v-else-if="(placemarkInfo.location?.latitude ?? 0) === 0">Save location on TMD</span>
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
    computed: {
        hasValidMapLocation() {
            const location = this.placemarkInfo?.micronationalMap?.location
            const latitude = Number(location?.lat)
            const longitude = Number(location?.long)
            return location?.applicable === true && Number.isFinite(latitude) && Number.isFinite(longitude)
                && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
        }
    },
    methods: {
        async saveLocation(micronation) {
            if (!this.hasValidMapLocation) return
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
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    height: 100%;
    padding: 14px;
    border: 1px solid color-mix(in srgb, var(--color-border) 75%, transparent);
    border-radius: var(--radius-lg);
    background: var(--color-surface-raised);
    box-shadow: var(--shadow-soft);
    color: var(--color-text);
}

.map-micronation-container.present {
    border-color: color-mix(in srgb, #2e7047 78%, var(--color-border));
    background: linear-gradient(160deg, color-mix(in srgb, #2e7047 88%, var(--color-surface-raised)),
        color-mix(in srgb, #2e7047 72%, var(--color-surface-raised)) 65%);
}

.placemark-location {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 40px;
    gap: 8px;
    color: var(--color-muted);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}

.placemark-name {
    display: block;
    min-height: 3.1em;
    max-height: none;
    margin: 10px 0 4px;
    color: var(--color-heading);
    text-align: center;
    font-size: 18px;
    line-height: 1.3;
    overflow-wrap: anywhere;
}

.micronation-description {
    display: block;
    min-height: 6.2em;
    max-height: 6.2em;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
    margin: 10px 0;
    color: var(--color-muted);
    font-size: 13px;
    line-height: 1.55;
    overflow-wrap: anywhere;
}

.source-origin {
    display: -webkit-box;
    min-height: 2.8em;
    max-height: 2.8em;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    margin: 0;
    color: var(--color-muted);
    text-align: center;
    font-size: 12px;
    line-height: 1.4;
}

.entry-source {
    margin-right: 5px;
}

.light-divider {
    width: 100%;
    margin: 10px 0;
    border: 0;
    border-top: 1px solid var(--color-border);
}

.map-status {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 3.2em;
    margin: 4px 0 10px;
    color: var(--color-muted);
    text-align: center;
    font-size: 13px;
    line-height: 1.5;
}

.map-location-button {
    width: 100%;
    min-height: 44px;
    margin-top: 12px;
    border-radius: var(--radius-md);
    font-size: 13px;
}

.map-micronation-container :deep(.map-directory-entry) {
    box-sizing: border-box;
    width: 180px !important;
    max-width: 100%;
    align-self: center;
    min-width: 0;
    margin: 0;
    padding: 10px;
    padding-bottom: 10px;
    border: 1px solid color-mix(in srgb, var(--color-border) 75%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-surface) 88%, transparent);
}

.map-micronation-container :deep(.map-directory-entry.info-displayed) {
    padding-bottom: 48px;
}

.map-micronation-container :deep(.map-directory-entry:hover) {
    transform: none;
}

.map-micronation-container :deep(.map-directory-entry .entry-text.entry-name) {
    display: block;
    min-height: 0;
    max-height: none;
    overflow: visible;
    -webkit-line-clamp: unset;
    line-clamp: unset;
    overflow-wrap: anywhere;
}

.map-micronation-container :deep(.map-directory-entry .info-buttons-container) {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    margin: 0;
}

.map-micronation-container :deep(.map-directory-entry .info-button.full-width) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);
    border-left: 0;
    border-right: 0;
}

@media (max-width: 520px) {
    .map-micronation-container {
        padding: 12px;
    }
}
</style>
