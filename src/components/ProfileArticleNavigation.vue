<script setup>
defineProps({
  routeBase: { type: String, required: true },
  previous: { type: String, default: '' },
  next: { type: String, default: '' },
  author: { type: String, default: '' },
  creationDate: { type: [Object, String, Number], default: null }
})

function cleanTimestamp(timestamp) {
  const seconds = timestamp?._seconds ?? timestamp?.seconds
  const date = seconds != null ? new Date(seconds * 1000) : new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}
</script>

<template>
  <div class="article-profiles-control">
    <span v-if="!previous">This is the first entry.</span>
    <router-link v-else :to="`${routeBase}/${previous}`" class="profile-option login-button color-transition">
      <span class="profile-option-label">← Previous</span>
      <span class="profile-option-name">{{ previous }}</span>
    </router-link>
    <span class="article-text contribution-info">Submitted by <b>{{ author }}</b> on {{ cleanTimestamp(creationDate) }}.</span>
    <router-link v-if="next" :to="`${routeBase}/${next}`" class="profile-option login-button color-transition">
      <span class="profile-option-label">Next →</span>
      <span class="profile-option-name">{{ next }}</span>
    </router-link>
    <span v-else>This is the last entry.</span>
  </div>
</template>
