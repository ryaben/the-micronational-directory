<script setup>
import { ref } from 'vue';
import { MapboxMap, MapboxMarker, MapboxNavigationControl } from '@studiometa/vue-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const map = ref();
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
    <div class="mapbox-container" :style="this.visible ? 'display: none;' : 'display: flex;'">
        <MapboxMap :style="{ 'height': this.height, 'width': this.width }" :access-token="mapboxToken" ref="mapbox"
            map-style="mapbox://styles/mapbox/streets-v11" @mb-created="(mapboxInstance) => map = mapboxInstance">
            <MapboxMarker v-if="this.mode === 'picker'" id="mapboxMarker" :lng-lat="this.markerPosition" popup draggable
                @mb-dragend="updatePosition">
                <template v-slot:popup>
                    <p style="color: black; font-size: 12px; text-align: center;">The micronation (or its founder) are based
                        here.</p>
                </template>
            </MapboxMarker>

            <MapboxMarker v-if="this.mode === 'locationMap'" v-for="(marker, i) in this.collection" :key="i"
                class="micronation-marker" :lng-lat="[marker.location.longitude, marker.location.latitude]" popup red>
                <template v-slot:popup>
                    <p class="custom-marker" style="color: black; font-size: 12px; text-align: center;">{{ marker.name.main
                    }}, {{ marker.name.title }}</p>
                </template>
            </MapboxMarker>

            <MapboxNavigationControl position="bottom-right" />
        </MapboxMap>
    </div>
</template>

<script>
export default {
    name: 'LocationPicker',
    data: () => {
        return {
            flagList: [],
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