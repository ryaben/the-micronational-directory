<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import MemberSource from '../components/MemberSource.vue'
import { useDirectoryData } from '../composables/useDirectoryData.js'
import { translate, useI18n } from '../i18n.js'
import { theme } from '../composables/userSettings.js'

const { micronationsApprovedDirectory, organizationsApprovedDirectory } = useDirectoryData()
const { locale } = useI18n()
const datePickerLocale = computed(() => (locale.value === 'es' ? 'es' : 'en'))
const datePickerAriaLabels = computed(() => ({ input: translate('stats.timelineDate') }))
const datePickerActionRow = {
  showSelect: true,
  showCancel: false,
  showNow: false,
  showPreview: false
}
const FOCUS_ZOOM_PERCENT = 8441
const MIN_ZOOM_SPAN = 30 * 86400000
const today = new Date()
const todayTimestamp = today.getTime()
const pickerDate = ref(today)
let pendingPickerDate = null
const range = ref(null)
const activeEvent = ref(null)
const timeline = ref(null)
const dragging = ref(false)
const verticalTimeline = ref(false)
let dragStartX = 0
let dragStartRange = null
let lastTouchTap = null
let ignoreNextEventClick = false

const updateTimelineOrientation = () => {
  verticalTimeline.value = window.matchMedia('(max-width: 760px)').matches
}
onMounted(() => {
  updateTimelineOrientation()
  window.addEventListener('resize', updateTimelineOrientation)
})

const toDate = (value) => {
  if (!value) return null
  const raw = typeof value === 'object' ? value._seconds ?? value.seconds ?? value.date : value
  if (!raw) return null
  const date = typeof raw === 'number' ? new Date(raw < 1e12 ? raw * 1000 : raw) : new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

const events = computed(() =>
  [
    ...micronationsApprovedDirectory.value.map((entry) => ({ entry, kind: 'micronation' })),
    ...organizationsApprovedDirectory.value.map((entry) => ({ entry, kind: 'organization' }))
  ]
    .flatMap(({ entry, kind }) => {
      const date = toDate(entry.foundationDate)
      if (!date || date.getTime() > todayTimestamp) return []
      const name = entry.name?.main || entry.name?.mainAlt || '—'
      return [
        {
          id: `${kind}-${entry.id || name}`,
          entry,
          kind,
          date,
          name,
          image: kind === 'micronation' ? entry.flag : entry.logo,
          href: `${kind === 'micronation' ? '/directory/' : '/organizations/'}${encodeURIComponent(
            name
          )}`
        }
      ]
    })
    .sort((a, b) => a.date - b.date)
)

const timelineFloor = computed(() =>
  events.value.length
    ? events.value[0].date.getTime() - 5 * 365.25 * 86400000
    : todayTimestamp - 50 * 365.25 * 86400000
)
const timelineFloorDate = computed(() => new Date(timelineFloor.value))
const bounds = computed(() => ({ min: timelineFloor.value, max: todayTimestamp }))

const visibleRange = computed(() => range.value || bounds.value)
const rangeSpan = computed(() => visibleRange.value.max - visibleRange.value.min)
const mobileCanvasHeight = computed(
  () => `${Math.max(440, Math.min(1400, (rangeSpan.value / 86400000 / 365.25) * 15))}px`
)
const zoomLevel = computed(() => {
  const fullSpan = bounds.value.max - bounds.value.min
  const maxRatio = fullSpan / MIN_ZOOM_SPAN
  const currentRatio = fullSpan / rangeSpan.value
  return Math.round((Math.log(currentRatio) / Math.log(maxRatio)) * 100)
})
const positionFor = (date) =>
  `${Math.min(
    100,
    Math.max(0, ((date.getTime() - visibleRange.value.min) / rangeSpan.value) * 100)
  )}%`

const ticks = computed(() => {
  const startYear = new Date(visibleRange.value.min).getUTCFullYear()
  const endYear = new Date(visibleRange.value.max).getUTCFullYear()
  const span = Math.max(endYear - startYear, 1)
  const step =
    span > 300
      ? 100
      : span > 120
      ? 50
      : span > 60
      ? 20
      : span > 25
      ? 10
      : span > 12
      ? 5
      : span > 6
      ? 2
      : 1
  const firstYear = Math.ceil(startYear / step) * step
  const result = []
  for (let year = firstYear; year <= endYear; year += step) {
    const date = new Date(Date.UTC(year, 0, 1))
    result.push({ year, left: positionFor(date) })
  }
  return result
})

const monthTicks = computed(() => {
  if (rangeSpan.value > 2 * 365.25 * 86400000) return []
  const start = new Date(visibleRange.value.min)
  const end = new Date(Math.min(visibleRange.value.max, todayTimestamp))
  const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
  const formatter = new Intl.DateTimeFormat(locale.value === 'es' ? 'es-419' : 'en-US', {
    month: 'short',
    timeZone: 'UTC'
  })
  const result = []
  while (date <= end && result.length < 25) {
    result.push({
      key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
      label: formatter.format(date),
      isYearStart: date.getUTCMonth() === 0,
      left: positionFor(date)
    })
    date.setUTCMonth(date.getUTCMonth() + 1)
  }
  return result
})

const clampToTimeline = (nextRange) => {
  const span = Math.min(nextRange.max - nextRange.min, todayTimestamp - timelineFloor.value)
  let min = nextRange.min
  let max = min + span
  if (min < timelineFloor.value) {
    min = timelineFloor.value
    max = min + span
  }
  if (max > todayTimestamp) {
    max = todayTimestamp
    min = max - span
  }
  return { min, max }
}

const focusedSpan = () => (bounds.value.max - bounds.value.min) / (1 + FOCUS_ZOOM_PERCENT / 100)

const zoom = (factor) => {
  const center = (visibleRange.value.min + visibleRange.value.max) / 2
  const nextSpan = Math.min(
    500 * 365.25 * 86400000,
    Math.max(MIN_ZOOM_SPAN, rangeSpan.value * factor)
  )
  range.value = clampToTimeline({ min: center - nextSpan / 2, max: center + nextSpan / 2 })
  activeEvent.value = null
}

const zoomAt = (factor, clientX, clientY) => {
  if (!timeline.value) return zoom(factor)
  const rect = timeline.value.getBoundingClientRect()
  const position = verticalTimeline.value
    ? (clientY - rect.top) / (rect.height || 1)
    : (clientX - rect.left) / (rect.width || 1)
  const anchorRatio = Math.min(1, Math.max(0, position))
  const anchorTime = visibleRange.value.min + rangeSpan.value * anchorRatio
  const nextSpan = Math.min(
    500 * 365.25 * 86400000,
    Math.max(MIN_ZOOM_SPAN, rangeSpan.value * factor)
  )
  const min = anchorTime - nextSpan * anchorRatio
  range.value = clampToTimeline({ min, max: min + nextSpan })
  activeEvent.value = null
}

const onTimelineDoubleClick = (event) => {
  if (verticalTimeline.value || event.target.closest('button, a, .vue-datepicker, .event-popover'))
    return
  zoomAt(0.55, event.clientX, event.clientY)
}

const onTimelinePointerUp = (event) => {
  if (event.pointerType === 'touch' && !event.target.closest('.vue-datepicker, .event-popover')) {
    const now = Date.now()
    if (
      lastTouchTap &&
      now - lastTouchTap.time < 350 &&
      Math.hypot(event.clientX - lastTouchTap.x, event.clientY - lastTouchTap.y) < 28
    ) {
      zoomAt(0.55, event.clientX, event.clientY)
      ignoreNextEventClick = Boolean(event.target.closest('.event-marker'))
      lastTouchTap = null
    } else {
      lastTouchTap = { time: now, x: event.clientX, y: event.clientY }
    }
  }
  stopDragging()
}

const toggleEvent = (event) => {
  if (ignoreNextEventClick) {
    ignoreNextEventClick = false
    return
  }
  activeEvent.value = activeEvent.value?.id === event.id ? null : event
}

const jumpToDate = (date) => {
  if (!date) return
  pickerDate.value = date
  const span = focusedSpan()
  range.value = clampToTimeline({ min: date.getTime() - span / 2, max: date.getTime() + span / 2 })
  activeEvent.value = null
}

const onDatePickerUpdate = (date) => {
  if (!date) return
  pendingPickerDate = date
  queueMicrotask(() => {
    if (pendingPickerDate === date) pendingPickerDate = null
  })
}

const onDatePickerClosed = () => {
  const date = pendingPickerDate
  pendingPickerDate = null
  if (!date) return
  pickerDate.value = date
  jumpToDate(date)
}

const resetTimeline = () => {
  jumpToDate(new Date())
}

const onWheel = (event) => {
  event.preventDefault()
  zoom(event.deltaY < 0 ? 0.8 : 1.25)
}

const onPointerDown = (event) => {
  if (event.target.closest('button, a, .vue-datepicker')) return
  dragging.value = true
  dragStartX = verticalTimeline.value ? event.clientY : event.clientX
  dragStartRange = { ...visibleRange.value }
  timeline.value?.setPointerCapture(event.pointerId)
}

const onPointerMove = (event) => {
  if (!dragging.value || !timeline.value) return
  const extent = verticalTimeline.value ? timeline.value.clientHeight : timeline.value.clientWidth
  const pointerPosition = verticalTimeline.value ? event.clientY : event.clientX
  const shift =
    ((pointerPosition - dragStartX) / (extent || 1)) * (dragStartRange.max - dragStartRange.min)
  range.value = clampToTimeline({
    min: dragStartRange.min - shift,
    max: dragStartRange.max - shift
  })
}

const closeActiveEvent = () => {
  activeEvent.value = null
}
const stopDragging = () => {
  dragging.value = false
}
onBeforeUnmount(() => {
  stopDragging()
  window.removeEventListener('resize', updateTimelineOrientation)
})
</script>

<template>
  <section class="site-section timeline-page">
    <header class="timeline-heading">
      <h1>{{ $t('stats.timelineTitle') }}</h1>
      <p>{{ $t('stats.timelineIntro') }}</p>
    </header>
    <div class="timeline-toolbar" :aria-label="$t('stats.timelineTools')">
      <div class="timeline-controls">
        <div class="date-control">
          <span>{{ $t('stats.timelineDate') }}</span>
          <div class="date-picker-shell" @pointerdown.stop>
            <VueDatePicker
              :model-value="pickerDate"
              :enable-time-picker="false"
              :clearable="false"
              :min-date="timelineFloorDate"
              :max-date="today"
              :dark="theme === 'dark'"
              :action-row="datePickerActionRow"
              :aria-labels="datePickerAriaLabels"
              :select-text="$t('stats.timelineSelectDate')"
              :locale="datePickerLocale"
              @closed="onDatePickerClosed"
              @update:model-value="onDatePickerUpdate"
            />
          </div>
        </div>
        <div class="zoom-controls" :aria-label="$t('stats.timelineTitle')">
          <button type="button" :aria-label="$t('stats.timelineZoomOut')" @click="zoom(1.6)">
            −
          </button>
          <span class="zoom-indicator" :aria-label="$t('stats.timelineZoom')"
            >{{ zoomLevel }}%</span
          >
          <button type="button" :aria-label="$t('stats.timelineZoomIn')" @click="zoom(0.625)">
            +
          </button>
          <span class="controls-divider" aria-hidden="true"></span>
          <button type="button" class="today-button" @click="resetTimeline">
            {{ $t('stats.timelineToday') }}
          </button>
        </div>
      </div>
    </div>

    <template v-if="events.length">
      <div class="timeline-panel">
        <div
          ref="timeline"
          class="timeline-canvas"
          :class="{
            dragging,
            'months-visible': monthTicks.length > 0,
            'is-vertical': verticalTimeline
          }"
          :style="{ '--mobile-canvas-height': mobileCanvasHeight }"
          @wheel="onWheel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onTimelinePointerUp"
          @pointercancel="stopDragging"
          @dblclick="onTimelineDoubleClick"
        >
          <div class="timeline-track"></div>
          <div
            v-for="tick in ticks"
            :key="tick.year"
            class="timeline-tick"
            :style="{ '--position': tick.left }"
          >
            <span>{{ tick.year }}</span>
          </div>
          <div
            v-for="tick in monthTicks"
            :key="tick.key"
            class="timeline-month-tick"
            :class="{ 'month-year-start': tick.isYearStart }"
            :style="{ '--position': tick.left }"
          >
            <span>{{ tick.label }}</span>
          </div>
          <div
            v-for="(event, index) in events"
            :key="event.id"
            class="timeline-event"
            :class="[{ 'is-active': activeEvent?.id === event.id }, event.kind]"
            :style="{
              '--position': positionFor(event.date),
              '--lane-offset': `${((index % 6) - 2.5) * (verticalTimeline ? 30 : 48)}px`
            }"
          >
            <button
              type="button"
              class="event-marker"
              :aria-label="$t('stats.timelineFounded', { name: event.name })"
              :aria-expanded="activeEvent?.id === event.id"
              @click.stop="toggleEvent(event)"
            ></button>
            <Transition name="event-card">
              <article
                v-if="activeEvent?.id === event.id && !verticalTimeline"
                class="event-popover"
                :class="{
                  'popover-below': index % 2 === 1,
                  'popover-left': positionFor(event.date) === '0%',
                  'popover-right': positionFor(event.date) === '100%'
                }"
                @pointerdown.stop
              >
                <button
                  class="event-close"
                  type="button"
                  :aria-label="$t('stats.timelineCloseEvent')"
                  @click.stop="closeActiveEvent"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
                </button>
                <strong>{{ $t('stats.timelineFounded', { name: event.name }) }}</strong>
                <time :datetime="event.date.toISOString()">{{ $formatDate(event.date) }}</time>
                <div class="event-member">
                  <MemberSource
                    icon="flag"
                    :flag-source="event.image || '/images/missing-flag.png'"
                    :href="event.href"
                    :micronation-name="event.name"
                    :width="46"
                    :height="32"
                  />
                </div>
              </article>
            </Transition>
          </div>
        </div>
        <footer class="timeline-legend">
          <span><i class="legend-dot micronation"></i>{{ $t('stats.timelineMicronation') }}</span>
          <span><i class="legend-dot organization"></i>{{ $t('stats.timelineOrganization') }}</span>
          <span class="timeline-hint">{{ $t('stats.timelineHint') }}</span>
        </footer>
      </div>
      <Teleport to="body">
        <Transition name="event-card">
          <article
            v-if="verticalTimeline && activeEvent"
            class="event-popover mobile-event-popover"
            @pointerdown.stop
          >
            <button
              class="event-close"
              type="button"
              :aria-label="$t('stats.timelineCloseEvent')"
              @click.stop="closeActiveEvent"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
            </button>
            <strong>{{ $t('stats.timelineFounded', { name: activeEvent.name }) }}</strong>
            <time :datetime="activeEvent.date.toISOString()">{{
              $formatDate(activeEvent.date)
            }}</time>
            <div class="event-member">
              <MemberSource
                icon="flag"
                :flag-source="activeEvent.image || '/images/missing-flag.png'"
                :href="activeEvent.href"
                :micronation-name="activeEvent.name"
                :width="46"
                :height="32"
              />
            </div>
          </article>
        </Transition>
      </Teleport>
    </template>
    <p v-else class="timeline-empty">{{ $t('stats.timelineNoEvents') }}</p>
  </section>
</template>

<style scoped>
.timeline-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.timeline-heading {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7px;
  text-align: center;
}
.timeline-heading h1 {
  margin: 0;
}
.timeline-heading p {
  margin: 0;
  color: var(--color-muted);
}
.timeline-toolbar {
  display: flex;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto 4px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-background-soft);
  box-shadow: var(--shadow-soft);
}
.timeline-controls {
  display: flex;
  align-items: end;
  gap: 12px;
}
.date-control {
  display: grid;
  gap: 5px;
  width: 205px;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 650;
}
.date-control :deep(.dp__main),
.date-control :deep(.dp__input) {
  color: var(--color-text);
}
.zoom-controls {
  display: flex;
  gap: 6px;
}
.zoom-controls button {
  min-width: 38px;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  color: var(--color-heading);
  font-size: 20px;
  cursor: pointer;
}
.zoom-controls .today-button {
  padding: 0 12px;
  font-size: 13px;
}
.zoom-indicator {
  display: inline-flex;
  min-width: 46px;
  height: 38px;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.controls-divider {
  width: 1px;
  height: 24px;
  align-self: center;
  margin: 0 3px;
  background: var(--color-border);
}
.zoom-controls button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.timeline-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-background-soft);
}
.timeline-canvas {
  position: relative;
  height: 480px;
  overflow: visible;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
}
.timeline-canvas.dragging {
  cursor: grabbing;
}
.timeline-track {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 3px;
  background: var(--color-border);
  transform: translateY(-50%);
}
.timeline-tick {
  position: absolute;
  top: 50%;
  left: var(--position);
  width: 0;
  height: 160px;
  border-left: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 650;
}
.timeline-month-tick {
  position: absolute;
  top: 50%;
  left: var(--position);
  width: 0;
  height: 160px;
  border-left: 1px solid color-mix(in srgb, var(--color-accent) 42%, transparent);
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 600;
  transition: left 180ms ease;
}
.timeline-month-tick.month-year-start {
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
}
.timeline-month-tick span {
  position: absolute;
  top: 154px;
  left: 5px;
  white-space: nowrap;
}
.months-visible .timeline-tick {
  top: auto;
  bottom: 50%;
  height: 160px;
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  color: var(--color-heading);
}
.months-visible .timeline-tick span {
  position: absolute;
  top: auto;
  bottom: 154px;
  left: 5px;
  color: var(--color-heading);
  font-size: 15px;
  font-weight: 750;
  white-space: nowrap;
}
.timeline-tick span {
  position: absolute;
  top: 154px;
  left: 5px;
  white-space: nowrap;
}
.timeline-event {
  position: absolute;
  top: calc(50% + var(--lane-offset));
  left: var(--position);
  z-index: 2;
  transform: translate(-50%, -50%);
  transition: left 180ms ease;
}
.timeline-event.is-active {
  z-index: 20;
}
.event-marker {
  display: block;
  width: 13px;
  height: 13px;
  padding: 0;
  border: 2px solid var(--color-background-soft);
  border-radius: 50%;
  background: #57a6e8;
  box-shadow: 0 0 0 1px #3484c6;
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}
.organization .event-marker {
  background: #e8a64c;
  box-shadow: 0 0 0 1px #c27b1e;
}
.event-marker:hover,
.is-active .event-marker {
  transform: scale(1.4);
}
.event-popover {
  position: absolute;
  bottom: 48px;
  left: 50%;
  display: grid;
  gap: 7px;
  width: 245px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-soft);
  color: var(--color-text);
  cursor: default;
  transform: translateX(-50%);
}
.event-popover::after {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1px;
  height: 48px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--color-accent) 42%, transparent),
    color-mix(in srgb, var(--color-accent) 8%, transparent)
  );
  content: '';
}
.event-popover::before {
  position: absolute;
  top: calc(100% - 2px);
  left: calc(50% - 2px);
  z-index: 1;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 55%, var(--color-surface-raised));
  content: '';
}
.event-popover.popover-below {
  top: 40px;
  bottom: auto;
}
.event-popover.popover-below::after {
  top: auto;
  bottom: 100%;
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--color-accent) 42%, transparent),
    color-mix(in srgb, var(--color-accent) 8%, transparent)
  );
}
.event-popover.popover-below::before {
  top: auto;
  bottom: calc(100% - 2px);
}
.event-popover.popover-left {
  left: 0;
  transform: none;
}
.event-popover.popover-right {
  right: 0;
  left: auto;
  transform: none;
}
.event-close {
  position: absolute;
  top: 7px;
  right: 7px;
  display: flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}
.event-close svg {
  display: block;
  width: 12px;
  height: 12px;
  overflow: visible;
}
.event-close path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.7;
}
.event-close:hover {
  background: var(--color-background-mute);
  color: var(--color-heading);
  transform: rotate(90deg);
}
.event-card-enter-active,
.event-card-leave-active {
  transition:
    opacity 160ms ease,
    transform 180ms ease;
}
.event-card-enter-from,
.event-card-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px) scale(0.98);
}
.popover-below.event-card-enter-from,
.popover-below.event-card-leave-to {
  transform: translate(-50%, -6px) scale(0.98);
}
.event-popover time {
  color: var(--color-muted);
  font-size: 12px;
}
.event-popover strong {
  color: var(--color-heading);
  font-size: 14px;
}
.event-member {
  display: flex;
  align-items: center;
  gap: 8px;
}
.timeline-legend {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 13px 16px;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 13px;
}
.timeline-legend > span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #57a6e8;
}
.legend-dot.organization {
  background: #e8a64c;
}
.timeline-legend .timeline-hint {
  margin-left: auto;
}
.timeline-empty {
  padding: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  color: var(--color-muted);
  text-align: center;
}
.dragging .timeline-event,
.dragging .timeline-month-tick {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .timeline-month-tick,
  .timeline-event,
  .event-marker,
  .event-close,
  .event-card-enter-active,
  .event-card-leave-active {
    transition: none;
  }
}
@media (max-width: 760px) {
  .timeline-heading {
    align-items: center;
  }
  .timeline-controls {
    align-items: end;
    flex-wrap: wrap;
  }
  .date-control {
    flex: 1 1 180px;
  }
  .timeline-toolbar {
    width: 100%;
  }
  .timeline-controls {
    width: 100%;
    flex-wrap: wrap;
  }
  .timeline-canvas {
    height: var(--mobile-canvas-height);
    min-height: 440px;
    overflow: hidden;
    touch-action: pan-y;
  }
  .timeline-canvas.is-vertical .timeline-track {
    top: 0;
    right: auto;
    bottom: 0;
    left: 50%;
    width: 3px;
    height: auto;
    transform: translateX(-50%);
  }
  .timeline-canvas.is-vertical .timeline-tick {
    top: var(--position);
    left: calc(50% - 78px);
    width: 78px;
    height: 2px;
    border-top: 2px solid color-mix(in srgb, var(--color-accent) 60%, var(--color-border));
    border-left: 0;
    font-size: 14px;
    font-weight: 650;
  }
  .timeline-canvas.is-vertical .timeline-tick {
    bottom: auto;
  }
  .timeline-canvas.is-vertical .timeline-tick span {
    position: absolute;
    top: 50%;
    right: calc(100% + 8px);
    bottom: auto;
    left: auto;
    transform: translateY(-50%);
  }
  .timeline-canvas.is-vertical .timeline-month-tick {
    top: var(--position);
    left: 50%;
    width: 62px;
    height: 2px;
    border-top: 2px solid color-mix(in srgb, var(--color-accent) 60%, var(--color-border));
    border-left: 0;
    font-size: 12px;
    font-weight: 600;
  }
  .timeline-canvas.is-vertical .timeline-month-tick.month-year-start {
    border-top: 2px solid color-mix(in srgb, var(--color-accent) 60%, var(--color-border));
  }
  .timeline-canvas.is-vertical .timeline-month-tick span {
    position: absolute;
    top: 50%;
    left: calc(100% + 8px);
    transform: translateY(-50%);
  }
  .timeline-canvas.is-vertical .timeline-event {
    top: var(--position);
    left: calc(50% + var(--lane-offset));
  }
  .months-visible .timeline-canvas.is-vertical .timeline-tick {
    left: calc(50% - 78px);
    width: 78px;
    height: 2px;
    border-top: 2px solid color-mix(in srgb, var(--color-accent) 60%, var(--color-border));
    border-left: 0;
    color: var(--color-heading);
  }
  .months-visible .timeline-canvas.is-vertical .timeline-tick span {
    color: var(--color-heading);
    font-size: 15px;
    font-weight: 750;
  }
  .mobile-event-popover {
    position: fixed;
    top: 50%;
    right: auto;
    bottom: auto;
    left: 50%;
    z-index: 2000;
    width: min(245px, calc(100vw - 32px));
    transform: translate(-50%, -50%);
  }
  .mobile-event-popover.event-card-enter-from,
  .mobile-event-popover.event-card-leave-to {
    transform: translate(-50%, calc(-50% + 7px)) scale(0.98);
  }
  .timeline-legend {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 10px 18px;
  }
  .timeline-legend .timeline-hint {
    flex-basis: 100%;
    margin-left: 0;
  }
}
</style>
