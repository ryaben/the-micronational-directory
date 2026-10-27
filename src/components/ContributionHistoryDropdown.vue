<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { formatDate } from '../i18n.js'

const props = defineProps({
  author: { type: [String, Object], default: '' },
  creationDate: { type: [Object, String, Number], default: null },
  editHistory: { type: Array, default: () => [] }
})

const historyOpen = ref(false)
const root = ref(null)
const trigger = ref(null)
const popover = ref(null)
const popoverStyle = ref({})

const cleanTimestamp = formatDate

function displayAuthor(value) {
  return typeof value === 'object' ? value?.name || 'Unknown' : value || 'Unknown'
}

function closeOnOutsideClick(event) {
  if (!root.value?.contains(event.target) && !popover.value?.contains(event.target)) {
    historyOpen.value = false
  }
}

function positionPopover() {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return
  const width = Math.min(rect.width, window.innerWidth - 16)
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  popoverStyle.value = { top: `${rect.bottom}px`, left: `${left}px`, width: `${width}px` }
}

async function toggleHistory() {
  historyOpen.value = !historyOpen.value
  if (historyOpen.value) {
    await nextTick()
    positionPopover()
    document.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('resize', positionPopover)
    window.addEventListener('scroll', positionPopover, true)
  } else {
    document.removeEventListener('pointerdown', closeOnOutsideClick)
    window.removeEventListener('resize', positionPopover)
    window.removeEventListener('scroll', positionPopover, true)
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutsideClick)
  window.removeEventListener('resize', positionPopover)
  window.removeEventListener('scroll', positionPopover, true)
})
</script>

<template>
  <div ref="root" class="contribution-history">
    <button
      ref="trigger"
      class="article-text contribution-history-trigger"
      type="button"
      :aria-expanded="historyOpen"
      aria-haspopup="true"
      @click="toggleHistory"
    >
      <span>{{ $t('history.submitted') }} <b>{{ displayAuthor(props.author) }}</b> {{ $t('history.on') }} {{ cleanTimestamp(props.creationDate) }}.</span>
      <svg class="contribution-history-chevron" :class="{ 'is-open': historyOpen }" viewBox="0 0 16 16" aria-hidden="true">
        <path d="m3.5 6 4.5 4 4.5-4" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="history-popover">
        <div
          v-if="historyOpen"
          ref="popover"
          class="contribution-history-popover"
          :style="popoverStyle"
          role="region"
          aria-label="Edit history"
        >
          <h3>{{ $t('history.editHistory') }}</h3>
          <p v-if="!editHistory.length" class="contribution-history-empty">{{ $t('history.noEdits') }}</p>
          <ol v-else>
            <li v-for="(edit, index) in [...editHistory].reverse()" :key="edit.issueNumber || `${edit.date}-${index}`">
              <span>{{ $t('history.editedBy') }} <b>{{ displayAuthor(edit.author) }}</b></span>
              <time>{{ cleanTimestamp(edit.date) }}</time>
            </li>
          </ol>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.contribution-history {
  position: relative;
  z-index: 3;
  flex: 0 1 auto;
  width: fit-content;
  max-width: 100%;
  text-align: center;
}

.contribution-history-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  min-height: 40px;
  padding: 7px 36px 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-muted);
  cursor: pointer;
  transition: border-color var(--transition-base) ease, background-color var(--transition-base) ease;
}

.contribution-history-trigger:hover,
.contribution-history-trigger[aria-expanded='true'] {
  border-color: var(--color-accent);
  background: var(--color-surface-raised);
}

.contribution-history-trigger[aria-expanded='true'] {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.contribution-history-trigger b {
  color: var(--color-accent);
}

.contribution-history-chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform: translateY(-50%);
  transition: transform 180ms ease;
}

.contribution-history-chevron.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.contribution-history-popover {
  position: fixed;
  z-index: 10000;
  box-sizing: border-box;
  width: max-content;
  min-width: 0;
  max-height: min(320px, 45vh);
  overflow: auto;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  color: var(--color-text);
  text-align: left;
}

.contribution-history-popover h3 {
  margin: 0 0 10px;
  color: var(--color-heading);
  font-size: 14px;
}

.contribution-history-popover ol {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contribution-history-popover li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.contribution-history-popover b {
  color: var(--color-accent);
}

.contribution-history-popover time {
  flex: 0 0 auto;
  color: var(--color-muted);
}

.contribution-history-empty {
  margin: 0;
  color: var(--color-muted);
  font-size: 13px;
}

.history-popover-enter-active,
.history-popover-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.history-popover-enter-from,
.history-popover-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
