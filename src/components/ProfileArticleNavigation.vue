<script setup>
import ContributionHistoryDropdown from './ContributionHistoryDropdown.vue'

defineProps({
  routeBase: { type: String, required: true },
  previous: { type: String, default: '' },
  next: { type: String, default: '' },
  author: { type: [String, Object], default: '' },
  creationDate: { type: [Object, String, Number], default: null },
  editHistory: { type: Array, default: () => [] }
})
</script>

<template>
  <div class="article-profiles-control">
    <span v-if="!previous">This is the first entry.</span>
    <router-link v-else :to="`${routeBase}/${previous}`" class="profile-option login-button color-transition">
      <span class="profile-option-label">← Previous</span>
      <span class="profile-option-name">{{ previous }}</span>
    </router-link>
    <ContributionHistoryDropdown
      :author="author"
      :creation-date="creationDate"
      :edit-history="editHistory"
    />
    <router-link v-if="next" :to="`${routeBase}/${next}`" class="profile-option login-button color-transition">
      <span class="profile-option-label">Next →</span>
      <span class="profile-option-name">{{ next }}</span>
    </router-link>
    <span v-else>This is the last entry.</span>
  </div>
</template>
