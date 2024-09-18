<script setup>
import store from '../store';
import PlacemarkEntry from '../components/PlacemarkEntry.vue';
import { placemarksDirectory } from '../assets/googleMyMapsSources';
import { notify } from "@kyvg/vue3-notification";
import $ from 'jquery';

defineProps({
  micronationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
  },
  moderatorsList: {
    type: Array,
    required: true,
    default: store.getters.moderators
  },
  userIsModerator: {
    type: Boolean,
    required: false,
    default: false
  },
  user: {
    type: Object,
    required: true,
    default: {}
  },
});
</script>

<template>
  <section class="site-section">
    <div id="notEnoughPrivileges" v-if="!userIsModerator" v-show="micronationsDirectory.length !== 0">
      You don't have sufficient privileges in order to work with stored placemarks.
    </div>

    <div v-if="userIsModerator" id="responseText">
      <div id="actionPanel" class="page-area">
        <div class="panel-section">
          <p class="micronations-stats">
            <span class="underlined larger">{{ placemarksDirectory.filter(mic => mic.location.applicable).length
              }}</span>
            placemarks for micronations on Google My Maps instances with an <span class="underlined">applicable
              location</span>.
          </p>
          <div id="addedSources">
            <p>Source maps already added to this tool:</p>
            <p v-for="(source, i) in placemarkSources" :key="i"><a :href="source.url">{{ source.name }}</a></p>
          </div>
        </div>
        <form class="panel-section" @submit.prevent>
          <input v-model="KMLlink" id="KMLlink" type="url" placeholder="Paste the map's URL here">
          <textarea v-model="KMLfile" id="KMLfile" name="KMLfile" cols="30" rows="10"
            placeholder="Paste the entire content of the KML file here."></textarea>
          <button class="login-button color-transition short" @click="processKML">Process KML file</button>
        </form>
      </div>

      <div class="page-area">
        <p class="list-description">
          The following <span class="underlined">{{ micronationsCompareSources.present.filter(micro =>
      micro.micronationalMap.location.applicable && micro.location._lat === 0).length }}</span> micronations from
          the map seem to be <b style="color: var(--success-tone);">present</b> with an entry on TMD that <b
            style="color: red;">DOES
            NOT</b> have location info:
        </p>
        <div class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in micronationsCompareSources.present.filter(mic => mic.micronationalMap.location.applicable && mic.location._lat === 0)"
            :key="i" :present="true" :placemark-info="item" />
        </div>

        <br>

        <p class="list-description">
          The following <span class="underlined">{{ micronationsCompareSources.present.filter(micro =>
      micro.micronationalMap.location.applicable && micro.location._lat !== 0).length }}</span> micronations from
          the map seem to be <b style="color: var(--success-tone);">present</b> with an entry on TMD that already has
          preexisting
          location info:
        </p>
        <div class="micronations-list">
          <PlacemarkEntry
            v-for="(item, i) in micronationsCompareSources.present.filter(mic => mic.micronationalMap.location.applicable && mic.location._lat !== 0)"
            :key="i" :present="true" :placemark-info="item" />
        </div>

        <br>

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
      </div>
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
        const check = that.micronationsDirectory.find(mic => that.normalizeString(element.name).includes(that.normalizeString(mic.name.main)));

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
      const cleanKML = this.KMLfile.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/\n        /g, '').replace(/    /g, '');
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 5%;
}

.panel-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.micronations-list {
  height: 640px;
  overflow-y: scroll;
}

.micronations-stats {
  font-size: 18px;
}

.micronations-stats .larger {
  font-size: 24px;
}

#KMLfile {
  margin-bottom: 10px;
}

.micronations-list {
  display: grid;
  width: 100%;
  grid-template-columns: 20% 20% 20% 20% 20%;
}

.list-description {
  font-size: 18px;
}

@media (max-width: 1250px) {
  .micronations-list {
    grid-template-columns: 25% 25% 25% 25%;
  }
}
</style>