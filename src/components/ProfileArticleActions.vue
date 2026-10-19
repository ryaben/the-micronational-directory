<script setup>
import { ref } from 'vue'

const props = defineProps({ title: { type: String, required: true } })
const copied = ref(false)

async function copyProfileLink() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(window.location.href)
    } else {
      const input = document.createElement('textarea')
      input.value = window.location.href
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      const didCopy = document.execCommand('copy')
      input.remove()
      if (!didCopy) throw new Error('Clipboard access is unavailable')
    }
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1800)
  } catch (error) {
    console.error('Could not copy profile link:', error)
  }
}

async function shareProfile() {
  if (!navigator.share) return copyProfileLink()
  try {
    await navigator.share({ title: props.title, url: window.location.href })
  } catch (error) {
    if (error.name !== 'AbortError') console.error('Could not share profile:', error)
  }
}
</script>

<template>
  <div class="profile-header-actions">
    <button class="profile-header-action share-profile-action" type="button" @click="shareProfile">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
      <span>Share</span>
    </button>
    <button class="profile-header-action copy-profile-action" type="button" @click="copyProfileLink"
      :aria-label="copied ? 'Link copied' : 'Copy profile link'" :title="copied ? 'Link copied' : 'Copy profile link'">
      <svg v-if="!copied" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
      <span class="copy-action-label">{{ copied ? 'Copied' : 'Copy link' }}</span>
    </button>
  </div>
</template>
