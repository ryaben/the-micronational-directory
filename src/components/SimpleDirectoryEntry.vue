<script setup>
import { computed, ref, watch } from 'vue'
import AnimateHeight from 'vue-animate-height'
import ModerationKindChip from './ModerationKindChip.vue'
import SourceLink from './SourceLink.vue'
import { checkIcon } from '../utils/EntrySourceFunctions'

const props = defineProps({
  info: { type: Object, required: true },
  width: { type: Number, default: 180 },
  logoHeight: { type: Number, default: 120 },
  moderationLabel: { type: String, default: '' },
  profileUrl: { type: String, default: '' },
  showProfileButton: { type: Boolean, default: false },
  inlineProfilePreview: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  alwaysExpanded: { type: Boolean, default: false },
  viewMode: { type: String, default: 'micronations' },
})

const emit = defineEmits(['open-profile'])
const expanded = ref(!props.expandable || props.alwaysExpanded)
const showDetails = computed(() => !props.expandable || props.alwaysExpanded || expanded.value)

watch(() => [props.expandable, props.alwaysExpanded], ([expandable, alwaysExpanded]) => {
  expanded.value = !expandable || alwaysExpanded
})

function toggleExpanded() {
  if (props.expandable && !props.alwaysExpanded) expanded.value = !expanded.value
}
</script>

<template>
  <article class="simple-directory-entry" :class="{ 'is-moderation': moderationLabel, 'collage-mode': viewMode === 'collage', 'info-displayed': showDetails && (info.texts?.length || profileUrl || inlineProfilePreview || showProfileButton) }" :style="{ width: `${width}px` }" @click="toggleExpanded">
    <ModerationKindChip v-if="moderationLabel && viewMode !== 'collage'" :label="moderationLabel" />
    <img v-if="info.logo" :src="info.logo" class="simple-entry-logo" :style="{ height: `${logoHeight}px` }" :alt="`${info.title} logo`" />
    <h2 v-if="viewMode !== 'collage'" class="simple-entry-title" :class="{ 'simple-entry-title--micronation': info.name }">
      <template v-if="info.name"><b>{{ info.name.main }}</b><span v-if="info.name.title">,<br />{{ info.name.title }}</span></template>
      <template v-else>{{ info.title }}</template>
    </h2>
    <AnimateHeight v-if="viewMode !== 'collage'" class="simple-entry-details-collapse" :duration="400" :height="showDetails ? 'auto' : 0" :animate-opacity="true">
      <div v-if="info.texts?.length">
        <hr class="simple-entry-divider" />
        <div class="simple-entry-sources-heading">
          <span>{{ $t('directory.infoSources') }}</span>
          <small>{{ info.texts.length }}</small>
        </div>
        <div class="simple-entry-facts">
          <div v-for="(item, index) in info.texts" :key="`${item.source}-${index}`" class="simple-entry-fact">
            <p>{{ item.content }}</p>
            <SourceLink
              class="simple-entry-source-link"
              :icon="checkIcon(item.source, info.title)"
              :href="item.source"
              :width="20"
              :height="20"
              :label="`Source ${index + 1} for ${info.title}`"
            />
          </div>
        </div>
      </div>
    </AnimateHeight>
    <div v-if="viewMode !== 'collage' && showDetails && (profileUrl || inlineProfilePreview || showProfileButton)" class="simple-entry-info-buttons">
      <button v-if="inlineProfilePreview" type="button" class="simple-entry-profile" @click.stop="emit('open-profile')">{{ $t('directory.fullProfile') }}</button>
      <router-link v-else-if="profileUrl" class="simple-entry-profile" :to="profileUrl" @click.stop>{{ $t('directory.fullProfile') }}</router-link>
      <span v-else class="simple-entry-profile disabled" aria-disabled="true">{{ $t('directory.fullProfile') }}</span>
    </div>
  </article>
</template>

<style scoped>
.simple-directory-entry {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 15px;
  margin: 0 3px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--directory-entry-background-color);
  color: var(--directory-entry-text-color);
  align-self: flex-start;
}
.simple-directory-entry.is-moderation { cursor: pointer; transition: transform var(--transition-base) ease, background-color var(--transition-base) ease, box-shadow var(--transition-base) ease; }
.simple-directory-entry.is-moderation:hover { transform: translateY(-4px); background-color: var(--navbar-tab-background-color-hover); box-shadow: var(--shadow-soft); }
.simple-directory-entry.info-displayed { padding: 12px 12px 0; border-color: color-mix(in srgb, var(--color-accent) 24%, var(--color-border)); background: linear-gradient(155deg, color-mix(in srgb, var(--color-accent) 6%, var(--directory-entry-background-color)), var(--directory-entry-background-color) 48%); box-shadow: 0 8px 20px color-mix(in srgb, var(--color-heading) 9%, transparent); }
.simple-entry-logo { width: 100%; object-fit: fill; }
.simple-entry-title { margin: 0; color: var(--color-heading); font-size: 16px; text-align: center; overflow-wrap: anywhere; }
.simple-entry-title--micronation { width: 100%; margin-block: 5px 0; font-size: 15px; font-weight: 400; line-height: 1.65; word-break: normal; overflow-wrap: anywhere; }
.simple-entry-title--micronation :deep(span) { font-weight: 400; }
.simple-entry-divider { align-self: stretch; width: 100%; margin: 10px 0 8px; border: 0; border-top: 1px solid var(--color-border); }
.simple-entry-sources-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 7px; color: var(--color-muted); font-size: 10px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; }
.simple-entry-sources-heading small { display: grid; min-width: 19px; height: 19px; padding: 0 4px; place-items: center; border-radius: var(--radius-full); color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface)); font-size: 10px; letter-spacing: normal; }
.simple-entry-facts { display: grid; align-self: stretch; gap: 7px; width: 100%; }
.simple-entry-fact { position: relative; box-sizing: border-box; display: flex; align-items: flex-start; gap: 6px; min-width: 0; padding: 7px 32px 7px 9px; border: 1px solid color-mix(in srgb, var(--color-accent) 14%, var(--color-border)); border-radius: var(--radius-sm); background: color-mix(in srgb, var(--color-surface) 72%, var(--directory-entry-background-color)); font-size: 12px; text-align: left; }
.simple-entry-fact p { display: -webkit-box; flex: 1 1 auto; min-width: 0; margin: 0; overflow: hidden; overflow-wrap: anywhere; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; }
.simple-entry-fact :deep(.simple-entry-source-link) { position: absolute; top: 7px; right: 7px; }
.simple-entry-info-buttons { display: flex; align-self: stretch; box-sizing: border-box; width: calc(100% + 24px); margin: 10px -12px 0; }
.simple-entry-profile { display: flex; width: 100%; min-height: 30px; align-items: center; justify-content: center; margin: 0; padding: 5px 8px; border: 1px solid var(--color-border); border-bottom: 0; border-radius: 0 0 var(--radius-sm) var(--radius-sm); background: var(--vt-c-indigo); color: var(--vt-c-white-soft); font-family: inherit; font-size: 13px; line-height: 1.3; text-align: center; text-decoration: none; cursor: pointer; transition: background-color 220ms ease, color 220ms ease, box-shadow 220ms ease; }
.simple-entry-profile:hover { background: color-mix(in srgb, var(--vt-c-indigo) 86%, var(--color-heading)); color: var(--vt-c-white-soft); box-shadow: 0 2px 8px color-mix(in srgb, var(--vt-c-indigo) 20%, transparent); }
.simple-entry-profile.disabled { opacity: .6; cursor: default; }
.simple-directory-entry.collage-mode { width: 100% !important; padding: 0; margin: 0; border: 0; border-radius: 0; background: transparent; }
.simple-directory-entry.collage-mode .simple-entry-logo { width: 100%; }
</style>
