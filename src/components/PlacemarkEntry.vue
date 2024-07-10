<script setup>
import { db } from '../firebase/init.js';
import { doc, updateDoc, arrayUnion, GeoPoint } from "firebase/firestore";
import EntrySource from '../components/EntrySource.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import { notify } from "@kyvg/vue3-notification";

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
            <span>({{ Math.floor(placemarkInfo.micronationalMap.location.lat * 100) / 100 }},{{ Math.floor(placemarkInfo.micronationalMap.location.long * 100) / 100 }})</span>
        </div>

        <h3>{{ placemarkInfo.micronationalMap.name }}</h3>
        <p class="source-origin">From: {{ placemarkInfo.micronationalMap.source.name }}</p>

        <hr class="light-divider">

        <p>{{ placemarkInfo.micronationalMap.description }}<span v-if="!placemarkInfo.micronationalMap.description">No
                description.</span></p>

        <hr class="light-divider">

        <p v-if="present && placemarkInfo.location._lat === 0">An entry seems to exist on TMD but does not have any
            location data:</p>
        <p v-if="present && placemarkInfo.location._lat !== 0">It seems that exists an entry on TMD that already
            contains location data:</p>
        <p v-if="!present">Seems that there is no entry for this micronation on TMD. But here is the location info!</p>

        <DirectoryEntry v-if="present" :info="{
        id: placemarkInfo.id,
        name: {
            main: placemarkInfo.name.main,
            mainAlt: placemarkInfo.name.mainAlt,
            title: placemarkInfo.name.title,
            titleAlt: placemarkInfo.name.titleAlt
        },
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
            @click="saveLocation(placemarkInfo)">
            <span v-if="placemarkInfo.location._lat === 0">Save location on TMD</span>
            <span v-if="placemarkInfo.location._lat !== 0">Update location on TMD</span>
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

        };
    },
    computed: {

    },
    methods: {
        async saveLocation(micronation) {
            const refId = doc(db, "micronations", micronation.id);
            await updateDoc(refId, {
                "location": new GeoPoint(micronation.micronationalMap.location.lat, micronation.micronationalMap.location.long),
                "type": arrayUnion('Physical')
            });
            notify({
                title: "Update successful",
                text: `The location data was added to the entry ${micronation.name.main} on TMD.`,
                type: "success"
            });
        },
    }
}
</script>

<style scoped>
.map-micronation-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--directory-entry-background-color);
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 4px;
    margin-right: 4px;
    width: 250px;
    overflow: hidden;
}

.map-micronation-container.present {
    background-color: green;
}

.map-micronation-container div {
    display: flex;
    align-items: center;
}

.map-micronation-container p,
.map-micronation-container h3 {
    text-align: center;
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
