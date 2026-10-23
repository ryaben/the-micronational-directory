<script setup>
import PlacemarkEntry from '../components/PlacemarkEntry.vue';
import ModerationToolWorkspace from '../components/ModerationToolWorkspace.vue';
import { placemarksDirectory } from '../assets/googleMyMapsSources';
import { notify } from "@kyvg/vue3-notification";
import $ from 'jquery';
import { useDirectoryData } from '../composables/useDirectoryData.js';
import { computed, ref } from 'vue';

const { micronationsDirectory, userIsModerator } = useDirectoryData();
const KMLfile = ref('');
const KMLlink = ref('');

const directory = computed(() => Array.isArray(micronationsDirectory.value) ? micronationsDirectory.value : []);

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
    if (!sources.has(element.source.name)) {
      sources.set(element.source.name, element.source.url);
    }
  });
  return [...sources].map(([name, url]) => ({ name, url }));
});

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
    title: "Processing complete",
    text: `Processed ${placemarksArray.length} placemarks and downloaded ${fileName}.json. Add the elements to googleMyMapsSources.js.`,
    type: "success"
  });
}
</script>

<template>
  <section class="site-section site-section--flush site-section--flat-top">
    <div id="notEnoughPrivileges" v-if="!userIsModerator" v-show="micronationsDirectory.length !== 0">
      You don't have sufficient privileges in order to work with stored placemarks.
    </div>

    <div v-if="userIsModerator" id="responseText">
      <ModerationToolWorkspace>
        <template #description>
          <p class="workspace-description">Process KML files from Google My Maps into micronation placemarks. Compare their coordinates and descriptions with directory entries, then identify entries that need location information.</p>
        </template>
        <template #summary>
          <strong class="summary-count">{{ placemarksDirectory.filter(mic => mic.location.applicable).length }}</strong>
          <span>placemarks have an applicable location</span>
        </template>

        <template #support>
          <div id="addedSources">
            <h3>Source maps</h3>
            <p v-for="(source, i) in placemarkSources" :key="i"><a :href="source.url">{{ source.name }}</a></p>
          </div>
          <form class="panel-section" @submit.prevent>
            <h3>Import a map</h3>
          <input v-model="KMLlink" id="KMLlink" type="url" placeholder="Paste the map's URL here">
          <textarea v-model="KMLfile" id="KMLfile" name="KMLfile" cols="30" rows="10"
            placeholder="Paste the entire content of the KML file here."></textarea>
          <button class="login-button color-transition short" @click="processKML">Process KML file</button>
        </form>
        </template>

        <template #main>
        <div class="map-results">
        <section class="map-result-group">
        <p class="list-description">
          The following <span class="underlined">{{ micronationsCompareSources.present.filter(micro =>
      micro.micronationalMap.location.applicable && micro.location.latitude === 0).length }}</span> micronations from
          the map seem to be <b style="color: var(--success-tone);">present</b> with an entry on TMD that <b
            style="color: red;">DOES
            NOT</b> have location info:
        </p>
        <div class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in micronationsCompareSources.present.filter(mic => mic.micronationalMap.location.applicable && mic.location.latitude === 0)"
            :key="i" :present="true" :placemark-info="item" />
        </div>
        </section>

        <section class="map-result-group">
        <p class="list-description">
          The following <span class="underlined">{{ micronationsCompareSources.present.filter(micro =>
      micro.micronationalMap.location.applicable && micro.location.latitude !== 0).length }}</span> micronations from
          the map seem to be <b style="color: var(--success-tone);">present</b> with an entry on TMD that already has
          preexisting
          location info:
        </p>
        <div class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in micronationsCompareSources.present.filter(mic => mic.micronationalMap.location.applicable && mic.location.latitude !== 0)"
            :key="i" :present="true" :placemark-info="item" />
        </div>
        </section>

        <section class="map-result-group">
        <p class="list-description">
          The following <span class="underlined">{{ micronationsCompareSources.missing.filter(micro =>
      micro.micronationalMap.location.applicable).length }}</span> micronations from the map most likely don't yet
          have an entry on TMD:
        </p>
        <div class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in micronationsCompareSources.missing.filter(micro => micro.micronationalMap.location.applicable)"
            :key="i" :present="false" :placemark-info="item" />
        </div>
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

.micronations-list {
  min-width: 0;
}

#KMLfile {
  margin-bottom: 10px;
}

.micronations-list {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
  gap: 12px;
}

</style>
