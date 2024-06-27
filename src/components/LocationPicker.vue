<script setup>
import { MapboxMap, MapboxMarker, MapboxNavigationControl } from '@studiometa/vue-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MemberSource from './MemberSource.vue';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

defineProps({
    visible: {
        type: Boolean,
        required: false,
        default: false
    },
    width: {
        type: String,
        required: true,
        default: '100%'
    },
    height: {
        type: String,
        required: true,
        default: '200px'
    },
    mode: {
        type: String,
        require: true,
        default: 'picker'
    },
    collection: {
        type: Array,
        require: false,
        default: []
    }
});
</script>

<template>
    <div class="mapbox-container" :style="visible ? 'display: none;' : 'display: flex;'">
        <MapboxMap :style="{ 'height': height, 'width': width }" :access-token="mapboxToken" ref="mapbox"
            map-style="mapbox://styles/ramayaben/clldsj3t701e101mf8buwfsad"
            @mb-created="(mapboxInstance) => map = mapboxInstance">
            <MapboxMarker v-if="mode === 'picker'" id="mapboxMarker" :lng-lat="markerPosition" popup draggable
                @mb-dragend="updatePosition">
                <template v-slot:popup>
                    <p style="color: black; font-size: 12px; text-align: center;">The micronation (or its founder) are
                        based here.
                    </p>
                </template>
            </MapboxMarker>

            <MapboxMarker v-if="mode === 'locationMap'" v-for="(marker, i) in collection" :key="i"
                class="micronation-marker" :lng-lat="[marker.location.longitude, marker.location.latitude]" popup>
                <template v-slot:popup>
                    <p class="custom-marker" style="color: black; font-size: 12px; text-align: center;">
                        {{ marker.name.main }}<span v-if="marker.name.title">,</span> {{ marker.name.title }}
                    </p>
                    <MemberSource class="member-source" style="margin: 0 auto 0 auto; border: 1px solid black;"
                        :href="`/directory/${marker.name.main}`" :flag-source="marker.flag" :width="60" :height="40"
                        :icon="'flag'" />
                </template>
            </MapboxMarker>

            <MapboxNavigationControl position="bottom-right" />
        </MapboxMap>
    </div>
</template>

<script>
export default {
    name: 'LocationPicker',
    components: {
        MemberSource
    },
    data: () => {
        return {
            layerOptions: {},
            markerPosition: [0, 0]
        };
    },
    methods: {
        updatePosition(e) {
            this.markerPosition = [e.target._lngLat.lng, e.target._lngLat.lat];
            this.$emit('dragged-marker', this.markerPosition);
        },
    }
}
</script>

<style scoped>
.mapbox-container {
    display: flex;
    justify-content: center;
}
</style>