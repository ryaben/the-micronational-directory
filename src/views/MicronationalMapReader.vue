<script setup>
import store from '../store';
import EntrySource from '../components/EntrySource.vue';
import DirectoryEntry from '../components/DirectoryEntry.vue';
import { db } from '../firebase/init.js';
import { doc, updateDoc, arrayUnion, GeoPoint } from "firebase/firestore";
import { notify } from "@kyvg/vue3-notification";
</script>

<template>
  <div id="responseText">
    <p class="micronations-stats">
      There are <span class="underlined">{{ micronationalMapMicronations.filter(micro =>
        micro.location.applicable).length }}</span> micronations pinned and
      located on <a
        href="https://www.google.com/maps/d/u/0/viewer?mid=1LtpI-6ss7kWFSMwX6Grouiz-hTuW8UA&ll=48.560772135784575%2C7.578602659694313&z=5"
        target="_blank">the map</a> with an <span class="underlined">applicable location</span>.
    </p>
    <p style="font-size: 16px;">Last downloaded KML file: Jul 7, 2024.</p>

    <br>

    <p class="list-description">
      The following <span class="underlined">{{ micronationsCompareSources.present.filter(micro =>
        micro.micronationalMap.location.applicable && micro.location._lat === 0).length }}</span> micronations from
      the map seem to be <b style="color: green;">present</b> with an entry on TMD that <b style="color: red;">DOES
        NOT</b> have location info:
    </p>
    <div id="micronationsList" class="micronations-list" ref="micronationsList">
      <div
        v-for="(item, i) in micronationsCompareSources.present.filter(micro => micro.micronationalMap.location.applicable && micro.location._lat === 0)"
        :key="i" class="map-micronation-container present">
        <EntrySource class="entry-source gmaps" v-if="item.micronationalMap.location.applicable" :flag-source="''"
          :size="36" :micronation-name="item.name" :icon="'Google Maps'"
          :href="'https://maps.google.com/?q=' + item.micronationalMap.location.lat + ',' + item.micronationalMap.location.long" />
        <h3>{{ item.micronationalMap.name }}</h3>
        <p>An entry seems to exist on TMD but does not have any location data:</p>
        <DirectoryEntry :info="{
        id: item.id,
        name: {
          main: item.name.main,
          mainAlt: item.name.mainAlt,
          title: item.name.title,
          titleAlt: item.name.titleAlt
        },
        flag: item.flag,
        motto: item.motto,
        type: item.type,
        languages: item.languages,
        capital: item.capital,
        currency: item.currency,
        foundationDate: item.foundationDate,
        location: item.location,
        memberships: item.memberships,
        contactInfo: item.contactInfo,
        websites: item.websites,
        author: item.author,
        approved: item.approved,
        creationDate: item.creationDate
      }" />
        <button class="login-button color-transition" style="width: auto; margin-top: 10px;"
          @click="saveLocation(item)">Save location on TMD</button>
      </div>
    </div>

    <br>

    <p class="list-description">
      The following <span class="underlined">{{ micronationsCompareSources.present.filter(micro =>
        micro.micronationalMap.location.applicable && micro.location._lat !== 0).length }}</span> micronations from
      the map seem to be <b style="color: green;">present</b> with an entry on TMD that already has preexisting location
      info:
    </p>
    <div id="micronationsList" class="micronations-list" ref="micronationsList">
      <div
        v-for="(item, i) in micronationsCompareSources.present.filter(micro => micro.micronationalMap.location.applicable && micro.location._lat !== 0)"
        :key="i" class="map-micronation-container present">
        <EntrySource class="entry-source gmaps" v-if="item.micronationalMap.location.applicable" :flag-source="''"
          :size="36" :micronation-name="item.name" :icon="'Google Maps'"
          :href="'https://maps.google.com/?q=' + item.micronationalMap.location.lat + ',' + item.micronationalMap.location.long" />
        <h3>{{ item.micronationalMap.name }}</h3>
        <p>It seems that exists an entry on TMD that already contains location data:</p>
        <DirectoryEntry :info="{
        id: item.id,
        name: {
          main: item.name.main,
          mainAlt: item.name.mainAlt,
          title: item.name.title,
          titleAlt: item.name.titleAlt
        },
        flag: item.flag,
        motto: item.motto,
        type: item.type,
        languages: item.languages,
        capital: item.capital,
        currency: item.currency,
        foundationDate: item.foundationDate,
        location: item.location,
        memberships: item.memberships,
        contactInfo: item.contactInfo,
        websites: item.websites,
        author: item.author,
        approved: item.approved,
        creationDate: item.creationDate
      }" />
        <button class="login-button color-transition" style="width: auto; margin-top: 10px;"
          @click="saveLocation(item)">Update location on TMD</button>
      </div>
    </div>

    <br>

    <p class="list-description">
      The following <span class="underlined">{{ micronationsCompareSources.missing.filter(micro =>
        micro.micronationalMap.location.applicable).length }}</span> micronations from the map most likely don't yet
      have an entry on TMD:
    </p>
    <div id="micronationsList" class="micronations-list" ref="micronationsList">
      <div
        v-for="(item, i) in micronationsCompareSources.missing.filter(micro => micro.micronationalMap.location.applicable)"
        :key="i" class="map-micronation-container missing">
        <EntrySource class="entry-source gmaps" v-if="item.micronationalMap.location.applicable" :flag-source="''"
          :size="36" :micronation-name="item.name" :icon="'Google Maps'"
          :href="'https://maps.google.com/?q=' + item.micronationalMap.location.lat + ',' + item.micronationalMap.location.long" />
        <h3>{{ item.micronationalMap.name }}</h3>
        <p>Seems that there is no entry for this micronation on TMD. But here is the location info!</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      micronationalMapMicronations: [
        {
          "name": "Kingdom of Wegmat",
          "location": {
            "long": "-88.0278322",
            "lat": "41.8911155",
            "applicable": true
          }
        },
        {
          "name": "Republic of Suverska",
          "location": {
            "long": "-105.4589501",
            "lat": "50.4046167",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE4m4YGqcG-4SISZPDibHUtqXCIm-CR9yzryLTJua4yjtA19SIxuLEuWzH1TMcEW7Hgir5JLr2c_KGQj-K31L9Fc1bR1tOzhT4L_GxrareiPAHZprXKXiex-3Rbmljf3E0iGMamDzePM_jbBTucU_B533rtMrsArYCvCxUl1wD3nwv-7hjnQ2z3WSZGhh9BPCiL70DaG3JWVYbWxBGfBEv51sRylhpT-1Ll6UPmPzL9vM22WZGde8PF7I0?authuser=0&fife=s16383"
        },
        {
          "name": "Vancouver Island Soviet Socialist Republic",
          "location": {
            "long": "-123.346158",
            "lat": "48.434664",
            "applicable": true
          }
        },
        {
          "name": "Principality of Kaetania",
          "location": {
            "long": "-121.3259375",
            "lat": "38.9055066",
            "applicable": true
          }
        },
        {
          "name": "Thegn-Hold of Siar Fordell",
          "location": {
            "long": "-122.7349885",
            "lat": "38.3107488",
            "applicable": true
          }
        },
        {
          "name": "Lazil Confederation",
          "location": {
            "long": "-121.3235475",
            "lat": "38.8998752",
            "applicable": true
          }
        },
        {
          "name": "Imperial Republic of Donkrea",
          "location": {
            "long": "-4.2716626",
            "lat": "55.8621417",
            "applicable": true
          }
        },
        {
          "name": "Etat-K",
          "location": {
            "long": "3.876716",
            "lat": "43.610769",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG2KeOfce2omGZBJqiTUxnUNC-RcVKxHf91QuGRJ716I_g2vxTONpXj4eLZk4wmT-7b31yF1e2VW_YzO-Pk1uY0IgcT8OvNU6IbA3Z7KcuQLsxZELKN87M21fSWgSctAjKOPeQ6epL51gdQGR31fYMHDpIUzCrbdqcVmI8FROJiWJ1_tDxqf3bJ1umWYbviwcSzXZs2tQkHvLXVIboO1GAxWII4da3XIj6VLOeadSfWDtLH3RSDVS5LRHuVTg?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Kolinaric Republic",
          "location": {
            "long": "-4.2611568",
            "lat": "55.8629315",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFDhOmvHlSIlQgkrpmWnYL04JoqRU_PFTw2W1If5O9CSU9SEdxv7x1UrqadC-_5y1rztffKY-ejnfU3QgWbe2UUMi-lbzI0PkUISw4pAm7rr6nkNdmb-c_n6oL3kbKH80LjttshSOZ1T1_AHI0-y8MzPdUL7Pj0lJ4-Z_61TK2N8jRPfmA9UmwnnGuLpyH9ysW6owaZwbqpCl_rzjYi_muHUldKARfStJJQOAMIBVEQa3vh1-O7ixW0L8g?authuser=0&fife=s16383"
        },
        {
          "name": "Hutt River Principality",
          "location": {
            "long": "114.4711709",
            "lat": "-28.0739101",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGIUx5m9tq4BbOU0R2jeJ18weEs0RSmnNgFkqwZyM8NGwIJqzghnw3_FfZa5_LbJwpgRVewBaz6yA1XpNCkFnaqYMEoQ6bLT9Tl7hhJvWcl4vWFQf4Yb5YW_sDNiG0hHEBkTYPiu5JaNK9B81VzOyU4C6zCTBP1HSKccgJVkiSz8u3FgBAf69KhVbtVpobOOLz3fzlnoF6Yymvzn6DRFxBjDskvHO6qfFBl-G0XQXj-PaWwXzC8TIzM_QM?authuser=0&fife=s16383"
        },
        {
          "name": "The Republic of Rose Island",
          "location": {
            "long": "13.0373204",
            "lat": "43.9800913",
            "applicable": true
          }
        },
        {
          "name": "Sprinske Empire",
          "location": {
            "long": "-4.2560414",
            "lat": "55.847207",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuES1IEua64gzf8cf1bhJJaX33vl7MDWocRRzr6gFbpO_unJhXMryHQjOD3ojw23SKAtMAHdFdLD1J7S2OmFMow5rEdzAd2QtfJjVxGE6Dy8z89bQhPjwbSTbRMqjtIjqAop-2foEekYF3LeWQHXGkX3Eg7rlI5MsTrw2TtthZTrzWwVa-qRTohZ4SROYsZwpcfFj-IfeDJKQJGlQZj3fHFAnIV5Vs3obuLMkngcuQckvBUoN8FXUbpgB1M?authuser=0&fife=s16383"
        },
        {
          "name": "The Union of the Free",
          "location": {
            "long": "-4.2876344",
            "lat": "55.8479162",
            "applicable": true
          }
        },
        {
          "name": "Democratic Republic of Sprinskè",
          "location": {
            "long": "-4.2896834",
            "lat": "55.8740537",
            "applicable": true
          }
        },
        {
          "name": "Sprinske Communist Republic",
          "location": {
            "long": "-4.2695342",
            "lat": "55.8369011",
            "applicable": true
          }
        },
        {
          "name": "Republic of Donkrea",
          "location": {
            "long": "-4.30009",
            "lat": "55.8542486",
            "applicable": true
          }
        },
        {
          "name": "People's Democratic Republic of Sprinskè",
          "location": {
            "long": "-4.2355452",
            "lat": "55.8584879",
            "applicable": true
          }
        },
        {
          "name": "Republic of Sprinske",
          "location": {
            "long": "-4.3071911",
            "lat": "55.8431583",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEVPAjILL04y0NYPW_s7VqHgL3nqnlZFOK52buY4IwyZ6BStFrkVH3BATgGBMLkU-x_wx8RiP31rIICbPWQp5ylxl2fu4AUyOta6XzQqsBKY7R0n9nwVWkKsFK6lKyw59hare3jk3yQVpvaScn39zJNRcK8ZAHYi9cb_nwgPf3l6G7Av_AQ_bp8reUyBCobYmUr01akysBx65teAiBssb57PN-P-1mK0x6EywgG7a6-lisVUsJjZh6Gt2c?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Dragos",
          "location": {
            "long": "-96.0631699",
            "lat": "27.5279708",
            "applicable": false
          }
        },
        {
          "name": "Principality of Novapara",
          "location": {
            "long": "-122.2853518",
            "lat": "46.603504",
            "applicable": true
          }
        },
        {
          "name": "Technostellar",
          "location": {
            "long": "103.2568428",
            "lat": "7.2867879",
            "applicable": true
          }
        },
        {
          "name": "Antonian Empire",
          "location": {
            "long": "-0.8585724",
            "lat": "52.4476763",
            "applicable": true
          }
        },
        {
          "name": "People's Republic of Courtica",
          "location": {
            "long": "-123.3354638",
            "lat": "48.4281973",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Ridab",
          "location": {
            "long": "-88.0044863",
            "lat": "41.9197334",
            "applicable": true
          }
        },
        {
          "name": "Empire of New German",
          "location": {
            "long": "-87.9835746",
            "lat": "41.9489219",
            "applicable": true
          }
        },
        {
          "name": "Democratic Weimar Republic",
          "location": {
            "long": "-87.997996",
            "lat": "41.9489285",
            "applicable": true
          }
        },
        {
          "name": "Philmont Confederation",
          "location": {
            "long": "-105.0447959",
            "lat": "36.5672125",
            "applicable": true
          }
        },
        {
          "name": "Hillenbrand Republic",
          "location": {
            "long": "-105.0996261",
            "lat": "39.5389661",
            "applicable": true
          }
        },
        {
          "name": "State of North Fox Island",
          "location": {
            "long": "-85.7828792",
            "lat": "45.4805649",
            "applicable": true
          }
        },
        {
          "name": "Grand Republic of Kapreburg",
          "location": {
            "long": "-71.4030136",
            "lat": "41.8193611",
            "applicable": true
          }
        },
        {
          "name": "Republic of Kapreburg",
          "location": {
            "long": "-87.6228661",
            "lat": "41.6432399",
            "applicable": true
          }
        },
        {
          "name": "Federation of Kapreburg",
          "location": {
            "long": "-87.614283",
            "lat": "41.6454206",
            "applicable": true
          }
        },
        {
          "name": "Protzkyan World Republic",
          "location": {
            "long": "-87.6053566",
            "lat": "41.6541429",
            "applicable": true
          }
        },
        {
          "name": "Republic of Zekia",
          "location": {
            "long": "-87.6070733",
            "lat": "41.6456772",
            "applicable": true
          }
        },
        {
          "name": "People's Republic of Tesforia",
          "location": {
            "long": "-73.134961",
            "lat": "40.789142",
            "applicable": true
          }
        },
        {
          "name": "The Confederation of Patchogue",
          "location": {
            "long": "-73.1425141",
            "lat": "40.7896619",
            "applicable": true
          }
        },
        {
          "name": "Republic of Islandia",
          "location": {
            "long": "-73.1389951",
            "lat": "40.7906366",
            "applicable": true
          }
        },
        {
          "name": "Republic of Wendatia",
          "location": {
            "long": "-83.3340423",
            "lat": "42.5969312",
            "applicable": true
          }
        },
        {
          "name": "Co-operative Republic of Wendatia",
          "location": {
            "long": "-83.3370056",
            "lat": "42.5976069",
            "applicable": true
          }
        },
        {
          "name": "Duchy of Pontchartrain-Maurepas",
          "location": {
            "long": "-90.1528519",
            "lat": "29.9840922",
            "applicable": true
          }
        },
        {
          "name": "State of Horokria",
          "location": {
            "long": "-1.6755994",
            "lat": "53.8695488",
            "applicable": true
          }
        },
        {
          "name": "Republic of Aweland",
          "location": {
            "long": "-1.76261",
            "lat": "53.8108176",
            "applicable": true
          }
        },
        {
          "name": "Republic of Bonumland",
          "location": {
            "long": "-84.4493725",
            "lat": "33.6534427",
            "applicable": true
          }
        },
        {
          "name": "Free Republic of Florania",
          "location": {
            "long": "-121.8107818",
            "lat": "45.7380761",
            "applicable": true
          }
        },
        {
          "name": "West River Confederation",
          "location": {
            "long": "-80.3826567",
            "lat": "43.1922138",
            "applicable": true
          }
        },
        {
          "name": "Democratic Kingdom of Benjastan",
          "location": {
            "long": "-80.3844996",
            "lat": "43.1940203",
            "applicable": true
          }
        },
        {
          "name": "Seabourgian Commonwealth",
          "location": {
            "long": "-82.1458248",
            "lat": "29.2096584",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Altavia",
          "location": {
            "long": "-82.0989736",
            "lat": "29.5512899",
            "applicable": true
          }
        },
        {
          "name": "Commonwealth of Altavia",
          "location": {
            "long": "-82.0969383",
            "lat": "29.5565054",
            "applicable": true
          }
        },
        {
          "name": "National Republic of Alexandria",
          "location": {
            "long": "-82.095945",
            "lat": "29.5547499",
            "applicable": true
          }
        },
        {
          "name": "Czardom of Heletia",
          "location": {
            "long": "-82.0982739",
            "lat": "29.5553395",
            "applicable": true
          }
        },
        {
          "name": "Windovian Commonwealth",
          "location": {
            "long": "-81.43558",
            "lat": "29.9430859",
            "applicable": true
          }
        },
        {
          "name": "State of Scott",
          "location": {
            "long": "-84.4904939",
            "lat": "36.409801",
            "applicable": true
          }
        },
        {
          "name": "Autonomous Digital State of Saphoria",
          "location": {
            "long": "-90.1741055",
            "lat": "59.5879612",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHbhFvFVDJDJacsQCJ17OiFt9sbWuL6xVezyBwypyJOgYdAp0_I-8iuLYpc5I9g79aSXDZg_A-rX6ZWa030AaniraK_FOdNbPOu0dKisoeHUl1k19gyN7Bry8LRO354OIRGLEgaC_h3Uj_BogzYbI9ZkKEjQkHzBetZAO_Z82pRAXQX0Yy5Jxrfne9IhhPnlkK6JY3qTae7px8ogkgQR2lFI8dzuWw3fKzjYU4ikMSBCh-XpcBpFYJADqk?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Freedonia",
          "location": {
            "long": "-96.3819882",
            "lat": "27.3455023",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFS4XQrk4djAAuvk8kjhVEwaWMrGA5W8S1_ENctAX0qVZ5YTvCVnJ3GZ58pZILE0hkggLhxNs5gCw8YNhF8sptQVssCSB2jrSBeiGX2uwMGYHJ_vGKcoIS--baGrgMwJqN246ELRbZVWR9zy8TJDpC0ynpudJjhsCMXNRdmws_6yxRD3xNJ-fx0R-As7BWnbxY6GvNkuMqSElBJcnZET8SVwj6oxFxMG46qd2fm96e_98c4AjGAb_6cnhs?authuser=0&fife=s16383"
        },
        {
          "name": "Frestonia",
          "location": {
            "long": "-0.2174356",
            "lat": "51.5101459",
            "applicable": true
          }
        },
        {
          "name": "Republic of Minerva",
          "location": {
            "long": "-179",
            "lat": "-23.8333333",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHCPSUxlJEewsuWR5bzC_cq2YkWSm9kQQ-thdijTkEcBcR3gUG3GWpAMoLB-rWlCwtFGUDeyyyRmA-gQrrlsv6FqNq-VhIXlRunXk12aZf9OMBgHiQgGYap1DsCoN2Y4AaXuLr_8CJX4bK_x7uC0zeynwbQ-cV_ARznY4yfq2c61DBRVOjhBCBVE6uMsB_d2J2WPe9_j30Cnc-bojxqjyONCxmPLfZ6YQEbmt4DMdhxcmnRU-4gXMMgn4o?authuser=0&fife=s16383"
        },
        {
          "name": "Sultanate of M'Simbati",
          "location": {
            "long": "40.3304311",
            "lat": "-10.4611326",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEPOMGtkJy04JsJMeiihlD6PzuY8oTeHn_FDCLKWKEcM_Mjm3O-qv6G6XvIfX1z4oQadx_3ei3ePA6LyhKxC7NwpevcQuR3wNYCMI8v2dEbC4qJ4yw6TZcsbf3MtWYn5v12fEMZzA8ki0OOquglF_v3DVOwwGjYaXnZfO7RYejRowxpJ5KfPFeZT0OvIPHtUI013FEqlw-sJUNEyCL62_yKSoAxDwwjvZccpv4FMUIN0CNUyhZU8P9Bi8s?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Morac-Songhrati-Meads",
          "location": {
            "long": "115.8036775",
            "lat": "10.7324318",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF7XOdYceGuXxuLRLuiXXkZ8Z1YqYbP3ZRwkkflzw_Hwxi66h_Q6YcbS5o6TFihc867_uzzQk4Vq0XmlCoEF67TO1YK6cr8pAKQuFESMyEleRvPNNcA6eSCpJObTUzbTwNrOuSr8H_ULTHHn-G-HfXmav54cVd-S4kw5O35g5X0yoS3mdDEOpCEAad5WEcBY7rE9U_bn5WpapjNSV8RRQaRy1-6vNaRBUp7fBfBzX5kFMGqEFoF77oYE20?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Humanity",
          "location": {
            "long": "115.8026596",
            "lat": "10.7341184",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHqLmathpqhQTVGGndwHNRwfd5zjbkjXUf6e8nH9AcvjzXkGP7k4rucPfv-VCPvMfjUPx0yvWzzW3sGDwKydf8k327-4jthqeGCUBFecN0S1Uoxs9-YaUrg0Xa3mSL6c6dwRWERQ81TmA0F8PTt5MN5bTNebwOQuSsTruJHn7Oran3IbscmlTOU_0tYiUEeE4whDbNFlZXlbSajxdVVYLHH8rUd0jzoovqbaBPmXA7yllupxf83hBWEb5g?authuser=0&fife=s16383"
        },
        {
          "name": "Free Territory of Freedomland",
          "location": {
            "long": "115.8030029",
            "lat": "10.7309982",
            "applicable": true
          }
        },
        {
          "name": "Kalakuta Republic",
          "location": {
            "long": "4.6473821",
            "lat": "8.0350323",
            "applicable": true
          }
        },
        {
          "name": "New Atlantis",
          "location": {
            "long": "-78.060355",
            "lat": "18.0802202",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH65UZ4TqtRXFFty-WwcRwgILE3YC7SFCe1CQ3iAVOY_uoI251f_VTvCiYE1jE3h4ff7d6xL4A2RVfkHkjFmFNh_iONlt74ufpxDAbOXb6BFqyFWU2M4A0nrimbPuHvf_5mGBnKVXr93bZi1n0rv-ZePEFcSdtSfkjYvQwQU6GMWIQ2HxiXC_nIXvl12PHe8-7dKV0i_kdMU2hbS9Z8UyZ-RfiPACbRkd8L4C6lPxmSpMMCPT_29X9wdKQ?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Malu Entu",
          "location": {
            "long": "8.304738",
            "lat": "39.9895092",
            "applicable": true
          }
        },
        {
          "name": "Sunda Democratic Empire",
          "location": {
            "long": "107.6191228",
            "lat": "-6.9174639",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFyc7TBhI5TgMkgHzfTaNk0-l9mIMwJWo-ymAu0Js8sJsJdZPCdrRX09HrP-VnwmM0O5bIMfH6Fo8aeANXVey5-8LUu4AnpDAGJzGqCJXiLoQeXy0Fuzh9tkhOTCzoezlAKcxogM2P3P5ITT_6lAZM7WwSs4q5KBBIzGqmqCAVaqzS2AVozzmX9C-xCRYCgNgbn5tp_d9MUMxBQfuiSX6RKBwibuRBYsoAT2PzkVzOXVRV1Q_-Krj47Au8?authuser=0&fife=s16383"
        },
        {
          "name": "The Universal August Throne",
          "location": {
            "long": "109.9989416",
            "lat": "-7.6964509",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEWkQwCidfBATFUjtlgHeGfXkcBr-essSCQ0nHl3-G1yofBsYnPnUUeyUf7N13bbqZbEr4-fjQ1237JKetFZL6NTgyf9ZEmLeb7kTNI3Zw0KnZrST-eQ-0srUAxJcKnFkRCIQDozw6sZgUSjwPiOYDvso56hmqmVhr_8BxlbxuDwh9tjUv2ktOZMmdE-i6jJ2xL2ThAz1VeTNpKzf5BtWiMhGYrAOx1Y1ZKCsKnhfCl9YgiMM3_hnVIwg4?authuser=0&fife=s16383"
        },
        {
          "name": "Free Republic of Wendland",
          "location": {
            "long": "11.3555325",
            "lat": "53.0469492",
            "applicable": true
          }
        },
        {
          "name": "Village Republic of Rüterberg",
          "location": {
            "long": "11.1884007",
            "lat": "53.1514622",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHdYMWom5KVh9ZVMT9xhmE5ckGAUjODnEH2E0GpuMRPwpcoRADDYNau357MxQ19UwjMs0kp3t_Y797pM5JRKGkDwji5EpdhjK8GVYN5GK8py4eswftIzFg0LIajkT6IlMxozVa4mClQymySFsMXze3BVsu2BGzi4II1nozz7SMAszL0h3hsvsxRFWUEIioeFgXihFgAQSwWUDtgAd9GxwJFqF_94ZhqkbxoTT8duBSLQs4qWj9LOnN14H8?authuser=0&fife=s16383"
        },
        {
          "name": "Bunte Republik Neustadt",
          "location": {
            "long": "13.741028",
            "lat": "51.0655758",
            "applicable": true
          }
        },
        {
          "name": "Other World Kingdom",
          "location": {
            "long": "15.741944",
            "lat": "50.6525",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHmy1KkW68MAktgy0hZL4MSJptJDh8_FkfBDZdyEn4nzMz4kk2Mxx0a4hDatWSoWRfC--gPdi00wDQ5XQl4Yo3Uevt9yiQXMIncRvJ4FUjlTQ_TJkISyJo9r7uMFMiEmd7m-2hwiGD4oUPlZpeGU-xOyA8spxwWRs45xeKob4wNigAU-sU95SdbaYow1al4ThpPq65OMv8oaHqpyfKhWytUCimy80jhkh-OYinxje5fa6ENAn3YlUrmeyk?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Vikesland",
          "location": {
            "long": "-99.9514807",
            "lat": "49.8437486",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEPwg1H3kYajlaAPfqvxgB2JltZsRWLYgn_TupGb7e4gd0B-LOxZai6GFTcRWZpI0dIOKEVV6s3cfFCDaEH7DkKfEmgpMM5G3YdnGahbSQqbUtc1j-G7tAb44nLw_uH0dFIckgWRqbVgCAuWVrhyA1UaefZG3iPbS2AWfTtTVUARQOQ33h_YIFymtbqus6v2oVzFa4ibQPf4TeVDuz5rHL2Yx10kYeIw7IvDzqE9dlhpJC8KNrdR6-JXeI?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Outer Baldonia",
          "location": {
            "long": "-66.0233554",
            "lat": "43.5994367",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEY2etpl48eJQDaAIlmu4sDuZ5G8yw5AIl62yhGV62cf7d_PUGRsCMFyJIW7C-XdQG2p22dHymTqfp0oS9X8XNkD0EWV59u81GZt_ztI1C35d9_zs9lC28bTL0mhp-VdKXm6gVjl8hcF7PeHXwY54Oq3kG26ofVTvMITULnNBWOMHpy4DMN1zBqLal6_mDJH4rlHPkvajakTrYYJVN9NlL_9t6EKGo9sI1Dm20eNACYs1Iwa0IofhyLnTg?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Trinidad",
          "location": {
            "long": "-29.325",
            "lat": "-20.525",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF8GqwvLeFggK4l_Avetqz0ds57cvR_uAjfMFHO2DuUL_HgdUvfy4MA57XlYBc6uNIlpSUMQx6Jc5SIwePVShhJ6EPhMjrnrlTKjdLRSPTxplcizoNladIZIUbj9XjwEdCaSouEE6MhiOkm0E0_Vho5e0KU5AAY8yuqag8YXub8ipJahfiN4zHbyxwNwRd4U60J63wrgAuFKOrZONu1-nr5CO6KPLJREk0mQYvDRMtSyaiA9e6IiIz-YUY?authuser=0&fife=s16383"
        },
        {
          "name": "Operation Atlantis",
          "location": {
            "long": "-76.9489283",
            "lat": "26.7260342",
            "applicable": true
          }
        },
        {
          "name": "Independent State of Rainbow Creek",
          "location": {
            "long": "146.6947889",
            "lat": "-38.0140356",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH7Qm4589jUOujmwTgBny2Cw5LcCZgXonRfLgmvgruz1MgFWD9xdA2ihJqrPzrYc5TiPSjIjWdEzns6rYqvYK6TuXHieynGSRd4IxLM7IM6fA_PoOUFpnMBplVz21-FQa2fJDupuHJ9TcEvppZTM8N3DmHrJIoDAugDdc9e3QR0RKVqySjSJkIGJeN-_WzjeSvQ_sD08TNgJJ5T9VJPkYD4HFYp1NG0ZtfC3JOqbhgUgY4eDG3-qf8l7n8?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Marlborough",
          "location": {
            "long": "149.151791666667",
            "lat": "-22.5050527777778",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEGrRKGZ4nuNhwe_F8CTvpWd0bTL6iY9xfRYjaEHNj7E8LFd23FQkYq5y2x0VQKJdiHsLs-jmo7iSAeVMWcxLL45vAREgyWD_FFwyXkYbFpNSTV7IKN5OSCDoOTNCc7JzxZnpkHoz-7V-igZI9BPbB5agYNJjm48QFV7CPOz7mXSbSviqYyjv6uVd7PLcjx7Cms-JvthFcBUmiCiBmkRGzUySVIGybBoc7yauvCxLjt_c0QmGDBNJDS-Oo?authuser=0&fife=s16383"
        },
        {
          "name": "Gay and Lesbian Kingdom of the Coral Sea Islands",
          "location": {
            "long": "150.6314939",
            "lat": "-20.6879372",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEcgzP0DM8_zE9Bg_O1avkoRVto0cBRkuDRIdXSrrxwB3baVqKUNUQA72oC5n6BOFL1Gwx2q2DywLNX-fFnXVcvoagmBrgjpxQ3v0oE_RpbvRMDxreRS4kJ6-sxWMjUxWv7Qx0TsSrnQgay7JvYODQFi_pEH6FEVAxF9kWG0aphegZcHLbmNwl5Gn80lf2dNvqyNVb8S6ybWS6J5zMRmyHIU_AzSWlu-NJsEYCCpE0PS4XXF5YhMCquw0c?authuser=0&fife=s16383"
        },
        {
          "name": "Province of Bumbunga",
          "location": {
            "long": "138.229",
            "lat": "-33.915",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEc0YouHaSYbqfG5OtWB8VHY3eqWb5ehxR-2perFKiHaCynensVJ8Oaw0LdftkG3Jm9_OfjGD32H6lNZo3llAPQDG-qgLfjrBGOgafZYyyQNDjxIt0sgst7EIkX5GGMCxEqedgU3U9K7UnDm925Ex0zJkyXpG94nenoI9wT5eGK13H8USv-KdK6LucecSshXVNibEBugNtAKbQKKiw7MVs5ub_fu1LEf_Ms4TwEiMg4OCIX1NThz7xJ14k?authuser=0&fife=s16383"
        },
        {
          "name": "Sovereign State of Aeterna Lucina",
          "location": {
            "long": "149.1297882",
            "lat": "-36.2268655",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHTUZIZ_-EOJj8dTE_3g-MEIX3re4dW31jE5xYoI7M40Dhc-2sASIV7OaKPIZEt3luQwj-m8DIA4Exv-Y-ro9Glbr-19An3eSxf7y7Ij9iZSc7fDmusEMoex0aAllZXfjkM23mqafjBdI759XiZqlEsUkyeDje4XXKit6hR1V_yFbyTRPAhtk_HjXY3GIfVd1TOrPAVs8gY32P40jmUHtgtF6pgoCs2rBEA1DWyOFpTaW9uTMtAmZa54po?authuser=0&fife=s16383"
        },
        {
          "name": "Romanov Empire",
          "location": {
            "long": "42.2244042",
            "lat": "67.9659372",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGPOCDQjdGRCyNY9DaRypEEoTC5OmOi4CPhOaKzQ-_j6B3HB1vG22XGIOPsX0lM4GQFarCa92nP2wGTW9dkp7LjhVcrcCj3cuNLjuY58XAJKog2Yt5vj239-YJATCMUWZndjc2hWFF8OPaBCOasZeDLsXe_hzT1LHMg9ze1uNSNHivea04j6SafjRLCsb_VqsBK9DFBNj88QcuvFmmXzk0CERo9irspKmW8lUM3YNMGGi41FEGdGGeZhB0?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of New Utopia",
          "location": {
            "long": "-83.8333333",
            "lat": "18.8333333",
            "applicable": true
          }
        },
        {
          "name": "Duchy of Mud",
          "location": {
            "long": "-95.9181569",
            "lat": "48.3067083",
            "applicable": true
          }
        },
        {
          "name": "Consulat of Surland",
          "location": {
            "long": "6.197442",
            "lat": "49.2674861",
            "applicable": true
          }
        },
        {
          "name": "Grand Duchy of Queensland ",
          "location": {
            "long": "105.2343867",
            "lat": "15.0841631",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHn87wnSU5uZ5SwBKBYELixLAZcsy6WHqsoC8-08vVFUEdRTwpy7bMCZ1nTT5JByS2FWYumW_a1T0ywAM4N_LY0c89ujMdZTLlpleoY1K9-FGUKEMchBH3YipKsd8OTqiKGh4WgFfyQYAlyuG4rXdkia--p8K3tvnz71XgKsYONE0ATmjoO-rN5XmIaJzoHBTHDu6XDtEprOFnP3Vp7zdPynFTA8fYneeBD2aaDdLxkxnTNOLtM7kjQlVA?authuser=0&fife=s16383"
        },
        {
          "name": "State of Queensland",
          "location": {
            "long": "105.2405665",
            "lat": "15.0709029",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHfs6i8Ieq-tlc3eoWzaFIY64qZKRjmfQ0qXsVhYxpZpWR14dj6ywHpvJyRyhrQ7IBHs3zVKEMvZXnTIz5wDoMHvgcaCc61M79wMNxNgs0pcEY61ZHDfb5ISFhM-uwn5ICAemN4tAbKCheLTgn2yWfVHue25NRVC1dtoaDTkKRuquHR8WPwAcoNnqTJQ6rkkeVLHH3Eqo7ELuXjJWCQ_SwcJAjdBO6AeMcDD7UKY1aBYJKsHvBSVYYf4xk?authuser=0&fife=s16383"
        },
        {
          "name": "Dominion of Bridgetown",
          "location": {
            "long": "105.2179072",
            "lat": "15.1000742",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG4GvIKdEGtaJT49plHM7j_Yze4-BaUFaI-Bi6m0zJsBQ5SlOOFex3mmTDs7n6CKTNak9iNX-60q0r-3oAafHx8_ypv6KujSieFID0ta35p1FGAkvJQFLLE91reNvPR1ISy32X8z4TTH4qCKgTBbAKrYwsnLAR7Qs2APXvZ03pasef1_BpwzARFMK0COgANGjna29LQ1j1TpH1npEM4q1hNQaBda7uzZNLnKB8SLiemLaoAavkdzt1zE9k?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Hashima",
          "location": {
            "long": "129.7385256",
            "lat": "32.6276331",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFUS8JVWxXZ3vuT_g1loIIhARJXDXaNWlPdjlJHIt_XXOZus-QpMBFaV1Z9IZcl37cgjKbL4KNbYByZLApINBb39Yf0ekMkzo4Rm_Q7SI6lselJMcxx2u6zpJQrKoEBFObgI0g4P-wIRbkt45zvSdO7YX5cBnlci7FJk_2ThFnh2tXzcuBPNZq8SA3ZFOnEyh3OAVLwc6CQbDw7JlaFDh43Lc0vacf5RcPpRf6D3vdXRmQAmH3tWvi9F1k?authuser=0&fife=s16383"
        },
        {
          "name": "Free State of Florensia",
          "location": {
            "long": "128.5055764",
            "lat": "35.753291",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHi_CY7Y_we7qvu8bokwzBD4FIGbRTMQ2lFEn_bpr30YKGXFkoqGkfuxo_wZBkVMGe5kLeP9a3aW8qxe7--wyRbc1tpw2u2Ka4rWIfyEGFE1R6OlSGE7kdfoq0nZ-bAZ6qx3FF-dtMZ5oTBC9w1opUbf-ZYw_1DSl6metsIkjYdw-wdpqty0r-Lf95aFcisgmD2M85Q9fySP7doB4mBxJ3_bBrfBYrTQCMeylkX2UrZ83RrqFT8lpyRlng?authuser=0&fife=s16383"
        },
        {
          "name": "Free Republic of Skarstan",
          "location": {
            "long": "-4.2771939",
            "lat": "55.8530298",
            "applicable": true
          }
        },
        {
          "name": "People's Republic of Hashima",
          "location": {
            "long": "129.7382907",
            "lat": "32.627597",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGs-4ZXdh24ms5VEp6aI2BY92tehb6qXjabjcpoC9l8G3fh3CJICF69aIw8XO6pNwkVu_3iCj5L5VAKkwd5bwBSv0s7imyvVO84-CXm56sAXEVDoNXT0S74R9_Mjxw3dORqqAbaD3wnqynQsrhJwLqOXQvIyIMz7IlDPgLihSEeV4E_dK6WbOqWao0fyHLRMFVbIt4CkQQ1fd5E8-z-XScYvJ0sL9Ol8gU17dVm841vx5pBgZtAvQYxSyI?authuser=0&fife=s16383"
        },
        {
          "name": "Überstadt",
          "location": {
            "long": "-122.3087405",
            "lat": "47.7881528",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHn0XLQJL5AMd0og3ZXNtLwegcdGjU3u4TckEdvkUjpbW4tM7ZN-eS0QRVkMx0BZ4TTnNuL5ZOpnMwEAuzWm5jUMtwQHxtl6Ppy-x660VjtEj0ME7jkCJoC-v4huxCCQwUmNzffNecqjAIg4NLliWMa5D8NqBkl6h1MrhvpL_jnLOWhYq-BrB8ReRPcs1H8GlDrLlSErrQAxFDzpasYvc7r_oisORymsjZjrmDcnNF_nd2m3sHvGYGDTdw?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Kaltarsia",
          "location": {
            "long": "-4.251806",
            "lat": "55.864237",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFiLc9uf-iP5g8UGbiImO_Y-l9yA8s_JqWYVusiAOH_mxe6QIgrMGYg-oFXeZ2fPH3GJ3VQca478E-msmxAACoXgPDk9I_lr5XMZ_3n1afrECWGSe8bropMGpvZw653jeuyhYBmwejwnNl6_TS7QhKT75MxrY992xp9-QIliEm2yK8IYIhVLFWOCsjzeGqTtm7KB0_FBv6GJBt8OA8JwOIRfN71yd2mpNUnRWNXF5vUhKQImEW5eGwc-W0?authuser=0&fife=s16383"
        },
        {
          "name": "Socialist Federal Union of Ponderosa Hills",
          "location": {
            "long": "-120.3821724",
            "lat": "37.9829496",
            "applicable": true
          }
        },
        {
          "name": "Duchy of Seitnam",
          "location": {
            "long": "-4.2686007",
            "lat": "55.8724682",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEl3p3qijrV_HFlkgmOgIsDG-fQveEooJkQbzFQ04dsl5BfF-biUy0khLAOaSnY9Lncv72DlSju0c6AzEaa2kOZ9wr4pOY4vLolx6EFhkLhVQblAEjzFoZNeHteU_rZIprE4-tCOYLU6Rs_K-4AyYz_MOFpsb3EiRfLZvPBSO4ksKP-rIZNhsgyb3MoiZEB-mUcE_QjH7lorcAe_3udkBj2k5BAbEO5K7uLY-aicMX4RqLP49c46LHdjtw?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Woodlandia",
          "location": {
            "long": "-81.0194283",
            "lat": "46.5212513",
            "applicable": true
          }
        },
        {
          "name": "Asworl",
          "location": {
            "long": "-4.2560305",
            "lat": "55.8744906",
            "applicable": true
          }
        },
        {
          "name": "Republic of Valentia Riqueza and Grandez",
          "location": {
            "long": "-54.6218477",
            "lat": "-20.4648517",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG7Edc-412lgZGxludM5se-NSnV75ogkPFwQbkgInV8jxdw95511bQGoCREhe607vpgikV0JBamK6VyaMkzY4w9RdHGiyed6gt4uNPwMvZpAE_QkDTzaWcLxJFYofjzFo8YTX6ezqSr378wVRTAV3650vpQ4GB41YD5O_Buv9eIzSXcpPi_VJkXQAVQ8ISs2PsjYEWFhEXmuQOomYR02Oq806J1hOQVPRbvOZc-i4nHjgEjjBwG6drrWFE?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Florenia",
          "location": {
            "long": "-72.7707401",
            "lat": "41.3057113",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFq4U5kXf3VN-73cHgAfrke44icWnZ27sKo55yQPgiKD8BoxI8G4m-SQUQLyrxyvN391j9zR1C-DWVb2-zbYMw-OPfB524SPX85qfmU1HTRqdOqj_szi7NChVWJkhSY9Y4LeJ7OSkoReE3se_TA23ICmQO6h__KI3_bKbssSffASav7T6lXDpbvPCfSnTufdPfuf8ExuZW1Al1-h-sJhuto1SM-8fIzqvafrva_PhU56eZ0qKATO7qd8zo?authuser=0&fife=s16383"
        },
        {
          "name": "Verd'landian Republic of Vladislavia",
          "location": {
            "long": "29.397801",
            "lat": "44.3125702",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHeTYD-Y3f02ki8_AFEkxLI1N9n2tEi0aq-MpWDYDdIq6YyE180BZK4UxHgaR1vxsDLQgvchwSL2erRzhLME5imqRSfZ20yPZf71gn5hwzqgLEFitnocb8ubaAsGpz4qhHSRYtvemvXJxme6jvnwkv4GfjLcvrG34NbDYe0d5-VeUbKwjdGtPIWha92i1bmozQZ444nudcEKvuL2RsQAVhBcRgVrSzyV06Ct2h_fZhbG017t1kVr6qW7Ow?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Deception Island",
          "location": {
            "long": "-60.5553751",
            "lat": "-62.9409297",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEL_kDfR4Sp4iE9qKMfUV9TVxZWm_bivtfYJgtqbRxEAQb4dElA_6GWaTRfs5NqojM_sV0uNK43mZoCuvqOmuiSFbTanZkEVBA09tduy1JocyPdYzXSRRWnl6oYxWcTnl8H9u85mc7m7l1MYi_2yM-uSuL32zoe__i-T_NutuoTQcRmSRo2t1Kea7WgfCY4U09f86aDrKg15hjrA2U-ugsW11k5PzaWB0LarNcaE8MsHa1HFPJObSkFSlw?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Lehmark",
          "location": {
            "long": "138.6007456",
            "lat": "-34.9284989",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEB_6M3hMgfsuTzxkWni5iI15PPIjBbs-bvYfBGFqqXhTMmocrWOUDSq9aG8Md3Ul1yb26WypvSbroq19rpVwwpM88lyasL9-pcPht9uPuIgHTUHkIi-jLhWL42HrRcgFIFNPAPFs1nxBY2_EuOKHyT7p3jBoEVwKyVitd44zRUl4rXdM9MLcw4vgChg7KHtI77YzwYsZZEqlG4bakLW4N63ZfxALuPXtyHHSbIlM_jW3X1satHxaX1eIk?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Westspillen",
          "location": {
            "long": "5.7456541",
            "lat": "52.958372",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG3ZiXGVAFPaBzZlmP-nSf94wwRMgBnPgm0Oiz6wvTlFxDaETQpl2C4JUokneCCKx085zcupOaV_ym0VBipF9iHBZbGF35WrhxbL0bKjOxJg1t3UWCw880oy01yfV2SiflH9SpguPfsw0mLBhDhTJIo9BgB2Nxgnyp_f-DRIzSxoqU975_Pv9LzZGEswH175cio9Fhv9TRaFEHf9EsF-t0t0NjPj51mQ5ta3uoKMAXp4cmTWIPteZEBYAg?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Paxland",
          "location": {
            "long": "-81.8076905",
            "lat": "27.4190115",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEJZ3XG7hBC9bYlzLs3LXT7MBqt9C_c2-cJBOEQ5E-IDPYIMM9ugWAWscttnmpIhKPa2EuwAWio1U8Uopy5l_iV5HFP9w41mbdbKNC8lGFh3Hwu1ps_TOLbAEG0H9X2Qaz5F12jnuslYuQ-92jxpEyb5x-WaupzJLv6c7X2ljxi9_oLxSic3MInVuDd6wGhVaBghFiTpalD2KQF2nH3yJ_taMk2W_Wof2YCCYw2huXWXCKXnPtaSoi2QH4?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Yestioria",
          "location": {
            "long": "-84.5973721",
            "lat": "27.8033526",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF0SENYj1vD-xu31AlaJcD3TQjQgRxkk_IpZS9IrfgHPTukaSnCBQ8snOLY0geU6XDue1h4oSkcJDA7hhSLVplHGRUNimPiNpo-0BJraYF3yqRGNyS7zUUXmL8HAa5oQpkdkFcu3Dw32VwUjUHtd8d8-h8Puiea6VVXOOBXn_C3ObK03Lk6AbKSeSMSbyHGy2z3OOEoBLuYI9yjzau49LGgR2Qoe7az2uWy9HoBqYbfY3cSmD0su5_Tek0?authuser=0&fife=s16383"
        },
        {
          "name": "Democratic Republic of Seybold",
          "location": {
            "long": "-81.6199412",
            "lat": "28.0974608",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEuNdXZML86Lc2kwP0Q5MHu0mcaBrqQgjsZn-g7IQWXU0RabbxCoXzAUb0FvABmek71_9Xcpou-6YaxyEJRkJr-ql7D-r4B9Fcs2cYigmTVTNAdNbJuQDh8Iy142dCnFxl88AtzrcbsEby_zQ9XKd8OCTCrn0rFL04ODLkbsXezNK7gL5TCYMc1N3iY7p4xY_QsRFl-MDicce7NTDPzhYZrREGALMb6uxAlqO7D1JkfRP-9AxWaLmFnyic?authuser=0&fife=s16383"
        },
        {
          "name": "Confederate Democracy of Gamers",
          "location": {
            "long": "176.1657544",
            "lat": "-37.6872547",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFNbtTrwdhhf2Iu7p19Gs4JYlTmFL0YgWuJ3ntW1-K9GRfSCBDkEognMVXX1UP3kkRD2-sedrXjA-B_Uxm0Pf7cU91rIilk2sg0IojpHRnj5X38UvjAomoSkqmxgOK_7s6UVvYOkh5VWHvhuh21EcxN2ZagxU_e_u8f8dur4fi1kSLxN3fphgOZAWX4DdasdX-pPVA5pMUQcGhc8SW-Uvqv1WfpSUm_IfYqNjS-rvv4twDD6vlGwriOWvs?authuser=0&fife=s16383"
        },
        {
          "name": "Grayson Country",
          "location": {
            "long": "176.1660623",
            "lat": "-37.68827",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuES3tUHzKcLPfx6jrzGM88KFKqTzGMKAOXSs7iVc7pAvUGuE7wOsGcBY50JewJqFzQ1LsMfkSrpmEmZPRhjsQzD0YPU3hbMU7nSnCbJvgZ2F7RH_mXmT_7-mDto8h01XzxFIzg1CNL3SNYSceHrguD16YT1SOyz54sOpihb_3tR7VzYKFGEjkvsvn9ZgSBPpYfN1pJHh7vJ90ScUdbA19A3B3Ms2FbuvTvPy2ZYlPFBKPaTv9QiwaF1amI?authuser=0&fife=s16383"
        },
        {
          "name": "City-State of Azehtyl",
          "location": {
            "long": "-84.5120196",
            "lat": "39.1031182",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHwT-1WyBUh_z9NSQlyT9bPrVVQx4q1vq7wEM0BuUE2cXXKqw2w9ah26lxPwS57bo_mOWCZTP8a9q-E_Ee3C8y6LH4pzLPr9sslBG2D4N41esz79_qvvlCMlDQVMTMQE9oa6GyXKsseua8CWL1scDAQwkoDlQKgBQGwkePlX09Uwrl_9gXBkuX9a2enjVMS3GwZmcCGd5xMVKsy0z_qCVaBagQh-gf0SF1nXwAWEo7bs5UaggNuWzbdycY?authuser=0&fife=s16383"
        },
        {
          "name": "State of Hidalgo",
          "location": {
            "long": "-98.7377062",
            "lat": "20.0920061",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHfP7uNL9j7kBPCyEf3fs9QDh2TCwV4c0DPggR5lOCX6F7gXC9RhzZMvViqEQIQTHvAKkiJ8FephKurrd44XlbBkT2AwoloBDBhkzArgLYwcd-b7vE5ff634AkhWPsW2A85aHjaS37-IA1E5IbHsZo3CDbRrP99VAoSP26hjgJsY_K8Tl9ptRKOzhPAPtik-1LL7igDQDY5PrwzeViiU6x9oYuksirZEzk3Tg8NgGrZ6rOI7gMa8qQH5o4?authuser=0&fife=s16383"
        },
        {
          "name": "Free State of Renasia",
          "location": {
            "long": "-0.2376744",
            "lat": "51.8097823",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEa09-uhXTOo5g3l-U9ehCItAepShjlFk-MFt0N3bkQEJFrx9xRC3qQ8C3-m9Ah4oO4Tk7hjZBzcZpI9aiMJVhbLMIFuoburgjrl14QkR89TweMY8Heholdhr89hU1wgmGQO8ZWO2keK3fjFe-rRyq839YO06rRi6j99u2gHo7CmT6lwlSZINoPWxin_UwrYjX_SgD6fInS9FduRfp3DnOJUSA4RH-Uarh74ZMS4ooEhfwBYpEyUXKBtj4?authuser=0&fife=s16383"
        },
        {
          "name": "Popular Union of Occitania",
          "location": {
            "long": "3.2893089",
            "lat": "43.7862111",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFcFnmYWf0kvKSl4O1ztxjqGdNQQTtSVaRIPTLXEMG9dWHe0QvUB497g0El1xUP7IwoJs-3himUZAY1zqW3N0nlIdAZ5PGd8qkuwqpei57P9f8Z4teHB_A6q_4LQjimdLQjeRAO1salqc63FMvkvTFZK7yA3UOVoOkHDQellbIrB7-h9j_poBX63B7zqlZJXhMGh1_tD5VI4ij73LFPuXY0ZAadJoKR2F83bjdsd1DSwULEgYcp7u_LuTc?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Duchy of Mecklenburg-Schwerin",
          "location": {
            "long": "12.4295953",
            "lat": "53.6126505",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHdG1euRPYgkk7PUtKXjvPQbiWwNZEgug-2k0FAP1NgL1lFU-MG1IBvpPgWpRM71YL4Vcql5gxNuSufo-Q-XMM6rbRnoncXZIcDafbKGPfbJRxAyv8uJiKbyLztLzo3tH4UqxWyOhahEMXnm2OlUY1Ku3HSc8ippZsauDQ9DnzUVK3eAGeoOhJuoCt_Qdyd3Ocb3MToAm-uvCL-tPe8yBG1qBFJ3F0ksayCHj5Z1gYp602pb9PclWOqNus?authuser=0&fife=s16383"
        },
        {
          "name": "Duchy of Makaron-Lublin",
          "location": {
            "long": "21.0173322",
            "lat": "52.1978415",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEtuUMNntXab0p4-3IBz0VsLvU6ejATN67Xws0gpbCRsa3fFI_cgV0AxfeEW6Ekm71yM1k3PD2fN_mWeWovXbya98lotVdOHduxsgAFP8COfTfJYQz0wDhLQHNn-sVWGW7fuEi5FbyQK0QBcfY8mpXHI87NekIAzZKzv1IWxfna5vr60SJf6ycLm_8YaZZjwvb8Cj3A2zDoLgoHFZrRbzCQt9P-VcXnK__UF7HmMaG3S8vG57L4lL5U3ms?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Monzen",
          "location": {
            "long": "120.2632001",
            "lat": "14.8511831",
            "applicable": true
          }
        },
        {
          "name": "Empire of Chrisland",
          "location": {
            "long": "121.0822196",
            "lat": "24.7335584",
            "applicable": true
          }
        },
        {
          "name": "Republic of Muskobia",
          "location": {
            "long": "120.2622856",
            "lat": "14.8507814",
            "applicable": true
          }
        },
        {
          "name": "Democratic Republic of Chrisland (Northern Gov)",
          "location": {
            "long": "121.0816188",
            "lat": "24.7340262",
            "applicable": true
          }
        },
        {
          "name": "Republic of Chrisland",
          "location": {
            "long": "121.0826878",
            "lat": "24.7341551",
            "applicable": true
          }
        },
        {
          "name": "Principality of Chrisland",
          "location": {
            "long": "121.0828595",
            "lat": "24.7348177",
            "applicable": true
          }
        },
        {
          "name": "Republic of Chrisland (Southern Gov)",
          "location": {
            "long": "121.0830779",
            "lat": "24.7337533",
            "applicable": true
          }
        },
        {
          "name": "Provisional Government of Chrismea",
          "location": {
            "long": "121.0837178",
            "lat": "24.7345449",
            "applicable": true
          }
        },
        {
          "name": "The Provisional Government of Chrisland",
          "location": {
            "long": "121.084104",
            "lat": "24.735033",
            "applicable": true
          }
        },
        {
          "name": "People's Republic of Monzen",
          "location": {
            "long": "120.2628105",
            "lat": "14.8507754",
            "applicable": true
          }
        },
        {
          "name": "United Kingdom of Chrisland",
          "location": {
            "long": "121.0838465",
            "lat": "24.7337653",
            "applicable": true
          }
        },
        {
          "name": "Republic of Squareland",
          "location": {
            "long": "-117.3233764",
            "lat": "-10.0635874",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF5VCibSP-nJRu8yHVOvbsmt3hnehpQTBE9vetgMXAA_8lpA951ACjsptaI5GIbBg-sFJUcI6V_oWzJyj0jpBuLYKmyD5ElllcT3hGj2cnHV7ZyTD9igv6KPqC6wLo7Pb09xXcixVdXHP7LzBgJJK1U95oPxc89c2JwTXkdRJm4DCIsTKDJ03-7ka9LRwP6sfng_ig-06sjlIOs4iedccnt5TQLSP8bcWXDYvwE5vg5A2MMqKB9aJ7GszI?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Monzen",
          "location": {
            "long": "120.2620514",
            "lat": "14.8514583",
            "applicable": true
          }
        },
        {
          "name": "Newgraviate of Saint-Castin",
          "location": {
            "long": "-70.892666",
            "lat": "48.345881",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGxDVRbuEDo8PE9906REm6W0ePCRxAV5_GNCaLnrN1gWfFAaaI-2jlR41c6CsOLRGO6ytOCra_XsF3bWkAys0nmHiFtMP7mrNUVgcdEW7A5lyo3TtGFUNEEgL3bX4ZuOq8sMKyIriP2GS-AYTgzibX1oUCgiFodHysZmr3oUpCaikLBOtYccVauaXNLg2R8JTpls4cuR2e78yBZuiK3_nlMOMPdwpDlXrakYFeTRkFAESwfF2fqM6tHCv0?authuser=0&fife=s16383"
        },
        {
          "name": "Imperial Principality of Stormhold",
          "location": {
            "long": "-98.4059931",
            "lat": "28.319334",
            "applicable": true
          }
        },
        {
          "name": "Empire of Stormhold",
          "location": {
            "long": "-98.4346215",
            "lat": "28.3169161",
            "applicable": true
          }
        },
        {
          "name": "Red Alliance",
          "location": {
            "long": "-98.3686581",
            "lat": "28.3411212",
            "applicable": true
          }
        },
        {
          "name": "Federation of Zenrax",
          "location": {
            "long": "-98.5493966",
            "lat": "28.3722718",
            "applicable": true
          }
        },
        {
          "name": "Republic of Ponderosa Hills",
          "location": {
            "long": "-120.3822152",
            "lat": "37.9823111",
            "applicable": true
          }
        },
        {
          "name": "Archduchy of Mimas",
          "location": {
            "long": "12.7826041",
            "lat": "56.3923099",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Ponderosa Hills",
          "location": {
            "long": "-120.3815286",
            "lat": "37.9824802",
            "applicable": true
          }
        },
        {
          "name": "Social Democratic Appalacho-Laurentian Republic of Saint-Castin",
          "location": {
            "long": "-73.8493646",
            "lat": "45.9514365",
            "applicable": true
          }
        },
        {
          "name": "The Confederacy",
          "location": {
            "long": "-98.4428158",
            "lat": "28.3604584",
            "applicable": true
          }
        },
        {
          "name": "Empire of Ponderosa Hills",
          "location": {
            "long": "-120.3812496",
            "lat": "37.9828692",
            "applicable": true
          }
        },
        {
          "name": "Republic of Saint-Castin",
          "location": {
            "long": "-73.8489355",
            "lat": "45.9510188",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH9nSVRn4bKBpx_o1DonoKxEQ8R92SibA48_eZnUvwMhSVB0ka0us6OoMQ4xUI3a7_3IeKeBNHIrtcjufm5BjLjYT1HV58iwjKxHOrccieP3yabtXvV2F6vYG6Df_5GLOE_UlPCOb_qSf5qD-oZudLQ_lHktSQaOXBiZw-TElOS4aLV7OWxSpNF1T1bJAWhv97Bbv0136VPQVRchev8lFNX8uA1ZKK8EBSF9HOATrdsoI5Fmz5VF5Ck4nk?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Saint-Castin (2nd)",
          "location": {
            "long": "-73.849708",
            "lat": "45.9510785",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuExtyM7ZFvoDAt0QiR8y4IMQ7hYD2BhbJGbftrOP0h2J_fJEu2jQw-Xlt8PemQc6pkuZypGzGXRpWZjD1axqF2uojs9QnaV_A4nyGhUSYgoCNoc02CC9kBbVYk9EMbfq-c48vLsp1LE2sRAEjUsTcF5o4QTtRkSDQPC-4bi0zEVIl-yHNVemU5k6nCXDpz7oSnz4f2RiNS_Plw9NJ1SrTmvGYOHGrapgJlZwwo79H08rb_iaFSm7XxJ54w?authuser=0&fife=s16383"
        },
        {
          "name": "Workers Communist Republic of Cretaria",
          "location": {
            "long": "-76.5024426",
            "lat": "43.0728982",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHU_eMMxxHD5r5XE9wccV80JOoQWeAzlywfnL6kDk6al4ZCfcqRlgXw3pS2f-HHB6hHwYtk-HdWu1-Wdk-pkQiZ5Zfu7mBzd3sm-k2v5Qmx14-IbK5OHfIxf8ubJumu5cftfQik7TX-PmctZPczEMDQFWyWbCbRkHoqZ_Y6X4X1eDvQ-36ldGTlbS1c542W9jhphRSWWJ37ojvSQFLmwUlNAFSftuhbIGTVY_-x40CFOTriov0W220Ktbg?authuser=0&fife=s16383"
        },
        {
          "name": "Arstotzkan Union",
          "location": {
            "long": "176.1656256",
            "lat": "-37.6866901",
            "applicable": true
          }
        },
        {
          "name": "Democratic Republic of the Arstotzkan Union",
          "location": {
            "long": "176.1660011",
            "lat": "-37.6867411",
            "applicable": true
          }
        },
        {
          "name": "Sovereign Democratic Republic of the Arstotzkan Union",
          "location": {
            "long": "176.1658617",
            "lat": "-37.6869236",
            "applicable": true
          }
        },
        {
          "name": "Independent Democratic Republic of the Arstotzkan Union",
          "location": {
            "long": "176.1658831",
            "lat": "-37.6863802",
            "applicable": true
          }
        },
        {
          "name": "Scientopia",
          "location": {
            "long": "-0.2372598",
            "lat": "51.8098088",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHf8OTo_gxacdYeyUUgrb8DYFmveQ42BSd35agFZjcRPyyB0A181qQrGy1snjtTTJHak954axKWVAT465AFJIBJJmxhMjnufpLSivks5Zvzzp_29K2lt3ojI0Xnn3vqRTiRnfQoHRj9WGfRl_zsDFhsqHqFZDeUUreR5bXfsbPaaXZAGjGaoZiV9Kg9j0q3ve0zaDDOVfD0Hkzz-EDvf_X7l0eyLRM9J3xbPEF4AfgYgoh8clb8qpUgdSY?authuser=0&fife=s16383"
        },
        {
          "name": "New Scientopia",
          "location": {
            "long": "-0.2373242",
            "lat": "51.8096562",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHOwN5cjaZDzeGfqIUIQn7Z2eGS94aCzoTTt6vR3IVw3uL-_W6uwI2NWCrPbQ08JQxXcgQCO7KO0RIQlSnAVB8vXW-tAr460VCdKL-UtPfsC1Rpsk9rw-iXc1DS5RTrTCSEwiSOu3GI2V67Jm8GPcsGqkTMGeG341_3vJ2WZibSLZf5_EqyRv6yUa8PXQ1aG8jL_MEVZGEVrJPBBZKXdWEi4_o5A-4lXmka1D-HY8nAazoHqW9sksjCH8Q?authuser=0&fife=s16383"
        },
        {
          "name": "Renaissance Republic of Renasia",
          "location": {
            "long": "-0.2375173",
            "lat": "51.8095634",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGwFinTYDKLLnYBjI9YdIl3luMoHTqk54bxKoWphiiH-MYLQ4QvstfcPXlNdw5CKT53wy52CbnLRKBA-WROGWAjyMsb5Gte-zyOic7nHa3Ea4pQJJP9HRNWhS-L7clLBSpPALKOOjiNwoo_ijHUmpv786HkdCqMYVlD1EJ5SzIy006CQm8xCkKCQVXM2x0rrTBoI4uB3S60gnaB-S8UmOK7QZK-x3ZaH7egqCABIM0ImwVZ6ad1lqdq6Ug?authuser=0&fife=s16383"
        },
        {
          "name": "Technocratic Renasia",
          "location": {
            "long": "-0.2369379",
            "lat": "51.8097624",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFGCTGx71n-H2S0mbGljLP9h2g8bThbrv-KBvFxrshrLFWdr7AR0RJknCHzBXituT73ifW2YkZI19oEiRrmatR1BVTHgMiSKftY8Ht82iSdP5LkOpIS2771FwWCSCz4ANZAWOITCN8oe5PE_qr5Cuwq-rWVqu7eByc7JkTgB28xTfJEuEcvEb-FaNFKfGosAN9IFVCLb6txaL4HL0oUEJLT2IJeANtfP2ks0zLUIhYTcFB9WWv4-p_sVDA?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Mathair",
          "location": {
            "long": "-104.8213634",
            "lat": "38.8338816",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHx9TtxFTBjPLGK9mSWdgXfzNs_HSJ1_ddgTlMsIT94XRE4AdTTE2mwkHwhvtiYwl_02FBVEuZlUpQpXaNT3bsKszyFwGxidCq3EjPDQFWh6wYsQQbuV_FF72CLglczOso41Qtus6hW5VNYnQCaspB7g1mrpRuxqZ8PAS7qitdCouj7x4eHOtYu6u78-HBsVioU7WMplLp6FeZtopwYQsc_lpqyjFIUPUOMcYQpWtrmC686bRc57jHhFRE?authuser=0&fife=s16383"
        },
        {
          "name": "The State of Aleutia",
          "location": {
            "long": "-174.2781262",
            "lat": "52.1607351",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Atlia",
          "location": {
            "long": "-99.1489148",
            "lat": "23.7127012",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG4veR3rY-pFjYzMaVVbLvY5DQMeoFPnm6zV9oiMFvHqND8a00dogG1vlTOLpIPCvgJo06fxO2HoRDSUXGJe3orWRXGWarh4CdvgUAnyHTL0lHvuJ0-awdPHDCKBoVeOmB8elh-Xg0lYGK7N0awNoDktuauxcdybIFjQ0Q1MyIP0c3-4ntAENzGkt6EqaP5H7cHpw2kHyOhgbVbJnV7I1kJ7gHyw-ug2VYCARzRhCRCxh4C3zpxBevae0c?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom Of Libertas",
          "location": {
            "long": "-97.6688111",
            "lat": "27.7904372",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGugjNASRpLuR17jpzPKFJ12Zr9O-7xItp3B9t0Jw_UBiNG-z-hx0LXGRmiR_2KhI424TLw_nfEJc8wAVr5uaC7TQpYpVAGQhppjkbqWgJ_0eQgBb1_JZxi-WSDkGXcWE0OIgqPZ46ARWe5QmuD106xA8iubxaXbkRN6sMHRaiMz3RSGKHZfU71bsupuO7WCYkyjhtFCKVTIrERxOb7IW3jrRlqxv_bHmZtoclNXtaVkg_s9Z1l2VG8lTY?authuser=0&fife=s16383"
        },
        {
          "name": "Commonwealth of Altavia (2nd)",
          "location": {
            "long": "-82.0961107",
            "lat": "29.5527553",
            "applicable": true
          }
        },
        {
          "name": "Independent Republic of Caeserea",
          "location": {
            "long": "-121.8110344",
            "lat": "45.738271",
            "applicable": true
          }
        },
        {
          "name": "Democratic Republic of Benjastan",
          "location": {
            "long": "-80.3838611",
            "lat": "43.193425",
            "applicable": true
          }
        },
        {
          "name": "Soviet Antarctic Republic",
          "location": {
            "long": "166.6863449",
            "lat": "-77.8418779",
            "applicable": true
          }
        },
        {
          "name": "Republic of Feroza",
          "location": {
            "long": "121.7016752",
            "lat": "31.1235167",
            "applicable": true
          }
        },
        {
          "name": "Socialist Principality of Kaetania",
          "location": {
            "long": "-121.3297273",
            "lat": "38.9013447",
            "applicable": true
          }
        },
        {
          "name": "People's Union of Chaveleir Socialists",
          "location": {
            "long": "-87.9739814",
            "lat": "41.9594638",
            "applicable": true
          }
        },
        {
          "name": "The Great Empire of Gamerland",
          "location": {
            "long": "-121.3254552",
            "lat": "38.903353",
            "applicable": true
          }
        },
        {
          "name": "Republic of Slivuna",
          "location": {
            "long": "-121.3239532",
            "lat": "38.902468",
            "applicable": true
          }
        },
        {
          "name": "Arazanian Republic",
          "location": {
            "long": "-121.3197087",
            "lat": "38.9014772",
            "applicable": true
          }
        },
        {
          "name": "Lihohian Peoples Republic",
          "location": {
            "long": "-4.2366415",
            "lat": "55.8404061",
            "applicable": true
          }
        },
        {
          "name": "Awhana Islands",
          "location": {
            "long": "-10.7503055555556",
            "lat": "41.2964166666667",
            "applicable": true
          }
        },
        {
          "name": "The Intercontinental Republic of the Americas ",
          "location": {
            "long": "-79.5492943",
            "lat": "9.0165261",
            "applicable": true
          }
        },
        {
          "name": "Valencian Republic",
          "location": {
            "long": "-82.0995795",
            "lat": "29.5457548",
            "applicable": true
          }
        },
        {
          "name": "Commonwealth of Essexia",
          "location": {
            "long": "0.4856781",
            "lat": "51.5742447",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG5mjBQH7dTTBGc9kcZtrEN_UQGyfAl06dkTQR_o1ayet0hz8T-THrJtFQL6FGldN71y2diHYxS6HED05YeabVZm5FP1bhkKpHhF4iiQrpCuHQ-bNfpfv7NueVOhU1hQlYxGSwH-QMgnhuvG2VnXx4OKn2FxCBBxKtqFMHeycMfj01OKhpbSILHI34mzoD7Jpj2LLA91UwBBfA88U8Tp260MR_eP_r3n4_5LW7FFC2PhJuZ7vLSD9mB-xM?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Snake Hill",
          "location": {
            "long": "149.5733291",
            "lat": "-32.6144566",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE-dm8PnfQVe6uVF6Kti_bbea6y6NBWudvN8RYOcQuZC4Jz9tUOtHVt9PK1v1G8jobHPQNidnaPEgOnqCTg59tMuBI9rGgRRsMEyHXuJZhmGA3ZgNpULh4u1a91NzFx8-Y0W4q-AF6oIusu5md09-qfEVfBfm-APZfnVzYMkfuwRMd4FL3yQeXdQ2Unc-6Wr_faAR4vtmVle6lneRRWQ5Njh-XcOVpbjjkh3fg1exYuOpT5hdvnuR5KqmU?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Ikonia",
          "location": {
            "long": "-81.6017417",
            "lat": "28.1614046",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGaOsQCIvchEGeBI96OSXgKQ_UgnTHc5YADM_QdGJ_gJQCf5-D0b7Qg-o5-5lWfzRowOyQpS-LJL3eiV4eBv7ozsf9TGG6SEAkq67X2Wfvu4OFZIWY0pGxdPQzddGzP8VNcvUK3CdJnw_OgErUraGguQ6KBGZHVIe9ZaHVTFa2PuBqmv_wmu90teKC4uP5kAvfW9_Fk5r07Iq7_oMY-aWfr0NRcXi6krQYTHpQIyjSDVYWDslvf09lPBiY?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Boclej",
          "location": {
            "long": "-6.3345506",
            "lat": "54.4635261",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEGq1FBNkE5A9S5lf6rLmJqDPCh5k82Ew8sP-oHd6ctHAHmKq3OjnZ6RfWnqTyLz4HMWqQJ0dSSjaaZxm8x9CAW1dljYWa0XnRryOu6-RTTYei_CKOd1Hh_3T3HlDCPgmAi0wvqK04pEyEVDCwAebE96JZLT7VlH4lJ8vk_GM0M42ihWDxm4zUchKjg2oaJbqDdsq4rmeRE4qU5N-srE0MhyxF4irD_jjxY0xHaJCnLVkuM_ZoRoOpRmaQ?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Duchy of Cordinar",
          "location": {
            "long": "-80.9621869",
            "lat": "46.467555",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHM-Hh3kjBSD8D1RyGop-wqi-IaZJGK8yvMu9kyAmkAZhYlqBspNhRQYnBfy2vobnwuBWKKsO7j_BILKELXJkDIVj5EN9INo1ZL367a9V9td_slJASBZULefk6opD2b5LeMAbcbqhsEhsxbTRY024PHKTFatxh77N2AbBqQUOxd576kvwYnATvglQdVgPPuF_99F5C3r2JX-uAl98HseD_o9VXSbD5ZVZqJ7OkqFEWjOnigMI6uMYTLcFw?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Principality of Sinoland",
          "location": {
            "long": "3.0636465",
            "lat": "52.274652",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE8lCp9--wYOEPCoSGqdwWBtigusiypJQNFb-YBRVQAwHIGW9D-tPrcz73w4mEHWTAhIo5ItMHdHTGXNkw1ALbdWSkzWry6aAMXIxNbKbMDiJ1lsCGPPWmlJGp4v_r4Ne-Q3JNk_1-qYIWmB4gRI4DPMXl_lLdStqi-azPNMmwwmUbw9Hl4fPv6OZzvrJ72CqxvKjk8ULw4HMF9DOrDeu6iPW5XYwnWFJgN5Tyz4KRfoTPONxuqRlnnaR4?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Brennonia",
          "location": {
            "long": "2.9757559",
            "lat": "52.0353681",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEJNnLKEeJsdp0azA60-W1ETk1Ej3FMbV7GcrloWo0b7JAOjAzdbW-5rdDSjRHXit7LjPEoFHnPZTSNLKtLzc_z0IG8mo3zqiLA5UtmwZDvHdoWXSIdL1Kp-nlU3SaQ5uhJ1WmW9ub-VJ5GIsizgSmb3kHhf9cGYd7rd30gsPJkOoNgYjxYX0PLEpWaXpAAMWvwroUu7L87DuoJ8Ri-PfUmpcopnHOwUZOQEOCvaQgCgAuw1wzx3p-QeGQ?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Akadron",
          "location": {
            "long": "-92.0716599",
            "lat": "34.1962082",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFxXX74sHWZrPMJz3azxhe_ifQOB7YYHc77RmRxDf3EtAwV6sNvNSVOBn9HdWk9gBgKPf8ztE9ysRHHYKRX6pQHzfHM9XttBkwMOAbl_47lu3T_C8WcAjMzqDWnhD-NaIDoJi5WACCOQlHUC4yO229lw9C7DTzr5yZ61R_UrgXvtN1xQjxZqF1e4Sx4ifvr1hksFCri2k7J0PMqKjiKUbb1Nj7KKNKXeqmussWWukqrFeNOvZImWkeXSUo?authuser=0&fife=s16383"
        },
        {
          "name": "Democratic Republic of Subejia",
          "location": {
            "long": "101.6323607",
            "lat": "3.0693917",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFsm2qzRGu_FI2zgUEZxY34lW3lZWslBqpNZBGnbwzNd4H4BYhLpJKTMToP-FebpM-qWStv81vWraWIquVrp3xpVzzowck7qIOB4eelQYfe0FwfaPGVx12behpIeCnkLxHpTpAnc4RfOWYK8R5jjCH5mp5LjEMnA60gOgr1yVGLat30mkm2DOB-Wi1zc1rlbvecSEW4l0Ep83Mc1zFCjHHch_TburhhMuCj8XBnhZr-GRlsaPP59X1WVuA?authuser=0&fife=s16383"
        },
        {
          "name": "Aerican Empire",
          "location": {
            "long": "-73.6604637",
            "lat": "45.4979076",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGXm3u5-fl5uWdFXcWoRbiNlOWcNYYJuUVPIy5Ai4IFXv8YcD_C31Z3vZ7tL26X_vKVQzyn7b1pBCy8WvYmTYameO4bKUNicYe19olkRgCy_Q_MgJQTPkYBFLifGq9KPuEeIn0uqed2uUm8HEc5BK-2i988ppT3pxShm31Pphhyef2Gr4Rbv1_6XQA7UA6xNywI5yfWsv8zapO1RJgUps5aMtMkZZoR1RtHrK8K6u3unvi2o5M3gSOstd4?authuser=0&fife=s16383"
        },
        {
          "name": "Densk Crown Federal Republic ",
          "location": {
            "long": "-86.4808043",
            "lat": "36.9685219",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGG4f1ae0zKWaZjY9Zlw6oNw02SaGcDCQ13f6r3IiXPwqewIRjoSMoCL3w2Y4kbSmG2KSK_4hr4tNysal63HyLfu7fkmb7kx4m684TpJeoEHGUj3JRRc8RGVUZyUV7Mz_etKOpdbMak0E5VFW5h0yGLXP7V3ZWUaThhLyZ876yqmVN-gWatAv1wvGGZZ1KKwDEgvslSKEKr1qbuSaTvRAZvV5w1DJVqEN_-NzNM7fo7m3ZRahUXU282k7M?authuser=0&fife=s16383"
        },
        {
          "name": "Tsardom of Nolland",
          "location": {
            "long": "-1.3839358",
            "lat": "54.9070149",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHBbR5zFJ4Lf8tfZZGMWKYmeDhA1BGfMebEXm4ojQvGXb2BVMVlpFd9ijWasbrAauKBSszbhvJTaQ31MhOBA20kZpb57T6aMg8mnQE_pByaKsg62JmhuXg8z9OsenuXfkYKItv-xKTC-gvzL1aarhp2ooe6V45BdbwgnOsxdFqRm4_qgPrBd8JLee_BSQQKfQFLV_0aERv4Bp_AndjjFqk0BgGp47gzt5bHrQgTvdiCtknO8k8ubuVM0KI?authuser=0&fife=s16383"
        },
        {
          "name": "Gymnasium State",
          "location": {
            "long": "13.5212456",
            "lat": "49.2347098",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFuV9jAL_9MOCx04OCXJxXQYSY_29VW2dO1M4fAL6phnR_35DZxBKvkdsY-9sNKLyDEpc9nuNebB5amIpjqVzYlT0jyyX0mOO7fE-zZoqa7wb2l1WfkuPCjhuXYAAE--FE__W64SM6FC1hAD8cQ44E2LvDeljrgloNb6mCq7WM6S1Nep8tmbYv_ImRP7MgqauNqiMy_fPrDeVGeTnj1EmxLgLW5xK9dJM_hYkTZehzljTI9SY-vLEqMj9Y?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Athabsaca",
          "location": {
            "long": "-110.0109849",
            "lat": "58.1962161",
            "applicable": true
          }
        },
        {
          "name": "Principality of Montescano",
          "location": {
            "long": "4.800289",
            "lat": "52.4661906",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFbHt9TtjRkLtX3by6swNzrN_pwc_ctBtEU4pzFdxeRAD_pU3nJ9pLRdDpKLK-MzA_M8VC4HuJ4lMHpb-_Q0iXvi7WPLatAwm1xwuDpLHaykV1qvkTnexpm_KEwkvpgXiGx2OhJuByjiorznyU4W1B-Q3NR0b0ngIgyzJG189BnaKqWw4rsvTlCWQRfCwrLsKWo0G9fDWhnRwVDO2esUC71OYi4DI6yA8cHQOCSiVKBX8QiXRV0Zgz3PIk?authuser=0&fife=s16383"
        },
        {
          "name": "Ganienkeh",
          "location": {
            "long": "-73.6697429",
            "lat": "44.8681539",
            "applicable": true
          }
        },
        {
          "name": "Republic of Chrisland (2nd)",
          "location": {
            "long": "121.0808892",
            "lat": "24.7339482",
            "applicable": true
          }
        },
        {
          "name": "Principality of Aigues-Mortes",
          "location": {
            "long": "4.1925869",
            "lat": "43.567172",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEeTfQQQJjIWNULnJ_9d9d3mofxS__p6uWOV66QH2JhXxgEy2zjvXHgjDNh-ylzX4UMdVOypGuDNhbcnVk3tkcUSnLjifI9Lu8xcnhTHAF2WAnvjBCMpb1FIFSBpR6cVDM9F2xQ9LwJaPdf30yjOAkBiu7B1by1vixSpCfMzmtlh-U0ZMojeUqGwZf8t1ycleaIJSAXaGYEvQhhYJJD0Uup0VlWbcEyvmbCA4p379DBlwHAQqZ-VXyECWQ?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Überstadt",
          "location": {
            "long": "-122.3025607",
            "lat": "47.7893061",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG9I5SbbmckBSUwzqD3N-SKBXC4U6J4PlEC8FKDJkN-kT9zmiY9da7k5ccM9mjYkaa0_l-MQXqGXTNOW3kMXd7Dkg9L8A489bEN30pmpswCKMeOJEp0nnPL4uBvrR7VDwZvKA6LflHxeRs2LBTAxa--LGWvD8dq_eGzblxhZd3gCA237IHQQK40-sr7b7uhn32EnUDbyHsoPH-VlMWtHdxk5Da-lRFjzJ7jBRt7wqSLIunDYTODHjCzwmk?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Kugelmugel",
          "location": {
            "long": "16.3960738",
            "lat": "48.2155307",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGNCEY8rGs6e-U1O0KbBq3pBRpeULP7b0gytULuRUbeobgwVDhiYqoaSp9ZAhvHejki4JUahXTYsaxYAMAq6uAx0y4NSvRCBYtPcPXY6Oji0B95suzw-zaNTS2QbKS9oRD_SBjyg8MMBTSCADombD_cMEw893CphVvmLo2M0fy46ns3UHJTnn3ZCtBcojDjQbL6HkDS3srQ1oMKI5tpwwvJirZ5CXSBUrIO9qvhMftpW1O3i4gthu7KiyA?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Atlantium",
          "location": {
            "long": "138.8021141",
            "lat": "-34.5735535",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEHSerkXMdmmF4EfMo5a1F6oYz03oL6jUii0jG6WxWLCQQ6SNwOYygftPY6D4bPICsP_Y9O_G0bPYrLOraxxRCDDojz75niR3L8VF44baU3CGoO1efYU-gwIcxj-pv1RjpHUWgGqgXIRxfuJuAqT09fdN6E-bw9Qx9NhfbEYzMfzmqdr1qR522HHhGD0j8FMvddWCAsrxymzgnXLVM13pPLnwrglhF7GXsgCLmnEZOsIpLsH8eAq5S3daY?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Duchy of Avram",
          "location": {
            "long": "157.0311908",
            "lat": "-34.8362648",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFbY7ONKahVtSbtbxC207SePQSdHlWzhhqZhs9LJ0xyDZ-Rf93iuUIETjivci3XcGUYKSp9pWkJcceYsKJA3srVi-C-F1abytV2exKiJwkIxq_g3NdIRGgSx9KKTRz0636w_P3F76aS6SoeVAilWw9HMmWPhT7s7PIFZI49ucUbuqpEc3YG57AWXTwW6FsoiEmLOqewbelA00oti7Gtl0hWYDCroEe3eT3q8d1IzsJIOrEO4wKj4H5LAz4?authuser=0&fife=s16383"
        },
        {
          "name": "The Independent Sovereign Independent Freethinking Liberated People Super Cool MegaAwesome BreathtakingAstounding Wonderful Spectacular Formidable Democratic Republic Nation Country Freedom Grounds Soil GrassLand of Disneyworld",
          "location": {
            "long": "-81.3789269",
            "lat": "28.5383832",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuETKZnWBoMxhalIRiJRCHMD3rZErCmGXjdiUIKebw2dCuMXdrQBXy6osJImE9ySfYiYbJEtUQH-GQS4oHzyDP5ca95f6zQ0UeohJ6tifuZ3KkyqN4u2lu4h8_d1W0t4Y-MDzX1noDqWpmxk9k_vHhaQvlqNU8IayrQFLCNN3VyNfRWhfBGjb7vDT9md4kkkTT2GzGCuL9R2DuqMFMDisvGx72jVkXHaCxw3IfTEUcsPCV-ygmuuLHshIgI?authuser=0&fife=s16383"
        },
        {
          "name": "Mafia Republic",
          "location": {
            "long": "-4.2544249",
            "lat": "55.8583186",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFV9GqDEZiJyY-zUw_zAt-17bouFL0u7zMywclJTRDaeYSE0uMgqRaeXBDkVPWD6bRS1Q08XseKtT7xJcvza1eJRZz-fEjdWB1epv-Aklu018OVWCQtuBgS1hM4iAO531pUwInm6qFCalDIxuho8QObBLiWWcd7BBM1nXz6tmYWnJ5LO4zLzVkfsYPCO9dLwZ6wo5WJY8UC9ZqxJ5ki7G1a1NpdcQDItP9wDokJrTunJ5g3m-tal2etZ4I?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Snagov",
          "location": {
            "long": "26.171389",
            "lat": "44.708889",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHMS7tcfa72j2-oHEbHgoqP34Raj7SG30rAH-bZfoJFXj_3vgH7r5PrQu7Dy2uhq7RMVLJRugxCcmzokcarDxSmOdEEjxqBcC14OMtYBye_Lq5rWnE36ON8P4j8L45nkkHw59wcmyaiCYkZcp6-HVoyo56hs_ba1soSPiB5XHjCX8AVm2nmqwJ94B2wbvng1TWif955nAoxo9be8Usete34kFL0dPj_XM2O7-rjRA79WghKzHOtwsFMmOk?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Sealand",
          "location": {
            "long": "1.5004925",
            "lat": "51.9211776",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGkbZDuScu7lkk3SHc01sZ_qeHMVtEQcwKsMOekzSn99nAoycn6RPb_FK42X0pCpNK6Zj8-4uwRRvBO4dKJPEppA8NYHzWlPQvTnUMxb-PRFBqmwiDFplB5rR6Wsw9nyKGce7QS0sfk_V0Zm4WKsALrmpQxDJ7L-do-u8pg8Rjf70IOJHDlheShk7F61bwPBtMKBLl3VNbLl6zrX_G7rI71_ZwGlpkFnyWGTmOHx1SyxoUbGTLDr5Jo5Ho?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Salanda",
          "location": {
            "long": "-0.2402836",
            "lat": "51.7215865",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG1dZlZ_1iKuWfHA6Vx_KlIgoJpA1dXmh9_f42ob6lUaPNDfU3jwF4RbJvLcLVMy2gyLr1c80yOkURtYshyZRPygu6iPX2pajnMW6tzscyPSCgCp7_GwXE2YGcc3rO02fImGqfH3h92d6qFgaRWA5GXLeGOobI1fCnXoDW8Zw78_pmrnhlZvsJ2JPhm5Lk3KwLrs0eiVmqRbhC3B-gfqqqh2eqxYLsYr7178vxGwk9jnGDgbNvcg1TEn34?authuser=0&fife=s16383"
        },
        {
          "name": "United Kingdom of Atlantis",
          "location": {
            "long": "-32.7093793",
            "lat": "35.2332689",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEkhhMJyHKQ-77asgeNwJArHZ0ftrbXNkCTcQkflQBT1vAp6aaoUQlppFaTQ0UVkerJ_zZzoewjpdm3FyqDzsvnD97lIgsv6iUZVcggL0_nMwHnjcjWha_VcnfebUiuPB_ezXibSWRg-URtOToXPqILKrYVh46334wDzI91gRYeNMEo1Mxlx2mDXiRW9TkbY_3kPpNnRY9Gl-UO0SIs7NIdLd0Vourhl_fLdKF6UyWBSV7D5ROvwAGjM2U?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Sancratosia",
          "location": {
            "long": "-73.5914038",
            "lat": "45.5178316",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFPRm-63USfN7y4UAnQ4NcGknnjqBR2C1a_surELTaZkb3WPloUVeHHoI2Thw8f-HZe48mJUDsPUdSbn9zRFtGbZ9RgwnZP23S-1ry1iwYergoiHAd-OlSljM57RYcxSASQv2jJRW2ccI8q-bHFxqJcoFhuYZ1wGMMcCkP_PjYBUxgGuePcM7d0rMNSloywaIAe_LOmmGnxMqbsp9bghP9YVf4LByU_iYGnvhLXZOZ4DXZhLDyaEzSXf2c?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Seborga",
          "location": {
            "long": "7.6944341",
            "lat": "43.8260204",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHin9RRmexit_Yy5-QCBQDfP9wJkbbWH6LHyHdJwkLGPRHfxwfm8fiwzc_k24NaiSZmIF-qxneC4moyXb8y2BcwpvhHnlFpMLQX1DPo5Z--fUEu4St12Fvn799_6CRVHdEtn6UySsJUQShupcL5pP0uMGCCY48HkuGzT3TL8D5H2G4scKV_Tw0rySTrsTQKzRmJmMbPxpsX4Dz1OW6me_iilIyZVOSXeUQie8j4ebqCHuuri9KAYv_M0h0?authuser=0&fife=s16383"
        },
        {
          "name": "The New Weddington Islands",
          "location": {
            "long": "149.1310324",
            "lat": "-35.2801846",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEXZWjRVIySi0Wy0dNi647Hq0W-st-Uog0HUO4ViE9r2kVP3dAyLOlfYLGJ-BtJY6_DqjxT0G-NjBVvdMbGwiWOOUCuX3atD41DpCEQ6K50f6IOD7SYqZl6t8IUdC5p5RH6rboppN7jkM49GwIN5TUy7NDVrGA9sJc7Yiz1HcR8f7d541TOJ2G1Puvvlf5ij10vbhJH-tHuTzXa1392D8wfQq36qZvJkoNpUzYuSYcZOed-USrc0NMmLKU?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Pekatan",
          "location": {
            "long": "-4.2893325",
            "lat": "55.8652068",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE72PGiziXPEWoCK19eCAEwSWRvvuOjn9QbEF2atGUMP6wqcx70yVVDoQSsX7lCzeOXG9HLDSsw4HQvKq1OzrvVZYDi162cKxOYnSiVgcl7-4lxMY4dfbO18ANpp2WmNHKcOXhzIV9PNxoT6j_flS18fJI8HKVNJ7f4uPgAJSJu2zV12vDWmlxGys5wNiqbXUbPiK3JH9ySJV6ZeoRLBLriP7xmbAaoTdTdkmMLoMBj_IzcRVh1ipft8YA?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Donkrea (2nd)",
          "location": {
            "long": "-4.2940814",
            "lat": "55.8542485",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHu9TynBqchF4pKACIzBrdeyaRgTIoUFYvoGIMghHpunTJ-5TVdeoitVSa27mhabjaYplPXiZVmGhO2k3fY-MHFTAy22CEks2hEfgPeyxpMMzUVKvRiiBqxCBTz6yHWSwO83rujBEC8EqW2p0VMz5CwYuc5rNvP3gGr6HEefwyrMDSTn7_xlhqDFIIXFhxTXnApWeJqVTBcqhcjf65Cgt7ZgsAJfpaAoIDp0xQzj_n_uje1o8eBdn3Azks?authuser=0&fife=s16383"
        },
        {
          "name": "Ìmpireachd ùr na h-Alba",
          "location": {
            "long": "-4.771983",
            "lat": "55.956476",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFO7aWHfodMKZWLt8vXCsmRZwGADq-Y16MGRXNkIYuyxjmBXQ3-yHlHKRVywsNMoh5kkIKOCLOWxciTdrt37m_0MBdHEf0E9UdLT3ZxpSseb6pyURUPGPkq8zJBO9AXoA1pIGLniK2O2jMWncA1oGLn3f8cpP-aEIgptvg9DS0U9lGALa734pCAAvo3Lhg8d8qCMg_Nmvkc9PxpkwN6fA_9QZnDwFnj7ILYOVssX19P8i3KfMIJKqYS0Bk?authuser=0&fife=s16383"
        },
        {
          "name": "Feudalist Righdom of Donkrea",
          "location": {
            "long": "-4.2476912",
            "lat": "55.8374064",
            "applicable": true
          }
        },
        {
          "name": "Republic of New Riga",
          "location": {
            "long": "-4.2252036",
            "lat": "55.8552355",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEkw-WCQmr9k8KYsp3uX4OSgI4gAMCnubWtlWOD5R_olsEPgj8HhKgYhYTXBqa_3ykOo8y3tzhSzsC3rqlvoWz311pK3NNEAPhdvkD_nZAtIKaX-SzKyjffx_ubv2NNMf7dTpyFLovsv2JiQGb1zCi-JcP9FjGH17clEy1ElOrQ-nEiYpZuVIvOvXSoET0Lu5hjOBU8GqCqpEig7kuunM1qUg36z46NrwiJ0MX2qM0uxkUJIUuahUyO9Is?authuser=0&fife=s16383"
        },
        {
          "name": "State of Thejistan",
          "location": {
            "long": "-81.2522451",
            "lat": "37.2811998",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH5RhhgoVTpjgT4yF4qC-be7e0wsxAHaucwEDdj4GeVsbQI0IwHeFI9t0oIQkiNBBVPuB2YpNSfokdLArt-temuEmCuAVYWnPMmSoLRS3VeTkGglvDwGcCF6ge_vCOy81psGHMruiB7uehLdeiXJapM_gFwXEh6mIC5TU53KsGnh9v6Nb_YGHrAVxUreZIA-OA2JMRNiwjMiAs2X0F3Zb79IMNJQ5uEK2N-8wf1tYNen5CO_8bY0nq-1k0?authuser=0&fife=s16383"
        },
        {
          "name": "Federal Republic of Early",
          "location": {
            "long": "-98.9456052",
            "lat": "31.742096",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEy0oguhTl73HjrOIpAoVIwyH4s6m3ISHatzX4HPovenR3iMV8-tJKIfXGN4wTf6AhZB5VfWqim6BlcYShCU_DjN_gdVktaMnIcOFnBTJKhO7fDkmeh6xpyZdhvIbr-GJIXDeaxjnCB2iLbkPhtxpOdnhzcOawTM7XKJdi1K6y1Zom6NKBhcTx5q1mwe0CEXs6h7D33zJ0qpa2Sgwl3G3AInDOczm400v8P1Tr0g5kQYbf0QHIki5NsyfU?authuser=0&fife=s16383"
        },
        {
          "name": "Oniyan-Forestrian Empire or Oniym-Forestrãou Ímperio",
          "location": {
            "long": "-119.7029194",
            "lat": "36.8252277",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Suteria",
          "location": {
            "long": "13.5084168",
            "lat": "38.0781746",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGzDoWRhpLEk4c0PAGCPsxo73AdOJPJym-vC3Hxe-I6My6YnTgFlvdtpxHPbAfVBZYXF0gPJ8KZlgSP3k_WKPgnjtyCsZZ3i1wVS4cy5dQ9_vpmjd-xDkKAUOyWDkTbZP7_KesC0WlzeMhHFksxddLM5hlgIazwrwDS92gBh9rY2hlUBOKOhQ6uT0ZHtUlfHl93lmDNhZ5cPashQaY2HVPHWm6LHQ4gPSq36DpqT6tRtO4PRFkSgJQcULU?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Lancaster",
          "location": {
            "long": "-75.2590721",
            "lat": "39.9184461",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFJWOxGxEpT64Q-TaMdowo36cTNYdZqajdznqQr_CrsUu0rIC6cxzg-yVYQ-vw-HlLJw3plWRAQL5fu3MmasfCKRynNfveJuH6GryNudRV6SoCceHlM1TjIhzZEvl8A9EG3s8KDrPh5lvlTKk44w9nnb6aW7ag7lLsynTl8EeXkpiHV8DPVueb5wpX6Y5Uhr0z6OJLhYCOnyJy2SMP3lcqD8PXy0E4cw8X97DCAYTlDzeuGZg-Q746lBkI?authuser=0&fife=s16383"
        },
        {
          "name": "The Sovereign Municipality of Ameristralia",
          "location": {
            "long": "144.9630576",
            "lat": "-37.8136276",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFDybq8sgWna1G1mXpD30YnBRPFU52dsPqIj81dwbcADKkt-7wdHVbGTEZ1gZ5VqxYFpJMlpBvgA6heR-1BHHsIQTwiek7X7sziHnDlTKY6MVoU8-r2coNX7y4s9Ul9Wp-GFLWhEEXlvFZrS3AthCce1re6scSgg2-EafogCnAmzZFwHigoE04caS5jpxB3PNTMb5X4x9Q7lkvotK6BRf5Vq0Y6tCNMkcP7u8t9MV0JmaxkwQwqVVP2zLs?authuser=0&fife=s16383"
        },
        {
          "name": "Second Sprinska Empire",
          "location": {
            "long": "-4.2706247",
            "lat": "55.8479707",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH8-UluY89wxE-e18oId34spewxlGlUCokAQQR3y6bz84iPKMU1xbqG6icoR0wQOpqD6CzecH8ZTCYEJ_vxKfJbKA9WB3q-Dd4cLx1NCSFwBYdKTxVr6vObFX0zybyyGu8fUXO5C9kIUngQt-GxJAKaJDbmj91wCn1FZoRdZa4jU56gSo8nHbX9iYWIOmMAN1uzkMjswFmNM_0Wr_k0usw8yueOjeD7rQI3LzM3TED02rfCvWHWYJ9xzCg?authuser=0&fife=s16383"
        },
        {
          "name": "The Imperial Federation of Zenrax",
          "location": {
            "long": "-98.5123236",
            "lat": "28.3710592",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF3f4slmdTCIGBXoiLOPG856Fok0fyljBV4rUHuzoO2II0Py9JTfZKlIijgwZAzI5w_SoUfJG1KlpaiJzVIXRphJf8C0rtwz35XZ45NYy4yXWCifJoz4zHzxqAekQOd2cI1xQkuchoBQ7IISDYoE786hqCeQZKANG9K5vIzr7lRQTcJzJ1yaVjroxIaIsTRbN4H9ODQU-DaurxUZZPhB38UzfBUm57f4dDWY_-9MsEtjXCGPVTTUbwdY1Y?authuser=0&fife=s16383"
        },
        {
          "name": "Bavarian Democratic Republic",
          "location": {
            "long": "12.5801538",
            "lat": "48.8777333",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGLlUGcwJzjlFWTQ3hmVsbbdTfe78KX3QNp1QxAymuotaA4qbhDTsYDGCu7TswyyD7Dkk7tKPMDV-b3tqApa7kmKiG4WqbJs4Sc-sQUhej142Zjo-vTLKY2zKMlfEYSjDxzroKTiUre9A0u1I5mHeQUnFS5MedSi9B3lRM_Pd6NoUxlbIHOmL5L-kzvIMJnx73xUOtjtYjkOcRP3ZWbwY4P8KHHDRHxKx_AtwqRRdlPGKBLivWHGhA6JvQ?authuser=0&fife=s16383"
        },
        {
          "name": "United Republic of Obscurium",
          "location": {
            "long": "10.1608181",
            "lat": "54.3761611",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFbYni1lpEkIpAkzkLWX2LgcqxpJ2gUnnJn12fcRZZoLkjMELjQ7EcowNnyNhxjIpX4fq2BcMifsmz3ECPITdI49sDK2hUabCl-voIKOj-Yf_FI-wDkxNT-vl_7XezI-YirR8BUizPqaUaCqGOEQ3rym_Ts2aFx9F68XDeLzrneQKbl_-LuFBhv563xww7l7ijJ8S5qsNhsy_6qXHS0obhWxfUBk1PGng-dLZa8EnfV1YQiDCWwhk9MI5A?authuser=0&fife=s16383"
        },
        {
          "name": "Parlamentary Republic of Zenith",
          "location": {
            "long": "7.5414752",
            "lat": "44.3788618",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuELTW-DGR8CwgdLiM5L2du6rkeKngODUKQHBaIyqjkghjlBvi1aST8JDidD3f9Cl40-1rjib1UJwkUaXDJH1byCmE_6X6G32Jokl6jAdK9qmBpjzG9VQw8ugpBhJzazRF6yzF0ddlRRQXexnfoa_rJsNOs8iV2H_hBcDdK5OmpVJbgZUXAiIZ0tA2u7lECKvfcLDz0TkLAviO66V0Muj6AuQaqe6pXKRH199dm_fZLpcsZriXwe_YiBWCg?authuser=0&fife=s16383"
        },
        {
          "name": "Kolniari Free State",
          "location": {
            "long": "-4.2594186",
            "lat": "55.8440799",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGS9NTDlmQpX4pWiGqLJV1K8qKpMwlBX3_bP4I_G0aEaNdNQ9Tv53fe35yrPc5w3C2xC2zK-wopZ_PP51ItxRWnRCz5QEvuU4MWuEL38h2yTUKlae1Uda3gB44q2n43Xvz5H8rrogYjrVxcsSlDD9VyPeRHXG1ucR5KTKcB7t1zOcl-djNkeKUHfZV_jciymfUjqv8o3rKo03N1_zisSHeDH2jAzZfS7sW2C54TjhrWyou1pMVS5JnVxyU?authuser=0&fife=s16383"
        },
        {
          "name": "Parliamentary Monarchy of Duckionary",
          "location": {
            "long": "13.4434607",
            "lat": "48.4399785",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHYBxNnU1YHwapW2WpGUhISgIT58NPJ45zbQcYWZ2CQTXXqTvP0PMdWw1kdHRDqeCF_vOrmkey9QOnjCFJSyV7R7aen7daD95E5oD0dSvsCf_OarXs9lHIgFluwSZ5hVwzW93TxTTzTt_78BI7xiLTu3BS5xKwBA5dEm-wqr9Rjry49-kVeTsKZNNLb_YzL_FTCKvp4hfuRUUmjExyV0ZNAv7mKIweo_Unw1kgNS-n-pSnYI2hJjlR99gw?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Molossia (2nd)",
          "location": {
            "long": "-119.5397027",
            "lat": "39.3227906",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHbhPc6QcxZ0o8VhdPBsZ5EjLlYLCkqefHlH-u_xDK6v8zIQIwK_WskCbcHKxV7RCboEMr7efmASKOkQwQzdaELLDSAVZZYXDRrWjVRWnFFezedpLv61aTvEB0AP3WikemAx3My3KwYdmhMv1VnYR4GPKEVPG0vI7YHyIU9hTJ9NMQt8aTdqVG2_xBhuPYUtEcSFk-SJR0TWLwQhPv6d5wrjDd-EGA1dEHvtNt4j6XhRio_6mdHSaw1KmI?authuser=0&fife=s16383"
        },
        {
          "name": "Commonwealth of Dracul",
          "location": {
            "long": "-95.2354902",
            "lat": "29.663008",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF4LY-_KN88vnVsj1_9AH4V8eN-MaWQR2en8WkwuEDbrqqI3a6vxQlgHB6BgQfO42q7wwcBrE7-01YywgRpNVjwfvDeypS7WMacwkIU1XTu8i7LpdPkA0JtmI3gVMj3kksxX6LAmbHVybpXsnIPcHNvNaHjzyxMwB1aMV8o1FHyRXWOtrnKWw6APsSwyjJlMMmga_VxtPHszgOBDeWNzSEOU2mAD-6e7zdCPFWaFXUPem-Zw1sWVyQ3lpA?authuser=0&fife=s16383"
        },
        {
          "name": "Commonwealth of Ballinfoyleburg",
          "location": {
            "long": "-9.0566819",
            "lat": "53.270564",
            "applicable": true
          }
        },
        {
          "name": "Grand Duchy of Westarctica",
          "location": {
            "long": "-90.6156956",
            "lat": "-68.8281828",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFM0purHq3FW8Y4kuoVOnp5pOH4lw67E510CVuTTim9qWTQy7hOsbE99k-X70G6s6rUmYX_ihoeK8nZPn_lxhsolHUVIo-vUBDA_ITHfntjTUY6JIJzBX0lYt1EIMKT2__XEJTQ6LN5tIL3OcCVpJD4VSyD8xg0EswGuwiO8XcjeOzfdVH9qBshA0uaxBBy05-Sm0DjxcEKeVT1OzCMRzRE5XeWhYByQD_ZVXr_MNQIbKotZv9SFdKjJgI?authuser=0&fife=s16383"
        },
        {
          "name": "Pinangese Republic (4th)",
          "location": {
            "long": "8.7279614",
            "lat": "45.8306759",
            "applicable": true
          }
        },
        {
          "name": "Soviet Socialist Republic of Fosalk",
          "location": {
            "long": "-119.2945199",
            "lat": "34.2804923",
            "applicable": true
          }
        },
        {
          "name": "Principality of Mendersia",
          "location": {
            "long": "13.5457856",
            "lat": "50.327176",
            "applicable": true
          }
        },
        {
          "name": "The United Territories of the Sovereign Nation of The People’s Republic ofSlowjamastan",
          "location": {
            "long": "-115.9697872",
            "lat": "33.1259203",
            "applicable": true
          }
        },
        {
          "name": "Republic of West Who",
          "location": {
            "long": "-105.1467511",
            "lat": "39.67029",
            "applicable": true
          }
        },
        {
          "name": "Duchy of Bardo",
          "location": {
            "long": "7.899612",
            "lat": "44.3487124",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Damora",
          "location": {
            "long": "22.8824264",
            "lat": "54.2190954",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGzLgaQBRSWZ6U_3BzT1nvmEINSRsH8wsVdR504FjSxpnlGNF0jo4HLItzTY_rOdFbZhF1RyKHF8-Q4mtPkshjYgvFy4u4hjN6xlx0gKMv7XS4Rzae5FIKyZrPgwL1WR-yNGGNHyOkdXA47IdpCCVXT-mgl0XiNvWqm_R3iSBQy5VfkYTA8uJWwkdybxZ9JnCRn2KJVFiiRv81wFYUZxxitMQxC5UvbOJ6dAGwfW7XkVoRztSz9S7VGatI?authuser=0&fife=s16383"
        },
        {
          "name": "Island of Vancouver and its Dependencies",
          "location": {
            "long": "-123.3504606",
            "lat": "48.4269195",
            "applicable": true
          }
        },
        {
          "name": "Aphelia Space Research Nation",
          "location": {
            "long": "103.6327841",
            "lat": "7.2007893",
            "applicable": false
          }
        },
        {
          "name": "Grand Duchy of Flandrensis",
          "location": {
            "long": "-126.6685992",
            "lat": "-73.4178255",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEwLeuJAzCk_oBJYC0gS_fDtLDwyiKG9M4mqE11dBURX9RbSd7GEFt5lw8lYuI9AHlXymZP4MBUF7zd6cxSW2By-wU0Ssp10ED6GfnVUswVNIlsIB3VbIKZsEJ2V8mjXorxBY9hs3R_AZBI6rkOPOrCyXfS0SAuON-uIbiZB-erKMmWjWlVwIFzOwq2nwyfeTjDfh2OhystFKcb_6UpNSN0h_pExhZcdOnuAlCpDzXAYtZcFu-wetJG62Y?authuser=0&fife=s16383"
        },
        {
          "name": "Penn Federal Republic",
          "location": {
            "long": "-75.8069082",
            "lat": "40.0010204",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Stratton",
          "location": {
            "long": "-97.1430671",
            "lat": "32.844017",
            "applicable": true
          }
        },
        {
          "name": "State of Vishwamitra",
          "location": {
            "long": "91.6679635",
            "lat": "25.6182145",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHam-1XiW7ll6_TZdykv0vmt7Yysbm1ZkUx0RXMGEbyXkUSUZJla6NYx4wXa2Hy3zt_mEwQCyBIPlHaecAxmanX2LB3CmCvgmcODQ55TeK81msvCBCKkU8ImCcP-ohlAwpfZ-mM6HQipgeO_d4n2U131dc1kH7ihAY6VTcGulUd1_cTlOW2jjKgikPYjTmD1fj_N42SspmogbXpA1bUPnbMZm1mUyGZnc7n-3Oq9EjA1hTWsjv-Gd_VYe8?authuser=0&fife=s16383"
        },
        {
          "name": "Ister Princedom",
          "location": {
            "long": "114.1693611",
            "lat": "22.3193039",
            "applicable": true
          }
        },
        {
          "name": "Republic of Kichi",
          "location": {
            "long": "118.2240861",
            "lat": "26.2009606",
            "applicable": true
          }
        },
        {
          "name": "Republic of Octania",
          "location": {
            "long": "-71.0536625",
            "lat": "42.40843",
            "applicable": true
          }
        },
        {
          "name": "Principality of Valumar",
          "location": {
            "long": "-3.3661933",
            "lat": "40.7802167",
            "applicable": true
          }
        },
        {
          "name": "Republic of Tarupia",
          "location": {
            "long": "-4.00943",
            "lat": "55.8071557",
            "applicable": true
          }
        },
        {
          "name": "Republic of Boronia",
          "location": {
            "long": "2.8219384",
            "lat": "41.9802633",
            "applicable": true
          }
        },
        {
          "name": "Federal Union of Wegmat",
          "location": {
            "long": "-87.9881998",
            "lat": "41.8867031",
            "applicable": true
          }
        },
        {
          "name": "Federal Kingdom of Golden Hill and Sdraliv",
          "location": {
            "long": "12.2862694",
            "lat": "41.7311182",
            "applicable": true
          }
        },
        {
          "name": "Federal Kingdom of Golden Hill and Sdraliv (part 2)",
          "location": {
            "long": "13.2517751",
            "lat": "42.0686395",
            "applicable": true
          }
        },
        {
          "name": "Empire of Kapreburg",
          "location": {
            "long": "-87.6165124",
            "lat": "41.6504983",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Ponchartrain-Maurepas",
          "location": {
            "long": "-90.160108",
            "lat": "29.9851637",
            "applicable": true
          }
        },
        {
          "name": "The TechnocraticRepublic of Aethodia",
          "location": {
            "long": "-24.1557095",
            "lat": "71.0296298",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGCT1Mq0YKqLXyLGULgXR37oAx3M0OzO8GIUYhPM_S0QrdL18PKn1ol9opc2Ats_SjJ0lg8GBtEgIm3Gobzcq4BUOSsNozTkdYR5KShr_Biy90lHcoKLPZZ2cfAoQ5d9DvZC54TokkXR2G5XLBNNhntC-8nxBXDrW7NJvaNbJJtT5ZS6ubEV985e_M8psAFirwNsh2myZErqG1PsAUWytMJNoFoEpzWlCm_zzgOorTOcjmTDGP8kv37ipw?authuser=0&fife=s16383"
        },
        {
          "name": "Federation of Ikerlàndia",
          "location": {
            "long": "2.0856539",
            "lat": "41.5687514",
            "applicable": true
          }
        },
        {
          "name": "Mestarist Republic of Valentia",
          "location": {
            "long": "-4.2790768",
            "lat": "55.8660389",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEkSNp4auKeOj7AuU8gx8TP6CiyoO9TtC7gJEFJoKvVk-abLJuczT3sWXAVjMrkB4lLbKpRvT03KegXR8hxQK2xAI_dIDqjxjZNCreLMzKQSD_XWEeR_0dn2XaaTHn9BHyEvcmutitfVtxaoBSLcRN31Kknx5_ZyGDS5Q7h9HITi4ntWDLbYyoVlxOE74ZmFymm5NOAyVJ_MeqHgyID3ofZZ7ZkJS5Xit_zT3w_n2-wd7dZtuH4qO2q2o0?authuser=0&fife=s16383"
        },
        {
          "name": "Saspearian",
          "location": {
            "long": "-97.7290025",
            "lat": "30.1210148",
            "applicable": true
          }
        },
        {
          "name": "Free Nation of New Athens",
          "location": {
            "long": "-84.3615555",
            "lat": "34.0232431",
            "applicable": true
          }
        },
        {
          "name": "Free Republic of Mestaria",
          "location": {
            "long": "-54.6238837",
            "lat": "-20.4666796",
            "applicable": true
          }
        },
        {
          "name": "Republic of Stone",
          "location": {
            "long": "121.5429768",
            "lat": "24.9919712",
            "applicable": true
          }
        },
        {
          "name": "Empire of Atlantium",
          "location": {
            "long": "149.0335",
            "lat": "-34.1924",
            "applicable": true
          }
        },
        {
          "name": "Principality of Wy",
          "location": {
            "long": "151.2517877",
            "lat": "-33.8183146",
            "applicable": true
          }
        },
        {
          "name": "Murrawarri Republic",
          "location": {
            "long": "145.8428606",
            "lat": "-29.5100231",
            "applicable": true
          }
        },
        {
          "name": "Principality of Islandia",
          "location": {
            "long": "-88.15",
            "lat": "17.5666667",
            "applicable": true
          }
        },
        {
          "name": "Hajdučka Republika Mijata Tomića",
          "location": {
            "long": "17.6546",
            "lat": "43.63092",
            "applicable": true
          }
        },
        {
          "name": "Free Republic of Liberland",
          "location": {
            "long": "18.8666666666667",
            "lat": "45.7666666666667",
            "applicable": true
          }
        },
        {
          "name": "Freetown Christiania",
          "location": {
            "long": "12.5964061",
            "lat": "55.673412",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEbxKshbKhyRFVd5MoczuaQ6yP1VEfQKLRq_mkkslWjAgqqFo3X0QS0ry8BgF_3XIVQNlW8fQumFRg-mZUy1CQrOwc-EO9F1KWxaY9jgm4BsxAXNxeub95CqTBuEojAw2C3zXJoyyhIX9jIqOk-d-ADfju7v2bbndDg2QgIIQHphQvr0bp4wRe9Od8eedXEEEsMWtrxPTOQugH_vHyUBPl5DC5xGrz9xJxjlZDNEQU-AQgjmr2hUjNLqug?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Elleore",
          "location": {
            "long": "12.061",
            "lat": "55.686",
            "applicable": true
          }
        },
        {
          "name": "Principality of Laàs en Béarn",
          "location": {
            "long": "-0.851455",
            "lat": "43.381416",
            "applicable": true
          }
        },
        {
          "name": "Republic of Saugeais",
          "location": {
            "long": "6.46209",
            "lat": "46.992134",
            "applicable": true
          }
        },
        {
          "name": "Republic of Užupis",
          "location": {
            "long": "25.2966193",
            "lat": "54.6807316",
            "applicable": true
          }
        },
        {
          "name": "Republic of Vevčani",
          "location": {
            "long": "20.5915649",
            "lat": "41.2407543",
            "applicable": true
          }
        },
        {
          "name": "United Republics of Jamtland, Herjeådalen and Ravund",
          "location": {
            "long": "14.6666666666667",
            "lat": "63",
            "applicable": true
          }
        },
        {
          "name": "Royal Republic of Ladonia",
          "location": {
            "long": "12.5409221",
            "lat": "56.2863381",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG6S8yKQ0yM1nFMlAr-Hpaca9K_C54gbvQ2sxmnF9yomRQ_WyvqqE_G6oruv24fsmB8EUQIE9AStr3-hiOIBjv87Ta2Q9RTiSX7iI04CPQybRPDLx3LNE_UzYwS4ulbaoGQacUF53pJPasGdn25GmyDQjTsPQBETSZ0W0wflC-spT6rnI-omqdXacF8olQpqgUOYGhT2Acgkt9eKK6JYSxWI35KKMY_-4RX_wkR528mMPbPB16IF9Vc-0E?authuser=0&fife=s16383"
        },
        {
          "name": "The Vicvillion Reestablished United Socialist Soviet Republic",
          "location": {
            "long": "-0.0863646",
            "lat": "51.4889145",
            "applicable": true
          }
        },
        {
          "name": "Great Kingdom of Slitronia",
          "location": {
            "long": "22.3944593",
            "lat": "58.9827084",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF4M6w5zY840pBPlo_T4Dir220qHKIJ7Ak0tiQVvX5gDqSAkVloa6dxxe7ZGb9Hz4V3dLqkGiNY4hrTt8rkUqJ9I-sl6B9UtP7hqFlrFItwCnLjBfN_xGvT7BcsNl86CtXFAC5XixKY5vmegyVRxvAsp7TRNuH9aTIb586CQaeI_1JNkpYuNSuIsRV-_4fwvIluCTByBig0FWC7r5saz2PBsRi_m3h2_4c8eeH2unHU-IIVVeVB4gYqypk?authuser=0&fife=s16383"
        },
        {
          "name": "Dostykstan",
          "location": {
            "long": "52.0328046",
            "lat": "47.1530902",
            "applicable": true
          }
        },
        {
          "name": "Wirtland",
          "location": {
            "long": "28.4036035",
            "lat": "42.6976942",
            "applicable": false
          }
        },
        {
          "name": "Nova Roma",
          "location": {
            "long": "-68.4937229",
            "lat": "43.8386666",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH_DJMiZbXZ5kMrOWI7rWGoLg5oNd1Fhx0XlWjCP4YVzUhOyra_xxJoJIS5Sp12wM0Y1GvMr-EOXpq9ASSx_Ldpkvh-uKdBoCFAKBupptVYij42-_hBzRXlob2G3WD5cB5nSgum-7-PrKSWXYNKwO7X7X2pygpQJt8pXszOWpq0a0sF4gmYwSw88PEdlCBiov-OLGjophAc6_-GK4Ay3Bd4vbvsbNdhCeY_PQVagoF9THAVGiG1s_2Ap4E?authuser=0&fife=s16383"
        },
        {
          "name": "Dominion of Melchizedek",
          "location": {
            "long": "169",
            "lat": "14.533333",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGrgIATS5gF7CULhcV0enEK_FQskMl1qlY3zYPjxbNp7ZDDDksrGZ1NSOSaYPDaXxZ3Y0iZ4an2GIamtt_x7uosv8w8jn5DW8T5FQvEZIm7JMR1kW3U3kmSPtL5R80GZf10D2zRL5Fvo_BjKi_F2_k5heAcOVhQt-gyrSs5jxKeMP4K6SXAVgF0mf6iuEQk2-AVb20LJpye5YvSpkYw4R00ugGAJi6WVsqLgxLK-P_wl26mMeJF3RfaeWw?authuser=0&fife=s16383"
        },
        {
          "name": "Global Country of World Peace",
          "location": {
            "long": "81.7102414",
            "lat": "14.9491712",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEEFgJKEiQElrpEZF0A_h_6gvuZ2CA-CGqno0M5GvzXr56eUP5i2zjNQV9GwOF3syk5Ji27Pq8-2uXtT1DZTW6Uy3Yb9LCpngUrTc-mfHhXOocKh4hVYJCXeit2tbsfZZbUZarlHJ5irbDKQjCV5EUCu-zf6gU5Zh11HJdOEgnOZaRLOGLkIw-M_JWW0XYsfWmnSzMyepWnKntL1sfH4N3qIy8c34cA9cbz-IHivWuAvSvZUqtX8_qTsRs?authuser=0&fife=s16383"
        },
        {
          "name": "Nation of Celestial Space",
          "location": {
            "long": "-76.0540896",
            "lat": "31.6572459",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF4WMKX4mt6kaPemrq9zjxJ4SZ6alcKbQ6SAQ4sVzwqSxKSgB92cMaatgp-vgvqhX7FQQtUwZfQruovr_k2fUpjZhxqohf7XlGgp3TET2bz-hai45hrfzskBZaX9qVmSUrOMFirdJKejLee4MJ2-UBeipNC3W61qmDrCOCuMiB8pkv440NGYJ5UIUiHPvBcjFR6RwoYu2PAHzXrFgbzVOpYUI3Q1Zs0FNwDIhBudMu_ySt0WMC7NxfjduA?authuser=0&fife=s16383"
        },
        {
          "name": "Space Kingdom of Asgardia",
          "location": {
            "long": "16.3738189",
            "lat": "48.2081743",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEV4vgouLu9BfKhrn-z_pwVf_Z3HguYO-zbRVz6474seiKFTTOzXyzLCOlvyAlW8E4__D5IEb7GEhrL5xLe_kdoggfDLOmqoJ7KqH2sXLuaRxSttq0gurrL7sQ5NmUzD9LvfHnS0H3GQNOLCxg5HocBAfa7UZlVOi-E3SbZhDKw6AWAL0qRh4k-4ypybeK0ZvFKC2obze7S6SHqFBN-kXQ5EHGLReVaAXvXj7mQ62vnrOaHZv_nNzZpcBw?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Parva Domus Magna Quies",
          "location": {
            "long": "-56.1612309",
            "lat": "-34.9262407",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuERsyEy1OgNSfKD5JqJBP2K4cX7-iJTxkU44_syj65uwA66HQ8uM7d77oJ7YitAAWN3Z6FsX-YQ5-XTpqy5cg_276GmvpKVQJai4n-2dPUQBbkGgmo9GLX_rd5F_4yhSbLBM6NbnsJyExsZclkPKnmWC6uan2G7PhdlNZG0W8MQbY0IMLtwYoSI6_juLKXphNj7dULCUjYURVLbAiKpC6eZ1DHWP04VPteuXRx3TzzkT2krPtniL6HDhf4?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Zaqistan",
          "location": {
            "long": "-113.1918021",
            "lat": "41.5380087",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHymZH3ovFl8zgPG0BYTJSXcPmXIXBbxNsKMMnFyMHIq0d8HaAjVulTi3I_gOrQcgmtY7AxvzHWjurvoCoOrGqAi4k71_3hPOCk6BhodcEOzULNj02H5xIdM7MlTtx_YVG9xqifOuy43T6D3oC4SxM0Un7beGgkGcgrA7wA0eDTg7GLCCnZ0qibbWr5gVj4pQOGN_wkM-vIc4AGw5xx92EzY884AI_N1SPiP7Ueay8BZVxXtqMZ2l-ftLY?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Talossa",
          "location": {
            "long": "-87.9064736",
            "lat": "43.0389025",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGz6iyA9efGYE60JeYYaiYDgNu_Mp_7z2iMty-LgfiSWErU7Go71xEIRoP73jxniCRVC8VLH9i79_yH-xjHSfougPja17v1T1k7TUNKStdx8_ia2PwGX34NvcHucUyVML3WCh91uo2AH1qTzHbeDTS8YBaHMCTKTG16WX3sc01MYVzpCyPUg2OHKBj-QVhNGwuQfeR-sYVcxCL1F3dOm4Nkhd0NiLxnanWPQfDBARpcuPq9woWgU4PY8OQ?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of EnenKio",
          "location": {
            "long": "166.6499348",
            "lat": "19.279619",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEt6iBsuAG24uVaKAk_zY2nwibq8D6UvNcBsxEgfJXeCtb-g-Ei-SlgY6-qamI_wBb_fp4US_WCdJdoiHjItK4jHgV8qRlMn5x3V4avrxBSXNvVqQfL1Aix37j3coC0P2-Ue7h-vaxeb0UnyiImMkq07rU0rcz3TXJZ2U7o9ylAYDsOyE8l2bk0gJQ4rqUwaXi7qLCHKnHMRVdbg6yo8weNBf-JQRA0kmunycoumPyCmJMPwy4yF6ricOE?authuser=0&fife=s16383"
        },
        {
          "name": "Maritime Republic of Eastport",
          "location": {
            "long": "-76.4921829",
            "lat": "38.9784453",
            "applicable": true
          }
        },
        {
          "name": "Conch Republic",
          "location": {
            "long": "-81.7799871",
            "lat": "24.5550593",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFP69LGG4hN-SLfHkmunXw1-AZDiUkWrdzeDpz3yqVsoa63EK5cPciho1_ry4TCUfUbQVrSyZDQC6EGJbeK7hZ2bmaHXFscSy8sWRZ99sKSV38eHgdmibPRq08zuu0qlyUCLoGhQwV9lnLmIJbDWjVfocTNWORrnqvAkH3Jj5GcyXUOIrCgo36Xky88CAm57ZG1zvjLkGCF-34iuJWl6Q0tY0_Btt4vYP-Qg5IebY_m6pWkqc3m3jLeMiU?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Lovely",
          "location": {
            "long": "-0.0308201",
            "lat": "51.5320893",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF-mjZ3wh5d4etZ5RQTjQk3VDLWpnfGJdDprVS9ib5r3wz6pCbQNpwdZsv4KGJ6HPJO0qKadJvgCZ6R-8NzmfjHcl5XZPWDu0fpKuGPMDKL0T077C1hru5hi-dzJ2a8ap3_nN_4LTgXsM7Eh0x5nXxRjoXwD_Dbvwq39cLQVHNrkqmq2UIHHyIqcxPJBbfMLsH9QG1KOWUA7CGZbe-NFbtr23LVW9GLosA9byx0Mqg9GZrqgV0HvwswZUU?authuser=0&fife=s16383"
        },
        {
          "name": "Free Borough of Llanrwst",
          "location": {
            "long": "-3.795732",
            "lat": "53.137033",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHcq7kjAOqTyFOT72iy0XV6RtESNbJsFuRQa6tL-WC7XCY8ynXte61fP0M0ju6Rjgi0qoBbn7JcYHMCWRsdBhv3a82Y8PQKgOWUMG3f-Rt0DvVt7cPDlxgEM6N-rIiPZ9w5HJUucnddarCtiVDO0C4T9dVARGK0eoQo0fZVSqC5DAIZH5Bkm_udbsOMy3ngeyxPNK24rtjK9arTtfdKhE1OQGdPTIh-Lj9Vk-ZsObws7bz7hbO7ZUfGsN8?authuser=0&fife=s16383"
        },
        {
          "name": "Sovereign State of Forvik",
          "location": {
            "long": "-1.6639853",
            "lat": "60.3188647",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEJ84C53-226zRbdYPONENIqNaWB-WHVEkHWNdCvaIjcyrFtI1p6f9w7Gemuh8pm1589Texas6NBdHZjXt7omg_2dhcF2y6l4o5X_fFkUqgN9Rs4vMOXcmtI4r1QzyhUNgXSHYZPQV5-oHkUdj35Ug_P9HJ6yKvwLoPSIQz6qIj2vbkQGqeFmiQjNT8zlx5O-hQ7GnPxZk4eEThr_RqL6qEVtSoQ0-RYjconIZXp3uzsurXTjcpK2CmxY4?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Austenasia",
          "location": {
            "long": "-0.164921",
            "lat": "51.365018",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEPuB9Juc6CohTFCEerV_QDQ7QkxlIdJrcfwbTnl97LVyxzIdgY4dA3FQxD-gSXMWuK0LaaehBUmoreY0-mSOcqcJ2sbGZf9KjHUQBtWwwO1bFlKibP44FnTxJiIV3PVHbCRHdwWKiMmbxWM5L17krRs_DK3MF-2HeHcwJmmCiN1EFfumz7_WUVU2m9-4WqPUkEZ4KGL_FgmlUaaOHz--pRD5EG7mSy8XORzO4IKqJ0T3_eY_g1wVDQ4VU?authuser=0&fife=s16383"
        },
        {
          "name": "KonungaRikerna Elgaland-Vargaland",
          "location": {
            "long": "18.1921848",
            "lat": "61.18575",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEOxZtlI0CHYUtbaXlXqU7VE9K7XlyB64Go3G-wrbjVyvaMoPsaex0vhgK-fKvDzIuWWyv7oNsTaTVabe3gz4X4-MWsqF9vm_2y6lLFJNduM9-K-2drFCELZM4aH-pk1OCGaEPuNtQLgpIzyneQt7blMAgb3pk99xBVIVItyeIEDBTcOlwoVMqyZ_KsSpyOi2NlUU7O0Md7574ICkt3oNHQQ75UN3xfI3YF83AtmduduBPq6-vWPFWpMC0?authuser=0&fife=s16383"
        },
        {
          "name": "Akhzivland",
          "location": {
            "long": "35.1032",
            "lat": "33.0481",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHLJzLXyhLo9CKn4VDyH_TSC0w6yQ0s6Xkc7C6ZOvJuWF4gMmAb9QB-8-4kwaY_w8CUVzO4pjelMb2RUQ6ULtCaIfnRlCRyWkCQPyDQ22mMOHCzLa8j8Iig4yZGPPoT41DuAzpQYVTekAwlwHjUA40UcVkEBBpqbDwBfhZ0mSO6WxirlUzCBO2MRHww1y_-HgrvxRbXrdC2Bss1ecQCAioSyeP1CqUtr4c3MDm7Xu1r4D4cTUpL40eThwc?authuser=0&fife=s16383"
        },
        {
          "name": "Holy Empire of Reunion",
          "location": {
            "long": "55.4484856",
            "lat": "-20.8784675",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEr4jA8dy6JB6Ea5AwgQufDBt1NazmSz-oUC2x63tzBXUONtzYVmy_fPs_6h7ROrsCC70KsgowDSuPT5mYnofFHP7AQya5LGHq8shNPJR0fKIMXCfkC1cwqfksniRhUVYdSplQ9od8bLr-biX9KLQPK8XqSnKasRORTIlR9oOw-_Sbh2ymWbv7dHt8lp2aat0M7KGTI1a4kBAI8cN4TExvO8I-WFrBbSOwuLDDOj_pAc8qiq8g5x2gO9AU?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Wallachia",
          "location": {
            "long": "18.0084701",
            "lat": "49.139564",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFOpbqiB_NVObPm6VeMATRNxFvF1c1eFVgqtFO0m48RlwQZqeHNaLP3F1sHhoWarLt5RRNMgloxJi0XqeuJoXvgKFHTDncqdhr9cMeFNhf4v63IqxWo8n-rzPbzIrFrGaojbIOxwuu0t4RZNIUkxaCe-Ch85xwjjZnd5dnAptI3d9d81bGuScYPEXn9psIht28JFMNuT_cPCEXXO6OwsHUJLdOCZJd0iwBiIGCRlOuHM_Wq9dA9zXjcYLg?authuser=0&fife=s16383"
        },
        {
          "name": "Sovereign Yidindji Government",
          "location": {
            "long": "145.770277777778",
            "lat": "-16.9302777777778",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFZ5tsvTgm6EUTaVFsJjIa8zqaBLTJKfEbwsvd8rmZKHtaMu749pzGfrVe_QF86klCzrcgIYWDzUKr7C9i-qrWVVWGWaX0EOfWVJ6uZk-SiQosCrQbLCX3C6Nu5xpL6IK6xiSNmzrpKOjyZtGEygYs8q61sj-QMsV8iqsFkv6-wwvvtqzUfXl-gPLvgowUivDSYMvR2SlhEAtD9gHzTsdbjQgdJi97R_s4CsyzTFHCpT9WP9-ANvjyXhFQ?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Surdam",
          "location": {
            "long": "-110.69306",
            "lat": "43.634711",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG56Bst7AYDlCmOUlaM5hrQvx3a0wM78KBuT9gcJSSNUwLSkAiba-4MCuT4kv_RcjjSdo7oTZyxu5lF3A-DHKcoim86_2fMPY0uELAbf6hZ4-2BUdlMOraH4nkwpKvmae2TfKTVwen0yn2K6qU4waYAtvW3LRFBIyXAMhbUq1zdrZEEKh0RPovd9c5ybnLLPx_uICN1cfnUg7uaynjyZZvN8p6eaLicq7Ama-GQm3syPRHGetTavW4b9AU?authuser=0&fife=s16383"
        },
        {
          "name": "Holy Empire of the United Duchies",
          "location": {
            "long": "-6.2283035",
            "lat": "37.9078584",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGY2Cf5vlT3dUhYyS4IOkhREhIhPAT9UJdQX2pEjx0wfGYWol_NZMfVxh5PdquZDpYuPhGuD__-fQ5raPCnlKYIFeh2_ZdlRb7hRgf0RoL0491G5u216AnNnlTdf5qkYNn2IEga5IoL-CkweYmnYPFalfRaqtwAO_4b-mBIs-4VXFpSQaoV0XX8spWYxNplr_bzK-lnCGf82Ug3R82e5vbEeDgOB2-kptZxmXj9Z-UfmuEo-YLS1HKz0Qs?authuser=0&fife=s16383"
        },
        {
          "name": "Holy Empire of the United Duchies",
          "location": {
            "long": "33.9133721",
            "lat": "21.9029051",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHNx2V89GnPkaVYYwo4rp2BTUlMGmEejcQ9CPPHFCJUMp6ulJxACxzA5_Jq871h13F__SiakaKpynvFYVA70YL0VdKPepFBt4jp9m7eTY9Nn8GS1sN8Sxde-_-EMgDpLZOIH-j6XaVd8AmidVF-qe3Zy8RGTmK7Tq1CuhcVzECM3fWG7r5mcB1Kjw3eTSLbS7KDtd9YCZj1mossUlSiiBXun6X3Vbv0g-gE5oRxmUEpKp9XsMR94zxUrlQ?authuser=0&fife=s16383"
        },
        {
          "name": "Archduchy of Mimas (2nd)",
          "location": {
            "long": "12.780905",
            "lat": "56.3918771",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGiTv_U7NJ-s_c6Im02mei2GtZaF8RjhfEAH4OIo6NyHxehMPeoFYldhAY_VFfMSnmyhHfKMILpfez0py0bX5lhb7TdLk1F9uf-LYYmZ1xT_PPRsackY95FaimMq3MvNO2rCOWOp1VO7Pwol5Lu-JwuNbSG-x2wUuxskfLx9U7INHHOcuLMO08Y-mFWlc67v5VAoSW_UykiudAN_4Y25S9-0GhYV6hqj2kId9ZdhBqza6Mx0MiqhMIitOw?authuser=0&fife=s16383"
        },
        {
          "name": "Palatine Duchy of Mud",
          "location": {
            "long": "-95.9183122",
            "lat": "48.3069303",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHTFqtgZmylqfTsA4g90B8Bgj3ch40zfIeNXMknVbdZweH49VDCH_QSw6us2r405GIqO1suE2IPSm95267r0sRgRx5inxFt_e2MTtmv_R4S6Tchpe05uKOUqwDnbarsRI9MOVZwBH_jK9PdDlHxRmP3zTz1OKunIQO8p7SgHEmqJY1BP8MrK45GXQtjnFEhz_5qRfRxDHg-YSQ6-jhLz9YKiD6JTGhW-NQWrsQs-NJOFB6NnYfDDBshQDw?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Surland",
          "location": {
            "long": "6.1952962",
            "lat": "49.2609049",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGvkB7bWJFdPOWgAs0iszAvoYhIKsEUr8wDvtKy3KlHEDcnEPvJXizWx-PWIeS8uB-xJ-58S4zW6w1GdNTmU983zTNt0I2HyExBmtwBQJO2jquf-SZ2v-GDUhD2EsUGsql85eM4INBRlUgSnCVV2y3Mu2fcVP_ic2Ur8lsoHm2SjXojMbu4uaCzMpKAb9wjh3uI1T2oePDWWAKNF1u1cL8rt8Bhs7fp-RX9wtchyH_7NUABzrbFW-JPKro?authuser=0&fife=s16383"
        },
        {
          "name": "Iron Republic",
          "location": {
            "long": "-99.9018131",
            "lat": "41.4925374",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFeIUj7Ejg44lUJY7E_jm5525MEy3q3H-xgV9o0MsK2aPPhIOczvEPOdabep4a3aYnQEEN1y4h7nWBTsHW6R5OGM_h3WMtgkULCv8PcOPQPu00g3jgKhYQWI2527PBsMqneLBf-R5y_mwof6LDMYsbZVA0yW1LFgkctFsOgxKZ-vodXm8ISe27C4bvBPXI3J74vmgFIrZkIDaHdhCkXAVgeLHfyvAXjAM1q73liApxuTZjUUKMkGgAKcXo?authuser=0&fife=s16383"
        },
        {
          "name": "Ethos Island",
          "location": {
            "long": "-121.5866601",
            "lat": "39.8209927",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE2bcJAh01umeXTfVYh-sLIRqPncCoGdMkJyVsE3jSd17TE2OtqKzChJ8O-JEK8XabuOETbAqLbtvVtg9AtH8g_KbvakzMUlvKX5Kqb2sSjHzm_wQWGnN8D2awhuRk8S5ueCSx86Hofd_kKoUIIcNJTM8Lsgym3iWhKR4_l7ZyQIcaFVQu1-gUzKG5Pd9ZgtkuSW4yY_3MEvYRvGuHSV86IjbSaxr4MwnLk1fxmqYOcLetEeJbeEH1QGvA?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Lorenzburg",
          "location": {
            "long": "13.5512488",
            "lat": "59.411821",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH_s-Ra3NKK4a6-4SynirW0KYfEn7rDgwyukbkoUttztprvh-wlLnLNHwmtK0IJiDuC7Hj4q7rmoQh3CcmK8qGAd0KlHizW4EUD2qzEHQMMg5FEH3NkOoANKl7L7SClcWMx3jLvaF47CRb7bG9Gvzv8P8AsF0vnxPyRjLH-OuD1aRFF0Lb_z_FmWlFGJJ92QLXKXih9IZ1uCoU-BoGLNbycwcUvOYOJ0lgqrEd1iLkGRrkw1aZ9ZNj-Quw?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Queensland",
          "location": {
            "long": "105.2194808",
            "lat": "15.0727086",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFm99Np8XZcsGL0Sq0hF3JUBI8rgr08M49gPJxLb6NRvz4kB8v41_RsQMVnBk4ig1bWkoLudu3IcbONGn5SzPs_0lO27pEKt7VCG84ZTin-K6bXDr3Zj6czDDDnWrC2VPt90h1hXjLxjuNVbN9HOu132G61o7EpxnZKEpZB37Mx_cu6uW3pIhrvW9LurxHCiA7j8KOpkBBlIhAzaesJppk2-FevTwhkkfHblPSUKkD9a1UIsQdk8fsgAwc?authuser=0&fife=s16383"
        },
        {
          "name": "The Grand Republic of Cycoldia of the Grand Duchy of Greater Houston, the Duchy ofDenver, the Duchy ofTequrovidea, and the Sub-Duchy of Crystal Bay, along with the Joint-Crown Territory of Lur alongside thecolonies of the Atkison Island, the Blue Water Atoll, the Territory of Primus, and Hog Island, anddescendant of the Republic of Flirbonia",
          "location": {
            "long": "-95.1133859",
            "lat": "29.598538",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG-odZO-MZvL1bUxjr2Pwo6iAzb-OM1LtTfiWZvkTDfcSDq_GhiAJuO2qB1gvhhejUiDTG_Epx301AYHKmaN60FNUuqFEjgOmK7pB4LuBFe25wddSJYDx6j7P0jej-ovfraew-hL1fdCVnT_EOZHF8ibzh1uOiLOmnb_5vUbtuOkPMw9WEFa7u7IxsFzlQqRIO1ifH6VJZ7TCjyAb3EpUZ16Pc_U5z12idAsF5_ewdHpakTJRDAX88MdBo?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Guanduania",
          "location": {
            "long": "32.5673651",
            "lat": "-25.8395533",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHbWOjK6GYsw6n04rEMGSOdMjann5KHJUd8Ki5jLWCkLyIIN6FuAjxXhIEOXCIWtSs4JBYo2oksP3FdwhDGEzushzUpAbtRWxYgayybSnJvzw7yJjGOZKK30tWZuBIz8Cth2_XUciL4xwDB8u8yuEz9wMh7nlf1CXHOk4s384KzhB5aAt0tb8tUsJUTyXTxcD5OOjUBaVV4XGn7YC_bEO02UkM0OYBLGym4BFyKHjWasRVoiOwwgQw427Q?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Adammia",
          "location": {
            "long": "-1.7536877",
            "lat": "53.8118931",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG_aTnLuLYQaJmULYkJR83Xz8I-6hCcTPDR5gFGZpvr2azYqSVFacy_cqpLVpc9g7fPKZWpRHKdC4WXwF9m5o_31-Ym4xFHHtnyn9SapBzKgn5xQ7aFZjLZ_y0JwoNpMN-F1lmLU-vCp3NAomvV0lx812E_xe4B2_n9mmQ29RiekKiBVpmx_SHNXx-o_xycZKc_X-iE8Bx5pUHv_aAu5lqUZcVnzrp5wH1fPZPWLflA7QZqNnqFQjlNOac?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Lomoria",
          "location": {
            "long": "-59.1041758",
            "lat": "-32.5175643",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEah7UmwUlK3f4Q-V8GVIOfzBwsKKxpfyrQIAyLHJx3OpGFPUZTeRloN4O4JIB_eBmtYP0nxFxDuthjNBpa60hwjJWd2vp1LeS02fm_JdYEFibE-R-xUKbe_qu8h77bk_SbUtkFnuw5VTeRTfl88PE8SRJCfgoG_JrHRzuwDazWdr5WzyXzXIcXh2_eOYGG1aUqX7EMl5KfGYwwGRQfd_1IrQTRYJLzrPwlr17_lCRZQQ4gswXbgu7ynHQ?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Solacia",
          "location": {
            "long": "9.9871703",
            "lat": "53.5488282",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG4m8fDfV5RUdkypsvDbOYGcoSW80kZvWhRlS5WIm6-p_Zu4FVYc8cybh2QXnHWloBkuq8WxfMGIOxqirsO2ntMVuyWSHsrtVbdrZpBQlNqZOvbb1BV0-DpFHOjrIU6FShDcvMak6huNBVHIRg-wNwlfOmabmASoBC-modCqpo-AxjCG9lGeDimtKAS4LE9fzopeZYCtPyZ7s8zj99iSnRxb8ulrvbDs-0cu-2iu95ZsCd98wuks6lHzbw?authuser=0&fife=s16383"
        },
        {
          "name": "City State of Novobrado",
          "location": {
            "long": "11.6358975",
            "lat": "43.2931496",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGdlfbLGDR8_JVqvRRRunmxYtFoxMUp55y6YUxN3hrVtYl9CPo578A7_bdDcXylNue-x8lHN5mgEoOxJ5I-1uIrm0qKPNFIEckVBqAHAq4uh5hIEmAJ7h_thQTF03l45rKO5cnnBcVhkgRW7JwAPB6zL2lh1jtrjv-VWr1F8weqWgns0oTFGTZQN7aiw69NvS8lOrEu8iSeahAKcKD5YCJo_07dJ4_Nu9Jm0UR47XAOEEqsNyuhcNAiLtY?authuser=0&fife=s16383"
        },
        {
          "name": "Urabba Parks Proprietary Limited",
          "location": {
            "long": "146.258991",
            "lat": "-33.841833",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH8Waloe40pinMQPievuBDVoIlOXV2zOx6Mx-e9rn8dOF5B15_061gEBdYwaJCymYU9NWsejHlKehuc5BvU7FQl5jBbMIk5IrhuHx9tsVl-IXW2ryuiJHq6wcTnBrEsK9PNAwCKlVjbRh4Zw--5Yuan4dheLnpJY3pljWfpAOfbMuZDSXuFnyGL9voQj0UT6_haLDwceV0ifzx0-46-gfEcS60ASR3vgt0uXWMaYztKF-qbyT4Yxcxl7ag?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of North Barchant",
          "location": {
            "long": "-24.3927706",
            "lat": "40.6022493",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEhqbmhHWLgeJIF5P6pK6vgHZx-q04NAnDDjrZ-P4NXoP-8mRuaeNVa3U9HQwGs-eqlxwChhdICTuiZfaicEUE6n1WKjVPG_HwVRJnrM4ToOEhige6TXOBsmEqrmrNLEX3GqzZFtosOLgjEbfoIc22eLG-VtpU0no-Y3jm8PYoZPKBX6Q2Cn2RypXlSe4bAfCurvDgsihEdMTEtdpEtsmXWeC3ue_8wdBkEKTOHUfy83AjE-WMqJLOZDQE?authuser=0&fife=s16383"
        },
        {
          "name": "The Empire of Cadavers",
          "location": {
            "long": "-86.5804473",
            "lat": "35.5174913",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFj0TmoCxw0U4U9BX8l2ahR1rFTVX70a2b-gW57bV5LwB1OuvS7Ua3vIIvGzGyPCo-gjIrZWe0_cw5I62fETFie7mWdRfystA28IxKHn4X9VJBmAm5bUhOxRTiNcyGDfzMzs2r6TALJZ0fc05sRRK87MhSo08xOaMbWZDmu6r7bl7D1pdgi70XvjfT7kbOIi5fBD7tsahL4fJ3mGVdlz4qLMgBhzd2RiWN7uxOOCZlTU6JLk-6NTuxerRY?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Rosoria",
          "location": {
            "long": "-88.0507253",
            "lat": "30.7666025",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHzeRuPYGVvVJn9AlxyTmgq6rjE5-m4Q80UZ-C7yYzwRPSbEhuFnr4uWVZWujc7O-aKxdFYkzeoLa0eh2Jszy_dvkkdPV_Wg4YjUppJEA24igKpOMkF6kMweP-MJNluDm2Rt3A9G5FqTDbcPJnfTf8xPG0TOVCGO_bSqYObMfn_wrpnMW85oeOw9kYU-Nz1mbgbtTfsDDb_r_bd5fAH8Zrup00fnMoMIWQn3MvVYDzjg_l61FNgQg5XVmA?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Todia",
          "location": {
            "long": "8.3964938",
            "lat": "44.3167917",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHukQG6YEiqj_DUIDCplCjZX0p9FNo2Hefv-4YF1ROBe7VsKarYIrC1eCPzoFd1h1ukpyN8LiuoDHsIAcGO70KXPCKNPaR2zV3tF1UXpK5andb67Tq1GSMszWxl0iI4V2NbhyYNyUQICLkGSfMlAy_9L-gzxu7iV2PZ448HPMDBeky7aEBk1aWFVUq3PeGHprrIfaH0L_l1oequNF4lMh0ylKOh96Cphm0pz7m91D-wo8qNIY8C9auwbuU?authuser=0&fife=s16383"
        },
        {
          "name": "Quinta Los Naranjos",
          "location": {
            "long": "-101.6424444",
            "lat": "21.1617578",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHMqqBjmfyOyK4U1g3I7TFD5OlhGUxcBM8vNuVMavpi-dS5U_4M2Rq0F4dLkf9smlJs6UPpKUvSymk4CER30rU9AjQ_cX9YCRHfOP5go32nGJyzuJfgjmK0wjIRVnJj_xQ6X0sdXUWHXdGWUA-Zlg34dLE3jafZK0WfSnE8La_1eQG2duK5MXBDtMyaXghQiKfYX3s0yiQq95R2PpNIKLqJ44fOm2P9GsTeMCKohpHr_HX0pnWaqEac_6M?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Beauluna",
          "location": {
            "long": "4.1187986",
            "lat": "52.3872499",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGRos6Y0T6DY8q42u3Cw0D94GqlwM-xU-nPQndJm0TvuynpKUsRi9aj3za90P4UxSON53j-Mie05WmFAKvkiELliIHyo4V5R5n4Sql2QTMxDD3MT4EIGHjaNZVxo3wcDf2-cZ0bPn33K3E4fpgAZZz62_YZd4LO-rgF1LYq4_bGrBB3oqtCpNEtNFimdisGFlRK6VFwFOB2qNF2rEIAlVKRWfPSY3EkNDE7zz4pq-2vUgXEoToe8IQTdXI?authuser=0&fife=s16383"
        },
        {
          "name": "The Peoples' Constitutional Monarchy of the Arcanum of Relica",
          "location": {
            "long": "-0.168396",
            "lat": "51.564917",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFVtLUrc9U73vR5zJUe-JImo6S5QDqrCFT3wPnYBNvLp9j4JTJO3C_P-xM3RdMKr6km_aBHmc41Tq6NOBqhg-i6rp4gtQnAHl5iimlFabub6aaVrrNn7E43hPg3PcQvzJ5jL42Q-xRqYmfX2nZh1vVXYtgnHpqC2orRfDziyYxK_6NfJ4TKrP0pw_TVkhONGyIHZrjYA-vIxyapU9iRbje3MBDHdU3H1-5H_RLinklmiL-YZ-UvvyORMUo?authuser=0&fife=s16383"
        },
        {
          "name": "Teyrnas yr Halen",
          "location": {
            "long": "-2.524102",
            "lat": "53.067185",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHwNwmuoI3eabK2bNUw4oiXqFR6hWyMY5dfXcW-aSYfd9N8_VNZBWuEz8WGRQ1y2aKPHej90JVrgJd2owcGhqs9eBsc5fZsAF4-aTirFsBzK7epsxfE2wCOvJglB-gfz_Lbx8ymY28q8cA4S0BjTapvuNURliq-tx-CyOihiKZuS4413YJhL78A9a7f4jDeugbwhvyxpz8LxBRAW4iAG0_Dw_l-gtMQC4vr7uWWtySJn06r_DYxvNRprxs?authuser=0&fife=s16383"
        },
        {
          "name": "Federal Republic of Herschel Galaxy",
          "location": {
            "long": "121.3009798",
            "lat": "24.9936281",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHUY3kMiLmIMoFtlVg-jRqsl03dP0UbJK3w6WuPcSgwjHqkEZfE1uK5fubYvbajBkt-jncuH-BOXlpFSrPZoq95s9z6lZ6JFCxRBuG8YsO0bFQg9ANUsDVZkPNQZm2fiMG1d7BZ3ttRkL9JYxhCBpbMMev9jGMpiMf8PpYcrgMOCDJPey8BK7QokkRgQcnvPoaYyye4LxXxkw-LgiMIzDMVjtPIdGL7kPqDr9OmCmWw8j7Kvn_lMpKZGBQ?authuser=0&fife=s16383"
        },
        {
          "name": "Most Serene County of Cook",
          "location": {
            "long": "150.7469735",
            "lat": "-33.5968741",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHIjm1j7K6O9t4kLJFVLlSeNiBXLMkarnmJIZLNN5PFNTLB3VRVbtlRVbqU_XuKLA5Ev81SaRqZCgDZJCjRZp2s7Ayv0qW0ifARAJ96-LEiUYc16eGaW7qKB7I3NQ-0OQeK1ylvw-mg5IOZw7EGmnCKNaxEPmz9jsMHP901GMo3fXuRIejhUL98Ly-0f2GXWoqMNDqBwz3liw46U3AVtY3AEGRIiYCms35gr4Pq3vBGMxMULfS2gWSBxH4?authuser=0&fife=s16383"
        },
        {
          "name": "Democratic Federation Republic of Canited",
          "location": {
            "long": "7.0505511",
            "lat": "49.3740018",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE9tYFdJ4Q4nHSTZr8zlRH4Gjkq38GPQ0tcNvSiCo0ZOJ2lDdjQ7xKV9nuOl7VDqLcADrwAH2hR151TXepotT4wvqs0IpgTPIpSamblvd4dTD0qThwNMDqC64yRCmrIDlZNi5e0Ls2pIfMhtLbwuashYVnT5_aLQxKb_lxQeo7RWmgN7SEwDZtNeR4hJG9sudGcdr40FhNj0N_Ccu_H32L0fVDNXUx1DZTGkYlbvadonfP5zE8jAC7uAMs?authuser=0&fife=s16383"
        },
        {
          "name": "Democratic Socialist People's Republic of Monzen",
          "location": {
            "long": "120.2626895",
            "lat": "14.8511751",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEuVedCdBtHHT7Q2WkWehymUKIMWLGlr8uiQMZK5XTCoGg1Khkjac6yrwdG8XaAqUSTupyvdDRhDNnbhxoU7Xi0NOa1DIlE5V2LQTt6ENkKGSn95ynZWeXmluWZH2bu8Mm7QQaQJ91Kjdt5hADfFe0MuPMk2KHksRZ14AmXyiYshqg0ls4Gl6lS0mH8tFEO9_DKVbkOc4mloexogrozrFHnNrd53TAOVb5vtpu1JTTzvJV6VDHe_uGcnvE?authuser=0&fife=s16383"
        },
        {
          "name": "New Republic of Gamers",
          "location": {
            "long": "-114.7192259",
            "lat": "35.2752807",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFiF7uBQ20RoFD2aeov4kjj8JK2kjQzkk3jJhoapzbLcVdBCmxHAntsYpSVA-DtpLKkdCkzb7yKqcKw1DHSgNj56uuyaOEvaVg6LPd7Iv3ZVszjxXx87Gof85fWRXI_PfVUh7wJmOZZQ1SPW6U4YsPEd7gpw4juf_ytHSML5aFCr0bxZQEy_yCgimRnk_FcIdr7M8gYdHS1PmbDVEgPsonRRyYmu9SBSkABdow8GERHdzGLdUSvq3y55vA?authuser=0&fife=s16383"
        },
        {
          "name": "Alphistia",
          "location": {
            "long": "-88.2433829",
            "lat": "40.1164204",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEjssdKmUkFz6w7BCoS4ytwEDjc8Srdz1MKmHYV7nwJoUMboD8aeDG7-vHnAO2uaRYOHq95fPXBnO-Io7O6GEjdAXEM4ZtFk5iRnNnuhSnbWZTUt-TGrcrHoSZy7GuuyTuugKpjrfosqE0jF8npcRspPn3Q_sxNh_IuxpCzeVYQtv1az70nCgaX87yj1qLBaKepcwwAkkBHSMv2MjyyVVcgsDOhWwX7SbSGyWnrtdiZYreL21cMGYu7ycI?authuser=0&fife=s16383"
        },
        {
          "name": "Federal Republic of Nabuzje",
          "location": {
            "long": "31.994583",
            "lat": "46.975033",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFgVeQUzk9ElpI0E0x8WtNbgBkEUzPKk_atETUYsE3Y6nwbN9a8DWqJkWaMk2WIl3Yj_CpuQw9MWdkFCh7wd5_wxUHxSPrWwlpoiiN1wDD0AFGt9BAMZnTvjZ-gm8kXIs7ddMqMm1Gn4HlZF4qTo3R1AcHiaXjOliY4w9E4sMpLDyN8qN0MKeVnTaqaxawPgmUisxOb9MxGcML1tZkgj93z-h7nDfz1b2ulCGwrN0a022Wiu_JHiznErKg?authuser=0&fife=s16383"
        },
        {
          "name": "Yellow Klyn",
          "location": {
            "long": "43.6931362",
            "lat": "51.1673654",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE20V43ZNO86Vi87rxyuDVbcFLsfYhx8ZI_c5gOlg9_OAHN14sWhWbU5NICur2wNrotH5bRuAi-ib5RpyU0e0JzQo5fC0IjCIoe8O-t9mTN6dFE0mlSadV7JZzrh2AuNN-yUMlntxWPC3xieGDvRkQUgHNJm_v0RaO2D0X_41uefYs99JsPPhmEYKRlUm8THpfpfuJx7HCQMszy60qbcNl-dibdXgaaRZ3F6BC1FZ_4CGVJ40EvQc3HVx4?authuser=0&fife=s16383"
        },
        {
          "name": "United Kingdom of Hesminia and Territories ",
          "location": {
            "long": "122.5666455",
            "lat": "11.1254063",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFiMQSfuURU_1aJ73uCJI4WpHayqgjIln0AQvtPFHVf8_0zVo6Kc4Zodhr-X272q1kNOb_fSCZewbkJoSvZ9dqYyyAS0cke7ouqFR6_3SIyQ10c-yD78aJpBPMPU_MeajNzYxS9jVEeNP3GeMMZE4z_azGWl3faGp80vC9GM-2Bd-EbsWtQSC8xBQuM3pihSRK1KsMbDQOTT9S83mW0JwiUU2Nc-PBH1mc0Ml-KvYQgCGcPizfCvLLCIFw?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Penumbria",
          "location": {
            "long": "0.4022963",
            "lat": "52.7516798",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG2kCUAGpnwcF_F8zwmct_AYhzp2t92CwMUAjCeSRzAleAGoRFqSN9lG7KSV0I4_SpwxsPNk3plv1WIflLHdThbr3y-ht5381maSs_munPml83aLctx_vLqoTxCFZI3Ii4bM93V4iYh9eq6FvLhhTEQ2Xf2i4GW5PJ1gFRIwWguMoT24mnTI-_Q7T7iYdtuRsDLED5DekJ7LEVDwkOe5skYRwWu0pAkWqgNXdncHy5TTKgl43s-921UZUU?authuser=0&fife=s16383"
        },
        {
          "name": "Glamorgannwg Micronation of Indigenous People",
          "location": {
            "long": "-3.290668",
            "lat": "51.623691",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFQIrwJxk7Twxidg_sjN11faqD0nOPg1WjXWjb6Nb0O-LRxmhOnRP8OLrNbVSd0qt6rtpiLVZiQzerxlLPcyKhEYFrxwAtVjEqbsCQ5NY659MV6ohv-rSDcOMxkYSyQyyZPwbqEkEV9lgh4m6Ze0IOtq9ZU_QpjJIRdxiS2_ki52-dRyQUS51Ackiz-22XKsAu1ia19bZ1gmlg9N3K9q31JQQTFDbnbBK_ILBdMHEn3d-aFL5LHRn_3deQ?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Duchy of Nossfolk ",
          "location": {
            "long": "-174.763055555556",
            "lat": "-18.9911111111111",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFSh8e3l8ZQwdWHM0kQFCIdvjg6tKoXak005E03HNEBW4aUakVXkC3CmcxjDS-OE4LkYQXXfXYHidvv_VTAXLzY9NHZM90mm21AP6-ITI9sfJ0a4npfpBHaNMuuJ3OqpUNzZnK_HocqXakycL-E0pFIyacl59PmXkNqDOAnY8ACpzKIWt5f--qw2nJez-tWtvb8hp50qzuM5mui2AygvhWjzG8VZaYbdZxo3kv3K_ctBgfGv-gsAbz3Shk?authuser=0&fife=s16383"
        },
        {
          "name": "United Territories of Northern New York",
          "location": {
            "long": "-76.502236",
            "lat": "43.072894",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEMrbXSUK0fFwAtDoDNVCuY4aRS7u1qB1q7m4HOSItsGNaEw_gAGE2_MEwcTagEk6UUVM6hQznnd68jw0LbMVL6E60kP621d46SkWrIT03qasjtNdng22_pMwivx-UJO5VPutfmHOq2vpf7SB3oZhKHLzsF8vgZ_lilcEy9_tgpg7-XyZKrMnb25ZHJCtJpTCOApWrhDSCXQ_t68m5wGtg8j8AMvzLYwJmV1SSHl4WItQqlUlw3afEY-Xo?authuser=0&fife=s16383"
        },
        {
          "name": "Super Cool Republic of Swag",
          "location": {
            "long": "-112.0740373",
            "lat": "33.4483771",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGW01W-WrQcASo_iEw5khSlXADh7bIaYFiJqoyPCTL4AIRmh0GEbRsFam1CRKle5mSWLrkZe2uuw2z4GeEbf0oB-tpIUjYXUmDvo43PieIP5Rv2DJ-4LNxoWn184NJAwIhqaRTwbhceuwR2vaUazd8VLPpdCF6Y-U8xLa2sb8L5ldGDj-DqIrALtIB_LXt1pM4QrqHnd1DtdNSQ9MQ3Zsk_ivsElyaiwy8PuGULLJuxAUl9mIddoHmHBPQ?authuser=0&fife=s16383"
        },
        {
          "name": "State of Hokoria (2nd)",
          "location": {
            "long": "-1.6760071",
            "lat": "53.8697639",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGc55nch8wdoBnir64EMUY6ejUIZKQ0JvwVXmMSwEtQeCm4HqwEKe_-nIzdCpko04wLw5Y5j97K_XPWKf8YfuWwlTD9wqz70NQlrkX9kJ9sH9j0Y9rAOQrvY8afHYD6QjV0amaj_GDM8cKARmii5u4Sr8LFaztshjZPlTbwCvTc7sIN1EWvX7yelDrftkfVNkBP_hI3u-XE4B9bzXWZD33bD5h-18Lsy30EeW_ANDaxDLA--3FwicMs5CA?authuser=0&fife=s16383"
        },
        {
          "name": "Tsardom of Kaltarsia",
          "location": {
            "long": "-4.2789148",
            "lat": "55.8740678",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFxIzvINsgeMVDRfDtua7dpGkew_KPQkZdFPYReNNdal7S83DkmGQCan8NDZcdyokVKgO1foaxIY6uJ6nV5zIGf8hNAoVvVEvW_p_hITMx2CWRwP4-59TE0a3akNTpmqQbgKZZVLvYKJnRl2YNind0xaht9nFx5XKgC7IFQB8m4HZt2UjBfmBiWDN8wZ0zNowfxWsDChiIxoFg3AMAyRWzGX2RttMYHMgqpAJAEXLxd5TL1L9h6tMUwhEU?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of North Sprinskè",
          "location": {
            "long": "-4.3078518",
            "lat": "55.8695412",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF7OktJZ79gKSh4luHsdc16ELMqZd7F3xoU7NUmGJycpqydSK05z4N1A9SmteJWVok0tfMpM7hrDqVw9AeVDnHeKBEEjdcrw8hczUG-GC2y8oPOFZ_yJgkFvcY80kCxlbClbwgg7iqev9aVAw8CiBCcXT-1s9gPS7oVZ3DQ26skDBNZrA0pDWz1jxhOyK3vWvXxy2e6an8FiAY4oafHhmUOnqLsxzZxuQnh_BQHBBgXGwjxBG9NNnyEx94?authuser=0&fife=s16383"
        },
        {
          "name": "Berghassa Republic",
          "location": {
            "long": "-4.2450265",
            "lat": "55.8474863",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHRzzeIPUBLsQnQ515ndgLRaPmww_lsPthzdOc4L-lfaHzuDBONN95qAcd_lbYIou4uj9MSnlCrQt7YgIX6jwwKXgUXFFNEiT3zbs_ByXhIPWa1Xrd2sbGb2crAm9Kq8FniMJ0Cyay2rWP_roV_xN6FSKS1Rxnb7SnEaIRGdEpeyQnAdtHAbWo_YxPdvqpcT1greR9M7wO9cZHI3UoFTjOOlPEgowfTSgfKlUSRHAKjcx2-iNWYpwEpNxU?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Seitnam",
          "location": {
            "long": "-4.2737116",
            "lat": "55.871794",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGH76UuqBbia7Uoy8QdJzJZnudR5xdQlzlyj7fA17hjwG-EXcqWAnYnoI6MknV6QFbiYXizAr85Wb-UN-Cmt217q944II7Mk8NMd7AbTCHy71off6DjY8FULHKGOkV2I5GsYdY77LCz-fPagdWUv5ew15V7V4hQOhm7dzc5DZpaUSJpdxJWSDXQneeYD0CEL5AVOgekONx9T22bo_bQOMC-os8wS_uUZ1DjF5m_uPmD_aGYE0hla95EDL4?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Dalrigia",
          "location": {
            "long": "-5.1153078",
            "lat": "54.8434655",
            "applicable": true
          }
        },
        {
          "name": "People's Republic of Edristan",
          "location": {
            "long": "7.483983",
            "lat": "50.8438385",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE0pqeTbfUoRIcP4QQEI5zqtCdeMcT41n9eXTGZgwEOIb27_-9pD-PLTpdUR8KhmNAUid3jobI7DO4E2wColnu7b91c2xsUNansp_8JCN-TxZqtLs8Zi-sF6PKRJi_dqYiQYq22mQXHIBPtHlE1YnaV6LbERH1s6Giorco-IuXkhhTwjgPrp6lDd5w9ldn8b-mTOmhsTIz-tfpc5aDblR59QNYO_ep1Y4jW072Wo9oqLLIaj2h6viVy9yo?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Ashukovo",
          "location": {
            "long": "41.259566",
            "lat": "54.3875964",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF9_EgSUl0sZiP5D5gAjOiEuH3tNiw7JO2XT4_DWplLxdpw6C6U4nbEd9aBZxSlVex6qekhgy3HUy0-YMzImSazhfBkqgrdazhc0Q0Ebqo9YuCLTUuxpWd7Mwxd5NaM_z-uTO2MVLCpJTFFa2ZqPQ3NIL0K5tCgIR1Pf47FgUoVENHQplh8CcwwenX_-fSVwhK_uiJezC8XWCxqqNo0sWfDE9FmilQSZBwceB96zCd8bKrn3hZMjdyu1kM?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Florenia",
          "location": {
            "long": "-72.7714267",
            "lat": "41.3049376",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG2WK3QHTU0YHtqrj8z2xFItFUcv-6F4nWP4QbRXlFxOgoBlQ94Ng-itwHZzGnVjOb5lm_cl4tZNd66s4eOTBtDmK-U1fuR0wfYlGyJ6uLSQ1IZ3STTGeZ984JgdSKCsfVfLKQW-iMqbbwnUX7QhA0Ug7FoVQQdE8B2adv0hViNFKbK7K4SeY4VoAwkc-2dS0TIyn8wM36GeUVDjDPq-Xou0E6nM58KInyIRWyiW1MU_HqfJ8L0yVbvT5s?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Cubeland",
          "location": {
            "long": "-117.1903819",
            "lat": "-10.0558953",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHFhSfIuTiqpa9XY3CqZICFyiX6eaPR5yNKol5CYJJXLC7vvw5w8R7Ds5SqrcQyatmm2b1tQ2i4_7Rjrtri1sqUvp79pCV9uNI4WaPq-Okth1v4rFFOrMt_oo3N-EvFkVPOKdB-7VQOjNVmwHJjGfRpyFTjgvXzl_5VGZSY_uCgGPyU5hdMOnHaUREHzQohMQKcJdOeW54qj5z6qlSCS_rmqCsVauBZaTDtNPVX9RzkjQigkt8TFCCkpdg?authuser=0&fife=s16383"
        },
        {
          "name": "Duchy of Ticronvidea ",
          "location": {
            "long": "-82.0403636",
            "lat": "28.8978444",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEPOL59ixJwLq2INs8YvicnUhXqly4cbMj1ZhQ_xWrtv4vqYX4ng7DsEKIOZBnIjIPKnaFuAuDxnxeGTTVNsAoUQDTpYTXJ-30dBen3CTNEqwXPJioIP2xPPqGaKhHHGbZiqUmPGBd4PgVTucryGcYKtpoKTPZahchBhirYarcg_fgpqk171hri4xjWL344BFW07qiZtjem9zjFUzKO82G-qIG1S4OxX1Qn_e1OMzYUAI_7EDLM7MjqY9w?authuser=0&fife=s16383"
        },
        {
          "name": "Newgraviate of Saint-Castin (2nd)",
          "location": {
            "long": "-73.8495725",
            "lat": "45.9504248",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHb5l6YtuLAnlUHA3rjmKykXIQ_a_i0XlFY3l1N3yiS4efXgBsotXcwTuMU4mFpJ3SoGvz1xxv_mx4RKWoZXJ8eCig6OobHi2L7DoyWMIuqRNvaXlMTdUa7pwiQdn5RY-ghZrhEx60h5fy8QG6p3qBAW1y8qoWNWJntBEx2CtN3S6OaSwf0kLT5HihuRR3E966lAXFJaV4PEkRAXtaoE2-DKY0QLHA9wyeU3AUWFRyMiuPE4dfzkzJZyCo?authuser=0&fife=s16383"
        },
        {
          "name": "Newgraviate of Saint-Castin (2nd) Part 2",
          "location": {
            "long": "-73.7572393",
            "lat": "45.8524432",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFcRnd-ojmEEr5yb0Lxwl43hjcipLtxiL8txMOyzBrgO1OMd73AyllKgHhLfHqXh3E9L-7u4h49dqtwCYE9raDOERSTOhUad_jE24n-p6o26RziW8suolTCK0gfIAr2jZfq141gYQbWw9iltlUYQQTOM-nN51lDUGLY5jHcAaY3zEKqVJL1z8oIpeJCKwoE5h11CAXKXnTsweavu0F-T-L0snfkVgNgNU1roa278Z7YSJ59uhD6SgXbZfc?authuser=0&fife=s16383"
        },
        {
          "name": "Reino Reunificado de Nueva Yemar",
          "location": {
            "long": "-1.1633607",
            "lat": "37.9353367",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFVtd6YLBepdt5nNEDWyLgwYvopZkDFV5avNV3RLxXTI_bNGz6Zv2qePq_EtcLCx9PG7AzL_cr4erxxoLzXdiZ3mSY9WoKGdH0hqyxFpewXWWm0yFwPnV7vmzqvZaF8YPcogyismwsQXdNsseP4SBOigzxiARUNFde63-FiNWC_MIcCf_zHJnj97-pQTJHNhpbiDOCyJDXl8oYtPZgV6yj7cXdMFwv3i8Rs1hcbw4LC86EnVL5GWGPsIjg?authuser=0&fife=s16383"
        },
        {
          "name": "Commonwealth Empire of Wakoku",
          "location": {
            "long": "137.2923893",
            "lat": "35.0182505",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHQuoSReo3AiZCkpxIDa2GkSI5EyIkWmFfaSiQr4gSi8oXfFclllJVKahVp4SqbAMKli3ykedzr4ulvnVfG9djXYjIl0mAGaGf4MsVvfqe5iMEuElD0Tx8GcdPY8f1Ys5yGtBDhAkO5yq21MOuJCZd98UVrAr9HUiLtJUO0FFY9pcLq0flEIbu2-R3ZnJN0_8UH8xmphS4ujBEGJDU36dF92W4P0Q_pfoFk3Bd0I9dSny6q8Mc-Vb9MZ1I?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Fernandez ",
          "location": {
            "long": "-87.8653005",
            "lat": "49.3465595",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEXTa9OlAma1wCBF2WpfGgfzK1hlB7Fxgda3ZXsz87G2fUNaIYIlCd8VLtK2h0q-tKVaPXj6Q8LDu0XtpzInozMYBzFLKotOv1U-4qTJZwiqhbe2GcsQ6Oq0lr0cmLjWcjgyCnnsJt99DNpAPlH_OrtZ4kLhihVrmM17tHYVtfpgQ-EjECcH0m5lPGiGo_ESzlKw31Q8tfhQjUtj8YEaWwCANztO9jRW4t6NupoW6KXS0c-v_BYu6m1oDs?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Berhouet ",
          "location": {
            "long": "-80.4654326",
            "lat": "48.5328574",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFZOddx9_QypdzHt22sUx0eUWgaDpT_zWeaA39A-jP_Y4OH05cNVHMyWpU3LZd5Mq8KGBvN_OADIbDZYv8JjuUzLmwOPIpo2xAWkPprSOWDFPodo-xFFTH7c43IZGkObWe1WZGeAkrIIFplU13MCG2B_qQBBMfAMkAzS4F6KaEg7i6wvKahI6g1w7kaZFeLt2yMra7Z7q-Kpf7UqgORiASkamvm8gc0dlfav7BahqX-5D19DjGBfIQEnt4?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Munoz ",
          "location": {
            "long": "-88.3341645",
            "lat": "54.0725271",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHqcfZ4B8i6qnrI64vgzC3jJymGQYfIOUUkupyM6jhBH0NUNJmCKJnYTf-CrDqQI1lUXINUMn4OPdf9Xb8DaXp_g6bFyBIVLfb9AOGnfDtzo4QTxzrTJOoZB8geV9IqxpI22PWw2Jk-Da5loRGLZQanMUi_66fL2Of3tQm9nCofXMconIbnhNvmY2eOhQcs6EtJNbOtVtVBHwrX5Q2lM8j5zEaPpNC09sfAtBYP2Tvd8PHy-7S2SIP4ouo?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Betida ",
          "location": {
            "long": "-83.8676201",
            "lat": "46.3072677",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFYNOxRN4Ry7yk81Jne5K-Yod3SawC-unswJwWmS_VxDvfPilJjLV-_VHNygI2mZROPsIdFmvGdN_lBiThXxJi36GmMBsA4QHUnhlpVWyuQvKUtHG3swj69BYMeQMn1qB6WB935Mc-AyVXHkH0G0xAGBtA3ObwDBDHbG7-zbf--G5q67i9vtCFbUPXcy-UwlkYAHi83xyj-JoDSzsskac4k0J6YybnBKSRNFqKH-TAdjQ9Jhi_tXkA_XEA?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Munoz Berhouet",
          "location": {
            "long": "-94.2339537",
            "lat": "57.6895839",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHc4kPqcyYm1bz-5z6i8lPuorMMCkWgdIGkfxYUArwC6ULLsphyeOAjwMhcptZ0G4hVserm5fUbOcH1Wcon4AQegm2kxMq4JgfdtY5lZjSZVogsELoH_g8Zx8dChTszpdId9irw9xirTTYilwfYhkJSulBuUTtfb0Tz3Y3eY56WUkLMMXZoFiUjQ7I67Qm7LVtX64spjOac446QZhdJEDm-wN3pyJGcuIT238ccc-9kL6cAoHIldBZ0Dos?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Kingdom of Basque Canada",
          "location": {
            "long": "-83.0436462",
            "lat": "54.7639716",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuESmRrwe8IoiQJEdW0ChselJ1WiJOeHqGi4MRqjptKipfKK08hSXX8MYp2YGgR55XPNyuzs2ZidxK41ON9V5lwAZQjdUMcVQ_-PylfkFGPQTW4EKE-hQTCbkJ7rEHzgN3szocIMjMq4Lm9B3ElOG3_HzXg9cAxPLUDcpSfCTpddJM82boHocvPbHEECu3U8Lg0ia3-KGw9i1Jp8HisEM6jqWQM8uFYaTApJKsu101of_5zGauxmp8l2Vnk?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Karnia-Ruthenia",
          "location": {
            "long": "-46.7201753",
            "lat": "-23.5152645",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE-QjUE9lwqNjfoqe493Z2dur3_BJXW1-AgtghUBkyUsKChdboVTRZ_Ayqf1R5R-Xchmv93aZvW-bp9Y46ItO9xsUOZq2w6AR4bn_QyzTVhNiqzx8GmmD9Sx1SwftNIv_DeUglpGhbjjrk2YoSBEshdKY5E6hnOh2u8lSlaijS0wa9beB6J1mDAKLPXBaEt8o8Gssds_X2krX1gWohAwNBGsoRb4PIaspjIG0kAtqGp-UayU0u152XiVRE?authuser=0&fife=s16383"
        },
        {
          "name": "Reino de Neor",
          "location": {
            "long": "-0.8890853",
            "lat": "41.6488226",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGwBklKXo4ZbkaQMVHm_JheqlAhqMjh5Ovl2afeb9DXGCxo4Trw6FShGoXXyZzOQnhV7Nz2KIVjya4DxVbIh7MXwm1JHCYVdaeMABiUQbh0Qj_DSEVSHb3oc6JyefrCeNGhg8qbj1jd9Y0K-miXq7000TzDuPmpP8xJ0fw7SsLmGy2oOjV32Yh6aer2nFagQoDFX1IMV_vf3lFTLF3JMm04YOun_zInr6DGEyDlk381eOpuZT233VDyPUs?authuser=0&fife=s16383"
        },
        {
          "name": "The Dual Monarchy of Shadow Metropolis",
          "location": {
            "long": "-91.9623327",
            "lat": "30.9842977",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEWDgf2T8vNkxB9C0R0BRe97eYOZG0dvbAUxPvgL--R25F-xIW2jLrbfl9oRieKtU3a-bGTjGzsGS8EfqdzlPrugnKN8k4UWi5NcJE8wyoYEMjUB6DlBLWlTFG7R4n4wE2-SLc8BVks6TUvZQ9-S_qRIS4Nx9cTQpS7P9pVrBfwBc6cFdmHUU4LORc9NXw61qnhto2yOmtwrAoepBdYeNZGjViLI4s5TqsmlULeWAiPmd_rHhAXKWQTpxo?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Shedingeh",
          "location": {
            "long": "7.8423124",
            "lat": "45.2277401",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG3j_pKvy00AlWna-oYEYDcbUfqFlRjqRqoizCoFPNVXqq5oXgFZkL0y-DeYpmFzo2OvHsjpBCAFtuQ0gtLaMra2jjBidqaRHzBGNI2zXAraEvEbpfKBuMxZUex41UkyR8uk3yi16nMg24NlB0rQPqxw23F-SBJgLtDdSlRtNTQ4sq6s0D1hmkytqROVbVuiDxYQs8Zp8AAmEEVT9JeUxWC0Tw6ulA7MQ28cLdBIVF-bgPufd3DTNTgj04?authuser=0&fife=s16383"
        },
        {
          "name": "Semi-Independent Territories of Cilsur",
          "location": {
            "long": "-4.1284622",
            "lat": "40.9517847",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHJ4aCg8RkRFnl5w1p036isjfRQAsyjyh2kGqV7W0V2nlIx-U-OzU0860UxpJ0_g2zn_mNl7ClIZ1Hq6BYOKZTsO8KxKoFlmygkYLqMWetOVqIc-qjgufeROKJMYSGpN9HlNYbUa6ZrZZrVDkt90noED_eJH6h75z9ZbskivXlHY6CExFsFkp-k4qm9P0qeqEfiOrdEKA6JRnWM5wGz4i5H5zfoti6wWhssnRQnt7u4E-iE4Pn0yO2EFZo?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of New Mazovia",
          "location": {
            "long": "-72.2416408",
            "lat": "41.8228087",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHUBN3PB7MB5oFGmFuRaEmnBbr27Su1W9ZmMNNqQCSGYW0fm3pwyCqk18EkQCsATFnY6jG-TkpQe0n81DMOgXAARSPvqrWGMOtwT9_HiocSYBLFmYHlg_A7LFckgHjLYh6N52KWD44imaEgYo6gv5EuvqhVKJU3KjND_-qtDfLLUcoFvNvF0i_cwONOc1I4dX4AK13fs7-hev2GE_no6mxxYgiQb8dbPEiDzexUIpMGI4Vb95D8XtaYpNw?authuser=0&fife=s16383"
        },
        {
          "name": "Holy Penn Federation",
          "location": {
            "long": "-5.265995",
            "lat": "51.881227",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFpSNVrtsp8xG5lOKGHpQ5p1lbOSwW22vky3sm1UmU74O0oYLLEwSHH0DAjnHjVQEqhdtMmbX3ex-OBs7dx41c0vCpVNeWuiKM3ueJEDe_9AUoOadAf1tkyy9cPhOkbuOXeRbMvsg4-GpMtlUja-Ts5EM4jTjGHDpnmI23BUIIhMrYbepnspadyozXETW-yNzky7bqOcYcZh3lPs0RXN1_clocQDMViGLFkQdak1CZ_efVgeNUjFBvX2_Q?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Listonia",
          "location": {
            "long": "-71.3824374",
            "lat": "42.4072107",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF-c3L383v2P-s2mG_QzCRCGoumj20gwsnFFTmFgfa5xx0T2nal0XcZyT3Kux4dtIguP-jX3FUsGl4Ln7caGnFZuKSfpsTuaL3_g6CFEk0XBz00ODPVjJ5D4A5Fi6tU9yKd3st47IHlABIhAcv-9azi0L13ktpBu88n_PG_zbRTFOUbqTFQwZdaKcf8JIqexTvwKkcN3FYXfInSk1eKCq8WDM4dzDYWmU3IYz7RyGeeQJU3QEuCgorlKT4?authuser=0&fife=s16383"
        },
        {
          "name": "Queendom of Nyx",
          "location": {
            "long": "-85.8378187",
            "lat": "38.1459489",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGMm_QFPPf8EWFNWIMDJayuPRjKsiAoHd6Y2d472yFEsvFKdR5BDHPwX9RhNe7i5lcNt9ftqcrZQN6JSrFbD6F_ivgqwLfknLBLQBINTwpDNcf7Ee-yvGi2O8Q9SJDQngcXVw7JNcAa_lBOIY6zN9pDjbrx-aoN8bGIpQ36r1TWJ2Gm43cxaSboL2S92eYjJaWWbd8JVrliLQweIVikb2P85BwL4wTr6vX3hhxqsQyambrk5-yBUfO8o4U?authuser=0&fife=s16383"
        },
        {
          "name": "The Free Jewish Immigrant Republic of Lipelistan",
          "location": {
            "long": "35.3185",
            "lat": "32.9198055555556",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFytB6Srml0zGSViTBG77v-kUoK_qABadHErEC_OnIXu4j0YXvky9_T6sBvTtoCEbaHkvW8X8EUaOwHqx2zcmHkKEAekYOwZtzG_T5HaOeIuK5-ra4p0W0JcMyGiUnRL_re4OkYiHa8ULrWZtVj3ltDpUHN0hUiYq6iviEaU2MTxBvHnTTCEB9CnlFQgBhCl7HGnmB7BZiX2OK2hMa-973gsca2JUlD7-1TqEzVaeM7Lt4Mp3WEe0ZkNIo?authuser=0&fife=s16383"
        },
        {
          "name": "Imperial Kingdom of Mdesk Chdoinzarneina",
          "location": {
            "long": "-105.084423",
            "lat": "40.5852602",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHnpgBCAMCHqRcE_aXekVZiTE-5ncA-DDrwpt_1KG7b_8mspOqoQ26DxTR7ko9JnTZUL9whUHVEujd1_sM_dkYr3DYWCFIrj2zpLl1OvdUtP1ZUw9aSb61k2TLX1GcQ7LX7IbPuX80LQt6GkNLol835_vLLa_SPAjAu1VNzERwaT3HqOvvmQWmH7Ka0KBhWzMWemBnVbA-l5bbwvsx7rPyvUUdA3Hi51mFe8djRkbrAqiveOO-xv0HzGmo?authuser=0&fife=s16383"
        },
        {
          "name": "Bask Kingdom",
          "location": {
            "long": "15.6461003",
            "lat": "46.5547245",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGJlWwk5JoTvUefsHBZnJg6LJmhaMU7jh0kRNa-9NeqroHLRD6YEn8MhUxbia8tiwWpeKol4a-qAZihOvs2qt5H1gKM6TjIScx59fUN3Zm3LpJPlg9zmpcBJUvpKGi1tdtrJ4dSx8SoZu2u5L4zETkHiP079CM7yeKePsinc7xh-B3NOduL1Ffylw1kAPnuiHyPQfwmp1eXO3fJ5WqEbwQOyaMpQ7HnsaSdiygco0_6upZfjEIsWpQyIXU?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Ondovia",
          "location": {
            "long": "103.8212752",
            "lat": "1.3498295",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFLbR13kw_VKf-vXOvb9GoDTUMIwSGuQdfevF_vD0T2NgeRSnWvxBcPTfXbwnz6uC3Um68OqoqfIq7gTcO9mkN_O9RXl7Fje3hYpMLW6iF2scPr0N3PnP6WfPK8FocpBcSY-8e3D4D1-waCoBNpnT-YH8aiatwQe7AF_xDMvCZCYCrbDjZ9whfGQ20wkuVqhfDRMQImL_nR5jiT-Q1qsgdMLkSc1d7nq6RU2am2_--TAAz37ZrmTMqz_v8?authuser=0&fife=s16383"
        },
        {
          "name": "Free City of Vodopol",
          "location": {
            "long": "26.0281926",
            "lat": "44.458842",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF3X4DC1doCn6Mipk-WVVxF0MabzTFWEOzsu4uNjPG-bcb1vusSoQ8RajKaeoektrW_6gAiB_T7XlTYSjfxf--8IYCxC_Fyybev55UZx_jcC9s0rRnm1INp2DTMeQiH68nhA4nxjZYVlQbCkX1eGeOJBePI0hFzpdqsPqP1wGHYvKbgH_VVGrnwxwweHfPM7R55hGYew6b4G1_Wrq-k5MxqmTtw3Plpfm1Dv7A4R5Fh8SpXcPON6PT7UUg?authuser=0&fife=s16383"
        },
        {
          "name": "Razorium State",
          "location": {
            "long": "121.1561137",
            "lat": "13.8878981",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE9EB2tKRWLm-barEAd7p9z3GY9g70RC1gteNLxopXkGXHU2fx0C2jstlmz9FGzvrF8SjIc_xa2A-NU0TctE34UzetEPVk-5Ijb79DRgnhiKCVCI9V0LASnuGAKUVqtFcsrE0ZZsS8cCMYo0I05BuL3iVZGD3SMfQWdIGn7QJjNm3BBAOuo68d9mv7kRM9MPv6_zOoyQ7paMl9cne3x1v59ZU9cCOCjGoDjlfhuLmHXV4kyXuQ_CGBFkmM?authuser=0&fife=s16383"
        },
        {
          "name": "Commonwealth of Dunland",
          "location": {
            "long": "-1.5852887",
            "lat": "54.7751991",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFu9oDTTfL5Wr1aAFeWmjGxMy_ZzzykMVkExkcS9ALsuZdj7D-NkoedsM95-bRzhM3wbWLlA--whrBj342Y0cos4l509RKZ1vhs-uykjIp-p-oCoGw-mydiPCFHZpdDcwJbrLeOdEs0RzcL_oIzwcs6WVL1WRaxTclXs6krpQI3l2fo700c1o525VYkA1Tm0pOwZb61vx9PHe75rHC40C3NfILR26zCOV_DOGKpZwfYFEtJ7FSSuubTLK0?authuser=0&fife=s16383"
        },
        {
          "name": "New Ulster",
          "location": {
            "long": "-65.9942973",
            "lat": "45.3888261",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFjD2fxFuHNt5T6WsdrsofW7oCuLN9K_e5T7bhvP2zmJHhNK-DGF-DIGie2eEq_Adbht-HCQnOsHmORhyaczCThA408dDhF7NE5qUKDN6lKIADumqAgdERt7sapYUfCh39s77hzlbgnoBrJYZ_q-2C2ZXGtfPDSvdkTkRmiu5sk_S1UE9-rBsDKjh3h0a-nEl9TWM2Otk4nxLV-2HWsGZck4ljiNbYaoFKIfDSzb6GXw6eAnnSqJqaDbak?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Robe",
          "location": {
            "long": "-9.3325412",
            "lat": "53.0197365",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEtTUqR39i4YkjtEhnMWWs_LN7SaANRny6Hx9ljhH5oK_F8ZsYF_Lsh2_Q4CMzf0fMExJSU61FVcP_-QeWpzXcHHZJpobWUha95bl5KBboPtZykm0Cufns4dmhhskrLYAnZmqyC4xrFHkMTfOFms2cRqZb3GDon0Vs0bZOPdWFpRFVb_bEUSrptvZgnDcjvUGBklaonce6Iw1lwIsxmDTkoAF1JPJ2Qu4cZIJ8c5RxVlhebuDGQJUjZiiE?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Aeternia",
          "location": {
            "long": "-86.7363724",
            "lat": "34.6924726",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF1rJIg_vXlNY3_1dOjDBmQ5JlllzTvFTNrjYCgS70cnAY2S3hY41u3MhCMVTFGMz2R5qUP_lIwoOzgvc7HtWWvI6pORvBzGQOh18ABQqvvR8ae6kF3edltyoJQasRtBLzHpYDWHcuqHTVK7F_UtHKbMPXyEwhmGtiMySjFmyEIaJzcp0106Tb3_PGQywKhP-CvJCll9l8D_1mm_RgEBrC2DjOQN0J8yeg4M6uvVcT5Iz37CABF-r85ego?authuser=0&fife=s16383"
        },
        {
          "name": "City-State of Elevatia",
          "location": {
            "long": "14.6816934",
            "lat": "49.2096492",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHRpiPt4waD2I4YoRDHuB4IClR-xMbDpflA1kUHknAjimEsZXUfkCVk8OYCpcf7EFujPIoE2rOB7gi2-WdEA0YwM9JDXEq3TpxVTM7uzaIK-HOqMoncbGYgcRhGlu-LCsOKv6zxS7Gd1C9hXtQo0DrXAclLtn5Cn4LdSpgXH7gf5nRNDEv3ezx991KzhMlePuH-UYx3qN94IGYE7L26vNTNlGjj7QYAqEAx2r0jhp3edkx-OZsjDxFMYo8?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Order of DR",
          "location": {
            "long": "-122.2308666",
            "lat": "40.10865",
            "applicable": true
          }
        },
        {
          "name": "Garden Republic of Sirland",
          "location": {
            "long": "12.3233144",
            "lat": "54.0992338",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGzoofFv_ofCEUbel822TM5R08IByQRhAUFqKqRtMPkUtvHHe74qGEhcuNAi5q3j_lFIg0JfXOWj6e0-pUQWCLPS4dDfZimY1ExbBcHTRAZp0T62jATIG02oFRRSbqtYFNhsOpd81zx7r8ytuDhm3ptjdWIaAFklDan0KmCy-daEpEWPtlwiAmGwoopOzokmGaH_QXB5OMKHtiqVZxxagy0ZuWw53AIn6ZiV9Z5C3poh5pZbtq-7BWJPr0?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Ethosia",
          "location": {
            "long": "-90.4879916",
            "lat": "37.7652755",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG11GRXGAjILO0PPDEs3hFERNUHTd8uM31qpNEMO-YZ76L2HhUUx2qsCDXcgmtJssoqbqbKiS3AvT6SWxdsTieOfVxuEygaBOZlLy6bUlOi1eV5o-sGU8POv4NWpeGwSXgBguSBjlPdv4ZsLz5xvKhzVa3Zb6Ofr3ApxTW6H8zrp9M3Z1_o4MLfFRLjSQCXIm_U614qZGXHOBWlLIBialBLSz6Qs4qtmUjT1MRw0bUgjQnAA-gpLLBPK-Q?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Keat",
          "location": {
            "long": "-92.7514363",
            "lat": "35.2942278",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGaGNDepxUjVH_cEja4-0SKVnlOMSSk_-bOMAu534BcLib7wJEkHnftqgYotFfDK7oxYRDrC_E21_ZumBnwfHrgPqlti0Ah2kZ7yEc-2EltvIncboDzS7uYXWP5zr_8nGAAm8SwRUHZLbIJnIYAF8Jhn4I_-AbIkO0YbBKj7oXEt5NCR8Ql1o0sWxQWxa3QPPY9cWM3q9UJgop0n3Vtl6IXvPo3PK4JAjGeRIUvUNNnNE6yDxnDAS44BJ0?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Lindsey",
          "location": {
            "long": "-0.1601246",
            "lat": "52.9451889",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGuM6Ywy0s0mmFHcor8PgfGsUksn-d01JjFRqs2-VhaBMX_ICA8PBZFQkSc7zim0O1Zn-8AFCPz7j0FnIxID0js1mgrt2AHE3XwzXoBi5V7UrSRTstIju_LeK8-qsuSoHogTN_eu0vSUIv2n0Mn85qYglyhZgFAP6dmXkPMfoMr3vuEG1HOyxKQmDpkkeMUfLbID-1EZC4S8VJM7FkGO4PF9fZKipO2HqJsSM1IiJxR8OfoytlgMHfSddc?authuser=0&fife=s16383"
        },
        {
          "name": "State of Samizdat",
          "location": {
            "long": "0.1960785",
            "lat": "39.5465235",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFh1Elpr254ORlrgl_EtGX8f_hewFrAXfEQEVQhrmKOYMH7xHZCaMtx0xlLU0n3KQ2B2AxkIDXILl8HmoFA1kY65TBQl6C0p12LO-xAlR_RSVQeU84aa90jbnBYn5ccpwAFDMHdNmd3CbnlCq0ocKaYdgM58O2zM3XlZn4dMLuxzJ7MsBC2kReVJDeUQWpXovTEOPzdHZRhWkhbONAI49kDettVkmaARG92GOdDBW20sVjLOY19MdK0UI4?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Lamb",
          "location": {
            "long": "-2.7488842",
            "lat": "56.0698168",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEuhZ7oDkQ316Q2-7afQHaLAF4dD5J-NQHWJXdsh1y0Swdf1R22SYXqYlU7-n2YQL2nStoS6tXwkoje0M7Dn83qhSXtTLkzYkRAdKbMQtcLXQSIhm1jeXUzaOWsLf1gBARho7CvR7gwN053NNYY6m2X57HBXA97zdB7O3U5FYjc9FWaCJ4MDjc-jPrqvZ7CbzXopjbFaE95WHCxjCWaCCA_KBL415eBnBUFWzg4mhNqcIU2pOrM6tVqhlI?authuser=0&fife=s16383"
        },
        {
          "name": "New Garlean Empire",
          "location": {
            "long": "136.9805103",
            "lat": "35.7437491",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHjMPvbts5khOIKniZLWppyQ3_DbdaCJyiJAOLr0vk4j9juyqkgq_OEo6uWZHxZQ3DQ9CZA-W7P-skG_q-aPeGQT2q_rFZpPRSWSFhIstVIiyt2rn02zqcoK3gMeH16Y8g8c_poLDHpxY-5_HeuvufiTG1mhqidrsI9EHHmf4033MXYMPK0zdCYiN_-r7bTLwv9yX3hBOg4jjTHvq8Vgup4leDKz467gLFWEccKkW80iWstuvgCwWJCuVM?authuser=0&fife=s16383"
        },
        {
          "name": "Listenbourg",
          "location": {
            "long": "-9.3663705",
            "lat": "43.6113234",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuELhMPR2gJnaJBF3Ez8ehECWjJKnw0QZHzzFpi0SSHXGNpO13kaymgpiBt-0q4dK1nF407XSFbKVJ_JZeQRxv70CivfMjcQ892S4A048Uk8JGeVENRChJIFupeo7RVao0gfdCMbzMQ7Oj8nfI0g7_D3A0eCpK6uk0sfC91SAj7iTeo3ExbcnHeFicVOG7McHOiw3bG86gk6NINYcLf2QNqckalSqQhIsNZ6TYYhyfmHb3NZI1u2m0RTC3k?authuser=0&fife=s16383"
        },
        {
          "name": "Autonomous Hispanic and Reformed Community of Nisea",
          "location": {
            "long": "-0.8328249",
            "lat": "38.5914512",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF-C-VPhR3dfTBTB2LMIlP8C86kHWwJvjqb_TY5yvqgHcQhCMP_t8cjEqK7d_qiiKi1ZTTdPjMX-WLyDu3K6ypK8IJwThIKdHFV3J24b2CtgI7SFNvYOEzrwXEqSaw1X4rbtkmpWFnBoe21fMeTZgpfEQOvUYeHsaiNc61nhKweCa5q6C2S1PysP3wRoQZl137clR2xa8S2VQkniLPbW1Ylarcnq9SnJv4UzstemLnYvvWYkPmfB6CFxhc?authuser=0&fife=s16383"
        },
        {
          "name": "Holy Sifanix Empire",
          "location": {
            "long": "135.7681489",
            "lat": "35.011564",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH-isIBiRCGU9PzKYPU0qcyiVi7Gcjllh86Gq9o7ZObJKmWmMhbpjXuDvPV0T64Et0_WDI6LFCO5ioXLlgKk-B6zfn3nTWjlzzkmloBmczfQaYGxIr_DWi6XqZFM9RZwnE0RyP_GVP6iRucdtgCFaJ1Xe7U7OOsFdJN_K-n8azY26BfNdEmZPTYeENgj4RZuHJ6hKcGqH_iLAN3HMCeU5Ixelm7g3n9ItdUA7OmgrbBHtHpHaxPL6bbCGU?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Berevia",
          "location": {
            "long": "-90.5756643",
            "lat": "36.1420113",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEX5Rv-77d8LajvvsN7RrjW6LicqTjdOQVqsWPoj_ZRAJ3NX_Gy1uqzmNMQhnJmuU8WW-OelfLoeCDK2O2cPSfBoof0oirCQBh2kjw6H7NvQGBpR5JkBM2609fc8rAluQW9cBOkhLeGZILQQhZPJ5A_lufkivcHwze5NFZML2J0Ts7IFmp-OuOyLXGuoxAXBGHP3E9Ef-ywGRqfT1UlCyCVoSPcz8kl3wJgjHMTiKaC0bLwC8JrUXrOwXM?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Tarsonia",
          "location": {
            "long": "-4.7793835",
            "lat": "37.8881751",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG0BMZLCXWnqbqccuc0V8Hq2kq_vdajYY1bn1pZ-x2OCiPR12U_gc0Bgmk6g4cP6fgOE_q6DX3_cLlmLUMbKxPZlGaVBd8HKuNyhiKDLIQ9r0x5uyse1vXPtnydxiuYYClLVP7ShR4UIBFlA52Z9DWAxELxGS4wtRfHpHU_ZBxG-7HULH27qIET3njp7mlDTDcNubb7Ns_KLyNL1it3WmNYx1-GiK1aEHTDPTlXWn1-0lIIZQNPHsqSZYM?authuser=0&fife=s16383"
        },
        {
          "name": "The United Kingdom of the Navasse",
          "location": {
            "long": "-75.0089019",
            "lat": "18.4031038",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE65GAWMRFfJVhLXxmEeHzsn95oQEg7fyPmNa5dVNtfrS3GigtEsw0oDLyZxH5MB0sw7z_IATvPub8OOCSy_cdDhBvR-nxTdJCBynBixixtGyk_LI7wk6RuC9LWeb-ju6tTKxQMZRdVf2rU7L_AtEmI8b1g4BR55uZ6Qp8pSv1xCjpYELmGT_WVEUKkBfxgKmdgQY6CQdpaC3rprjM9xAcn49OuI--cML1avnz3vqlCt6_4PBDqY_SMVBk?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Northwood-Oregon",
          "location": {
            "long": "-83.4386883",
            "lat": "41.6451553",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFSswW-pdN3sErwoGY1w3mSikZpVJ0hU63PEKu2bJrd3a_BlX7_ErjB9NHTZP2SAC1Hk4SPq8uAKhaJWLEgsFhd1oySPsgatxq-auo63-0CcGyTLWK6h6ZOlItUyorU6K461z4wC_1lFabu07uPslrsjM8I7dranACwsaKG8_yTZ0p_5ir-TtA334A8KY_MBdrb3hEu9NlqPqOgu8QPkbaS2_jjsuSMQSxDk_t9O67gDi9SFiTwgYZkWZs?authuser=0&fife=s16383"
        },
        {
          "name": "Federal Republic of Lostisland",
          "location": {
            "long": "172.0849962",
            "lat": "-22.3951188",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGtfWQJGiP_OPsPHAcTevFWAlJ4PG6yWElZrDYKjDTZeYmPH2qZMpWF9UBoxLZXaGUihTQH84Lk1qpUr_cwprSn1R5wkai2JEg4QMK5XC9c-kikT8iuiruBZB0xPOsbWM2Lh8R0ECDh3RCQojBCgiYe4xXeVvwko_XMKmo_zxEgQ0zsd-t4jEQOsjKLoasMvOw7s3rfJNOeeeuDAu-T3SCI_TvZeniOXYzF6zX13wkoc9-PNBGA7XCnpjk?authuser=0&fife=s16383"
        },
        {
          "name": "Elendor's Kingdom",
          "location": {
            "long": "12.0391236",
            "lat": "44.2061606",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGAsG7QwCkWczF7kuoBH64K5KIXMP3mKThoViRQqdEzEDR4r2eRH-ekdUr2dCJiXYazlYRzo6G3E5P6Sd5EfudOtq1sToz4eEzmXzSW8JiTTeKm_MNIOuV86NXwHiayc10vk3imX0_cPXnQCTM_agL-Lf1eowdSco2-5qJv5h84RPO5-6tcQPaaywYSYWihF0SAIwPMqF9WzmNS10dlt5WXYABIi8zcyWIMMAb_jk_xgEU0HDLcsuDpA-w?authuser=0&fife=s16383"
        },
        {
          "name": "Nordic Federation of Bjørnavik",
          "location": {
            "long": "6.2112204",
            "lat": "48.5222968",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG4skPC3E-PBp0O8zJP9VdJyWGBWTSXv1dDgMFC0YXwRqfYobVz5Alq5WGl7H8KpUGqy5muc7STu5PU1vWnOaWIk_N2FBCEYvRJJOx-Z54SSxaFynXBYe1cIQGq2g8O0GDYLXWB6WYxWRPIG39VePJZWu3Fwaf7QNC5r2pzbL7tqL9ytMeG5C9KfTDmY77d4Dj2Xfc6oEXmrtehh6A5hPYRC_V07en9SoKvyEKJVJWMkXN2XnBpvtXKkYc?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Apalache",
          "location": {
            "long": "120.2366297",
            "lat": "14.8967937",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEfvHrgAmbW3j5MUcehxLd1mGDPxKVq7uWI8O4HvQMw1WeFEXB3RxZl29S_PynhF8xfdOvFks__g95ki6vW7YTjUzpWdIToE8DORKVPoFzdT_20ysAhmF1QyDWxO8301VtikCfAY7fDxHEFC-XgE0sffOgiiG-X0lgEshwea2wOep80spordLFNdkF5DXkis79i50IqQuk0Z8S9kiUD0X82s7whT1UXKr-C9qFVGAUNc-qd9WtITVmIeCA?authuser=0&fife=s16383"
        },
        {
          "name": "Ondruland",
          "location": {
            "long": "36.8434433",
            "lat": "46.4398484",
            "applicable": false
          }
        },
        {
          "name": "Duchy of Heligoland",
          "location": {
            "long": "7.8889438",
            "lat": "54.1803268",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFHrmfLM9PbD9feayQ1m_Fxq2Mp5xJeEK-LO1U2m-8sGK0AZbrpjaD5bPpQCCFccLfDerZjaCuiXFyk0cPgINqMTkKaYyM7iuzAXIawii6sR6W2JkE-WxWjaP5hBdCIGODo8LagvfJNpzHDQXMyE26MI-5p-VZa34uudEPUoOC3_rKuwTW2nYzsCOhVBQUydOXpU6s389Bkl6RrCSjUo2OK5QPtY9MZ1qevaRIXl8dLAwB8t-byXA4LNIQ?authuser=0&fife=s16383"
        },
        {
          "name": "Principality of Anthophilia",
          "location": {
            "long": "3.311209",
            "lat": "48.133102",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHWxGlUc4Q9X0K9D606Ha0ApJHhOBnL_po7WO-ewv4xE9U_ysD9C3gA0Kjd43OItmva42vAgrVCyPT4OvndRpDJEGyB-diq4Ut80k2Rc9L-pY8L8BO9P8jf0D9aYgV6b5J_ddctXjxNdv5WWJ1IL2jot7BWBADHCn8G0CdyekBeOnCKsPYNXmR-eBHYNEAQ2MdMHluxgX7MA6ocy5IE7BSV_vMgzKKO5--iIvlze6gPUQurDf8b1cSXLO4?authuser=0&fife=s16383"
        },
        {
          "name": "Duskrosun",
          "location": {
            "long": "120.821415",
            "lat": "24.560247",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG1iIaTxHxpyL4eBi7mPl-IdLrllPTmcEMf5dZVxpzZQ2dMbnoDi-YCOJExa0x1hTWH_pGhRYEfIc-a5vZ3t31CldPUn3hl_snkr9FUqhHJ2iwd9o5KB_DfVPgLZiMvOfkB5HTqpajzG9hyLwlHg_Gau-Uf4YsfcvDvCvvkI3QmPvzEelH6tNCPCXj7nzo2OJB7wrZXBS1kI5MeLD1rF-mvY5PMv_933wVp943Oqlyo5ZsWRqgoPslROnI?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Bubrium",
          "location": {
            "long": "34.1641377",
            "lat": "43.7649846",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGdRNocBYg1zMjTzY5c-saLDm3kF8RUcxstt7uW0oz9ktyx3G40ruYfBkFpUR3cwOjDmWz2v6gl52aM_xO_7ncfI_t1MV2FHPJBbG7FG2Lm7Llr7fD2Po7N335ydLy-GbiPeffRUof7c7Zcywd3W-qvrmEtNsx25sUZF5ZQhbI_12NHQ3A4uIJRqEs9SRT6327jjl6Xb7_IMNqE00XH12BpawzbWkWDCqOxaKRfdAAGLTlxE_yJK04YLVI?authuser=0&fife=s16383"
        },
        {
          "name": "Royal Republic of Candrea",
          "location": {
            "long": "-79.6170044",
            "lat": "42.9035374",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGP7UFHD0qzUWMX-wKpDcIqkue27D9JhV10lwwCQ45JbRevCawPA0vSjpIGROc6IKD6dKDxJjD_PWl1QxRcKrjnCu6o8uiqA-TGIVVPhbQoz_LHz4XtEVK57YPQFPUBV8wEY7X0d4X-4DmcCMu_c_STuNAg3FLh3N06q4GIw087hhOnEUAwY1EQW4xrdG7DH4foJg_3KutaeuM4su5K8Mx-bmYzFvDrkhsIoBgYBC8g0d3qiZqzAuFK8Po?authuser=0&fife=s16383"
        },
        {
          "name": "República de Manzaniyork",
          "location": {
            "long": "-72.1416132",
            "lat": "10.2910237",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuG32Lvxjd6X1G9xnXHSJbQUM1p_VhMlDhDb8ebaq7SBbIPpyWt_qVwgHITCiJJC9uVNcRZlkqH4dVuNsKhmyXBtH7wSsslXOb23zZGceVDQ8ilqZ_wbG9Vpt6jJ4q9hhvKzz-ImwIXWEo1XPqq2rE7QQHUuGlc8vPW7RPCbYJEF6UQwGRE6LGJk4EgN0_bEiI-CBLIcKjQSaisTsUvS7z7cfy_yzqa2RmGgnKbc5F-jgJAGRUE0WJvOLf8?authuser=0&fife=s16383"
        },
        {
          "name": "Edonia Kingdom",
          "location": {
            "long": "27.8522222222222",
            "lat": "40.9944444444444",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHNm_pTQgl6B_pIkC1VcwHGlD4MAssNpRD9PZSHXZAIPOCtLKqHLWCZNvDmCXWtUW1EJ2mY-HvOk_2o3iNh84W_wiJbFKxus7joC2GR1C0KIgKxpic-tq5Fkv6_Gflx75SPfx8JcWMmMeAPDw7NU0Nk5Zk-b5UfJeevtfOc7nI0V_qE0ejVty0Bkn96hEPcYeY9o-uc2KK8nWZTuqn1mRLfhsEi-eFok_aFqT-7dibyTIozht5jMfYVCe4?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Falcar",
          "location": {
            "long": "137.9383346",
            "lat": "-34.40615",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF5Qq4t6dg8MBY9cHHXMKQa40zfWE6Oe_M2bEjiScxHYf9wkF7edLFHFTrtcIVTrzlnt1ZELrJoaZqTh8MdctWAPSsccSRijQXw8D4QklcnvqQlbIQR83BxvReLZ5L1Zr1Y2r6FKV_3j4NTaml2FoynkJxMcHusMeWfu-7rt-CutUD0mSuZPJfGBYV863zvjav39XGi51q1px73sngM1ZMI5puWGcd2IB8YiCpZ_fsQaqG85dmF6LHmGW0?authuser=0&fife=s16383"
        },
        {
          "name": "New Shropshire",
          "location": {
            "long": "-74.6855619",
            "lat": "-52.4454303",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGboNVKfQOgSouns4PnH6a0wOflJj3yJf6xDywNlfIH1woXTFICnoopLBR7xpojqk0vXXMVxyBGHAkcqOOOGqpPW4KSycr1grvOKMKkPOPGULSIDj85VRz2FlvM28uFtWFwhQYIdmjPE-CBbYYw1eJ4Bnwj-DPIB2fCkANeaUT9o9WtaaeVFP-WIsj9GoL_07pnDp9rT-XCiMnz3CTEHCrVPPNBayInXeukDk_05v2-o-j3MTqMCJ7czZg?authuser=0&fife=s16383"
        },
        {
          "name": "Federation of Okasakawa",
          "location": {
            "long": "121.1335591",
            "lat": "14.5681749",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuExu-aBuTvnivfmkhyZxWeZ4uYt-KCUpid3jf46qQlz8OMo3PMTFJQ4COPugzHBA81XETVxTEhjaBm-KkVaDboqdAHi-9EWL51G-63ofgbP-Yf0GYLaCtxrAQMplz7IyWWlCxTCekZzDnnaChkWG7f1PecJOMKCnDlAP1UCG3-JgTFUon6wJFGICcloO_OREA30loGanwEPA4-BTg57euhcTQYvSIVdm2Ahcid1xfmlm2SvFLyb7yV3l74?authuser=0&fife=s16383"
        },
        {
          "name": "Konraq Khanate",
          "location": {
            "long": "77.6182158",
            "lat": "42.9204102",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGV1FdnCNDlZves8-elUGCp9maCxZDhcowRSpZFdOjB-al_uZOG31EM7DgDGlZ9-ex6w_P-frfqnRYPdjPu36Umd-JrHonTm2QbokQuHAUwMsFs9myuH6eNRaHjCZ-7xOgximHCPxpS5gT3ELRDHbbt8S8T9sPNokWUGoElyBMiNlRqh32bqH7nnUBz4HOJjcUKJnmULJNThaSl4oLWNIyUhEsiyn8T-KQyDcybE1vnbnMWRmHBfWEEDdQ?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Kirka'yaim",
          "location": {
            "long": "9.8450765",
            "lat": "52.6367036",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEx6q4-DCOtGTSrAuzPme7fJ7OPnfI2E8nCw2ICmnuHpuTcnBkFg9wfZOd2O6w3gIU8LLX6y27s3cK6-IkvpxJW1h0Pw-RJIU8Zpk-yyf6boQbZtxgS39yZSD9B5GPHG-L3XTaGG2r4-Ytm5zi_8fnp_rlt7Vvcrnur3gniPscxWifrdnLXvExrokhS2RsKe9hcHFTyOjsrtqf9rqLcaYVnIQtEgwQJdAEruW710xHJR2fueMH2fQUijO4?authuser=0&fife=s16383"
        },
        {
          "name": "People’s Democratic Republic of Clivestan",
          "location": {
            "long": "145.0006819",
            "lat": "-37.4165613",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGa9ANKA4sZRIZcOLz36Shf0drAlSoiXFClDL5p7MWUnc0gWyWHqel0tSAeJnJo5WWfH9bJM4Amp9lOQWuBGIe684nY336GhjXrj8T3_IXvGgCPL96anggOLDBauE00EODq2rzgTbe_AHHGdc5W_BVdzSgyvbchQAFht9ZxRTL69bY7Usu-rhwjCxWmofOtkS6duPypJ3owE-gHno1dT9Sf_5tSg0X24xVnIT50jM9YlVKIsM7J5TRxxXc?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Meritia",
          "location": {
            "long": "-83.386363",
            "lat": "41.5239237",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHq49Xim517bWL02GKV2XplLNJbXfeh1J-HYx1fWqJmznP2tkvBhw0BFBO4gdwNG7WSJ1J9PZKg3x0pxaOQDrGkq9bSURB5__blfKX7S0acnBwxbRmUvN3z75tXMYuSMFyTO80NT4zqo_gvu89A_RCn0XZdmLStfvm4hykClyytCQxKsuloen7yxGlgBE8RW1poAJXuvoRYscOCgOGRJYWobrDIipn0Z1QP9PgjGrkZ17HIFH3hiOzwdZc?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Zinland",
          "location": {
            "long": "33.7341039",
            "lat": "21.8650863",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF8Llcb8cknmgGEDTs_X7Jk0Lkbxp_6uZZOWNkiNvQfw0QyBlFTybx56YScbMVCngb0yFtlzzyW8o7dow7CKzK7U3U9Vos87PmtBtPWZfL7XeGyGUYevuZEixIb4283n21x5ZUm3MvRxJ6ybEjxORZkrBHLXNkWyV7m_MElh6z6o7rfpTseMVHoOcWpPdJhKzVIfZ3RCMPhD8_jg5RpHB7hjpX5Ipez5WSqzWtwejO27xJBuR5JUPSdD7A?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Ocrain",
          "location": {
            "long": "-1.8524065",
            "lat": "53.1521868",
            "applicable": true
          }
        },
        {
          "name": "Independant and Sovereign Principality of Beremagne",
          "location": {
            "long": "-71.3297528",
            "lat": "48.1160428",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEl6QLNSVMj9x-nC54qBvBlIbnlkFblqnjb1NEqBW2g8hz54QsYU0GALkQawy86t0gVYwGVd9ufxQcw6H0SFosZFKolhITRKjAmwedCHkOcrEUFw5fzP-TMPPETLT6L6qJvACnUeCVa8Yb5LfEypa4lMLVn8fGXiAu341CtiABY03s9H6Xbh5aZI_DE2P-0NDGK3D4OfEE6ggUcnNGzzXqOmQuCJXXzpyAQnP_XDDNtroAIpgZxtQRrSlY?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Duchy of Letzembourg",
          "location": {
            "long": "-75.9810097",
            "lat": "35.1146152",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGagrqUlDBVh8UuWOzJ9LLJLyOAHMXoAFplH6sX0kroRzxWz3_1rzuk6u_dy2shaQBWMqQNkhcfeCQkJwqLdAAtISjFp9ojWWOAsTmNakd50JxnJ8Hd4wrOpFoz2yHFNZlFx5RS6m6P63S2DdpbBPFdCZv7jC2YNGWzVoQbpmiwaucxzkSdePi_YbMn8zhsN-8E1N8XXZ42-NJUe61t4DWHvRDb2mfxBEQjcvqSDaaDLOTl-fhIs-FFgYs?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Tranar",
          "location": {
            "long": "-175.038042",
            "lat": "-19.7799598",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHzD5VR6D_3ObIj8f_mKuaN-FYGimVQzPQc90bzXbuZFjjNpwt2dgnjmwk46TNJFNx9chL4A8VcmS3_EOf2wPfbHWkJH0pC1F8bfR3m6CBGYfk6WofgJk145gotjwLQG6gZSP4Ki3B2aCAF_xsP9aweM-VFu94YRLSTRoUNPwtACPmF7yqtYZRH34nCLtC1gA_0Q2im9OSzq_itQFsiZ40Wtdo8C558LjrjROaOVjdXQ3ozGESqDSZnpXY?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Kravinkis",
          "location": {
            "long": "27.1979444444444",
            "lat": "59.8536111111111",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH7BP65InP-o3XckRDFSa7uCB6vAsoDBqj8I7MS5io10-uQkm88akD2Lx6Jly95IPqi5eYkNmvbgOa_nug7LLSU6uGIxn5yV2zI5J0AHO2XaPfgtNGRXcqAfXW8puPQZcJI0j9B7BCMm9JZYs--UrJY0gE2U7WqYrqB80ifbUEETMtc07RMX7H6itnoIgtvI1oYPo_pojbTQ0loXDQS_U9ffb8VccKkiPPrPrTER9hhxyFMrgn3xU0jMhc?authuser=0&fife=s16383"
        },
        {
          "name": "République de Toubak",
          "location": {
            "long": "-4.1290324",
            "lat": "5.3710087",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE8XAbxzH25fY7jTfuPapVG3THDr_vLbQ1gsQHQvK_FAAZO3xdjdEQDFMID-2k9WdzyoSUuJibXnRPxIV8VeJ-MLmEe3mmXxlXuhA2GUz5XKnsd-Kt0a8c8OStW4vrze3BVPzvd7WhUhcIZJ_lnWlzXbmwnigrdCthQne1LMjBxVIpET1Ww0zLHOFApFBHjrtUWznXuDKdWOIxAOzaE2-EolXmLLeznJZJ7xRqjNChh3Ov6Gpowus6734I?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Quinta Velha",
          "location": {
            "long": "-35.1945953",
            "lat": "-5.6975949",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEfILd2JQDHFPLHzIK0y35D-Tef6sU9JdpSe-K9cLsj0AaKwipUQSv5PA_5LFpJ3tZFiKkoTiHTzTJ0Urgeo0I1XASTUAgCJk4uUR7WYG7sdFBFTMTXCQ8UH-OSoEqHvhnwp0hH4Up6XlC6uj3UUFOXnv6qUWAOIfbd01tvrCTEI1Fy3yjncxtjj3gYAi3V9oCAeOrcZ705eGV9o-19bxU5eHRlEKMYP8cdDUob8pcJgBciBDSduVM0LPU?authuser=0&fife=s16383"
        },
        {
          "name": "Cooperativa De Celestia",
          "location": {
            "long": "-50.1582998",
            "lat": "-25.0993943",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFgZMwqxEbIyQWgxfA6gjaaLKMzSltofp3SM23Eo9rBIox-TY7PQkWcYbk7LYf6aGkQreUvfCztXGjJ827GsM85u3dtKFIIaxNBItMHWVHU5hosFsBpQHWmwfO5vag9lL1ua379noDT-enHwJtmNB2rilbvKBEYZK24mF21jRZnsIx9Hu8fOL_eqa7_ioPanwMbGWabLrgiZ6Cs3HHVpd9V4s8rCU3aE3LdIGUYPH4XPt4oL526S2RTd1M?authuser=0&fife=s16383"
        },
        {
          "name": "Império de Solraak",
          "location": {
            "long": "-46.5781774",
            "lat": "-22.4438225",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGWc2pem1kQh-EBqXseU859iQLLoDhWBrlvLZ4rogpnBepLI8yJX-UkpqjVsYiO1dAuQTKpCvKSyDVzDV0qW7gly2_3zChFOrWG5Pt6dms0n5WeSLb0E9N8vknWqGcy7FXHXL5yKwXIVQe7FdCGDHOuCkYsMM0rPPiKPJ3GbVN4MzZidl2hyhbjbXdz-i12yE25TQsZ2_JXHwkxiIj9jOx5TA3t49zB7VSgZh9RAogYsd_ckuquaIoXOmM?authuser=0&fife=s16383"
        },
        {
          "name": "Grand Duchy of Gosland",
          "location": {
            "long": "-142.1915466",
            "lat": "-75.9832991",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFzSTxxE2Hy1KjgYBthujt3dybpOsdpnkQ5jGLpwlYtGqZk8yoz8it5328-5qGh1LB0-Ds81NaVk8ensnbATJcKb1txwH7QnEOrJV6NC_dcwH04VeFqJzDUsPW6s2m6EHyuaEe4HPpgKKnFie52lpY9FFEjvXZVOhjkBqE17k2Fa_cnRbRdaUqumZdVex9oadyKNlZcXDPImAhKVrpdKmjHxMcN4HNCNf_7cqGaHk2BCQuv_m3uLJPU3OQ?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Lavari",
          "location": {
            "long": "-112.0740373",
            "lat": "33.4483771",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHTaELisB1sLwsiG7esEnDsicqeYl_F_V7FNJJYrKMvk-ZmMjK4jNwRJ9RksuPbAfl7hQvu5uNBjr6Wqg6RVSOhr8a7izzqlD6uB9VNf5TCnXXULxSqMhm_g_4Rvp3aNwJwu1RQmbRM1jYdPXcNqSKETLBh2Iqhjidsa7h4hEKn-leinuLjtdcDJGi5k31MzeHAB1rU8dsRZlvOS4O2F180QWklABOVKgcVN2Zn-1m25Q3eYUKcSFX4oOE?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Paladonia",
          "location": {
            "long": "-119.7171864",
            "lat": "49.7480163",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFwsnyUckd8UYrfAfK7F4OIeNlWQ4rpLDpp-5clVw_WbmsIWhD16NAlLfj8aJKQAjVnPHE6il11lDHuvAi9Bup0pMZyg3X82x6s6_Pm8rVYZwOCcnxLYBFBPSsJR2notDMTSjdrKtmznBfFFA5B_dDWHWsDNSIKAV1iA7oM9s1_yqj2LWNBgjQx19eYmGbKV-bI7WMwMtWqfOWmJlfF1htsyUtxdYDdO3o5rzlqDueHUncmVAwKnm3oHVg?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Sunland",
          "location": {
            "long": "16.2836457",
            "lat": "57.6989521",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE1ZhvgJrwn_i3PN71SLOCIs_diirAO_Tu4SSXi9Q0FLb6div5R-4BsryG-ok0NGWc6DUofBtVrbOgr-ooTbteW4QSoSLbXpG3JxYiMgKHl0E4cMd3uKvLNh-nYpfS1bhQckamUVVtCBOdc7yQxumZKX08cMtBJJC8AKGE6H4gwrhkRbtw0UiWJqQheRoMetfeFNSuCCZN51TAypOo9fPTxAyMffgNvPA4O3g-cZ8P9MCrzUbgBO7iSrIE?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Norton",
          "location": {
            "long": "-2.7444232",
            "lat": "50.9481937",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHHbLjnq5tlarDrcuiXn0cfU8zk71fmj-SvsHptqOpF6tEGoFSFl-E8Ehk8jeCwy6P9MCtNKQrYMrdB-USgNZJd1_PrBqwMwZxCBPgXuGmeTynZ4ktnnr49U4IUFGRJiKAEqtWxbJZpd4zK97ZXpTuC_cRyKxGmkqlrAKbh6lGjQXeMpSsFVPOxHJkZoBjdkAANaRbom-KrbQVyXm4TKgVbWAfNEs89jTZg6-DRBM6Itp-cZdK5v5dYBn4?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Kotland",
          "location": {
            "long": "22.5684463",
            "lat": "51.2464536",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGYdP1lQdYpnmnPwcdkFpffzvGZQCZsUjJLwqfEaCUPZQi--pKwUGv79xEV6TcRLg83dVlYAooFohZ7nM5gQH8CHcU66FH5llB5LwRa5-L62Un3hvpBDfUxIO9pGeWXzjKRGBkDacKw2uZv7-LpxmxAk-zaMFpaop0gHUme2oFpcc3pmuoNpzoCvU8FgeHhrTbG9kXZLFsB2Xk3tySkDA0-y60yaBgQm2kDEebbqzL5X3b15BQpV1bLTIY?authuser=0&fife=s16383"
        },
        {
          "name": "State Republic of Malton",
          "location": {
            "long": "-84.0707681",
            "lat": "39.6356154",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE2scjE6N_wFxCWlYxxHPjTj5N2us48JXBdBsB4nZhVEm212Yf0yYOU4nOXuAQ_TzPxw-rbjq08AYVDVM4XpgriGMJ364wRWg2gpCC8Gt_UL78tx691Vx6vY6g4o0ljl3Xtmk386_d6Xxnbgjm7vraPYyiRiZ0ZMyHIN0ou4u3M6hdK2SEsr3jYwJsUwGwNP27iUq-uLheAq0fVti3B2iT1i_KcOwrdymi-mIJXiKQIxDqLDnEj5W-m5V4?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Sylvania",
          "location": {
            "long": "-2.012239",
            "lat": "55.54684",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHcGpIddSPAYR_Njr8iYTNiLdMsLHEAxoO3BwHf36x9baD3JmmixehWjP-DdSi8ZQYEyDSuxSyE3oNJSdGLdts_dXTHAbPH-Bt8AtLFIfrdYCNHAIg6wL4ZF9mqtPjk1I1jXYzE9cj1fUt8JUgA51aHevgq_n-L2qqyXSYfxZ8ISW_lgPQYZkSaaor4EV_smyzl1sSkd0Y3DD9XAYFc6PZ1hTvanM5OHBSBYwLJl6uIsNFiv0xhzeY8SV8?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Stomaria",
          "location": {
            "long": "-0.842655",
            "lat": "51.277283",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFJWVssbpm3GnLQVaBKMjiwc4qTd7frdYjjsDLoLvVkKKkTR0VS3NXiyyjJz8imejWWp15vNZPdHMu145yh7RYIO2UhHw090ARLpXK7yl2Q9HUXphOoCU0E6eg30JSqzoRAcm7ymS2Qnh1QS-_7N2hEJq3gqrWUoa3MYNpzRoioubu9ei9Nxm7dW6WxoxbVCOrPRy0-uFXpg-bPK-CR8lJMEuLIW3kk7llg4fASF--zs3m4OrSbMcOTos8?authuser=0&fife=s16383"
        },
        {
          "name": "Isle of Lithua",
          "location": {
            "long": "-3.5553171",
            "lat": "52.112489",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEW03Zmt7FB8u9T7LF_joJpfjFwLDFxQ3hE_am63L9mnjeqgc5ARLXfMOmxYETXbRj4gOMXU1I8elWarltj8neDH4C4D0MBAYXMLA2YinA5mLc03js2YyoL-kU-0WVPTzCRwoCIqR-rWPRrsvuQ9msRDTloqo-8h7dqIclYOugiwtJuR6VKjg3DC8AyY1ZogigrvOJpClcD5DEtkeJygAa3sYy8pEaU8byWVChqCG0AL5A0zfya3jsnVO0?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Waywood",
          "location": {
            "long": "-1.733951",
            "lat": "50.780503",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGgXRG64TJwfQPo4oaUcm10H0tCk1JhR4a6rcB9LvqP0TJkWSfy4AGRSj1gEbgLeA2T_YEoM_-Y3iWfSEZ0WNnKhsvb1dcMvUUd5It-1sfSKp7Q-ifklNLpHKwVqtW8cAyf6X03DfOMBAUden7vMzl3YCAv6yVuEde3OGkhP-rWSe80Ar55ZbPvVTs4Urypt2lDNQ3fQWuN_fB8oTdM0fnXXshA-xWBoGSGXCT8JdzSwlKQtwygSUSiaUk?authuser=0&fife=s16383"
        },
        {
          "name": "Federal State of Soraichen",
          "location": {
            "long": "-4.3829947",
            "lat": "42.6835273",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGzAw2DjgKvwCEzW1tZFYg3XJvORBa0QSQALWVDxNrW_UZDVE4LehTQgfSRHWQKJt-xntS7USlrxIXoiztehbOmQnO3zKXY5oEjRG2KnJ5Pvk06tZk-IZYEvBHDE1BQ6RzsRQFDJWFrT-U09dzAFr9s7jwFZSW_lVvTwpeFoZbidVKzJjzpC2WFSYdjKLpbl9IxZ2XoUT60ou2Hcy0I9oR6AogoPlwRVs943gdpy_zl508K3I5YWs-R45g?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of New York",
          "location": {
            "long": "-83.0146526",
            "lat": "42.5144566",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHd3AKzQcJevTNQT4akZs3zohxQ0hF8uvctwiOu4RQAMagTbq3SVGe4Bg9RRzY87Rv0Dry0VwmDmE3m2M5F-r_ZWEMma9N6NrpkmzouDqje4d8saCBS7QtVCtvmHtlncIIZ5pv1-XHoVQEa94ov2g-oD68z5VaDMpBufAEfzolYJFwEKOx-uXeHfqTj0Ku2CxuSmjLch0ZC3sqz708uect7KFtL9CobP9pg3kkpvXVibCx-2POShSgyj9s?authuser=0&fife=s16383"
        },
        {
          "name": "Independent Federal Republic of the Arstotzkan Union",
          "location": {
            "long": "176.1654272",
            "lat": "-37.6869653",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGkr0Jxy55qpNa77WTP9ueEx8ACEsoRBuP2I5rzKi1o4AZeZJcakUsPqjz9przfIntxLdgAKwlgnpHA_TQB9RDZ_yZnXGAsLeVJV3MFAK2_1DMGbjUBtjA3U5IW8YKZB92-8puDVWb2vElwwCVblwLEjqgQT60EezOsorV0_IcCc1cxiSnkJmAyc0yHVGENm6_ZkluQUhSy5sIoGC-cttWLeHkTgGULZYOpKaEQjZDLsEcQpC_XE6pUnrA?authuser=0&fife=s16383"
        },
        {
          "name": "Confederate Democracy of Gamers (2nd)",
          "location": {
            "long": "176.1674892",
            "lat": "-37.687244",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHyLro9iKO4EXslbs9GdSF07F-lTKJcEe_0XSCcZob-v5fwj9bvsyTyuaUIk8gyLCkeY6pUEIzid79ZiAQlYosqPFCFEEJLVRvhQ8Qs54F0DN8I-iANqZs3lWhqwRWry7i-kNQaeBcpsM3Wmm3mlLiuF1Htb9MTHcADP0Sewly0KIgt_24VoYrRlBTtbjgqz8PNYW9_7lT1jgt8MlCnum31UbUi-63T2X0wdevfhKmqGA2U4rO7BoppVoc?authuser=0&fife=s16383"
        },
        {
          "name": "Ward Empire",
          "location": {
            "long": "176.1660623",
            "lat": "-37.68827",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFWBKOzOIT3M1K1qaSf_BZ8GTHjs1aVPz37s-o1-_LD6QqH8JJV2_eoaImZKLQ4xFCHGvKqaooME4CkC2F_5ppFW1h8JcAvBBjaAu4NOni0IxBW19ixdTDvCOlG8dhBqP5eXWlXAax8hoePdY6SJ-qoW1hzlRp5IaksQkJXGF4TIOrqQRvWZHoeF6_G7hYZTuOJkJJgVtOVKxdYlgMwEWqFszj6HrYxkvs0-gozyuJB_10xEoQ86phVBbo?authuser=0&fife=s16383"
        },
        {
          "name": "Ultra Democratic Republic of Referendums",
          "location": {
            "long": "176.1684579",
            "lat": "-37.6885896",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEfLVk1InAzB_k7XE_yLwuYYNxMDwXdhib4Hqg5Vp0WtdCRLqfFYb_Ru3q9Rn81MELuzBRYarpdHhuTtNdgbKo_c9QHj7COXfUTdW_4U5lm-kT1iMzZs5ZYMn3dtR883EqBhwFGUnqh6ia-Isu03w0iBX4dSAgMdOBYswzuyanmMe78wWh1MJW7YDvTK0dhEY2iijdmy7buy8KnrsDdqjO-hvi1R7GtN64eyXf1SQT73Mhj6talfGaEUeY?authuser=0&fife=s16383"
        },
        {
          "name": "Democratic Republic of Port Norland",
          "location": {
            "long": "34.925028",
            "lat": "32.407659",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHqErq1RxvLGguA-05oVbgIkm47XtTVsUhQt0beBZ_Nd3t_ZVmTNQKENXJve4R4Z_u_8j4GejuNnrggmiNJwuXuwoYXmYwCUA5WHZSyqNBIT8uknbaxlln0P2VtLvIecA2wYx3jY7wAnkfW1x_fT3AIchTksmbfIrM8EmSNeOi9SxlKDwI97t4xkVlnoOtM9N8lh4GJCNBRVcNyybUDJxWKGaFwTKL8MWrIie7G0dIU4sI76EKnKfUkKGY?authuser=0&fife=s16383"
        },
        {
          "name": "Marinovka Empire",
          "location": {
            "long": "-104.6005096",
            "lat": "38.9759399",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGXOOcq_nX_NKvD0lZDC5__bRRmFNPrPeC0wfXkOo8fEpK7fyGJsqmd8L0tadrrJMBnLBZzOTd4XYXYBG8tThcVKEMcYY-2IVxw4RqdomYcJIWSFRBfKisP5lIhchHzquiR9ETYyByJcQ0t-g1iDedXHQ56eDy-PyDHoMeSUaxRqMcDftOjXLB4sKYAphE5a8pVvf-UZ4mhukaZg2TCb0WMOnAh2YZrTOZETybtE4wNJFPS_jZylEnO7Bg?authuser=0&fife=s16383"
        },
        {
          "name": "Southern Confederation of Angosvria",
          "location": {
            "long": "-73.6054988",
            "lat": "-47.2385124",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEbAKH6yKYvoeZ9U9C-HvZU4bHMtmGhpSlUmVf8yhvF9XfrgnqrKOHV-_KLvwFsBomazNCm14IPS2_nleqJ9IH0PvYfNo0ZPoMpsYsgMlvtc7fbvCXN2DnTPC-qPmTfjC2dSWOb23koPLc-kEvaZ0BvpHfgNG3tMVfnB8iHCkJN6FXKqyanhYjdTumGvGL2d25piiOJ7NaVrFagoowY58pMdt0q3pqSs69IWqf6UTMLRiIf5MRHtzF-jzk?authuser=0&fife=s16383"
        },
        {
          "name": "Federation of Ilairan and Polarianda",
          "location": {
            "long": "-73.2425333",
            "lat": "-39.8173788",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFQLzEsXvKnFXnT-977-2sZBkB4ElnpWmLA9FLAZjDI-BWZmQWJej6V3IGhPQO8cOGdUdO_b1RIY6lWIXOQCeOB_vPufKmHVNX5Roq12mF77BVKzc5aW9VOZc-7a36DSgT6PqjNXkKeJdXPQE1KtmHvYIXY3VaBQ5FMGsi24A3Dk_RICNtzZfyGFr5UNu4K_se4iqXt0wciiASLv-ZvCQLll1NMoYYKOjyuQaWa0OQYdKPCB-KO1IwBUEU?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Sauguinia",
          "location": {
            "long": "-74.0954255",
            "lat": "4.7108844",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHMwHy58Gh1xzRNLo3mXNrQMK9_qQy_kpYemkL6Yvw-l41ZwEeATMbCgIK7SRiwA_dXJYGhBg-bdnLBtUCClBRCan3QVZ9XFM298bdooSfydnC3nZxujx7GVJ-V9lWYJMf6m6ALFyL8zit6dl27-KwaIL8t6E0HrLwlIIJPDFvwxfUAEVv73HnfOhvv0vEh7ehWg7cbAPckE_SkBkDWfIq0YZ1n1jv2UU3D2P2SnN6ezMS0bRfSZkLOgDA?authuser=0&fife=s16383"
        },
        {
          "name": "Lechian People's Republic",
          "location": {
            "long": "-174.20696",
            "lat": "52.1626027",
            "applicable": true
          }
        },
        {
          "name": "República Pelotuciana",
          "location": {
            "long": "-70.6573657",
            "lat": "-33.4452217",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuHqNJuexfIySEshUk80i_2kqNJzlKHoc5TiktODsw02_86S732tY0Wp8L4GqmSAuG6ZjaNsY2X8C3x5FJU5MKwv4G142zBfC1itZ9c2eqhooxGy6eQin9092js9Vz3TKJGKkYCYO4lMZVMD-RfV439lL18FaKjKNQDdIBjMvj0kYPwgLd6SkB50LW3531MDXbnvqVbQrzXAJQrQvQwCE1uCsilgVYbCqJHHjWUHC12LvxoZBCwpCyMbMSQ?authuser=0&fife=s16383"
        },
        {
          "name": "Federal Kingdom of Cerro",
          "location": {
            "long": "-1.9881527",
            "lat": "38.8036957",
            "applicable": true
          }
        },
        {
          "name": "Kingdom of Helitania",
          "location": {
            "long": "-0.2224305",
            "lat": "39.4190297",
            "applicable": false
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuH1H47DmkpdGXAN-Dstyj93nvHDb4ExltaJ1HtmMmGRg4JP4eKZTf3R0UWbq3V1_xohr28SG6LYPJy8av0dS28S8sbCLLIe-luzucNhVbHzjHNldYJc1WyDloIuj1QJiybSldc0UGBN6FsL-npfBs6MYjXzPzdYgnCa4DUypc9giikjlK32Gg20D0XSCdat0j4XvVJ5NZcmRGSe5L6YhVoRnCkmlYgg-0Ha4I_J3i9UndXjpCrl3FSVcs0?authuser=0&fife=s16383"
        },
        {
          "name": "Empire of Atlia",
          "location": {
            "long": "-99.1165393",
            "lat": "23.7300054",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFbcPQ3jtpf6B2kpHUVgIJoCVhowyb_1KxqqttcD_57ZtPXrTBJJA-NhR8Ziqb0QmJZLMBeGb8yXos-P4FAjbj5RxjBnsd0rK_KtBMzq5uZUkVDA6l6K8KktBlbZuhQO6ICSaX2R5zZ-1bk5lyAbOZcYXZ_wRhoZj2oUIn-ZFZBZVW0gD3qsNXuwni1Z6AdO81Vk_oZpEycFEdsALQmGdSu0_WgFGBAcapt08ej8UvX15cxti7HpSpPWZA?authuser=0&fife=s16383"
        },
        {
          "name": "Jewish Bolshevist Republic of Schykille",
          "location": {
            "long": "-77.1945247",
            "lat": "41.2033216",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE-67MGeJ13y8-L8JmaUiq2_kd4iaON3nQURFRpeI1kPYWv-kpWulylnEfQPUlHesiLX3_gc_SVw483Z17kyzLrm_Ch0f61CCWuORSHGVIyy9UA0vtoR-DKvIXtlyUG3qwFgY9Kj-gd04YAsJCHMvo69qzE11O1cE_g3TXnGr3j3w3-fecXUeh8uMyaMjJXgdK-I3_4-hzAkP40YrV5kgRP5oVM8rS6wATcU98HbSxRXEEYr-dfolEmyk8?authuser=0&fife=s16383"
        },
        {
          "name": "United Kingdom of Tazar and Sudóvia",
          "location": {
            "long": "-51.2346088",
            "lat": "-29.9506135",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGnHcgJO8zBftFrKCmwvrxbY5aDrrqzgBOCsdOGYbr3WVHCl1Q0hrR12t-b_5ZxvWHDGH4jKymEOE8gm7Te5dyAuU5xYesWe4SGRKUbbXc3WiVYiJET0RJicmAGzfFLPeweHyT_EAJctq96zE9Z-PMKbPPlGLpB61_-EriDsQyAyXmaysT8vRlAuKfjiR5TXyis45R1HKXvhGWAYHWxWipPE7kCUU_CHIzFwRFl3seRTuf4AHqvbo8PMgE?authuser=0&fife=s16383"
        },
        {
          "name": "Republic of Woultenland",
          "location": {
            "long": "-99.1065863",
            "lat": "19.3965964",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuF4mKkXc9OHNl3DEWHDFoYFlDZ3e_9q9O0Jljw6Z71DBdMoaxyaUc1VOdrNzyqlYdqrCqb85X9CqgE_HpxfiShvpVySi_24-KdUhwMWjcdLhISLZg4PvJIdGYYKNoJ0qFBRHJFDnbciL7Rr7dc0VOZoQyhwaU1t4RMpiIwRQNIFMd-fPYeAhcZwXUXAMjbICt0Yrv5hNzF_2Xw5necAvcVwDMRz9kBAtQ4hyB1e5XO-2yIkHj8sVPF7KJ8?authuser=0&fife=s16383"
        },
        {
          "name": "Rino Island Republic",
          "location": {
            "long": "-84.9999993",
            "lat": "-25.6666674",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuEvEfiz0-TBkCKQpABSLDIXvXfnOrRdNgAbKoyU4QmmyckGWqnIXpMEzUzQge9bNXMX-G1KiusWljspCwJwwNIxYauQmUklDJZMfsGyQSpNiGhkFOmkOZh7_lOEeC43-iJQ-NN3B9xj0JjS6E0Q63TpmoBd9b8o2F75IZ1srVMx4sTAgI58UgR0PD6VC5XeGv3A3GNpJQsIwv6csLmr3Z0EHinGDKoESvyMXWvcsLQYO58Oj_wcUtSOMTw?authuser=0&fife=s16383"
        },
        {
          "name": "Kingdom of Troncopañya",
          "location": {
            "long": "-3.221917",
            "lat": "39.8750591",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuE-Usiel0etiJvhYk5NT7yTR8kUv3gi9jqKJDV-OQuKW7E-WCuWwtHy6U9tEybmKMFNPbkfsGP4RpekEcogUBBl8BnJ4qyPwa1Pi7qVUp4H-huH2CASsYiHDolvAKgsKI6hy55KBCaN9IoI58LEzvdDyxRzMJgE-zRbLj7JJDFdMdI6OICWTrqzRmIN7gXiW4uu3WWS-lAcaMTec24Vwz0Md9w2aBDVbZ0vdodEHVQJiLSskY_omWIRaOA?authuser=0&fife=s16383"
        },
        {
          "name": "New Rubix Republic",
          "location": {
            "long": "151.2092955",
            "lat": "-33.8688197",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuFNgliXig5KlnJAsGwsHUpEnxqTEUmvotIVCFu4rqPL9od4bmSxbnKSct-ngsZnD0o4bG0KRMWgnoL8KfEw0vSj-Wu6wgOpYd5HWsd7ggUtgA6IltHvkcFBX-XJdOkiRXRdn-lREtBrnGrLu614SdWiRdYMNMrSwjRc48oAM9rmyWKow9LSIz-bKKhOzoagvEZvLGS1gxTpNpm2NzFXPKrMNJPrFdAL2fy83f-E8kGtMqvH9TyboBPE7sU?authuser=0&fife=s16383"
        },
        {
          "name": "Democratic States of Libertas",
          "location": {
            "long": "-97.6653603",
            "lat": "27.7901855",
            "applicable": true
          },
          "flag": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AFclZuGYcSZB_gq7a2jnwVng9pDMGK5ZqTFFa2QgJkqgrv4IAtVT7yoXJ216gvSUvzMcCN0XlHlbHn28kAUYhSFa5eMaf-1sP4vsUzyoNNcmcn_4PtQqEeyZCNuhnkb5ZvPMCtuF1FCK_wxTIxY20V_IFulztXJ_0WMyQGNTlXZC7AEH22itT_WIv53qwUJY9gGavICx8J4YSRk-MGL-DvPyjAB1jV0CpoIb36eh3bqdzK_VqSuSgCIDDsiYBIE?authuser=0&fife=s16383"
        }
      ]
    }
  },
  computed: {
    micronationsDirectory() {
      return store.getters.micronations;
    },
    micronationsCompareSources() {
      const that = this;
      let presentArray = [];
      let missingArray = []

      this.micronationalMapMicronations.forEach(function (element) {
        const check = that.micronationsDirectory.find(mic => element.name.includes(mic.name.main));

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
    }
  },
  methods: {
    async saveLocation(micronation) {
      const refId = doc(db, "micronations", micronation.id);
      await updateDoc(refId, {
        "location": new GeoPoint(micronation.micronationalMap.location.lat, micronation.micronationalMap.location.long),
        "type": arrayUnion('Physical')
      });
      notify({
        title: "Update successful",
        text: `The location data was added to the entry ${micronation.name.main} on TMD.`,
        type: "success"
      });
    }
  }
}
</script>

<style scoped>
.micronations-stats {
  font-size: 22px;
}

.micronations-list {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
}

.map-micronation-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--directory-entry-background-color);
  border-radius: 10px;
  padding: 8px;
  margin-bottom: 4px;
  margin-right: 4px;
  width: 250px;
}

.map-micronation-container.present {
  background-color: green;
}

.map-micronation-container div {
  display: flex;
  align-items: center;
}

.map-micronation-container p,
.map-micronation-container h3 {
  text-align: center;
}

.entry-source {
  margin-right: 5px;
}

.list-description {
  font-size: 18px;
}
</style>
