<script setup>
import { ref } from 'vue'
import FavoriteToggle from './FavoriteToggle.vue'
import ShareIcon from './icons/ShareIcon.vue'
import CopyIcon from './icons/CopyIcon.vue'
import CheckIcon from './icons/CheckIcon.vue'

const props = defineProps({
  title: { type: String, required: true },
  entryId: { type: String, default: '' },
  entryType: { type: String, required: true }
})
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
    window.setTimeout(() => {
      copied.value = false
    }, 1800)
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
    <FavoriteToggle :entry-id="entryId" :entry-type="entryType" placement="profile" />
    <button class="profile-header-action share-profile-action" type="button" @click="shareProfile">
      <ShareIcon aria-hidden="true" />
    </button>
    <button
      class="profile-header-action copy-profile-action"
      type="button"
      @click="copyProfileLink"
      :aria-label="copied ? 'Link copied' : 'Copy profile link'"
      :title="copied ? 'Link copied' : 'Copy profile link'"
    >
      <CopyIcon v-if="!copied" aria-hidden="true" />
      <CheckIcon v-else aria-hidden="true" />
      <span class="copy-action-label">{{ copied ? 'Copied' : 'Copy link' }}</span>
    </button>
  </div>
</template>
