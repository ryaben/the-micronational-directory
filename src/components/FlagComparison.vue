<script setup>
import { ref } from 'vue'

defineProps({
  name: { type: String, required: true },
  entryId: { type: [String, Number], default: '' },
  original: { type: String, required: true },
  enhanced: { type: String, required: true }
})

const split = ref(50)
</script>

<template>
  <article class="flag-comparison">
    <h3><router-link :to="`/directory/${encodeURIComponent(entryId || name)}`">{{ name }}</router-link></h3>
    <div class="comparison-stage" :style="{ '--split': `${split}%` }">
      <img class="comparison-image" :src="original" :alt="`${name} original flag`" />
      <img class="comparison-image comparison-enhanced" :src="enhanced" :alt="`${name} enhanced flag`" />
      <div class="comparison-divider" aria-hidden="true"><span>↔</span></div>
      <input v-model="split" class="comparison-range" type="range" min="0" max="100"
        :aria-label="$t('flagRevival.sliderLabel', { name })" />
    </div>
    <div class="comparison-labels">
      <span class="comparison-label enhanced-label">{{ $t('flagRevival.enhanced') }}</span>
      <span class="comparison-label original-label">{{ $t('flagRevival.original') }}</span>
    </div>
  </article>
</template>

<style scoped>
.flag-comparison {
  min-width: 0;
  padding: 18px;
}

.flag-comparison h3 {
  margin: 0 0 14px;
  font-size: 19px;
}

.flag-comparison h3 a {
  color: inherit;
  text-decoration: none;
}

.flag-comparison h3 a:hover {
  color: var(--color-link);
  text-decoration: underline;
}

.comparison-stage {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: var(--radius-lg);
  background: var(--color-background-soft);
}

.comparison-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.comparison-enhanced {
  clip-path: inset(0 calc(100% - var(--split)) 0 0);
}

.comparison-label {
  display: inline-block;
  min-width: 0;
  padding: 4px 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.comparison-labels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 5px;
}

.comparison-divider {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: var(--split);
  width: 2px;
  background: white;
  box-shadow: 0 0 5px #0009;
  transform: translateX(-50%);
  pointer-events: none;
}

.comparison-divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  border-radius: 50%;
  color: #17212d;
  background: white;
  box-shadow: 0 1px 6px #0006;
}

.comparison-range {
  position: absolute;
  z-index: 3;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

.comparison-range:focus-visible {
  opacity: .08;
  outline: 3px solid var(--color-accent);
  outline-offset: -4px;
}
</style>
