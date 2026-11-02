<script setup>
import { computed } from 'vue';
import LocationPicker from '../components/LocationPicker.vue';
import { useDirectoryData } from '../composables/useDirectoryData.js';

const { physicalMicronationsDirectory, micronationsApprovedDirectory } = useDirectoryData();
const locatedMicronations = computed(() => physicalMicronationsDirectory.value.filter(element => element.approved));
const locatedShare = computed(() => micronationsApprovedDirectory.value.length
  ? Math.round((locatedMicronations.value.length / micronationsApprovedDirectory.value.length) * 100)
  : 0);
</script>

<template>
  <section class="site-section">
    <LocationPicker ref="micronationsMap" mode="locationMap"
      :collection="locatedMicronations" width="100%" height="40vw" />
    <div class="map-info-bar" :aria-label="$t('globalMap.summary')">
      <div class="map-info-item">
        <span class="map-info-value">{{ locatedMicronations.length }}</span>
        <span class="map-info-label">{{ $t('globalMap.located') }}</span>
      </div>
      <span class="map-info-divider" aria-hidden="true"></span>
      <div class="map-info-item">
        <span class="map-info-value">{{ locatedShare }}%</span>
        <span class="map-info-label">{{ $t('globalMap.directoryShare') }}</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  components: {
    LocationPicker
  },
}
</script>

<style scoped>
.site-section :deep(.mapbox-container),
.site-section :deep(.mapboxgl-map) {
  min-height: 350px;
}

.map-info-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-top: 12px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.map-info-item {
  display: flex;
  align-items: baseline;
  gap: 9px;
}

.map-info-value {
  color: var(--color-heading);
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.map-info-label {
  color: var(--color-muted);
  font-size: 14px;
}

.map-info-divider {
  width: 1px;
  height: 26px;
  background: var(--color-border);
}

@media (max-width: 520px) {
  .map-info-bar {
    gap: 14px;
    padding: 13px 10px;
  }

  .map-info-item {
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;
  }

  .map-info-label {
    font-size: 12px;
  }
}
</style>
