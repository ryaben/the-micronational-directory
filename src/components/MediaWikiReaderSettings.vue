<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  elementsDirectory: { type: Array, default: () => [] }
});

const emit = defineEmits(['loaded-directory']);

const searchQuery = ref('');
const selectedLetter = ref('');
const sortBy = ref('latestAdded');
const entriesPerPage = ref(50);
const currentPage = ref(1);
const randomOrder = ref(new Map());

function entryName(entry) {
  return typeof entry.name === 'string' ? entry.name : entry.name?.main || '';
}

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function timestamp(entry) {
  const date = entry.creationDate;
  return date?._seconds ?? date?.seconds ?? (date instanceof Date ? date.getTime() / 1000 : 0);
}

function shuffleDirectory() {
  const shuffled = [...props.elementsDirectory];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  randomOrder.value = new Map(shuffled.map((entry, index) => [entry, index]));
}

const letters = computed(() => [...new Set(props.elementsDirectory
  .map(entry => normalize(entryName(entry)).charAt(0).toUpperCase())
  .filter(Boolean))].sort());

const filteredEntries = computed(() => {
  const query = normalize(searchQuery.value.trim());
  const result = props.elementsDirectory.filter(entry => {
    const name = normalize(entryName(entry));
    const letterMatches = !selectedLetter.value || name.startsWith(normalize(selectedLetter.value));
    return letterMatches && (!query || name.includes(query));
  });

  switch (sortBy.value) {
    case 'ascending':
      return result.sort((a, b) => entryName(a).localeCompare(entryName(b)));
    case 'descending':
      return result.sort((a, b) => entryName(b).localeCompare(entryName(a)));
    case 'oldestAdded':
      return result.sort((a, b) => timestamp(a) - timestamp(b));
    case 'random':
      return result.sort((a, b) => (randomOrder.value.get(a) ?? 0) - (randomOrder.value.get(b) ?? 0));
    default:
      return result.sort((a, b) => timestamp(b) - timestamp(a));
  }
});

const pageSize = computed(() => Math.min(Math.max(Number(entriesPerPage.value) || 1, 1), 10000));
const totalPages = computed(() => Math.max(1, Math.ceil(filteredEntries.value.length / pageSize.value)));
const safeCurrentPage = computed(() => Math.min(Math.max(Number(currentPage.value) || 1, 1), totalPages.value));
const pagedEntries = computed(() => {
  const start = (safeCurrentPage.value - 1) * pageSize.value;
  return filteredEntries.value.slice(start, start + pageSize.value);
});

watch([searchQuery, selectedLetter, sortBy, entriesPerPage], () => {
  currentPage.value = 1;
});

watch(() => props.elementsDirectory, () => {
  if (sortBy.value === 'random') shuffleDirectory();
}, { immediate: true });

watch(sortBy, value => {
  if (value === 'random') shuffleDirectory();
});

watch(totalPages, pageCount => {
  currentPage.value = Math.min(Math.max(Number(currentPage.value) || 1, 1), pageCount);
});

watch(pagedEntries, entries => emit('loaded-directory', entries), { immediate: true });
</script>

<template>
  <div class="wiki-reader-settings" aria-label="Article list controls">
    <div class="settings-heading">
      <div>
        <h3>{{ $t('reader.browseArticles') }}</h3>
      </div>
      <div class="matched-count" aria-live="polite">
        <strong>{{ filteredEntries.length }}</strong>
        <span>{{ $t('reader.matched') }}</span>
      </div>
    </div>

    <div class="settings-fields">
      <label class="control-field search-field">
        <span>{{ $t('reader.searchArticles') }}</span>
        <input v-model="searchQuery" type="search" placeholder="Search by name...">
      </label>

      <label class="control-field">
        <span>{{ $t('reader.initialLetter') }}</span>
        <select v-model="selectedLetter">
          <option value="">{{ $t('reader.anyLetter') }}</option>
          <option v-for="letter in letters" :key="letter" :value="letter">{{ letter }}</option>
        </select>
      </label>

      <label class="control-field">
        <span>{{ $t('reader.sortBy') }}</span>
        <select v-model="sortBy">
          <option value="latestAdded">{{ $t('reader.latestAdded') }}</option>
          <option value="oldestAdded">{{ $t('reader.oldestAdded') }}</option>
          <option value="ascending">{{ $t('reader.nameAsc') }}</option>
          <option value="descending">{{ $t('reader.nameDesc') }}</option>
          <option value="random">{{ $t('reader.random') }}</option>
        </select>
      </label>

      <label class="control-field page-size-field">
        <span>{{ $t('reader.perPage') }}</span>
        <input v-model.number="entriesPerPage" type="number" min="1" max="10000">
      </label>
    </div>

    <div class="pagination-controls">
      <button type="button" class="page-button" :disabled="safeCurrentPage <= 1"
        :aria-label="$t('reader.previous')" @click="currentPage = safeCurrentPage - 1">‹</button>
      <label class="current-page-control">
        <span>{{ $t('reader.page') }}</span>
        <input v-model.number="currentPage" type="number" min="1" :max="totalPages">
        <span>{{ $t('reader.of') }} {{ totalPages }}</span>
      </label>
      <button type="button" class="page-button" :disabled="safeCurrentPage >= totalPages"
        :aria-label="$t('reader.next')" @click="currentPage = safeCurrentPage + 1">›</button>
    </div>
  </div>
</template>

<style scoped>
.wiki-reader-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
  color: var(--color-text);
}

.settings-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.settings-heading h3 {
  margin: 3px 0 0;
  color: var(--color-heading);
  font-size: 18px;
}

.matched-count {
  display: flex;
  align-items: baseline;
  gap: 5px;
  white-space: nowrap;
}

.matched-count strong {
  color: var(--color-accent);
  font-size: 20px;
}

.matched-count span {
  color: var(--color-muted);
  font-size: 12px;
}

.settings-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.control-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 600;
}

.control-field input,
.control-field select,
.current-page-control input {
  width: 100%;
  min-width: 0;
  height: 42px;
  box-sizing: border-box;
  padding: 0 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background: var(--color-background-soft);
  font: inherit;
  font-size: 14px;
}

.control-field input:focus,
.control-field select:focus,
.current-page-control input:focus {
  border-color: var(--color-accent);
  outline: 2px solid color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 54px;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
}

.page-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  background: var(--color-surface);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: border-color var(--transition-fast) ease, background-color var(--transition-fast) ease;
}

.page-button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--navbar-tab-background-color-hover);
}

.page-button:disabled {
  color: var(--color-muted);
  opacity: 0.5;
  cursor: default;
}

.current-page-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-muted);
  font-size: 13px;
}

.current-page-control input {
  width: 66px;
  text-align: center;
}

@media (max-width: 520px) {
  .settings-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
