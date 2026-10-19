<script setup>
import { checkHref, getIconFolder } from '../utils/EntrySourceFunctions'

const props = defineProps({
  icon: { type: String, default: 'www' },
  image: { type: String, default: '/' },
  href: { type: String, default: null },
  width: { type: Number, default: 46 },
  height: { type: Number, default: 46 },
  internal: { type: Boolean, default: false },
  memberStyle: { type: Boolean, default: false },
  label: { type: String, default: 'Source link' }
})

const imageSrc = () => props.icon === 'flag'
  ? props.image
  : `/images/${props.memberStyle ? '' : `${getIconFolder(props.icon)}/`}${props.icon}.png`
</script>

<template>
  <component
    :is="href ? (internal ? 'router-link' : 'a') : 'span'"
    class="source-container"
    :class="[{ 'member-source-link': memberStyle }, icon]"
    :style="{ width: `${width}px`, height: `${height}px` }"
    :href="!internal && href ? checkHref(href) : undefined"
    :to="internal && href ? href : undefined"
    :target="internal || !href ? undefined : '_blank'"
    :rel="internal || !href ? undefined : 'noopener noreferrer'"
    :aria-label="href ? label : 'Unknown membership'"
  >
    <img :src="imageSrc()" :alt="label">
  </component>
</template>

<style scoped>
.source-container {
  display: block;
  overflow: hidden;
  cursor: pointer;
  background-color: #f1f5f9;
  background-size: cover;
  background-position: center;
  border: 2px solid black;
  border-radius: 50%;
  transform: translateY(0) scale(1);
  transform-origin: center;
  transition: transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 180ms ease,
    border-color 180ms ease, background-color 180ms ease;
}

.member-source-link {
  border: 0;
  border-radius: 0;
  margin-inline: 2px;
  background-color: var(--vt-c-white);
  transition: transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 180ms ease,
    outline-color 180ms ease;
}

.source-container:hover {
  background-color: #f1f5f9;
  border-color: var(--color-accent);
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.28), 0 0 0 2px color-mix(in srgb, var(--color-accent) 30%, transparent);
}

.member-source-link:hover {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
  transform: translateY(-3px) scale(1.06);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.28);
}

.source-container:active { transform: translateY(0) scale(0.96); transition-duration: 80ms; }
.source-container:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 3px; }
.source-container img { width: 100%; height: 100%; }

@media (prefers-reduced-motion: reduce) {
  .source-container, .source-container:hover, .source-container:active { transition: none; transform: none; }
}
</style>
