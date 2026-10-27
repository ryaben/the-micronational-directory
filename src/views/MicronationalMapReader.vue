<script setup>
import PlacemarkEntry from '../components/PlacemarkEntry.vue';
import ModerationToolWorkspace from '../components/ModerationToolWorkspace.vue';
import { placemarksDirectory } from '../assets/sources/googleMyMapsSources.js';
import { notify } from "@kyvg/vue3-notification";
import $ from 'jquery';
import { useDirectoryData } from '../composables/useDirectoryData.js';
import { computed, ref } from 'vue';
import { translate } from '../i18n.js';

const { micronationsDirectory, userIsModerator } = useDirectoryData();
const KMLfile = ref('');
const KMLlink = ref('');

const directory = computed(() => Array.isArray(micronationsDirectory.value) ? micronationsDirectory.value : []);
const hasApplicableLocation = (placemark) => placemark?.location?.applicable === true;
const pageSize = 12;
const noLocationPage = ref(1);
const hasLocationPage = ref(1);
const missingEntryPage = ref(1);

const micronationsCompareSources = computed(() => {
  const present = [];
  const missing = [];

  placemarksDirectory.forEach((element) => {
    const check = directory.value.find((mic) => [
      mic.name?.main,
      ...(mic.name?.alt || []).map((name) => name.main),
      mic.name?.mainAlt
    ].some((name) => name && normalizeString(element.name).includes(normalizeString(name))));

    if (check) {
      present.push({ ...check, micronationalMap: element });
    } else {
      missing.push({ micronationalMap: element });
    }
  });

  return { present, missing };
});

const placemarkSources = computed(() => {
  const sources = new Map();
  placemarksDirectory.forEach((element) => {
    const name = element?.source?.name;
    const url = element?.source?.url;
    if (name && url && !sources.has(name)) {
      sources.set(name, url);
    }
  });
  return [...sources].map(([name, url]) => ({ name, url }));
});

const entriesWithoutLocation = computed(() => micronationsCompareSources.value.present.filter(
  (micro) => hasApplicableLocation(micro.micronationalMap) && micro.location?.latitude === 0
));
const entriesWithLocation = computed(() => micronationsCompareSources.value.present.filter(
  (micro) => hasApplicableLocation(micro.micronationalMap) && micro.location?.latitude !== 0
));
const entriesMissingFromDirectory = computed(() => micronationsCompareSources.value.missing.filter(
  (micro) => hasApplicableLocation(micro.micronationalMap)
));

function pageItems(items, page) {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

function pageCount(items) {
  return Math.max(1, Math.ceil(items.length / pageSize));
}

function changePage(pageName, items, direction) {
  const pageRef = { noLocationPage, hasLocationPage, missingEntryPage }[pageName];
  pageRef.value = Math.min(pageCount(items), Math.max(1, pageRef.value + direction));
}

function setPage(pageName, items, value) {
  const pageRef = { noLocationPage, hasLocationPage, missingEntryPage }[pageName];
  const requestedPage = Number(value);
  if (!Number.isFinite(requestedPage)) return;
  pageRef.value = Math.min(pageCount(items), Math.max(1, Math.trunc(requestedPage)));
}

function normalizeString(string = '') {
  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function processKML() {
  const cleanKML = KMLfile.value.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/\n {8}/g, '').replace(/ {4}/g, '');
  const documentData = {
    name: $(cleanKML).find('Document name:eq(0)').text(),
    url: KMLlink.value
  };
  const placemarksArray = [];

  $(cleanKML).find('Placemark').each(function () {
    const checkName = $(this).find('name').text().replace(/>/g, '');
    const coordinates = $(this).find('Point coordinates').text().split(',');
    const checkFlag = $(this).find('description img').prop('src');

    placemarksArray.push({
      source: { url: documentData.url, name: documentData.name },
      name: checkName || '',
      location: {
        long: coordinates[0]?.trim() || 0,
        lat: coordinates[1]?.trim() || 0,
        applicable: !/non-territorial/i.test($(this).find('description').text())
      },
      description: $(this).find('description').text().replace(/>/g, ''),
      flag: checkFlag || ''
    });
  });

  const { saveAs } = await import('file-saver');
  const fileName = normalizeString(documentData.name || 'google-my-maps-placemarks')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'google-my-maps-placemarks';
  const jsonFile = new Blob([JSON.stringify(placemarksArray, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
  saveAs(jsonFile, `${fileName}.json`);

  notify({
    title: translate('mapReader.processingCompleteTitle'),
    text: translate('mapReader.processingCompleteText', { count: placemarksArray.length, fileName }),
    type: "success"
  });
}
</script>

<template>
  <section class="site-section site-section--flush site-section--flat-top">
    <div id="notEnoughPrivileges" v-if="!userIsModerator" v-show="micronationsDirectory.length !== 0">
      {{ $t('mapReader.noPrivileges') }}
    </div>

    <div v-if="userIsModerator" id="responseText">
      <ModerationToolWorkspace>
        <template #description>
          <p class="workspace-description">{{ $t('mapReader.description') }}</p>
        </template>
        <template #summary>
          <strong class="summary-count">{{ placemarksDirectory.filter(hasApplicableLocation).length }}</strong>
          <span>{{ $t('mapReader.applicableLocationCount') }}</span>
        </template>

        <template #support>
          <div id="addedSources">
            <h3>{{ $t('mapReader.sourceMaps') }}</h3>
            <p v-for="(source, i) in placemarkSources" :key="i"><a :href="source.url">{{ source.name }}</a></p>
          </div>
          <form class="panel-section" @submit.prevent>
            <h3>{{ $t('mapReader.importMap') }}</h3>
          <input v-model="KMLlink" id="KMLlink" type="url" :placeholder="$t('mapReader.mapUrlPlaceholder')">
          <textarea v-model="KMLfile" id="KMLfile" name="KMLfile" cols="30" rows="10"
            :placeholder="$t('mapReader.kmlPlaceholder')"></textarea>
          <button class="login-button color-transition short" @click="processKML">{{ $t('mapReader.processKml') }}</button>
        </form>
        </template>

        <template #main>
        <div class="map-results">
        <section class="map-result-group">
        <div class="list-heading">
          <div><h3>{{ $t('mapReader.withoutLocationHeading') }}</h3><p>{{ $t('mapReader.withoutLocationSummary', { count: entriesWithoutLocation.length }) }}</p></div>
          <div class="pagination" v-if="entriesWithoutLocation.length > pageSize" :aria-label="$t('mapReader.withoutLocationPagination')">
            <button type="button" class="page-arrow" :disabled="noLocationPage <= 1" :aria-label="$t('common.previous')" @click="changePage('noLocationPage', entriesWithoutLocation, -1)">←</button>
            <label><span class="sr-only">{{ $t('reader.page') }}</span><input type="number" min="1" :max="pageCount(entriesWithoutLocation)" :value="noLocationPage" @change="setPage('noLocationPage', entriesWithoutLocation, $event.target.value)"></label>
            <span>{{ $t('reader.of') }} {{ pageCount(entriesWithoutLocation) }}</span>
            <button type="button" class="page-arrow" :disabled="noLocationPage >= pageCount(entriesWithoutLocation)" :aria-label="$t('common.next')" @click="changePage('noLocationPage', entriesWithoutLocation, 1)">→</button>
          </div>
        </div>
        <Transition name="page-transition" mode="out-in">
          <div :key="noLocationPage" class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in pageItems(entriesWithoutLocation, noLocationPage)"
            :key="i" :present="true" :placemark-info="item" />
          </div>
        </Transition>
        </section>

        <section class="map-result-group">
        <div class="list-heading">
          <div><h3>{{ $t('mapReader.withLocationHeading') }}</h3><p>{{ $t('mapReader.withLocationSummary', { count: entriesWithLocation.length }) }}</p></div>
          <div class="pagination" v-if="entriesWithLocation.length > pageSize" :aria-label="$t('mapReader.withLocationPagination')">
            <button type="button" class="page-arrow" :disabled="hasLocationPage <= 1" :aria-label="$t('common.previous')" @click="changePage('hasLocationPage', entriesWithLocation, -1)">←</button>
            <label><span class="sr-only">{{ $t('reader.page') }}</span><input type="number" min="1" :max="pageCount(entriesWithLocation)" :value="hasLocationPage" @change="setPage('hasLocationPage', entriesWithLocation, $event.target.value)"></label>
            <span>{{ $t('reader.of') }} {{ pageCount(entriesWithLocation) }}</span>
            <button type="button" class="page-arrow" :disabled="hasLocationPage >= pageCount(entriesWithLocation)" :aria-label="$t('common.next')" @click="changePage('hasLocationPage', entriesWithLocation, 1)">→</button>
          </div>
        </div>
        <Transition name="page-transition" mode="out-in">
          <div :key="hasLocationPage" class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in pageItems(entriesWithLocation, hasLocationPage)"
            :key="i" :present="true" :placemark-info="item" />
          </div>
        </Transition>
        </section>

        <section class="map-result-group">
        <div class="list-heading">
          <div><h3>{{ $t('mapReader.missingHeading') }}</h3><p>{{ entriesMissingFromDirectory.length }} {{ $t('mapReader.missingBody') }}</p></div>
          <div class="pagination" v-if="entriesMissingFromDirectory.length > pageSize" :aria-label="$t('mapReader.missingPagination')">
            <button type="button" class="page-arrow" :disabled="missingEntryPage <= 1" :aria-label="$t('common.previous')" @click="changePage('missingEntryPage', entriesMissingFromDirectory, -1)">←</button>
            <label><span class="sr-only">{{ $t('reader.page') }}</span><input type="number" min="1" :max="pageCount(entriesMissingFromDirectory)" :value="missingEntryPage" @change="setPage('missingEntryPage', entriesMissingFromDirectory, $event.target.value)"></label>
            <span>{{ $t('reader.of') }} {{ pageCount(entriesMissingFromDirectory) }}</span>
            <button type="button" class="page-arrow" :disabled="missingEntryPage >= pageCount(entriesMissingFromDirectory)" :aria-label="$t('common.next')" @click="changePage('missingEntryPage', entriesMissingFromDirectory, 1)">→</button>
          </div>
        </div>
        <Transition name="page-transition" mode="out-in">
          <div :key="missingEntryPage" class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in pageItems(entriesMissingFromDirectory, missingEntryPage)"
            :key="i" :present="false" :placemark-info="item" />
          </div>
        </Transition>
        </section>
      </div>
        </template>
      </ModerationToolWorkspace>
    </div>
  </section>
</template>

<style scoped>
#actionPanel {
  display: flex;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.summary-count {
  margin-right: 8px;
  color: var(--color-accent);
  font-size: 19px;
}

#addedSources h3,
.panel-section h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

#addedSources p {
  margin: 0 0 7px;
}

.map-results {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.map-result-group {
  min-width: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface, rgba(255, 255, 255, 0.04));
}

.list-heading h3 {
  margin: 0 0 4px;
  font-size: 17px;
}

.list-heading p {
  margin: 0;
  color: var(--color-muted, #aab4c2);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  font-size: 13px;
}

.pagination button {
  padding: 5px 9px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: inherit;
  background: transparent;
  cursor: pointer;
  transition: transform 140ms ease, background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}

.pagination button:not(:disabled):hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.16);
}

.pagination button:not(:disabled):active {
  transform: translateY(0) scale(0.94);
  box-shadow: none;
}

.pagination button:focus-visible,
.pagination input:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.pagination .page-arrow {
  min-width: 34px;
  font-size: 19px;
  line-height: 1;
}

.pagination input {
  width: 52px;
  padding: 5px 4px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: inherit;
  background: transparent;
  text-align: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 150ms ease;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pagination button,
  .page-transition-enter-active,
  .page-transition-leave-active {
    transition-duration: 0.01ms;
  }
}

.pagination button:disabled {
  opacity: 0.45;
  cursor: default;
}

.micronations-list {
  min-width: 0;
}

@media (max-width: 700px) {
  .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .pagination {
    justify-content: flex-start;
  }
}

#KMLfile {
  margin-bottom: 10px;
}

.micronations-list {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
  gap: 12px;
}

</style>
