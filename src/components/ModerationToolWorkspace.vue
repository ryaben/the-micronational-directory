<script setup>
import { computed, useSlots } from 'vue';

const slots = useSlots();
const hasSummary = computed(() => Boolean(slots.summary));
const hasDescription = computed(() => Boolean(slots.description));
const hasSupport = computed(() => Boolean(slots.support));
const hasAfter = computed(() => Boolean(slots.after));
</script>

<template>
  <div class="moderation-tool-workspace">
    <div v-if="hasDescription || hasSummary" class="workspace-summary">
      <div v-if="hasDescription" class="workspace-summary-copy">
        <slot name="description" />
      </div>
      <div v-if="hasSummary" class="workspace-summary-metrics">
        <slot name="summary" />
      </div>
    </div>

    <div class="workspace-columns" :class="{ 'single-column': !hasSupport }">
      <main class="workspace-main">
        <slot name="main" />
      </main>
      <aside v-if="hasSupport" class="workspace-support">
        <slot name="support" />
      </aside>
    </div>

    <div v-if="hasAfter" class="workspace-after">
      <slot name="after" />
    </div>
  </div>
</template>

<script>
export default { name: 'ModerationToolWorkspace' };
</script>

<style scoped>
.moderation-tool-workspace {
  --workspace-gap: 16px;
  --workspace-inset: 16px;

  display: flex;
  flex-direction: column;
  gap: var(--workspace-gap);
  min-width: 0;
  padding: 12px var(--workspace-inset) 18px;
}

.workspace-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 54px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background: var(--color-surface-raised);
}

.workspace-summary-copy {
  min-width: 0;
}

.workspace-summary-copy :deep(.workspace-description) {
  max-width: 75ch;
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
  line-height: 1.5;
}

.workspace-summary-metrics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  color: var(--color-text);
  font-size: 13px;
}

.workspace-summary-metrics :deep(strong) {
  color: var(--color-accent);
  font-size: 17px;
}

.workspace-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(270px, 0.8fr);
  align-items: start;
  gap: 18px;
  min-width: 0;
}

.workspace-columns.single-column {
  grid-template-columns: minmax(0, 1fr);
}

.workspace-main,
.workspace-support,
.workspace-after {
  min-width: 0;
}

.workspace-support {
  padding: var(--workspace-inset);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.workspace-main :deep(.area-title),
.workspace-main :deep(.list-description) {
  margin: 0 0 12px;
  color: var(--color-heading);
  font-size: 18px;
  line-height: 1.45;
}

.workspace-support :deep(.settings-tab) {
  min-height: 42px;
}

.workspace-after {
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 900px) {
  .workspace-summary {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .workspace-columns {
    grid-template-columns: minmax(0, 1fr);
  }

  .workspace-support {
    grid-row: 2;
  }
}

@media (max-width: 520px) {
  .moderation-tool-workspace {
    gap: 12px;
    --workspace-gap: 12px;
    --workspace-inset: 12px;
    padding: 10px var(--workspace-inset) 14px;
  }

}
</style>
