<script setup>
defineProps({ variant: { type: String, default: 'directory' } })
</script>

<template>
  <div class="profile-data-cell" :class="[`profile-data-cell--${variant}`, variant === 'directory' ? 'data-cell' : 'organization-data-cell']"><slot /></div>
</template>

<style scoped>
.profile-data-cell {
  display: grid;
  grid-template-columns: minmax(0, 0.4fr) minmax(0, 0.6fr);
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.profile-data-cell--directory:nth-child(odd) { border-right: 1px solid var(--color-border); }
.profile-data-cell :deep(.data-label), .profile-data-cell :deep(.organization-data-label) { color: var(--color-accent); font-size: 16px; font-weight: 600; overflow-wrap: break-word; }
.profile-data-cell :deep(.data-value), .profile-data-cell :deep(.organization-data-value) { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-width: 0; color: var(--color-text); font-size: 16px; line-height: 1.5; overflow-wrap: anywhere; }
.profile-data-cell :deep(.data-value .uncertainty-toggle), .profile-data-cell :deep(.organization-data-value .uncertainty-toggle) { margin: 0; }
.profile-data-cell :deep(.data-value .sources-container), .profile-data-cell :deep(.organization-data-value .sources-container) { align-items: center; }

@media (max-width: 700px) {
  .profile-data-cell--organization { gap: 10px; padding: 12px; }
}

@media (max-width: 600px) {
  .profile-data-cell--directory { gap: 10px; padding: 12px; }
  .profile-data-cell--directory:nth-child(odd) { border-right: 0; }
}
</style>
