<script setup>
import PlacemarkEntry from '../components/PlacemarkEntry.vue';
import ModerationToolWorkspace from '../components/ModerationToolWorkspace.vue';
import { placemarksDirectory } from '../assets/googleMyMapsSources';
import { notify } from "@kyvg/vue3-notification";
import $ from 'jquery';
import { useDirectoryData } from '../composables/useDirectoryData.js';

const { micronationsDirectory, userIsModerator } = useDirectoryData();
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

<script>
export default {
  components: {
    PlacemarkEntry
  },
  data() {
    return {
      KMLfile: '',
      KMLlink: ''
    }
  },
  computed: {
    micronationsCompareSources() {
      const that = this;
      let presentArray = [];
      let missingArray = []

      placemarksDirectory.forEach(function (element) {
        const check = that.micronationsDirectory.find(mic => [mic.name.main, ...(mic.name.alt || []).map(name => name.main), mic.name.mainAlt]
          .some(name => name && that.normalizeString(element.name).includes(that.normalizeString(name))));

        if (check !== undefined) {
          presentArray.push({
            ...check,
            micronationalMap: element
          });
        } else {
          missingArray.push({
            ...check,
            micronationalMap: element
          });
        }
      });

      return { present: presentArray, missing: missingArray };
    },
    placemarkSources() {
      let sources = [{ url: 'url', name: 'name' }];

      placemarksDirectory.forEach(function (element) {
        if (sources.find(el => el.name === element.source.name) === undefined) {
          sources.push({ url: element.source.url, name: element.source.name })
        }
      });

      sources.shift();
      return sources;
    }
  },
  methods: {
    async processKML() {
      const cleanKML = this.KMLfile.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/\n {8}/g, '').replace(/ {4}/g, '');
      const documentData = {
        name: $(cleanKML).find('Document name:eq(0)').text(),
        url: this.KMLlink
      }
      let placemarksArray = [];

      $(cleanKML).find('Placemark').each(function (i, obj) {
        const checkName = $(this).find('name').text().replace(/>/g, '');
        const checkLong = $(this).find('Point coordinates').text().split(',')[0].trim();
        const checkLat = $(this).find('Point coordinates').text().split(',')[1];
        const checkFlag = $(this).find('description img').prop('src');

        placemarksArray.push({
          source: {
            url: documentData.url,
            name: documentData.name
          },
          name: checkName !== undefined ? checkName : '',
          location: {
            long: checkLong !== undefined ? checkLong : 0,
            lat: checkLat !== undefined ? checkLat : 0,
            applicable: $(this).find('description').text().search(/non-territorial/i) === -1 ? true : false
          },
          description: $(this).find('description').text().replace(/>/g, ''),
          flag: checkFlag !== undefined ? checkFlag : '',
        });
      });

      console.log(placemarksArray);
      notify({
        title: "Processing complete",
        text: `All placemarks from the KML file have been processed. Check the console to download the array and add the elements to googleMyMapsSources.js.`,
        type: "success"
      });
    },
    normalizeString(string) {
      return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
  }
}
</script>

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
