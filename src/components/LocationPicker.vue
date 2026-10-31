<script setup>
import { MapboxMap, MapboxMarker, MapboxNavigationControl } from '@studiometa/vue-mapbox-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
    },
    initialPosition: {
        type: Array,
        required: false,
        default: () => [0, 0]
    }
});
</script>

<template>
    <div class="mapbox-container" :style="visible ? 'display: none;' : 'display: flex;'">
        <MapboxMap :style="{ 'height': height, 'width': width }" :access-token="mapboxToken" ref="mapbox"
            map-style="mapbox://styles/ramayaben/clldsj3t701e101mf8buwfsad"
            @mb-created="initializeMap">
            <MapboxMarker v-if="mode === 'picker'" id="mapboxMarker" :lng-lat="markerPosition" popup draggable
                @mb-dragend="updatePosition">
                <template v-slot:popup>
                    <p style="color: black; font-size: 12px; text-align: center;">
                        {{ $t('locationPicker.micronationLocation') }}
                    </p>
                </template>
            </MapboxMarker>

            <MapboxNavigationControl position="bottom-right" />
        </MapboxMap>
    </div>
    <div v-if="mode === 'picker'" class="location-coordinates">
        <label>
            {{ $t('locationPicker.longitude') }}
            <input type="number" step="any" :value="coordinateInputs.longitude" @input="updateCoordinate('longitude', $event.target.value)">
        </label>
        <label>
            {{ $t('locationPicker.latitude') }}
            <input type="number" step="any" :value="coordinateInputs.latitude" @input="updateCoordinate('latitude', $event.target.value)">
        </label>
    </div>
</template>

<script>
export default {
    name: 'LocationPicker',
    data() {
        return {
            map: null,
            layerOptions: {},
            markerPosition: [...this.initialPosition],
            coordinateInputs: {
                longitude: String(this.initialPosition[0] ?? 0),
                latitude: String(this.initialPosition[1] ?? 0)
            }
        };
    },
    watch: {
        collection() {
            this.map?.getSource('micronations')?.setData(this.locationFeatures());
        },
        initialPosition(position) {
            if (Array.isArray(position) && position.length === 2) {
                this.markerPosition = [...position];
                this.coordinateInputs = { longitude: String(position[0]), latitude: String(position[1]) };
            }
        }
    },
    methods: {
        initializeMap(mapboxInstance) {
            this.map = mapboxInstance;
            const hasInitialLocation = this.initialPosition.some(value => Number(value) !== 0);
            if (this.mode === 'picker' && hasInitialLocation) {
                mapboxInstance.setCenter(this.markerPosition);
                mapboxInstance.setZoom(4);
            }
            if (this.mode === 'locationMap') {
                const addLocationLayers = () => this.addLocationLayers();
                if (mapboxInstance.isStyleLoaded()) addLocationLayers();
                else mapboxInstance.once('load', addLocationLayers);
            }
        },
        locationFeatures() {
            return {
                type: 'FeatureCollection',
                features: this.collection
                    .filter(marker => Number.isFinite(Number(marker.location?.longitude)) && Number.isFinite(Number(marker.location?.latitude)))
                    .map(marker => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [Number(marker.location.longitude), Number(marker.location.latitude)]
                        },
                        properties: {
                            name: marker.name?.main || '',
                            title: marker.name?.title || '',
                            flag: marker.flag || ''
                        }
                    }))
            };
        },
        addLocationLayers() {
            if (!this.map || this.map.getSource('micronations')) return;

            this.map.addSource('micronations', {
                type: 'geojson',
                data: this.locationFeatures(),
                cluster: true,
                clusterMaxZoom: 5,
                clusterRadius: 48
            });
            this.map.addLayer({
                id: 'micronation-clusters',
                type: 'circle',
                source: 'micronations',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#2563eb',
                    'circle-radius': ['step', ['get', 'point_count'], 17, 10, 21, 50, 26],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });
            this.map.addLayer({
                id: 'micronation-cluster-count',
                type: 'symbol',
                source: 'micronations',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                paint: { 'text-color': '#ffffff' }
            });
            this.map.addLayer({
                id: 'micronation-points',
                type: 'circle',
                source: 'micronations',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#ef4444',
                    'circle-radius': 7,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });

            this.map.on('click', 'micronation-clusters', event => {
                const cluster = this.map.queryRenderedFeatures(event.point, { layers: ['micronation-clusters'] })[0];
                if (!cluster) return;
                this.map.getSource('micronations').getClusterExpansionZoom(cluster.properties.cluster_id, (error, zoom) => {
                    if (!error) this.map.easeTo({ center: cluster.geometry.coordinates, zoom });
                });
            });
            this.map.on('click', 'micronation-points', event => {
                const feature = this.map.queryRenderedFeatures(event.point, { layers: ['micronation-points'] })[0];
                if (!feature) return;
                const { name, title, flag } = feature.properties;
                const content = document.createElement('div');
                content.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
                const label = document.createElement('p');
                label.textContent = title ? `${name}, ${title}` : name;
                label.style.cssText = 'color: black; font-size: 12px; text-align: center; margin: 0 0 8px;';
                content.appendChild(label);

                const link = document.createElement('a');
                link.href = `/directory/${encodeURIComponent(name)}`;
                link.setAttribute('aria-label', name);
                const image = document.createElement('img');
                image.src = flag;
                image.alt = '';
                image.width = 60;
                image.height = 40;
                image.style.cssText = 'display: block; object-fit: contain; border: 1px solid black;';
                link.appendChild(image);
                content.appendChild(link);
                new mapboxgl.Popup().setLngLat(feature.geometry.coordinates).setDOMContent(content).addTo(this.map);
            });
            for (const layer of ['micronation-clusters', 'micronation-points']) {
                this.map.on('mouseenter', layer, () => { this.map.getCanvas().style.cursor = 'pointer'; });
                this.map.on('mouseleave', layer, () => { this.map.getCanvas().style.cursor = ''; });
            }
        },
        updatePosition(e) {
            this.markerPosition = [e.target._lngLat.lng, e.target._lngLat.lat];
            this.coordinateInputs = {
                longitude: String(this.markerPosition[0]),
                latitude: String(this.markerPosition[1])
            };
            this.$emit('dragged-marker', this.markerPosition);
        },
        updateCoordinate(axis, value) {
            this.coordinateInputs[axis] = value;
            if (value === '' || !Number.isFinite(Number(value))) return;

            const position = [...this.markerPosition];
            position[axis === 'longitude' ? 0 : 1] = Number(value);
            this.markerPosition = position;
            this.map?.setCenter(position);
            this.$emit('dragged-marker', position);
        }
    }
}
</script>

<style scoped>
.mapbox-container {
    display: flex;
    justify-content: center;
}

.location-coordinates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
    margin-top: 10px;
}

.location-coordinates label {
    display: grid;
    gap: 4px;
    color: var(--color-muted);
    font-size: 12px;
    font-weight: 600;
}

.location-coordinates input {
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-heading);
    background: var(--color-surface);
    font: inherit;
}
</style>
