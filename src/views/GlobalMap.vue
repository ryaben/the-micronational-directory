<script setup>
import LocationPicker from '../components/LocationPicker.vue';
import store from '../store';

defineProps({
  physicalMicronationsDirectory: {
    type: Array,
    required: true,
    default: store.getters.physicalMicronations
  }
});
</script>

<template>
  <section class="site-section">
    <LocationPicker ref="micronationsMap" mode="locationMap"
      :collection="physicalMicronationsDirectory.filter(element => element.approved)" width="100%" height="40vw" />
  </section>
</template>

<script>
export default {
  components: {
    LocationPicker
  },
}
</script>

<style scoped></style>
