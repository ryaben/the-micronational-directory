<script setup>
import { computed } from 'vue'
import FlagComparison from '../components/FlagComparison.vue'
import store from '../store'

const entries = computed(() => store.getters.micronations
  .filter((entry) => entry.approved && entry.flagEnhanced && entry.flag)
  .sort((a, b) => a.name.main.localeCompare(b.name.main)))
</script>

<template>
  <section class="site-section flag-revival-page">
    <header class="project-header">
      <h1>{{ $t('flagRevival.title') }}</h1>
      <p>{{ $t('flagRevival.intro') }}</p>
      <p>{{ $t('flagRevival.method') }}</p>
      <p>{{ $t('flagRevival.respect') }}</p>
      <div class="restoration-count-bar" :aria-label="$t('flagRevival.summary')">
        <div class="restoration-count-item">
          <span class="restoration-count-value">{{ entries.length }}</span>
          <span class="restoration-count-label">{{ $t('flagRevival.restored') }}</span>
        </div>
      </div>
    </header>
    <div class="project-demo">
      <div class="comparison-list" :aria-label="$t('flagRevival.examples')">
        <FlagComparison v-for="entry in entries" :key="entry.id || entry.name.main" :name="entry.name.main"
          :entry-id="entry.id" :original="entry.flag" :enhanced="entry.flagEnhanced" />
        <p v-if="!entries.length" class="empty-project">{{ $t('flagRevival.empty') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.flag-revival-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: clamp(22px, 3vw, 42px);
}

.project-header {
  display: block;
  max-width: 760px;
  text-align: left;
}

.project-header h1 {
  margin: 4px 0 20px;
  font-size: clamp(30px, 4vw, 44px);
  letter-spacing: -.03em;
}

.project-header p {
  line-height: 1.8;
}

.project-header p+p {
  margin-top: 20px;
}

.restoration-count-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.restoration-count-item {
  display: flex;
  align-items: baseline;
  gap: 9px;
}

.restoration-count-value {
  color: var(--color-heading);
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.restoration-count-label {
  color: var(--color-muted);
  font-size: 14px;
}

.project-demo {
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}

.comparison-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: 18px;
  max-height: min(74vh, 1000px);
  overflow-y: auto;
  padding: 4px 8px 4px 4px;
}

.empty-project {
  grid-column: 1 / -1;
  padding: 24px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-xl);
  color: var(--color-muted);
  text-align: center;
}

@media (max-width: 1000px) {
  .flag-revival-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .project-header {
    max-width: none;
  }

  .restoration-count-bar {
    margin-top: 16px;
  }

  .comparison-list {
    max-height: 70vh;
  }
}

@media (max-width: 620px) {
  .comparison-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
