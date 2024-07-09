<script setup>
import store from '../store';
import DirectoryEntry from '../components/DirectoryEntry.vue';
</script>

<template>
  <div id="responseText">
    <p class="micronations-stats">
      There are <span class="underlined">{{ microWikiMicronations.length }}</span> (filtered) articles within category
      'Micronations' in MicroWiki (that doesn't mean strictly micronations):<br>
      - Out of them, <span class="underlined">{{ micronationsStub }}</span> are marked as <b style="color: indianred">stubs</b>, so probably don't have
      enough info to create an entry.<br>
      - Out of them, <span class="underlined">{{ micronationsPoor }}</span> are marked as <b style="color: red">poor</b>, so probably don't have
      enough info to create an entry.<br>
      - At least <span class="underlined">{{ micronationsInBothSources }}</span> may be <b style="color: green">present</b> on TMD.
    </p>

    <div id="micronationsList" class="micronations-list" ref="micronationsList">
      <DirectoryEntry v-for="(item, i) in microWikiMicronations" :key="i"
      :class="{ 'stub': item.stub, 'poor': item.poor, 'present': micronationsDirectory.find(mic => item.title.includes(mic.name.main)) }" :info="{
        id: '',
        name: {
          main: item.title.search(/ of /i) !== -1 ? item.title.slice(item.title.search(/ of /i) + 4) : item.title,
          mainAlt: '',
          title: item.title.search(/ of /i) !== -1 ? item.title.slice(0, item.title.search(/ of /i) + 3) : '',
          titleAlt: ''
        },
        flag: '',
        motto: '',
        type: '',
        languages: '',
        capital: '',
        currency: '',
        foundationDate: '',
        location: '',
        memberships: '',
        contactInfo: '',
        websites: ['https://micronations.wiki/wiki/' + item.title.replace(/ /g, '_')],
        author: 'themicronationaldirectory@gmail.com',
        approved: false,
        creationDate: ''
      }" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      microWikiMicronations: [
        {
          "pageid": 12388,
          "ns": 0,
          "title": "Republic of Aerlig"
        },
        {
          "pageid": 591,
          "ns": 0,
          "title": "Sovereign State of Aeterna Lucina"
        },
        {
          "pageid": 85451,
          "ns": 0,
          "title": "Republic of Aetosia"
        },
        {
          "pageid": 106743,
          "ns": 0,
          "title": "Empire of Agber"
        },
        {
          "pageid": 12391,
          "ns": 0,
          "title": "Republic of Agnorr"
        },
        {
          "pageid": 98840,
          "ns": 0,
          "title": "Ahmedland"
        },
        {
          "pageid": 97893,
          "ns": 0,
          "title": "Airedalandia"
        },
        {
          "pageid": 134053,
          "ns": 0,
          "title": "Akeno-Mysenian Empire"
        },
        {
          "pageid": 217571,
          "ns": 0,
          "title": "Aksana"
        },
        {
          "pageid": 7974,
          "ns": 0,
          "title": "Sultanate of Al Rasyid Darussalam"
        },
        {
          "pageid": 64211,
          "ns": 0,
          "title": "Kingdom of Alanland",
          "stub": true
        },
        {
          "pageid": 6693,
          "ns": 0,
          "title": "Free State of Albion"
        },
        {
          "pageid": 12395,
          "ns": 0,
          "title": "Republic of Alerther"
        },
        {
          "pageid": 152413,
          "ns": 0,
          "title": "Alexander Island (Province of Antarctica)"
        },
        {
          "pageid": 6066,
          "ns": 0,
          "title": "Empire of the Alexandrians"
        },
        {
          "pageid": 41533,
          "ns": 0,
          "title": "Republic of Alexantium"
        },
        {
          "pageid": 197020,
          "ns": 0,
          "title": "Algardian Republic"
        },
        {
          "pageid": 12396,
          "ns": 0,
          "title": "Republic of Alicanto"
        },
        {
          "pageid": 261851,
          "ns": 3000,
          "title": "Draft:Alidaniya Republic"
        },
        {
          "pageid": 12397,
          "ns": 0,
          "title": "Republic of Alienania"
        },
        {
          "pageid": 41555,
          "ns": 0,
          "title": "Republic of Alista",
          "stub": true
        },
        {
          "pageid": 217707,
          "ns": 0,
          "title": "Alkanuit"
        },
        {
          "pageid": 49707,
          "ns": 0,
          "title": "Alkland",
          "stub": true
        },
        {
          "pageid": 270979,
          "ns": 0,
          "title": "Allied states of America"
        },
        {
          "pageid": 202256,
          "ns": 0,
          "title": "Almendrian Democratic Republic"
        },
        {
          "pageid": 150982,
          "ns": 0,
          "title": "Almendrian Revanchist Union",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 87285,
          "ns": 0,
          "title": "Federal Republic of Alrovia"
        },
        {
          "pageid": 210054,
          "ns": 0,
          "title": "Alsann Republic"
        },
        {
          "pageid": 41501,
          "ns": 0,
          "title": "Amalgamated Territory of Friends"
        },
        {
          "pageid": 118667,
          "ns": 0,
          "title": "Grand Empire of Amarettini",
          "stub": true
        },
        {
          "pageid": 43223,
          "ns": 0,
          "title": "Socialist Republic of America"
        },
        {
          "pageid": 278166,
          "ns": 0,
          "title": "Anarchist Commune of Rubezhovka"
        },
        {
          "pageid": 161786,
          "ns": 0,
          "title": "Anarcho-Communalist Republic of Kaskadjas"
        },
        {
          "pageid": 121096,
          "ns": 0,
          "title": "Anasite Republic",
          "stub": true
        },
        {
          "pageid": 5073,
          "ns": 0,
          "title": "Confederate Protectorate of Andalusia"
        },
        {
          "pageid": 106988,
          "ns": 0,
          "title": "Angarb"
        },
        {
          "pageid": 6011,
          "ns": 0,
          "title": "Empire of Angyalistan"
        },
        {
          "pageid": 6012,
          "ns": 0,
          "title": "Empire of Antarctica"
        },
        {
          "pageid": 966,
          "ns": 0,
          "title": "Confederation of the Antarctica's Elain of Atilnia"
        },
        {
          "pageid": 256495,
          "ns": 3000,
          "title": "Draft:Antarctican Empire"
        },
        {
          "pageid": 48184,
          "ns": 0,
          "title": "Empire of the AntarcticIsland",
          "stub": true
        },
        {
          "pageid": 53606,
          "ns": 0,
          "title": "Republic of Antares"
        },
        {
          "pageid": 41837,
          "ns": 0,
          "title": "Antibois"
        },
        {
          "pageid": 242444,
          "ns": 0,
          "title": "United Territories and States of Arbor Cortice"
        },
        {
          "pageid": 13042,
          "ns": 0,
          "title": "People's Democratic Autocracy of Arborea"
        },
        {
          "pageid": 237863,
          "ns": 0,
          "title": "Arbores Federated Columns"
        },
        {
          "pageid": 127223,
          "ns": 0,
          "title": "Archduchy of Verdura"
        },
        {
          "pageid": 106474,
          "ns": 0,
          "title": "Republic of Aristan"
        },
        {
          "pageid": 37984,
          "ns": 0,
          "title": "People's Republic of Arizo",
          "stub": true
        },
        {
          "pageid": 114223,
          "ns": 0,
          "title": "Arklandik Confederation"
        },
        {
          "pageid": 146361,
          "ns": 0,
          "title": "Republic of Arkyn"
        },
        {
          "pageid": 150249,
          "ns": 0,
          "title": "Arterra Empire"
        },
        {
          "pageid": 29551,
          "ns": 0,
          "title": "Kingdom of Arthur"
        },
        {
          "pageid": 58600,
          "ns": 0,
          "title": "Kingdom of Arum",
          "poor": true
        },
        {
          "pageid": 112754,
          "ns": 0,
          "title": "Empire of Arvesia"
        },
        {
          "pageid": 41091,
          "ns": 0,
          "title": "Arían Empire",
          "stub": true
        },
        {
          "pageid": 49565,
          "ns": 0,
          "title": "Asdania"
        },
        {
          "pageid": 12404,
          "ns": 0,
          "title": "Republic of Ashkenatza"
        },
        {
          "pageid": 6207,
          "ns": 0,
          "title": "Exilarchy of Ashoka"
        },
        {
          "pageid": 41381,
          "ns": 0,
          "title": "Principality of Aslaria",
          "stub": true
        },
        {
          "pageid": 5808,
          "ns": 0,
          "title": "Duchy of Astral"
        },
        {
          "pageid": 96398,
          "ns": 0,
          "title": "Imperial Federation of Astraluxor"
        },
        {
          "pageid": 27108,
          "ns": 0,
          "title": "Kingdom of Astroika",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 127501,
          "ns": 0,
          "title": "Republic of Atami"
        },
        {
          "pageid": 12405,
          "ns": 0,
          "title": "Republic of Atann"
        },
        {
          "pageid": 122659,
          "ns": 0,
          "title": "Holy Athérenon Empire"
        },
        {
          "pageid": 1092,
          "ns": 0,
          "title": "Empire of Atlan"
        },
        {
          "pageid": 212550,
          "ns": 0,
          "title": "Attolian Federal Republic"
        },
        {
          "pageid": 6934,
          "ns": 0,
          "title": "Grand Duchy of Auckland"
        },
        {
          "pageid": 1137,
          "ns": 0,
          "title": "Audentior Independent Nation"
        },
        {
          "pageid": 61976,
          "ns": 0,
          "title": "Republic of Arora"
        },
        {
          "pageid": 196000,
          "ns": 0,
          "title": "Austin Empire"
        },
        {
          "pageid": 82457,
          "ns": 0,
          "title": "Kingdom of Australand"
        },
        {
          "pageid": 144522,
          "ns": 0,
          "title": "Australland"
        },
        {
          "pageid": 34220,
          "ns": 0,
          "title": "Austro-Hungarian Federation",
          "stub": true
        },
        {
          "pageid": 59940,
          "ns": 0,
          "title": "Austrovian Empire"
        },
        {
          "pageid": 153009,
          "ns": 0,
          "title": "Autistia"
        },
        {
          "pageid": 246517,
          "ns": 0,
          "title": "Autonomous Democracy of Lytpatri"
        },
        {
          "pageid": 223450,
          "ns": 0,
          "title": "Autonomous Digital State of Saphoria"
        },
        {
          "pageid": 36116,
          "ns": 0,
          "title": "Autonomous Republic of Altis"
        },
        {
          "pageid": 30354,
          "ns": 0,
          "title": "Autonomous Republic of Bergenpünt"
        },
        {
          "pageid": 178043,
          "ns": 0,
          "title": "Autonomous Republic of Krasyva",
          "stub": true
        },
        {
          "pageid": 113650,
          "ns": 0,
          "title": "Republic of Autrytania",
          "stub": true
        },
        {
          "pageid": 99922,
          "ns": 0,
          "title": "Second Kingdom of Auvenum"
        },
        {
          "pageid": 5562,
          "ns": 0,
          "title": "Democratic Republic of Avalokiteśvara"
        },
        {
          "pageid": 63600,
          "ns": 0,
          "title": "Avansea",
          "stub": true
        },
        {
          "pageid": 184393,
          "ns": 0,
          "title": "Averan Confederation"
        },
        {
          "pageid": 59157,
          "ns": 0,
          "title": "Avilsae",
          "stub": true
        },
        {
          "pageid": 131,
          "ns": 0,
          "title": "Ayrshire",
          "stub": true
        },
        {
          "pageid": 1807,
          "ns": 0,
          "title": "Ayselbork"
        },
        {
          "pageid": 1812,
          "ns": 0,
          "title": "Aztoka",
          "stub": true
        },
        {
          "pageid": 34698,
          "ns": 0,
          "title": "Republic of Bahal"
        },
        {
          "pageid": 103884,
          "ns": 0,
          "title": "Bailiwick of Hak'hanna"
        },
        {
          "pageid": 74049,
          "ns": 0,
          "title": "Republic of Bakerland",
          "stub": true
        },
        {
          "pageid": 69600,
          "ns": 0,
          "title": "Republic of Balboa",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 225875,
          "ns": 3000,
          "title": "Draft:Bales Republic"
        },
        {
          "pageid": 227529,
          "ns": 2,
          "title": "User:BalesRepublic"
        },
        {
          "pageid": 1838,
          "ns": 0,
          "title": "Kingdom of Balmex",
          "stub": true
        },
        {
          "pageid": 152455,
          "ns": 0,
          "title": "Baltimorian Empire"
        },
        {
          "pageid": 24857,
          "ns": 0,
          "title": "Banana Republic"
        },
        {
          "pageid": 1852,
          "ns": 0,
          "title": "Band Room Realms"
        },
        {
          "pageid": 167287,
          "ns": 0,
          "title": "Barbaramas Micronation",
          "stub": true
        },
        {
          "pageid": 53492,
          "ns": 0,
          "title": "Barnardian Empire",
          "stub": true
        },
        {
          "pageid": 104764,
          "ns": 0,
          "title": "Baránok"
        },
        {
          "pageid": 131795,
          "ns": 0,
          "title": "Federal State of Batria"
        },
        {
          "pageid": 174549,
          "ns": 0,
          "title": "Bavarian Democratic Republic",
          "stub": true
        },
        {
          "pageid": 32882,
          "ns": 0,
          "title": "Principality of Beacon City"
        },
        {
          "pageid": 30428,
          "ns": 0,
          "title": "Beiwan"
        },
        {
          "pageid": 88322,
          "ns": 0,
          "title": "Beland",
          "stub": true
        },
        {
          "pageid": 7994,
          "ns": 0,
          "title": "Kingdom of Belaronia"
        },
        {
          "pageid": 191635,
          "ns": 0,
          "title": "Benusian State of The Philippines"
        },
        {
          "pageid": 1940,
          "ns": 0,
          "title": "Berinese Empire"
        },
        {
          "pageid": 59562,
          "ns": 0,
          "title": "Republic of Bermeja"
        },
        {
          "pageid": 228955,
          "ns": 0,
          "title": "Bermond Island"
        },
        {
          "pageid": 1967,
          "ns": 0,
          "title": "Blackfen Soviet Socialist Republic"
        },
        {
          "pageid": 1968,
          "ns": 0,
          "title": "Blackrock"
        },
        {
          "pageid": 13071,
          "ns": 0,
          "title": "People's Republic of Blejord",
          "stub": true
        },
        {
          "pageid": 6315,
          "ns": 0,
          "title": "Federal Republic of BlueSkies"
        },
        {
          "pageid": 192860,
          "ns": 0,
          "title": "Bogderia"
        },
        {
          "pageid": 69989,
          "ns": 0,
          "title": "Kingdom of Bonapartia",
          "stub": true
        },
        {
          "pageid": 277486,
          "ns": 0,
          "title": "United Republics of Borealis"
        },
        {
          "pageid": 66457,
          "ns": 0,
          "title": "Holy Empire of Boromia",
          "stub": true
        },
        {
          "pageid": 123902,
          "ns": 0,
          "title": "Botswanistan"
        },
        {
          "pageid": 136734,
          "ns": 0,
          "title": "Heavenly Kingdom of Bradonia"
        },
        {
          "pageid": 5563,
          "ns": 0,
          "title": "Democratic Republic of Bravia"
        },
        {
          "pageid": 63914,
          "ns": 0,
          "title": "Republic of Brazos",
          "stub": true
        },
        {
          "pageid": 82196,
          "ns": 0,
          "title": "Bregusland"
        },
        {
          "pageid": 78944,
          "ns": 0,
          "title": "Kingdom of Britannia",
          "stub": true
        },
        {
          "pageid": 54153,
          "ns": 0,
          "title": "Broccotropolian Empire",
          "poor": true
        },
        {
          "pageid": 35988,
          "ns": 0,
          "title": "Grand Duchy of Broslavia"
        },
        {
          "pageid": 42431,
          "ns": 0,
          "title": "Bulgaristan"
        },
        {
          "pageid": 163623,
          "ns": 0,
          "title": "Republic of Burgerland",
          "stub": true
        },
        {
          "pageid": 71042,
          "ns": 0,
          "title": "Bussolino"
        },
        {
          "pageid": 13063,
          "ns": 0,
          "title": "People's Popular Socialist Republic of Bzan"
        },
        {
          "pageid": 57633,
          "ns": 0,
          "title": "Caballusia",
          "stub": true
        },
        {
          "pageid": 69325,
          "ns": 0,
          "title": "Kingdom of Caelumia"
        },
        {
          "pageid": 27536,
          "ns": 0,
          "title": "Kingdom of Caeruleus"
        },
        {
          "pageid": 60633,
          "ns": 0,
          "title": "Commonwealth of California"
        },
        {
          "pageid": 108318,
          "ns": 0,
          "title": "Colony of Calsahara"
        },
        {
          "pageid": 92505,
          "ns": 0,
          "title": "Kingdom of Cambria"
        },
        {
          "pageid": 8003,
          "ns": 0,
          "title": "Kingdom of Camuria and Althacia"
        },
        {
          "pageid": 181946,
          "ns": 0,
          "title": "Canadian Worker's Democratic Republic"
        },
        {
          "pageid": 75638,
          "ns": 0,
          "title": "Capitán Pérsico",
          "stub": true
        },
        {
          "pageid": 6389,
          "ns": 0,
          "title": "City of Caprica"
        },
        {
          "pageid": 12424,
          "ns": 0,
          "title": "Republic of Capricornia"
        },
        {
          "pageid": 42385,
          "ns": 0,
          "title": "Kingdom of Carolina Arabia"
        },
        {
          "pageid": 37810,
          "ns": 0,
          "title": "Principality of the Carpathia"
        },
        {
          "pageid": 114369,
          "ns": 0,
          "title": "Grand Duchy of Carthage"
        },
        {
          "pageid": 197636,
          "ns": 0,
          "title": "Caspusian Republic"
        },
        {
          "pageid": 64570,
          "ns": 0,
          "title": "Grand Principality of Castacia"
        },
        {
          "pageid": 93654,
          "ns": 0,
          "title": "Republic of Casuarina",
          "stub": true
        },
        {
          "pageid": 65707,
          "ns": 0,
          "title": "Catalonia",
          "poor": true
        },
        {
          "pageid": 206134,
          "ns": 0,
          "title": "Catanese Republic"
        },
        {
          "pageid": 167575,
          "ns": 0,
          "title": "Catherinemas Micronation"
        },
        {
          "pageid": 230008,
          "ns": 0,
          "title": "Catholic Republic of Pontunia"
        },
        {
          "pageid": 79770,
          "ns": 0,
          "title": "Catholic State of Pascrito"
        },
        {
          "pageid": 93101,
          "ns": 0,
          "title": "Confederate States of Felinuscatonia"
        },
        {
          "pageid": 69874,
          "ns": 0,
          "title": "Holy Empire of Cavlan"
        },
        {
          "pageid": 103062,
          "ns": 0,
          "title": "Principality of Cedarnia",
          "stub": true
        },
        {
          "pageid": 6019,
          "ns": 0,
          "title": "Empire of Celestia"
        },
        {
          "pageid": 88741,
          "ns": 0,
          "title": "Celtic Kingdom of Lugesia"
        },
        {
          "pageid": 107786,
          "ns": 0,
          "title": "Empire of Centralia"
        },
        {
          "pageid": 92359,
          "ns": 0,
          "title": "Cet Valstat/cet"
        },
        {
          "pageid": 135997,
          "ns": 0,
          "title": "Cetcile/ct",
          "stub": true
        },
        {
          "pageid": 70320,
          "ns": 0,
          "title": "Ceticilien/de"
        },
        {
          "pageid": 49826,
          "ns": 0,
          "title": "Chakaristan"
        },
        {
          "pageid": 31504,
          "ns": 0,
          "title": "Empire of Chang Zhang",
          "stub": true
        },
        {
          "pageid": 283710,
          "ns": 0,
          "title": "Chernofemboysk State"
        },
        {
          "pageid": 179643,
          "ns": 0,
          "title": "Chernotskya"
        },
        {
          "pageid": 2329,
          "ns": 0,
          "title": "Cheslovian Federation"
        },
        {
          "pageid": 141271,
          "ns": 0,
          "title": "Chibbean Kingdom"
        },
        {
          "pageid": 110021,
          "ns": 0,
          "title": "Chicken Empire",
          "stub": true
        },
        {
          "pageid": 12425,
          "ns": 0,
          "title": "Republic of Chico"
        },
        {
          "pageid": 12426,
          "ns": 0,
          "title": "Republic of Chipitocoland"
        },
        {
          "pageid": 174001,
          "ns": 0,
          "title": "City-State of Elevatia"
        },
        {
          "pageid": 82615,
          "ns": 0,
          "title": "Civitas"
        },
        {
          "pageid": 86482,
          "ns": 0,
          "title": "Clandestine State of Brummagem",
          "stub": true
        },
        {
          "pageid": 2415,
          "ns": 0,
          "title": "Classification systems for micronations"
        },
        {
          "pageid": 10928,
          "ns": 0,
          "title": "Free City of Cleveland"
        },
        {
          "pageid": 70200,
          "ns": 0,
          "title": "Empire of ClockCrew"
        },
        {
          "pageid": 58156,
          "ns": 0,
          "title": "Coastal Empire"
        },
        {
          "pageid": 8007,
          "ns": 0,
          "title": "Kingdom of Coleraine"
        },
        {
          "pageid": 49399,
          "ns": 0,
          "title": "Colonia",
          "stub": true
        },
        {
          "pageid": 4986,
          "ns": 0,
          "title": "Colony of Tura"
        },
        {
          "pageid": 137948,
          "ns": 0,
          "title": "Commonwealth di Pinang/it"
        },
        {
          "pageid": 142239,
          "ns": 0,
          "title": "Commonwealth of Audelpins"
        },
        {
          "pageid": 125048,
          "ns": 0,
          "title": "Commonwealth of Bearclaw",
          "stub": true
        },
        {
          "pageid": 116881,
          "ns": 0,
          "title": "Commonwealth of Cansdia"
        },
        {
          "pageid": 183027,
          "ns": 0,
          "title": "Commonwealth of Dracul/hi"
        },
        {
          "pageid": 84646,
          "ns": 0,
          "title": "Commonwealth of Mursia",
          "stub": true
        },
        {
          "pageid": 253459,
          "ns": 0,
          "title": "Commonwealth of Novo-Erecteutolectrocia"
        },
        {
          "pageid": 82956,
          "ns": 0,
          "title": "Commonwealth of Pazistan"
        },
        {
          "pageid": 164060,
          "ns": 0,
          "title": "Commonwealth of Zeprana"
        },
        {
          "pageid": 220784,
          "ns": 3000,
          "title": "Draft:Communist Republic of Cabode"
        },
        {
          "pageid": 169023,
          "ns": 0,
          "title": "Communist Republic of Dinnist",
          "stub": true
        },
        {
          "pageid": 189517,
          "ns": 0,
          "title": "Communist Republic of The Great Belt",
          "stub": true
        },
        {
          "pageid": 97169,
          "ns": 0,
          "title": "Communist State of Fort Hall"
        },
        {
          "pageid": 97185,
          "ns": 0,
          "title": "Communist State of Salish"
        },
        {
          "pageid": 9165,
          "ns": 0,
          "title": "Natlandist State of the ComradeMr Republic"
        },
        {
          "pageid": 153526,
          "ns": 0,
          "title": "CONART"
        },
        {
          "pageid": 5065,
          "ns": 0,
          "title": "Conch Republic"
        },
        {
          "pageid": 191641,
          "ns": 0,
          "title": "Concordian Kingdom"
        },
        {
          "pageid": 57911,
          "ns": 0,
          "title": "Empire of Condelero",
          "stub": true
        },
        {
          "pageid": 166500,
          "ns": 0,
          "title": "Confederate Democracy of Gamers"
        },
        {
          "pageid": 43652,
          "ns": 0,
          "title": "Confederate States of Earth",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 206579,
          "ns": 2,
          "title": "User:Conner/Sandbox/test"
        },
        {
          "pageid": 48868,
          "ns": 0,
          "title": "Conservationalist Union of Vivannia"
        },
        {
          "pageid": 96982,
          "ns": 0,
          "title": "Conservative Kayut Republic"
        },
        {
          "pageid": 109223,
          "ns": 0,
          "title": "Constitutional Monarchy of Herta",
          "stub": true
        },
        {
          "pageid": 233088,
          "ns": 0,
          "title": "Constitutional Monarchy State of Huajiangstan"
        },
        {
          "pageid": 141903,
          "ns": 0,
          "title": "Constitutional Republic of Libertas"
        },
        {
          "pageid": 64760,
          "ns": 0,
          "title": "Constitutional State of Mcarthia"
        },
        {
          "pageid": 12429,
          "ns": 0,
          "title": "Republic of Cooriengah"
        },
        {
          "pageid": 8009,
          "ns": 0,
          "title": "Kingdom of Copan"
        },
        {
          "pageid": 5140,
          "ns": 0,
          "title": "Corbonian Empire"
        },
        {
          "pageid": 99021,
          "ns": 0,
          "title": "Cordoba Empire",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 6021,
          "ns": 0,
          "title": "Empire of Cordoniea"
        },
        {
          "pageid": 12430,
          "ns": 0,
          "title": "Republic of Corennica"
        },
        {
          "pageid": 8010,
          "ns": 0,
          "title": "Kingdom of Corran"
        },
        {
          "pageid": 147948,
          "ns": 0,
          "title": "Corsican Republic of Niolu"
        },
        {
          "pageid": 202392,
          "ns": 0,
          "title": "Corte People's Republic"
        },
        {
          "pageid": 183948,
          "ns": 0,
          "title": "Coublonea of the Democratic Federal United Exclaves"
        },
        {
          "pageid": 5182,
          "ns": 0,
          "title": "Crawford Empire"
        },
        {
          "pageid": 118342,
          "ns": 0,
          "title": "Republic of Crossroads",
          "stub": true
        },
        {
          "pageid": 61417,
          "ns": 0,
          "title": "Crown Dependency of Sademaara",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 154624,
          "ns": 0,
          "title": "Crownton"
        },
        {
          "pageid": 40544,
          "ns": 3000,
          "title": "Draft:Cumania"
        },
        {
          "pageid": 5229,
          "ns": 0,
          "title": "Cuplandic Empire",
          "stub": true
        },
        {
          "pageid": 49128,
          "ns": 0,
          "title": "Curimae"
        },
        {
          "pageid": 49127,
          "ns": 0,
          "title": "Republic of Curimae",
          "stub": true
        },
        {
          "pageid": 151790,
          "ns": 0,
          "title": "Cybercity"
        },
        {
          "pageid": 8011,
          "ns": 0,
          "title": "Kingdom of Dadingisila",
          "stub": true
        },
        {
          "pageid": 6980,
          "ns": 0,
          "title": "Grander DaeZig Empire"
        },
        {
          "pageid": 8012,
          "ns": 0,
          "title": "Kingdom of Dafelonia"
        },
        {
          "pageid": 8163,
          "ns": 0,
          "title": "Kingdom of the Dale Empire"
        },
        {
          "pageid": 87011,
          "ns": 0,
          "title": "Kingdom of Damora"
        },
        {
          "pageid": 5408,
          "ns": 0,
          "title": "Danburnia"
        },
        {
          "pageid": 5538,
          "ns": 0,
          "title": "Democratic People's Republic of Danesland"
        },
        {
          "pageid": 8013,
          "ns": 0,
          "title": "Kingdom of Danland"
        },
        {
          "pageid": 12434,
          "ns": 0,
          "title": "Republic of Danvania"
        },
        {
          "pageid": 121077,
          "ns": 0,
          "title": "Darvin",
          "stub": true
        },
        {
          "pageid": 5802,
          "ns": 0,
          "title": "Dual Monarchy of Davetopia and Emiri"
        },
        {
          "pageid": 36078,
          "ns": 0,
          "title": "De Heen and Mildeburg",
          "poor": true
        },
        {
          "pageid": 170371,
          "ns": 0,
          "title": "Empire of Deividonia",
          "stub": true
        },
        {
          "pageid": 42774,
          "ns": 2,
          "title": "User:Demetri Leventi/Sandbox2"
        },
        {
          "pageid": 131436,
          "ns": 0,
          "title": "Demigón",
          "stub": true
        },
        {
          "pageid": 136837,
          "ns": 0,
          "title": "Democracy of Anthea"
        },
        {
          "pageid": 48289,
          "ns": 0,
          "title": "Democracy of Geelong",
          "stub": true
        },
        {
          "pageid": 35926,
          "ns": 0,
          "title": "Democratic Commonwealth Union"
        },
        {
          "pageid": 90842,
          "ns": 0,
          "title": "Democratic Duchy of Rhovanion",
          "stub": true
        },
        {
          "pageid": 147922,
          "ns": 0,
          "title": "Democratic Empire of Dharmapura"
        },
        {
          "pageid": 194555,
          "ns": 0,
          "title": "Democratic Nation of Dinopolus"
        },
        {
          "pageid": 50586,
          "ns": 0,
          "title": "Democratic Nation of Liberty",
          "stub": true
        },
        {
          "pageid": 144104,
          "ns": 0,
          "title": "Democratic Pangerian Socialist Republic"
        },
        {
          "pageid": 196363,
          "ns": 0,
          "title": "Democratic People's Republic of Libertas"
        },
        {
          "pageid": 59298,
          "ns": 0,
          "title": "Democratic People's Republic of Sholand"
        },
        {
          "pageid": 297476,
          "ns": 3000,
          "title": "Draft:Democratic People's Republic of South Seondan"
        },
        {
          "pageid": 105777,
          "ns": 0,
          "title": "Democratic Republic of Benjastan"
        },
        {
          "pageid": 39531,
          "ns": 0,
          "title": "Democratic Republic of Epilda",
          "stub": true
        },
        {
          "pageid": 216687,
          "ns": 0,
          "title": "Democratic Republic of Nevis Kitts"
        },
        {
          "pageid": 191705,
          "ns": 0,
          "title": "Democratic Socialist Republic of Apisia"
        },
        {
          "pageid": 258265,
          "ns": 0,
          "title": "Democratic-Republic of Boredesia"
        },
        {
          "pageid": 10963,
          "ns": 0,
          "title": "Dominion of Kill Island",
          "stub": true
        },
        {
          "pageid": 144607,
          "ns": 0,
          "title": "Dominion of Tucona"
        },
        {
          "pageid": 265647,
          "ns": 0,
          "title": "Dominion of Vikialand"
        },
        {
          "pageid": 225469,
          "ns": 0,
          "title": "Crown Republic of Dorssa"
        },
        {
          "pageid": 121100,
          "ns": 0,
          "title": "Dracul American Company",
          "stub": true
        },
        {
          "pageid": 74957,
          "ns": 0,
          "title": "Commonwealth of Dracul"
        },
        {
          "pageid": 64554,
          "ns": 0,
          "title": "Kingdom of Drietsland (2019)"
        },
        {
          "pageid": 78018,
          "ns": 0,
          "title": "Drietsland/dr"
        },
        {
          "pageid": 78020,
          "ns": 0,
          "title": "Drietsland/ke"
        },
        {
          "pageid": 269317,
          "ns": 0,
          "title": "Dubovian Socialist Republic"
        },
        {
          "pageid": 248416,
          "ns": 3000,
          "title": "Draft:Duchy of Pomerania"
        },
        {
          "pageid": 214419,
          "ns": 0,
          "title": "Duchy of Seitnam"
        },
        {
          "pageid": 5799,
          "ns": 0,
          "title": "DuPonty Monarchy"
        },
        {
          "pageid": 75477,
          "ns": 0,
          "title": "Grand Duchy of Duschvaria"
        },
        {
          "pageid": 245102,
          "ns": 0,
          "title": "Duskrosun"
        },
        {
          "pageid": 5851,
          "ns": 0,
          "title": "Dutch Territories of the Lundian Counties"
        },
        {
          "pageid": 51891,
          "ns": 0,
          "title": "Oligarchy of Dysh",
          "stub": true
        },
        {
          "pageid": 265778,
          "ns": 3000,
          "title": "Draft:Dzierżawa Rabiańska"
        },
        {
          "pageid": 6025,
          "ns": 0,
          "title": "Empire of Eania"
        },
        {
          "pageid": 947,
          "ns": 0,
          "title": "Earldom of Angelforss"
        },
        {
          "pageid": 11207,
          "ns": 0,
          "title": "Earldom of Sontilant",
          "stub": true
        },
        {
          "pageid": 57065,
          "ns": 0,
          "title": "Earth Federal Republic"
        },
        {
          "pageid": 111331,
          "ns": 0,
          "title": "Earth's Kingdom"
        },
        {
          "pageid": 121209,
          "ns": 0,
          "title": "Republic of Earthia",
          "stub": true
        },
        {
          "pageid": 57343,
          "ns": 0,
          "title": "Republic of East Asia"
        },
        {
          "pageid": 58698,
          "ns": 0,
          "title": "East Aurora",
          "stub": true
        },
        {
          "pageid": 139354,
          "ns": 0,
          "title": "East Bushistan"
        },
        {
          "pageid": 39808,
          "ns": 0,
          "title": "Republic of East Caicos"
        },
        {
          "pageid": 226250,
          "ns": 0,
          "title": "East Yerushalome"
        },
        {
          "pageid": 118964,
          "ns": 0,
          "title": "Eastslavonia"
        },
        {
          "pageid": 159187,
          "ns": 3000,
          "title": "Draft:Easway"
        },
        {
          "pageid": 56524,
          "ns": 0,
          "title": "Republic of Ebaan",
          "stub": true
        },
        {
          "pageid": 37974,
          "ns": 0,
          "title": "Republic of Eberia",
          "stub": true
        },
        {
          "pageid": 69753,
          "ns": 0,
          "title": "Kingdom of Ebneria"
        },
        {
          "pageid": 8019,
          "ns": 0,
          "title": "Kingdom of Edan"
        },
        {
          "pageid": 163988,
          "ns": 0,
          "title": "Eden City State"
        },
        {
          "pageid": 113218,
          "ns": 0,
          "title": "Kingdom of Eden-Heath"
        },
        {
          "pageid": 42463,
          "ns": 0,
          "title": "Eestcorea"
        },
        {
          "pageid": 12769,
          "ns": 0,
          "title": "Principality of Efaté"
        },
        {
          "pageid": 118086,
          "ns": 0,
          "title": "Commonwealth of Efransa"
        },
        {
          "pageid": 112375,
          "ns": 0,
          "title": "Efrasachin Judiciary"
        },
        {
          "pageid": 95555,
          "ns": 0,
          "title": "Kingdom of Eggalia"
        },
        {
          "pageid": 103324,
          "ns": 0,
          "title": "Egrevia",
          "stub": true
        },
        {
          "pageid": 103414,
          "ns": 0,
          "title": "Ehnesi Federation"
        },
        {
          "pageid": 184721,
          "ns": 0,
          "title": "Kingdom of Eintrachtia"
        },
        {
          "pageid": 91326,
          "ns": 0,
          "title": "El Capitolio"
        },
        {
          "pageid": 75406,
          "ns": 0,
          "title": "El Gabinete de la Primera Presidencia"
        },
        {
          "pageid": 108517,
          "ns": 0,
          "title": "Elba Empire"
        },
        {
          "pageid": 72258,
          "ns": 0,
          "title": "Kingdom of Elessa"
        },
        {
          "pageid": 12028,
          "ns": 0,
          "title": "Royal Republic of Eleytheria",
          "stub": true
        },
        {
          "pageid": 54987,
          "ns": 0,
          "title": "Commonwealth Kingdom of Elim"
        },
        {
          "pageid": 8020,
          "ns": 0,
          "title": "Kingdom of Elleore"
        },
        {
          "pageid": 76089,
          "ns": 0,
          "title": "Republic of Ellsmeras"
        },
        {
          "pageid": 5005,
          "ns": 0,
          "title": "Commonwealth of Ellsworth"
        },
        {
          "pageid": 92354,
          "ns": 0,
          "title": "People's Republic of Elmshorn"
        },
        {
          "pageid": 98542,
          "ns": 0,
          "title": "Republic of Elves"
        },
        {
          "pageid": 158156,
          "ns": 0,
          "title": "Republic of Elves/et"
        },
        {
          "pageid": 118423,
          "ns": 0,
          "title": "Kingdom of Elysia",
          "stub": true
        },
        {
          "pageid": 8022,
          "ns": 0,
          "title": "Kingdom of Emerald Isle"
        },
        {
          "pageid": 12437,
          "ns": 0,
          "title": "Republic of Emerald Isle"
        },
        {
          "pageid": 6319,
          "ns": 0,
          "title": "Federal Republic of Emerity"
        },
        {
          "pageid": 71089,
          "ns": 0,
          "title": "Emilsang"
        },
        {
          "pageid": 169025,
          "ns": 2,
          "title": "User:EmperorAdamI/Empire of Adammia/la"
        },
        {
          "pageid": 867,
          "ns": 0,
          "title": "Empire of Alkmaar"
        },
        {
          "pageid": 141879,
          "ns": 0,
          "title": "Empire of Biberach"
        },
        {
          "pageid": 207731,
          "ns": 0,
          "title": "Empire of Cronic"
        },
        {
          "pageid": 177451,
          "ns": 0,
          "title": "Empire of Ela'r'oech"
        },
        {
          "pageid": 98792,
          "ns": 0,
          "title": "Empire of Joschitika"
        },
        {
          "pageid": 189876,
          "ns": 0,
          "title": "Empire of Malczyce"
        },
        {
          "pageid": 86060,
          "ns": 0,
          "title": "Empire of Maragato"
        },
        {
          "pageid": 30983,
          "ns": 0,
          "title": "Empire of Maxzillia",
          "stub": true
        },
        {
          "pageid": 154155,
          "ns": 0,
          "title": "Empire of Narsiryn"
        },
        {
          "pageid": 181682,
          "ns": 0,
          "title": "Empire of Pontavia"
        },
        {
          "pageid": 195163,
          "ns": 0,
          "title": "Empire of Potalia"
        },
        {
          "pageid": 184026,
          "ns": 0,
          "title": "Empire of Quadria"
        },
        {
          "pageid": 236677,
          "ns": 0,
          "title": "Empire of Solraak"
        },
        {
          "pageid": 206190,
          "ns": 0,
          "title": "Empire of Takaeya"
        },
        {
          "pageid": 187704,
          "ns": 0,
          "title": "Empire of the Kingdom of the Shark"
        },
        {
          "pageid": 198199,
          "ns": 0,
          "title": "Empire of the United Duchies of Spainhstan"
        },
        {
          "pageid": 131296,
          "ns": 0,
          "title": "Empire of Truto"
        },
        {
          "pageid": 111244,
          "ns": 0,
          "title": "Empire of Varmol",
          "stub": true
        },
        {
          "pageid": 133528,
          "ns": 0,
          "title": "Empire of Zichroland"
        },
        {
          "pageid": 228421,
          "ns": 0,
          "title": "Seewatian Commune"
        },
        {
          "pageid": 202141,
          "ns": 0,
          "title": "Empyrean of the Moon"
        },
        {
          "pageid": 57342,
          "ns": 0,
          "title": "Engelia",
          "stub": true
        },
        {
          "pageid": 51117,
          "ns": 0,
          "title": "Eodus"
        },
        {
          "pageid": 186222,
          "ns": 0,
          "title": "Epic of Spuhklingi"
        },
        {
          "pageid": 6135,
          "ns": 0,
          "title": "Eran Federation"
        },
        {
          "pageid": 49432,
          "ns": 0,
          "title": "Student's State of Eresamia"
        },
        {
          "pageid": 59638,
          "ns": 0,
          "title": "Republic of Escaplieria"
        },
        {
          "pageid": 61605,
          "ns": 0,
          "title": "Kingdom of Espero"
        },
        {
          "pageid": 121403,
          "ns": 0,
          "title": "Espium Republic"
        },
        {
          "pageid": 184070,
          "ns": 0,
          "title": "Second Essenian Republic",
          "stub": true
        },
        {
          "pageid": 70087,
          "ns": 0,
          "title": "Commonwealth of Essexia"
        },
        {
          "pageid": 234131,
          "ns": 0,
          "title": "Kingdom of Great Esteria"
        },
        {
          "pageid": 11885,
          "ns": 0,
          "title": "Republic of the Esterlands"
        },
        {
          "pageid": 73726,
          "ns": 0,
          "title": "Estocia"
        },
        {
          "pageid": 158731,
          "ns": 0,
          "title": "Estonian Socialist Republic/et"
        },
        {
          "pageid": 153544,
          "ns": 0,
          "title": "Estonian Travaman Republic"
        },
        {
          "pageid": 6030,
          "ns": 0,
          "title": "Empire of Eszakpohi"
        },
        {
          "pageid": 70484,
          "ns": 0,
          "title": "Republic of Eternia",
          "stub": true
        },
        {
          "pageid": 199498,
          "ns": 0,
          "title": "Etricia"
        },
        {
          "pageid": 87247,
          "ns": 0,
          "title": "Kingdom of Eureka"
        },
        {
          "pageid": 114314,
          "ns": 0,
          "title": "Autonomous Republic of Europa"
        },
        {
          "pageid": 268314,
          "ns": 0,
          "title": "Eveland Republic"
        },
        {
          "pageid": 49342,
          "ns": 0,
          "title": "Evonia"
        },
        {
          "pageid": 50873,
          "ns": 0,
          "title": "Exarchate of New Mystras (Imvrassia)"
        },
        {
          "pageid": 188780,
          "ns": 3000,
          "title": "Draft:EXE/SDA California Republic",
          "poor": true
        },
        {
          "pageid": 97219,
          "ns": 0,
          "title": "Extraterrestrial Interstellar Republic of Pluto"
        },
        {
          "pageid": 222120,
          "ns": 0,
          "title": "F.I.C. Empire"
        },
        {
          "pageid": 57960,
          "ns": 0,
          "title": "Fair Republic of Nedland"
        },
        {
          "pageid": 179748,
          "ns": 0,
          "title": "Fakistan",
          "poor": true
        },
        {
          "pageid": 7603,
          "ns": 0,
          "title": "Islamic Republic of Falanadar"
        },
        {
          "pageid": 6245,
          "ns": 0,
          "title": "Falia",
          "stub": true
        },
        {
          "pageid": 57448,
          "ns": 0,
          "title": "Fascist Empire of New Prussia",
          "stub": true
        },
        {
          "pageid": 9449,
          "ns": 0,
          "title": "Fascist Republic of North Cubodia"
        },
        {
          "pageid": 90930,
          "ns": 0,
          "title": "Fau's free and eternal nation"
        },
        {
          "pageid": 142141,
          "ns": 0,
          "title": "Federal Kingdom of Starasia"
        },
        {
          "pageid": 126027,
          "ns": 0,
          "title": "Federal Republic of Bloxburg"
        },
        {
          "pageid": 186176,
          "ns": 0,
          "title": "Federal Republic of Centonia"
        },
        {
          "pageid": 166534,
          "ns": 0,
          "title": "Federal Republic of Marblostan"
        },
        {
          "pageid": 152943,
          "ns": 0,
          "title": "Federal Republic of New Holland",
          "stub": true
        },
        {
          "pageid": 163049,
          "ns": 0,
          "title": "Federal Republic of Reiji"
        },
        {
          "pageid": 167500,
          "ns": 0,
          "title": "Federal Republic of Villoria & Fleetland"
        },
        {
          "pageid": 196279,
          "ns": 0,
          "title": "Federal Republic of Vothestan"
        },
        {
          "pageid": 204769,
          "ns": 0,
          "title": "Federal Republic of Xboxia"
        },
        {
          "pageid": 168437,
          "ns": 0,
          "title": "Federal Socialist Republic of Sbeba"
        },
        {
          "pageid": 194068,
          "ns": 0,
          "title": "Federal States of Arcadia"
        },
        {
          "pageid": 6357,
          "ns": 0,
          "title": "Federal Union of Socialist Republics"
        },
        {
          "pageid": 62176,
          "ns": 0,
          "title": "Federal Union of Zwischenland"
        },
        {
          "pageid": 27008,
          "ns": 0,
          "title": "Federated States of East Indian Ocean/id"
        },
        {
          "pageid": 174407,
          "ns": 0,
          "title": "Nomadic Limonia"
        },
        {
          "pageid": 203358,
          "ns": 0,
          "title": "Federation of Moshui and Kichi"
        },
        {
          "pageid": 274744,
          "ns": 3000,
          "title": "Draft:Felindia Kingdom"
        },
        {
          "pageid": 11027,
          "ns": 0,
          "title": "Principality of Felix"
        },
        {
          "pageid": 12175,
          "ns": 0,
          "title": "Province of Fenwick Isle",
          "stub": true
        },
        {
          "pageid": 84282,
          "ns": 0,
          "title": "Feudal Kingdom of the Chuntaro Clan",
          "stub": true
        },
        {
          "pageid": 104404,
          "ns": 0,
          "title": "Fiefdom of Kerzia"
        },
        {
          "pageid": 100360,
          "ns": 0,
          "title": "Fifth Aenderian Republic/vi"
        },
        {
          "pageid": 90520,
          "ns": 0,
          "title": "FIIFA"
        },
        {
          "pageid": 11856,
          "ns": 0,
          "title": "Filostonia"
        },
        {
          "pageid": 8031,
          "ns": 0,
          "title": "Kingdom of Finismund"
        },
        {
          "pageid": 96671,
          "ns": 0,
          "title": "Firefly Kingdom"
        },
        {
          "pageid": 13083,
          "ns": 0,
          "title": "People's Republic of Fireland"
        },
        {
          "pageid": 123186,
          "ns": 0,
          "title": "First Grand Herzetian Caliphate",
          "stub": true
        },
        {
          "pageid": 91329,
          "ns": 0,
          "title": "First Presidency"
        },
        {
          "pageid": 145544,
          "ns": 0,
          "title": "First Republic of Wamong"
        },
        {
          "pageid": 68244,
          "ns": 0,
          "title": "Republic of Fitzerland"
        },
        {
          "pageid": 89597,
          "ns": 0,
          "title": "Flamvoria"
        },
        {
          "pageid": 6561,
          "ns": 0,
          "title": "Kingdom of Flandria Secunda"
        },
        {
          "pageid": 8033,
          "ns": 0,
          "title": "Kingdom of Flatlands"
        },
        {
          "pageid": 42818,
          "ns": 0,
          "title": "Holy Roman Empire of Flevelt"
        },
        {
          "pageid": 50061,
          "ns": 0,
          "title": "Confederation of Flevelt"
        },
        {
          "pageid": 124888,
          "ns": 0,
          "title": "Free State of Florensia"
        },
        {
          "pageid": 193393,
          "ns": 0,
          "title": "Floroistan"
        },
        {
          "pageid": 50777,
          "ns": 0,
          "title": "Nation of Fluito",
          "stub": true
        },
        {
          "pageid": 11023,
          "ns": 0,
          "title": "People's Republic of Foggzania"
        },
        {
          "pageid": 273569,
          "ns": 0,
          "title": "Folkgöger"
        },
        {
          "pageid": 156354,
          "ns": 0,
          "title": "Principality of Fontaineblanche"
        },
        {
          "pageid": 96410,
          "ns": 0,
          "title": "Foreign relations of Quebec"
        },
        {
          "pageid": 264052,
          "ns": 0,
          "title": "Formori Community"
        },
        {
          "pageid": 85764,
          "ns": 0,
          "title": "Fortnite Coalition"
        },
        {
          "pageid": 158470,
          "ns": 0,
          "title": "Social Democratic Republic of Foundland"
        },
        {
          "pageid": 165430,
          "ns": 0,
          "title": "Social Democratic Republic of Foundland/et"
        },
        {
          "pageid": 244149,
          "ns": 0,
          "title": "Fraildenese Socialist State"
        },
        {
          "pageid": 6323,
          "ns": 0,
          "title": "Federal Republic of Francisville/fl"
        },
        {
          "pageid": 71091,
          "ns": 0,
          "title": "Franzlandia"
        },
        {
          "pageid": 196069,
          "ns": 0,
          "title": "Фракийское Королевство"
        },
        {
          "pageid": 26556,
          "ns": 0,
          "title": "Freblick"
        },
        {
          "pageid": 172778,
          "ns": 0,
          "title": "Free Kingdom of Atomica"
        },
        {
          "pageid": 242841,
          "ns": 0,
          "title": "Free Kingdom of South Dilu"
        },
        {
          "pageid": 26246,
          "ns": 0,
          "title": "Free Monarchy of Comet",
          "stub": true
        },
        {
          "pageid": 235418,
          "ns": 0,
          "title": "Free Nakoosa Republic"
        },
        {
          "pageid": 209895,
          "ns": 0,
          "title": "Free Republic of Ikerlàndia"
        },
        {
          "pageid": 199436,
          "ns": 0,
          "title": "Free Republic of Libernesia"
        },
        {
          "pageid": 98261,
          "ns": 0,
          "title": "Free Republika",
          "stub": true
        },
        {
          "pageid": 188891,
          "ns": 0,
          "title": "Free State of Hyws"
        },
        {
          "pageid": 193134,
          "ns": 0,
          "title": "Free State of New Manila"
        },
        {
          "pageid": 190080,
          "ns": 0,
          "title": "Free State of Türenor"
        },
        {
          "pageid": 61180,
          "ns": 0,
          "title": "Free State of Vallehermoso"
        },
        {
          "pageid": 275859,
          "ns": 0,
          "title": "Free Taydrostian Republic of South Meadowen"
        },
        {
          "pageid": 92741,
          "ns": 0,
          "title": "Freestate of Ravenstein",
          "stub": true
        },
        {
          "pageid": 109259,
          "ns": 0,
          "title": "Freetown Derry"
        },
        {
          "pageid": 41592,
          "ns": 0,
          "title": "Amalgamated Territories of Friends"
        },
        {
          "pageid": 32512,
          "ns": 2,
          "title": "User:Frix/Sandbox"
        },
        {
          "pageid": 96770,
          "ns": 0,
          "title": "Fromsey",
          "stub": true
        },
        {
          "pageid": 28781,
          "ns": 0,
          "title": "Republic of Fuerza",
          "stub": true
        },
        {
          "pageid": 64059,
          "ns": 0,
          "title": "Furland"
        },
        {
          "pageid": 34897,
          "ns": 0,
          "title": "Kingdom of Gaerstania"
        },
        {
          "pageid": 32371,
          "ns": 0,
          "title": "Empire of Gameria"
        },
        {
          "pageid": 94467,
          "ns": 0,
          "title": "Federated States of Gapla"
        },
        {
          "pageid": 113421,
          "ns": 0,
          "title": "Garden Republic of Sirland"
        },
        {
          "pageid": 167871,
          "ns": 0,
          "title": "Gatianusmas Micronation"
        },
        {
          "pageid": 164837,
          "ns": 0,
          "title": "GC UnitedStates",
          "poor": true
        },
        {
          "pageid": 87693,
          "ns": 0,
          "title": "Kingdom of Gendarania"
        },
        {
          "pageid": 8953,
          "ns": 0,
          "title": "Most Imperial Principality of Georgeton"
        },
        {
          "pageid": 160988,
          "ns": 0,
          "title": "Holy Germanic Empire"
        },
        {
          "pageid": 6806,
          "ns": 0,
          "title": "Germanitas Imperious Crucis"
        },
        {
          "pageid": 220368,
          "ns": 3000,
          "title": "Draft:Ghurklas"
        },
        {
          "pageid": 41807,
          "ns": 0,
          "title": "Gillusia",
          "stub": true
        },
        {
          "pageid": 6819,
          "ns": 0,
          "title": "Gishabrun SAR"
        },
        {
          "pageid": 5542,
          "ns": 0,
          "title": "Democratic People's Republic of Glebiania"
        },
        {
          "pageid": 6856,
          "ns": 0,
          "title": "Global Country of World Peace"
        },
        {
          "pageid": 102569,
          "ns": 0,
          "title": "Glorious Kingdom of Friezeland"
        },
        {
          "pageid": 75405,
          "ns": 0,
          "title": "Gobierno de Los Estados Unidos Socialistas"
        },
        {
          "pageid": 124974,
          "ns": 0,
          "title": "Goldania"
        },
        {
          "pageid": 41772,
          "ns": 0,
          "title": "Gondwanaland"
        },
        {
          "pageid": 27264,
          "ns": 0,
          "title": "Republic of Gothia"
        },
        {
          "pageid": 12011,
          "ns": 0,
          "title": "Royal Kingdom of Gotzborg"
        },
        {
          "pageid": 43185,
          "ns": 0,
          "title": "Government of Harjakarta"
        },
        {
          "pageid": 118113,
          "ns": 0,
          "title": "Governorate of Græcia"
        },
        {
          "pageid": 64000,
          "ns": 0,
          "title": "Republic of Gradonia"
        },
        {
          "pageid": 92341,
          "ns": 0,
          "title": "Kingdom of Gradonia"
        },
        {
          "pageid": 109501,
          "ns": 0,
          "title": "Gran Ducado de Torrego"
        },
        {
          "pageid": 184108,
          "ns": 0,
          "title": "Principality of Eskeria"
        },
        {
          "pageid": 60801,
          "ns": 0,
          "title": "Grand Duchy of Foxtrott"
        },
        {
          "pageid": 159372,
          "ns": 0,
          "title": "Grand Duchy of Grindle"
        },
        {
          "pageid": 166726,
          "ns": 0,
          "title": "Grand Duchy of Portucale"
        },
        {
          "pageid": 93720,
          "ns": 0,
          "title": "Grand Electoral Monarchy of Illyrus"
        },
        {
          "pageid": 267607,
          "ns": 0,
          "title": "Grand Feudal Empire of Wyndela"
        },
        {
          "pageid": 142561,
          "ns": 0,
          "title": "Grand Himmel Imperium",
          "stub": true
        },
        {
          "pageid": 145865,
          "ns": 0,
          "title": "Grand Holy Christian Empire of Nazarethenia"
        },
        {
          "pageid": 149187,
          "ns": 0,
          "title": "Grand Order of DR"
        },
        {
          "pageid": 151422,
          "ns": 0,
          "title": "Grand Republic of Kapreburg"
        },
        {
          "pageid": 128959,
          "ns": 0,
          "title": "Grand Republic of New Hamilton",
          "stub": true
        },
        {
          "pageid": 284128,
          "ns": 0,
          "title": "Grand Republic of Orrie"
        },
        {
          "pageid": 64957,
          "ns": 0,
          "title": "Grand Republic of Zetsukunia",
          "stub": true
        },
        {
          "pageid": 58795,
          "ns": 0,
          "title": "Grand-Duchy of Gibenest"
        },
        {
          "pageid": 162667,
          "ns": 0,
          "title": "Granda Aŭtista Duklando de Sophia"
        },
        {
          "pageid": 82219,
          "ns": 0,
          "title": "Empire of Grandelumiere",
          "stub": true
        },
        {
          "pageid": 67994,
          "ns": 0,
          "title": "Kingdom of Grant Island"
        },
        {
          "pageid": 218933,
          "ns": 2,
          "title": "User:Grant/sandbox/Shiveryia"
        },
        {
          "pageid": 6125,
          "ns": 0,
          "title": "Enlightened Absolutist Republic of Gratisia"
        },
        {
          "pageid": 93495,
          "ns": 0,
          "title": "Graustark-Dawsbergen"
        },
        {
          "pageid": 133372,
          "ns": 0,
          "title": "Socialist Republic of Gravois"
        },
        {
          "pageid": 48068,
          "ns": 0,
          "title": "Great Mizumori Empire",
          "stub": true
        },
        {
          "pageid": 275863,
          "ns": 0,
          "title": "Great Taydrostian Empire"
        },
        {
          "pageid": 40299,
          "ns": 0,
          "title": "Empire of the Great Xiang",
          "stub": true
        },
        {
          "pageid": 8041,
          "ns": 0,
          "title": "Kingdom of Greater Carolina"
        },
        {
          "pageid": 250433,
          "ns": 3000,
          "title": "Draft:Greater Femboyish Union"
        },
        {
          "pageid": 94771,
          "ns": 0,
          "title": "Greater Klitzibürg Empire"
        },
        {
          "pageid": 253866,
          "ns": 3000,
          "title": "Draft:Greater State of Mochia"
        },
        {
          "pageid": 62053,
          "ns": 0,
          "title": "Greenway",
          "poor": true
        },
        {
          "pageid": 8164,
          "ns": 0,
          "title": "Kingdom of the Grove"
        },
        {
          "pageid": 58560,
          "ns": 0,
          "title": "Empire of Guanduania"
        },
        {
          "pageid": 7276,
          "ns": 0,
          "title": "Holy Empire of Guist",
          "stub": true
        },
        {
          "pageid": 78510,
          "ns": 0,
          "title": "Kingdom of the Gulf"
        },
        {
          "pageid": 177024,
          "ns": 0,
          "title": "GWL Democratic Republic"
        },
        {
          "pageid": 146785,
          "ns": 0,
          "title": "First Republic of Gwladcoeden"
        },
        {
          "pageid": 173285,
          "ns": 0,
          "title": "Republic of Gwladcoeden"
        },
        {
          "pageid": 107821,
          "ns": 0,
          "title": "Kingdom of Hadistan",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 164713,
          "ns": 0,
          "title": "Hallowmas Micronation"
        },
        {
          "pageid": 196050,
          "ns": 0,
          "title": "Hannasia (New South Canberra protectorate state)"
        },
        {
          "pageid": 30130,
          "ns": 0,
          "title": "Kingdom of Hanover"
        },
        {
          "pageid": 7127,
          "ns": 0,
          "title": "Princely State of Harcourt"
        },
        {
          "pageid": 40382,
          "ns": 0,
          "title": "Federal Republic of Harmonia"
        },
        {
          "pageid": 80535,
          "ns": 0,
          "title": "Harmony South (Micronation)"
        },
        {
          "pageid": 98619,
          "ns": 0,
          "title": "Kingdom of Haronve"
        },
        {
          "pageid": 7144,
          "ns": 0,
          "title": "Hasanistan"
        },
        {
          "pageid": 37830,
          "ns": 0,
          "title": "Principality of Hashima"
        },
        {
          "pageid": 52210,
          "ns": 0,
          "title": "Republic of Hashima"
        },
        {
          "pageid": 271159,
          "ns": 0,
          "title": "Haskeir"
        },
        {
          "pageid": 40224,
          "ns": 0,
          "title": "Hatteras"
        },
        {
          "pageid": 105445,
          "ns": 0,
          "title": "Hausgurd Union of the Crowns"
        },
        {
          "pageid": 133657,
          "ns": 0,
          "title": "Republic of Hawaii"
        },
        {
          "pageid": 130772,
          "ns": 0,
          "title": "Heimatia"
        },
        {
          "pageid": 89764,
          "ns": 0,
          "title": "Republic of Hektorlandia"
        },
        {
          "pageid": 68876,
          "ns": 0,
          "title": "Kingdom of Helitania"
        },
        {
          "pageid": 71670,
          "ns": 0,
          "title": "Helium Community",
          "stub": true
        },
        {
          "pageid": 115030,
          "ns": 0,
          "title": "Helyg Cwsg"
        },
        {
          "pageid": 80189,
          "ns": 0,
          "title": "Kingdom of Hepburn",
          "stub": true
        },
        {
          "pageid": 154988,
          "ns": 0,
          "title": "Herschel",
          "stub": true
        },
        {
          "pageid": 76825,
          "ns": 0,
          "title": "Kingdom of Herzetia"
        },
        {
          "pageid": 145775,
          "ns": 0,
          "title": "Herzogen Puntuniaska",
          "stub": true
        },
        {
          "pageid": 84526,
          "ns": 0,
          "title": "Republic of Hattering"
        },
        {
          "pageid": 7215,
          "ns": 0,
          "title": "Hintonia"
        },
        {
          "pageid": 155615,
          "ns": 0,
          "title": "History of Mushroomia (2021 - present)",
          "stub": true
        },
        {
          "pageid": 89736,
          "ns": 0,
          "title": "Holy Alephian Republic",
          "stub": true
        },
        {
          "pageid": 157864,
          "ns": 0,
          "title": "Holy American Empire",
          "stub": true
        },
        {
          "pageid": 190507,
          "ns": 0,
          "title": "Holy Empire of the Kappa"
        },
        {
          "pageid": 140862,
          "ns": 0,
          "title": "Holy Kingdom of Odinlands"
        },
        {
          "pageid": 157866,
          "ns": 0,
          "title": "Holy Russian Empire"
        },
        {
          "pageid": 7285,
          "ns": 0,
          "title": "Holy Salanian Empire"
        },
        {
          "pageid": 245655,
          "ns": 0,
          "title": "Holy Sovereignty of Lytpatri"
        },
        {
          "pageid": 152974,
          "ns": 0,
          "title": "Holy Swiss Empire"
        },
        {
          "pageid": 10991,
          "ns": 0,
          "title": "Holzer Empire"
        },
        {
          "pageid": 107774,
          "ns": 0,
          "title": "Homocratic State of Kieys",
          "stub": true
        },
        {
          "pageid": 259520,
          "ns": 3000,
          "title": "Draft:Honderoarna kingdom-republic"
        },
        {
          "pageid": 59340,
          "ns": 0,
          "title": "Hong Kong Government in Exile"
        },
        {
          "pageid": 132885,
          "ns": 0,
          "title": "Hope Kingdom"
        },
        {
          "pageid": 34981,
          "ns": 0,
          "title": "Kingdom of Hoppalobindia"
        },
        {
          "pageid": 39551,
          "ns": 0,
          "title": "Non-Territorial Kingdom of Hoppalobindia"
        },
        {
          "pageid": 80873,
          "ns": 0,
          "title": "Principality of Hosamia"
        },
        {
          "pageid": 276859,
          "ns": 0,
          "title": "House of Homestead"
        },
        {
          "pageid": 100439,
          "ns": 0,
          "title": "Democratic Republic of Houseistan",
          "stub": true
        },
        {
          "pageid": 187673,
          "ns": 0,
          "title": "How to Start Your Own Country"
        },
        {
          "pageid": 12448,
          "ns": 0,
          "title": "Republic of Howland",
          "poor": true
        },
        {
          "pageid": 139127,
          "ns": 0,
          "title": "Huckstable Empire"
        },
        {
          "pageid": 121699,
          "ns": 0,
          "title": "Kingdom of Hugia"
        },
        {
          "pageid": 258727,
          "ns": 3000,
          "title": "Draft:Hundoarna"
        },
        {
          "pageid": 54634,
          "ns": 0,
          "title": "Kingdom of Huntsburg"
        },
        {
          "pageid": 160599,
          "ns": 0,
          "title": "Hyotasickswia",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 39901,
          "ns": 0,
          "title": "Republic of Iberis",
          "stub": true
        },
        {
          "pageid": 43315,
          "ns": 0,
          "title": "Kingdom of the IcePeaks",
          "stub": true
        },
        {
          "pageid": 8044,
          "ns": 0,
          "title": "Kingdom of Ihuset"
        },
        {
          "pageid": 12450,
          "ns": 0,
          "title": "Kingdom of Illinois"
        },
        {
          "pageid": 97568,
          "ns": 0,
          "title": "Illinois Soviet Socialist Republic"
        },
        {
          "pageid": 7419,
          "ns": 0,
          "title": "Illionese Hungarian Free State/hu"
        },
        {
          "pageid": 244578,
          "ns": 0,
          "title": "Imperial Council"
        },
        {
          "pageid": 248319,
          "ns": 0,
          "title": "Imperial Federation of Schpecktenia"
        },
        {
          "pageid": 7441,
          "ns": 0,
          "title": "Imperial Government of Norton II in Exile"
        },
        {
          "pageid": 201754,
          "ns": 0,
          "title": "Imperial Kingdom of Mdesk Chdoinzarneina"
        },
        {
          "pageid": 150710,
          "ns": 0,
          "title": "Imperial Principality of Stormhold"
        },
        {
          "pageid": 7460,
          "ns": 0,
          "title": "Imperial Republic of Bonthonia",
          "stub": true
        },
        {
          "pageid": 198077,
          "ns": 0,
          "title": "Imperial Republic of Donkrea"
        },
        {
          "pageid": 243833,
          "ns": 3000,
          "title": "Draft:Imperial State of Terposia"
        },
        {
          "pageid": 107457,
          "ns": 0,
          "title": "Imperial State of Xanzthima"
        },
        {
          "pageid": 155616,
          "ns": 0,
          "title": "Imperial States of Forestria"
        },
        {
          "pageid": 61927,
          "ns": 0,
          "title": "Imperial Union of Edenia"
        },
        {
          "pageid": 99475,
          "ns": 0,
          "title": "Imperial University of Lehmark"
        },
        {
          "pageid": 95607,
          "ns": 0,
          "title": "Imperium Aquilae"
        },
        {
          "pageid": 281470,
          "ns": 0,
          "title": "Imruland"
        },
        {
          "pageid": 88798,
          "ns": 0,
          "title": "Independent State of New Velothis"
        },
        {
          "pageid": 132633,
          "ns": 0,
          "title": "Independent State of the New Southern Rhine"
        },
        {
          "pageid": 221624,
          "ns": 3000,
          "title": "Draft:Republic of Indobalkonia"
        },
        {
          "pageid": 6328,
          "ns": 0,
          "title": "Federal Republic of Indokistan"
        },
        {
          "pageid": 12453,
          "ns": 0,
          "title": "Republic of Indokistan/id"
        },
        {
          "pageid": 160013,
          "ns": 0,
          "title": "Indradhanush Television",
          "stub": true
        },
        {
          "pageid": 33016,
          "ns": 0,
          "title": "Principality of the Kingdom of Inival"
        },
        {
          "pageid": 195522,
          "ns": 0,
          "title": "Integralist Republic of Harambanistan"
        },
        {
          "pageid": 248920,
          "ns": 0,
          "title": "International Relations of the Republic of Baltia"
        },
        {
          "pageid": 58863,
          "ns": 0,
          "title": "Irevan Republic"
        },
        {
          "pageid": 89071,
          "ns": 0,
          "title": "Republic of Iridia"
        },
        {
          "pageid": 48307,
          "ns": 0,
          "title": "Kingdom of Iron Moon"
        },
        {
          "pageid": 4983,
          "ns": 0,
          "title": "Colony of Isla Herne"
        },
        {
          "pageid": 153622,
          "ns": 0,
          "title": "Islamic Caliphate of Edenistan"
        },
        {
          "pageid": 220441,
          "ns": 0,
          "title": "Islamic Emirate of Athor"
        },
        {
          "pageid": 74860,
          "ns": 0,
          "title": "Islamic Republic of Hala'ib Triangle"
        },
        {
          "pageid": 209576,
          "ns": 0,
          "title": "Islamic Republic of Wescoyla"
        },
        {
          "pageid": 12454,
          "ns": 0,
          "title": "Republic of Islamkistan"
        },
        {
          "pageid": 125990,
          "ns": 0,
          "title": "Isle of Lithua"
        },
        {
          "pageid": 82924,
          "ns": 0,
          "title": "Isles of Colibar"
        },
        {
          "pageid": 131055,
          "ns": 0,
          "title": "ISTER Princedom"
        },
        {
          "pageid": 131021,
          "ns": 0,
          "title": "ISTER Princedom/zh"
        },
        {
          "pageid": 7615,
          "ns": 0,
          "title": "Iyabi Republic"
        },
        {
          "pageid": 7620,
          "ns": 0,
          "title": "Izkar Confederacy"
        },
        {
          "pageid": 8048,
          "ns": 0,
          "title": "Kingdom of Jaeckel"
        },
        {
          "pageid": 6037,
          "ns": 0,
          "title": "Empire of Jake"
        },
        {
          "pageid": 153944,
          "ns": 0,
          "title": "Jakeist Mushroomia"
        },
        {
          "pageid": 5754,
          "ns": 0,
          "title": "Dominion of Jaliva"
        },
        {
          "pageid": 13051,
          "ns": 0,
          "title": "People's Imperial Republic of Jalovaalea"
        },
        {
          "pageid": 39427,
          "ns": 0,
          "title": "Japanitania"
        },
        {
          "pageid": 8049,
          "ns": 0,
          "title": "Kingdom of Jaris"
        },
        {
          "pageid": 6582,
          "ns": 0,
          "title": "Flying Islands of Jasonia"
        },
        {
          "pageid": 194509,
          "ns": 0,
          "title": "Javanese State"
        },
        {
          "pageid": 179578,
          "ns": 0,
          "title": "Jaypondia",
          "stub": true
        },
        {
          "pageid": 111906,
          "ns": 0,
          "title": "Kingdom of Jehovah"
        },
        {
          "pageid": 72267,
          "ns": 0,
          "title": "Republic of Jelasia"
        },
        {
          "pageid": 8050,
          "ns": 0,
          "title": "Kingdom of Jerusalem"
        },
        {
          "pageid": 36871,
          "ns": 0,
          "title": "Republic of Jiaoxi",
          "stub": true
        },
        {
          "pageid": 8051,
          "ns": 0,
          "title": "Kingdom of Jirmania"
        },
        {
          "pageid": 7724,
          "ns": 0,
          "title": "Kingdom of Johnland"
        },
        {
          "pageid": 191742,
          "ns": 3000,
          "title": "Draft:Johnsonland"
        },
        {
          "pageid": 6942,
          "ns": 0,
          "title": "Grand Duchy of Johnstonia",
          "stub": true
        },
        {
          "pageid": 5543,
          "ns": 0,
          "title": "Democratic People's Republic of Jonitoria"
        },
        {
          "pageid": 35759,
          "ns": 0,
          "title": "Empire of Joshstralia"
        },
        {
          "pageid": 5131,
          "ns": 0,
          "title": "Consulate of Jovak Helm"
        },
        {
          "pageid": 152423,
          "ns": 2,
          "title": "User:JRVD/sandboxNH"
        },
        {
          "pageid": 253582,
          "ns": 0,
          "title": "Juche Republic of Texas"
        },
        {
          "pageid": 24230,
          "ns": 0,
          "title": "Kingdom of Juddlandia"
        },
        {
          "pageid": 169796,
          "ns": 0,
          "title": "Junkdom of Badis"
        },
        {
          "pageid": 43979,
          "ns": 0,
          "title": "Kingdom of Jupiter"
        },
        {
          "pageid": 184386,
          "ns": 0,
          "title": "Kingdom of Ranzania"
        },
        {
          "pageid": 89420,
          "ns": 0,
          "title": "Empire of Kaemira"
        },
        {
          "pageid": 102690,
          "ns": 0,
          "title": "Kaisership of Lanbia"
        },
        {
          "pageid": 44033,
          "ns": 0,
          "title": "Kalkedonia Kingdom"
        },
        {
          "pageid": 7821,
          "ns": 0,
          "title": "Kalmar National Authority"
        },
        {
          "pageid": 78597,
          "ns": 0,
          "title": "Kingdom of Kaltonia",
          "stub": true
        },
        {
          "pageid": 206137,
          "ns": 0,
          "title": "Kamore"
        },
        {
          "pageid": 7834,
          "ns": 0,
          "title": "Karantania Special Administrative Region"
        },
        {
          "pageid": 286923,
          "ns": 0,
          "title": "Karvika"
        },
        {
          "pageid": 227498,
          "ns": 3000,
          "title": "Draft:Kaçibia"
        },
        {
          "pageid": 7862,
          "ns": 0,
          "title": "Keep Watch"
        },
        {
          "pageid": 168469,
          "ns": 0,
          "title": "Republic of Kelko"
        },
        {
          "pageid": 7866,
          "ns": 0,
          "title": "Kenivan Confederation"
        },
        {
          "pageid": 44101,
          "ns": 3000,
          "title": "Draft:Republic of Kervakistan"
        },
        {
          "pageid": 234518,
          "ns": 0,
          "title": "Khaganate of the Blue Huns"
        },
        {
          "pageid": 81092,
          "ns": 0,
          "title": "Alphadom Of Khager"
        },
        {
          "pageid": 111272,
          "ns": 0,
          "title": "Khoidbaatar"
        },
        {
          "pageid": 165095,
          "ns": 2,
          "title": "User:King Anonymous of Suttornland/sandbox"
        },
        {
          "pageid": 188951,
          "ns": 0,
          "title": "Kingdom of Agoga"
        },
        {
          "pageid": 168738,
          "ns": 0,
          "title": "Kingdom of Alderaan"
        },
        {
          "pageid": 182170,
          "ns": 0,
          "title": "Kingdom of Ambrosia",
          "stub": true
        },
        {
          "pageid": 131406,
          "ns": 0,
          "title": "Kingdom of Anselmia"
        },
        {
          "pageid": 227071,
          "ns": 0,
          "title": "Kingdom of Arkaland"
        },
        {
          "pageid": 74922,
          "ns": 0,
          "title": "Kingdom of Aspen"
        },
        {
          "pageid": 71765,
          "ns": 0,
          "title": "Kingdom of Atlia"
        },
        {
          "pageid": 180778,
          "ns": 0,
          "title": "Kingdom of Austranthium"
        },
        {
          "pageid": 184629,
          "ns": 0,
          "title": "Kingdom of Austranthium/fr",
          "poor": true
        },
        {
          "pageid": 144033,
          "ns": 0,
          "title": "Kingdom of Aztaria"
        },
        {
          "pageid": 245174,
          "ns": 0,
          "title": "Kingdom of Bastara"
        },
        {
          "pageid": 193357,
          "ns": 0,
          "title": "Kingdom of Bengalia"
        },
        {
          "pageid": 142554,
          "ns": 0,
          "title": "Kingdom of Blazdonia"
        },
        {
          "pageid": 183369,
          "ns": 0,
          "title": "Kingdom of Blazdonia/hi"
        },
        {
          "pageid": 159217,
          "ns": 0,
          "title": "Kingdom of Brennonia"
        },
        {
          "pageid": 107085,
          "ns": 0,
          "title": "Kingdom of Bryantia"
        },
        {
          "pageid": 2160,
          "ns": 0,
          "title": "Kingdom of Cakeland"
        },
        {
          "pageid": 51568,
          "ns": 0,
          "title": "Kingdom of Calcon"
        },
        {
          "pageid": 158312,
          "ns": 0,
          "title": "Kingdom of Candice",
          "poor": true
        },
        {
          "pageid": 228549,
          "ns": 0,
          "title": "Kingdom of Cania"
        },
        {
          "pageid": 116163,
          "ns": 0,
          "title": "Kingdom of Compen",
          "poor": true
        },
        {
          "pageid": 151951,
          "ns": 0,
          "title": "Kingdom of Cutenstonia"
        },
        {
          "pageid": 112122,
          "ns": 0,
          "title": "Kingdom of Daenyria",
          "stub": true
        },
        {
          "pageid": 145126,
          "ns": 0,
          "title": "Kingdom of Deez",
          "stub": true
        },
        {
          "pageid": 179497,
          "ns": 0,
          "title": "Kingdom of Eclaria"
        },
        {
          "pageid": 281563,
          "ns": 0,
          "title": "Kingdom of Fatrea"
        },
        {
          "pageid": 198962,
          "ns": 0,
          "title": "Kingdom of Floland"
        },
        {
          "pageid": 138233,
          "ns": 0,
          "title": "Kingdom of Florensia"
        },
        {
          "pageid": 140546,
          "ns": 0,
          "title": "Kingdom of Freshland/de"
        },
        {
          "pageid": 168858,
          "ns": 0,
          "title": "Kingdom of Fronterib"
        },
        {
          "pageid": 124904,
          "ns": 0,
          "title": "Kingdom of Gazuland",
          "stub": true
        },
        {
          "pageid": 193229,
          "ns": 0,
          "title": "Kingdom of Great Welland"
        },
        {
          "pageid": 178039,
          "ns": 0,
          "title": "Kingdom of Haafingar"
        },
        {
          "pageid": 265921,
          "ns": 0,
          "title": "Kingdom of Hortusland"
        },
        {
          "pageid": 212910,
          "ns": 0,
          "title": "Kingdom of Irish"
        },
        {
          "pageid": 275749,
          "ns": 0,
          "title": "Kingdom of Karador"
        },
        {
          "pageid": 192566,
          "ns": 0,
          "title": "Kingdom of Kasbatar"
        },
        {
          "pageid": 202823,
          "ns": 0,
          "title": "Kingdom of Katzburg"
        },
        {
          "pageid": 140089,
          "ns": 0,
          "title": "Kingdom of Kholand"
        },
        {
          "pageid": 168899,
          "ns": 0,
          "title": "Kingdom of Kirka'yaim"
        },
        {
          "pageid": 151205,
          "ns": 0,
          "title": "Kingdom of Kravinkis"
        },
        {
          "pageid": 263240,
          "ns": 0,
          "title": "Kingdom of Laskaridia"
        },
        {
          "pageid": 178128,
          "ns": 0,
          "title": "Kingdom of Lavari"
        },
        {
          "pageid": 207624,
          "ns": 0,
          "title": "Kingdom of Libertas"
        },
        {
          "pageid": 178132,
          "ns": 0,
          "title": "Kingdom of Luxpublica"
        },
        {
          "pageid": 242757,
          "ns": 0,
          "title": "Kingdom of Majerówka"
        },
        {
          "pageid": 216044,
          "ns": 0,
          "title": "Kingdom of Malpok"
        },
        {
          "pageid": 94290,
          "ns": 0,
          "title": "Kingdom of Manso",
          "stub": true
        },
        {
          "pageid": 191689,
          "ns": 0,
          "title": "Kingdom of Mars"
        },
        {
          "pageid": 147872,
          "ns": 3000,
          "title": "Draft:Kingdom of Mckovia"
        },
        {
          "pageid": 174734,
          "ns": 0,
          "title": "Kingdom of Mercionia"
        },
        {
          "pageid": 178874,
          "ns": 0,
          "title": "Kingdom of Middlesock",
          "poor": true
        },
        {
          "pageid": 94683,
          "ns": 0,
          "title": "Kingdom of Mull"
        },
        {
          "pageid": 162189,
          "ns": 0,
          "title": "Kingdom of Narsiryn"
        },
        {
          "pageid": 179099,
          "ns": 0,
          "title": "Kingdom of New Sweden"
        },
        {
          "pageid": 126637,
          "ns": 0,
          "title": "Kingdom of Nichensburg"
        },
        {
          "pageid": 265057,
          "ns": 0,
          "title": "Kingdom of Norvika"
        },
        {
          "pageid": 137145,
          "ns": 0,
          "title": "Kingdom of Novus Hierosolymis"
        },
        {
          "pageid": 58039,
          "ns": 0,
          "title": "Kingdom of Nána/hu"
        },
        {
          "pageid": 186322,
          "ns": 0,
          "title": "Kingdom of Ocrain"
        },
        {
          "pageid": 287838,
          "ns": 0,
          "title": "Kingdom of Ombria"
        },
        {
          "pageid": 28704,
          "ns": 0,
          "title": "Kingdom of Oryland",
          "poor": true
        },
        {
          "pageid": 157045,
          "ns": 0,
          "title": "Kingdom of Otterland"
        },
        {
          "pageid": 176900,
          "ns": 0,
          "title": "Kingdom of Paradise"
        },
        {
          "pageid": 296314,
          "ns": 0,
          "title": "Kingdom of Parnesia"
        },
        {
          "pageid": 217290,
          "ns": 0,
          "title": "Kingdom of Parvussia"
        },
        {
          "pageid": 161302,
          "ns": 3000,
          "title": "Draft:Kingdom of Purcal"
        },
        {
          "pageid": 233631,
          "ns": 0,
          "title": "Kingdom of Riveria"
        },
        {
          "pageid": 164646,
          "ns": 0,
          "title": "Kingdom of Rnsoduna",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 143049,
          "ns": 0,
          "title": "Kingdom of Roranhon"
        },
        {
          "pageid": 64827,
          "ns": 0,
          "title": "Kingdom of Roschfallen"
        },
        {
          "pageid": 156892,
          "ns": 0,
          "title": "Kingdom of Rudorvia1"
        },
        {
          "pageid": 272596,
          "ns": 0,
          "title": "Kingdom of Saen"
        },
        {
          "pageid": 224266,
          "ns": 0,
          "title": "Kingdom of Selland"
        },
        {
          "pageid": 192366,
          "ns": 0,
          "title": "Kingdom of Seluvia"
        },
        {
          "pageid": 131823,
          "ns": 0,
          "title": "Kingdom of Serramwen"
        },
        {
          "pageid": 202586,
          "ns": 0,
          "title": "Kingdom of Setara"
        },
        {
          "pageid": 278221,
          "ns": 3000,
          "title": "Draft:Kingdom of Sharish Crim"
        },
        {
          "pageid": 65804,
          "ns": 0,
          "title": "Kingdom of Sorrenia"
        },
        {
          "pageid": 176542,
          "ns": 0,
          "title": "Kingdom of Sweet Tea"
        },
        {
          "pageid": 65894,
          "ns": 0,
          "title": "Kingdom of Symkaria"
        },
        {
          "pageid": 268910,
          "ns": 0,
          "title": "Kingdom of Tanaau"
        },
        {
          "pageid": 133393,
          "ns": 0,
          "title": "Kingdom of Taslavia"
        },
        {
          "pageid": 256250,
          "ns": 0,
          "title": "Kingdom of the Flanrives"
        },
        {
          "pageid": 140235,
          "ns": 0,
          "title": "Kingdom of the Flemish Ardennes",
          "stub": true
        },
        {
          "pageid": 167490,
          "ns": 0,
          "title": "Kingdom of the Isle of Mercion"
        },
        {
          "pageid": 194625,
          "ns": 0,
          "title": "Kingdom of the Local Anthill"
        },
        {
          "pageid": 194004,
          "ns": 0,
          "title": "Kingdom of Tranar"
        },
        {
          "pageid": 229557,
          "ns": 0,
          "title": "Kingdom of Tuceria"
        },
        {
          "pageid": 242552,
          "ns": 0,
          "title": "Kingdom of Two Sumbrias"
        },
        {
          "pageid": 151563,
          "ns": 0,
          "title": "Kingdom of Valdu"
        },
        {
          "pageid": 153119,
          "ns": 0,
          "title": "Kingdom of Voamaraku"
        },
        {
          "pageid": 143691,
          "ns": 0,
          "title": "Kingdom of Wellmoore"
        },
        {
          "pageid": 204799,
          "ns": 0,
          "title": "Kingdom of West Scotland"
        },
        {
          "pageid": 248604,
          "ns": 0,
          "title": "Kingdom of Wolfyland"
        },
        {
          "pageid": 62585,
          "ns": 0,
          "title": "Kingdom of Yeesland"
        },
        {
          "pageid": 260506,
          "ns": 0,
          "title": "Kingdom-Republic of Hönderoarna"
        },
        {
          "pageid": 157677,
          "ns": 2,
          "title": "User:KingdomofTenebrous"
        },
        {
          "pageid": 187516,
          "ns": 0,
          "title": "Neo Prussian Kingdom"
        },
        {
          "pageid": 31599,
          "ns": 0,
          "title": "Kinlandia"
        },
        {
          "pageid": 58573,
          "ns": 0,
          "title": "Kirkallerton",
          "stub": true
        },
        {
          "pageid": 5546,
          "ns": 0,
          "title": "Democratic People's Republic of Kirkland"
        },
        {
          "pageid": 12460,
          "ns": 0,
          "title": "Republic of Kirkland"
        },
        {
          "pageid": 11253,
          "ns": 0,
          "title": "Sovereign Kingdom of Kivinesaar"
        },
        {
          "pageid": 165592,
          "ns": 0,
          "title": "Kivtonia",
          "stub": true
        },
        {
          "pageid": 8187,
          "ns": 0,
          "title": "Kleinland"
        },
        {
          "pageid": 97974,
          "ns": 0,
          "title": "Kleisoura of Lofokrithia"
        },
        {
          "pageid": 6966,
          "ns": 0,
          "title": "Grand Empire of Knaphill"
        },
        {
          "pageid": 28188,
          "ns": 0,
          "title": "Köktughluk"
        },
        {
          "pageid": 113406,
          "ns": 0,
          "title": "Protectorate of Kolios"
        },
        {
          "pageid": 120493,
          "ns": 0,
          "title": "Koppian Empire"
        },
        {
          "pageid": 171110,
          "ns": 0,
          "title": "Korean Empire",
          "stub": true
        },
        {
          "pageid": 120311,
          "ns": 0,
          "title": "Korean Soviet Socialist Republic"
        },
        {
          "pageid": 295874,
          "ns": 3000,
          "title": "Draft:Republic of Koredonia"
        },
        {
          "pageid": 6384,
          "ns": 0,
          "title": "Federation of Koss/aa",
          "stub": true
        },
        {
          "pageid": 6943,
          "ns": 0,
          "title": "Grand Duchy of Koss/pt"
        },
        {
          "pageid": 34989,
          "ns": 0,
          "title": "Kothladev",
          "stub": true
        },
        {
          "pageid": 5559,
          "ns": 0,
          "title": "Democratic People's Republic of Kozlova"
        },
        {
          "pageid": 5580,
          "ns": 0,
          "title": "Democratic Soviet People's Republic of Kozuc",
          "stub": true
        },
        {
          "pageid": 106433,
          "ns": 0,
          "title": "Republic of Krebaria"
        },
        {
          "pageid": 8239,
          "ns": 0,
          "title": "Krighton Republic"
        },
        {
          "pageid": 71183,
          "ns": 0,
          "title": "Kingdom of Kromeland",
          "stub": true
        },
        {
          "pageid": 113606,
          "ns": 0,
          "title": "Krunmark"
        },
        {
          "pageid": 150064,
          "ns": 0,
          "title": "Krussian Kingdom"
        },
        {
          "pageid": 155754,
          "ns": 0,
          "title": "Kingdom of Krzakacja"
        },
        {
          "pageid": 194017,
          "ns": 0,
          "title": "Kubministan"
        },
        {
          "pageid": 97068,
          "ns": 0,
          "title": "Empire of Kyberia"
        },
        {
          "pageid": 104057,
          "ns": 0,
          "title": "Königreich Lilienstedt"
        },
        {
          "pageid": 38628,
          "ns": 0,
          "title": "L19"
        },
        {
          "pageid": 7496,
          "ns": 0,
          "title": "Independent State of La Agüera"
        },
        {
          "pageid": 64333,
          "ns": 0,
          "title": "Labronic People's Republic of Rosignano"
        },
        {
          "pageid": 8056,
          "ns": 0,
          "title": "Kingdom of Lacia"
        },
        {
          "pageid": 53769,
          "ns": 0,
          "title": "Kingdom of Lacuslandia",
          "stub": true
        },
        {
          "pageid": 63314,
          "ns": 0,
          "title": "Kingdom of Ladoland"
        },
        {
          "pageid": 136660,
          "ns": 0,
          "title": "Lakeland"
        },
        {
          "pageid": 87131,
          "ns": 0,
          "title": "Republic of Lakeshore",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 115527,
          "ns": 0,
          "title": "Socialist Republic of Lakosha",
          "poor": true
        },
        {
          "pageid": 118753,
          "ns": 0,
          "title": "Lanstkolland"
        },
        {
          "pageid": 40047,
          "ns": 0,
          "title": "Most Serene Republic of Larberiza"
        },
        {
          "pageid": 8057,
          "ns": 0,
          "title": "Kingdom of Larsonia"
        },
        {
          "pageid": 52493,
          "ns": 0,
          "title": "Republic of Larsonia"
        },
        {
          "pageid": 173683,
          "ns": 0,
          "title": "Las Condes"
        },
        {
          "pageid": 245291,
          "ns": 0,
          "title": "Empire of Golgotha and Hesperia"
        },
        {
          "pageid": 48370,
          "ns": 0,
          "title": "Lasvaria"
        },
        {
          "pageid": 49027,
          "ns": 0,
          "title": "Kingdom of Latitudia",
          "stub": true
        },
        {
          "pageid": 237528,
          "ns": 0,
          "title": "Lavarač republic"
        },
        {
          "pageid": 122721,
          "ns": 0,
          "title": "Republic of Lawean"
        },
        {
          "pageid": 31519,
          "ns": 0,
          "title": "Parliamentary Monarchy of Leadking",
          "stub": true
        },
        {
          "pageid": 176163,
          "ns": 0,
          "title": "Lechistani State Of Bir Tawil."
        },
        {
          "pageid": 20093,
          "ns": 0,
          "title": "Leestani Soviet Socialist Republic"
        },
        {
          "pageid": 36182,
          "ns": 0,
          "title": "Kingdom of Legabelden",
          "stub": true
        },
        {
          "pageid": 52267,
          "ns": 0,
          "title": "Legatia"
        },
        {
          "pageid": 12473,
          "ns": 0,
          "title": "Republic of Legendstries"
        },
        {
          "pageid": 60060,
          "ns": 0,
          "title": "Kingdom of Legialle"
        },
        {
          "pageid": 99476,
          "ns": 0,
          "title": "Lehmark Investment Corporation"
        },
        {
          "pageid": 99477,
          "ns": 0,
          "title": "Lehmark Law & Associates"
        },
        {
          "pageid": 104528,
          "ns": 0,
          "title": "Republic of Leo"
        },
        {
          "pageid": 135268,
          "ns": 0,
          "title": "Leonardium",
          "stub": true
        },
        {
          "pageid": 39364,
          "ns": 0,
          "title": "Grand Duchy of Letzembourg"
        },
        {
          "pageid": 5566,
          "ns": 0,
          "title": "Democratic Republic of Leylandiistan"
        },
        {
          "pageid": 51665,
          "ns": 0,
          "title": "Democratic Oligarchy of Libertatem Regni Sui"
        },
        {
          "pageid": 31886,
          "ns": 0,
          "title": "Duchy of Libertia"
        },
        {
          "pageid": 39769,
          "ns": 0,
          "title": "Empire of Lifréia"
        },
        {
          "pageid": 28264,
          "ns": 0,
          "title": "People's Republic of Linian"
        },
        {
          "pageid": 31463,
          "ns": 0,
          "title": "People's Republic of Linian-Marksovka"
        },
        {
          "pageid": 41078,
          "ns": 0,
          "title": "Linitian Democratic People's Republic"
        },
        {
          "pageid": 205173,
          "ns": 0,
          "title": "List of states headed by Daniel I of Artharia"
        },
        {
          "pageid": 133215,
          "ns": 0,
          "title": "Litoral"
        },
        {
          "pageid": 20088,
          "ns": 0,
          "title": "Live Nations"
        },
        {
          "pageid": 6040,
          "ns": 0,
          "title": "Empire of Livonia"
        },
        {
          "pageid": 28826,
          "ns": 0,
          "title": "Lomellinian Galactic Empire"
        },
        {
          "pageid": 30858,
          "ns": 0,
          "title": "Kingdom of Loquntia"
        },
        {
          "pageid": 6329,
          "ns": 0,
          "title": "Federal Republic of Los Bay Petros"
        },
        {
          "pageid": 6331,
          "ns": 0,
          "title": "Federal Republic of Los Bay Petros/id"
        },
        {
          "pageid": 6332,
          "ns": 0,
          "title": "Federal Republic of Lostisland"
        },
        {
          "pageid": 228867,
          "ns": 0,
          "title": "Louland"
        },
        {
          "pageid": 42815,
          "ns": 0,
          "title": "Kingdom of Loxodia",
          "poor": true
        },
        {
          "pageid": 167056,
          "ns": 0,
          "title": "Loyemas Micronation"
        },
        {
          "pageid": 166904,
          "ns": 0,
          "title": "Lucymas Micronation"
        },
        {
          "pageid": 7490,
          "ns": 0,
          "title": "Independent Nation of Ludia"
        },
        {
          "pageid": 57391,
          "ns": 0,
          "title": "Luigi People's Federation/ja"
        },
        {
          "pageid": 87804,
          "ns": 0,
          "title": "Lululand"
        },
        {
          "pageid": 75533,
          "ns": 0,
          "title": "Kingdom of Lululandia",
          "stub": true
        },
        {
          "pageid": 231596,
          "ns": 0,
          "title": "Lumeria"
        },
        {
          "pageid": 12782,
          "ns": 0,
          "title": "Principality of Lumlin"
        },
        {
          "pageid": 194040,
          "ns": 0,
          "title": "Lunarian Federation"
        },
        {
          "pageid": 191586,
          "ns": 0,
          "title": "Lunataria"
        },
        {
          "pageid": 25803,
          "ns": 0,
          "title": "Imperial Grand Duchy of Lundenwic"
        },
        {
          "pageid": 64843,
          "ns": 0,
          "title": "Luporto",
          "stub": true
        },
        {
          "pageid": 6042,
          "ns": 0,
          "title": "Empire of Luri"
        },
        {
          "pageid": 8060,
          "ns": 0,
          "title": "Kingdom of Lutherania"
        },
        {
          "pageid": 67791,
          "ns": 0,
          "title": "Republic of Luxia"
        },
        {
          "pageid": 84166,
          "ns": 0,
          "title": "Kingdom of Lytera"
        },
        {
          "pageid": 12477,
          "ns": 0,
          "title": "Republic of Macadamia",
          "stub": true
        },
        {
          "pageid": 58629,
          "ns": 0,
          "title": "Republic of Macahdon"
        },
        {
          "pageid": 75846,
          "ns": 0,
          "title": "Kingdom of Macalos"
        },
        {
          "pageid": 193793,
          "ns": 0,
          "title": "Macedonian Sosiocracy"
        },
        {
          "pageid": 12478,
          "ns": 0,
          "title": "Republic of Madawaska",
          "poor": true
        },
        {
          "pageid": 8441,
          "ns": 0,
          "title": "Kingdom of Madland"
        },
        {
          "pageid": 8061,
          "ns": 0,
          "title": "Kingdom of Madrona"
        },
        {
          "pageid": 52503,
          "ns": 0,
          "title": "People's Republic of Madrona"
        },
        {
          "pageid": 120539,
          "ns": 0,
          "title": "Kingdom of Maevis"
        },
        {
          "pageid": 257362,
          "ns": 3000,
          "title": "Draft:Mafia Republic"
        },
        {
          "pageid": 8491,
          "ns": 0,
          "title": "Majaoui"
        },
        {
          "pageid": 56372,
          "ns": 0,
          "title": "Kingdom of Makira"
        },
        {
          "pageid": 127916,
          "ns": 0,
          "title": "Maldernian Commonwealth",
          "stub": true
        },
        {
          "pageid": 178866,
          "ns": 0,
          "title": "Malianese Empire"
        },
        {
          "pageid": 42466,
          "ns": 0,
          "title": "Manchustan"
        },
        {
          "pageid": 12479,
          "ns": 0,
          "title": "Republic of Mania"
        },
        {
          "pageid": 200078,
          "ns": 0,
          "title": "Mantasia"
        },
        {
          "pageid": 41527,
          "ns": 0,
          "title": "Marana"
        },
        {
          "pageid": 116116,
          "ns": 2,
          "title": "User:Marawi"
        },
        {
          "pageid": 8525,
          "ns": 0,
          "title": "Mareborg"
        },
        {
          "pageid": 79012,
          "ns": 0,
          "title": "Marillösten"
        },
        {
          "pageid": 174750,
          "ns": 0,
          "title": "Marquisate de Odieval"
        },
        {
          "pageid": 28887,
          "ns": 0,
          "title": "Grand Duchy of Mars",
          "stub": true
        },
        {
          "pageid": 8552,
          "ns": 0,
          "title": "Martian Soviet Socialist Republic"
        },
        {
          "pageid": 156947,
          "ns": 0,
          "title": "Martina's Kingdom",
          "stub": true
        },
        {
          "pageid": 164734,
          "ns": 0,
          "title": "Martinmas Micronation"
        },
        {
          "pageid": 206959,
          "ns": 0,
          "title": "Marxist Empire"
        },
        {
          "pageid": 41838,
          "ns": 0,
          "title": "Kingdom of Matai"
        },
        {
          "pageid": 8590,
          "ns": 0,
          "title": "Mayorship of MathsVille"
        },
        {
          "pageid": 88400,
          "ns": 0,
          "title": "Republic of Mativati"
        },
        {
          "pageid": 8062,
          "ns": 0,
          "title": "Kingdom of Matt"
        },
        {
          "pageid": 12481,
          "ns": 0,
          "title": "Republic of Matt"
        },
        {
          "pageid": 69232,
          "ns": 0,
          "title": "Kingdom of Matthew",
          "stub": true
        },
        {
          "pageid": 42417,
          "ns": 0,
          "title": "Maun"
        },
        {
          "pageid": 33127,
          "ns": 0,
          "title": "Republic of Mcarthia"
        },
        {
          "pageid": 82998,
          "ns": 0,
          "title": "Memeraeus"
        },
        {
          "pageid": 89453,
          "ns": 0,
          "title": "Mensa Ann"
        },
        {
          "pageid": 145779,
          "ns": 3000,
          "title": "Draft:Meow-Woof Empire"
        },
        {
          "pageid": 26299,
          "ns": 0,
          "title": "Empire of Merania"
        },
        {
          "pageid": 134828,
          "ns": 0,
          "title": "Meretia"
        },
        {
          "pageid": 12482,
          "ns": 0,
          "title": "Republic of Meridica"
        },
        {
          "pageid": 132657,
          "ns": 0,
          "title": "Republic Of Methuzilah"
        },
        {
          "pageid": 161923,
          "ns": 0,
          "title": "Micronation/et"
        },
        {
          "pageid": 58857,
          "ns": 0,
          "title": "Micronation/kr"
        },
        {
          "pageid": 91270,
          "ns": 0,
          "title": "Micronational Confederation"
        },
        {
          "pageid": 7531,
          "ns": 0,
          "title": "Micronational diplomacy"
        },
        {
          "pageid": 152866,
          "ns": 0,
          "title": "Micronational World Ranking",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 68579,
          "ns": 0,
          "title": "Micronations World Cup"
        },
        {
          "pageid": 97610,
          "ns": 0,
          "title": "Midthenian Republic"
        },
        {
          "pageid": 5650,
          "ns": 0,
          "title": "Dictatorial Republic of Minato"
        },
        {
          "pageid": 12484,
          "ns": 0,
          "title": "Republic of Minerva"
        },
        {
          "pageid": 26743,
          "ns": 0,
          "title": "Minion Republic",
          "stub": true
        },
        {
          "pageid": 86844,
          "ns": 0,
          "title": "Republic of Minitrea"
        },
        {
          "pageid": 155079,
          "ns": 0,
          "title": "Mirrland",
          "stub": true
        },
        {
          "pageid": 40161,
          "ns": 0,
          "title": "Mohawk Empire"
        },
        {
          "pageid": 37313,
          "ns": 0,
          "title": "Moleland Republic",
          "stub": true
        },
        {
          "pageid": 130155,
          "ns": 0,
          "title": "Grand Duchy of Moletopia"
        },
        {
          "pageid": 71657,
          "ns": 0,
          "title": "Monarchial Micronation of Libondor"
        },
        {
          "pageid": 90158,
          "ns": 0,
          "title": "Monarchy of Lehmark"
        },
        {
          "pageid": 84701,
          "ns": 0,
          "title": "Communist State of Monavo",
          "stub": true
        },
        {
          "pageid": 123399,
          "ns": 0,
          "title": "Monkey Free State",
          "stub": true
        },
        {
          "pageid": 8927,
          "ns": 0,
          "title": "Principality of Monovia"
        },
        {
          "pageid": 124303,
          "ns": 0,
          "title": "Federal States of Monréal"
        },
        {
          "pageid": 62016,
          "ns": 0,
          "title": "Kingdom of Montara",
          "stub": true
        },
        {
          "pageid": 106714,
          "ns": 0,
          "title": "Principality of Montescano"
        },
        {
          "pageid": 85053,
          "ns": 0,
          "title": "Democratic Republic of Monteverde"
        },
        {
          "pageid": 8933,
          "ns": 0,
          "title": "Montosh"
        },
        {
          "pageid": 6687,
          "ns": 0,
          "title": "Free Morbhan Republic"
        },
        {
          "pageid": 64583,
          "ns": 0,
          "title": "Most Serene People's Democratic Republic of Bassopiave",
          "stub": true
        },
        {
          "pageid": 48044,
          "ns": 0,
          "title": "Imperial Republic of Mount Henadas"
        },
        {
          "pageid": 126226,
          "ns": 0,
          "title": "Republic of MrGhostia"
        },
        {
          "pageid": 119401,
          "ns": 0,
          "title": "Muhariba",
          "stub": true
        },
        {
          "pageid": 8975,
          "ns": 0,
          "title": "Empire of Mundai",
          "poor": true
        },
        {
          "pageid": 32523,
          "ns": 0,
          "title": "People's Republic of Munkkia"
        },
        {
          "pageid": 6374,
          "ns": 0,
          "title": "Federated States of Museus"
        },
        {
          "pageid": 156509,
          "ns": 0,
          "title": "Mushroomia"
        },
        {
          "pageid": 5630,
          "ns": 0,
          "title": "Dershowo Musograd"
        },
        {
          "pageid": 134892,
          "ns": 0,
          "title": "Republic of Mussel Rock",
          "stub": true
        },
        {
          "pageid": 171495,
          "ns": 0,
          "title": "Mutsuba Town Special Economic Zone"
        },
        {
          "pageid": 78617,
          "ns": 0,
          "title": "Myrek Republic",
          "stub": true
        },
        {
          "pageid": 28346,
          "ns": 0,
          "title": "Empire of Myrotania/de"
        },
        {
          "pageid": 62083,
          "ns": 0,
          "title": "Na Riaghailtean Thaealan",
          "stub": true
        },
        {
          "pageid": 23593,
          "ns": 0,
          "title": "Kingdom of Na'er",
          "stub": true
        },
        {
          "pageid": 78920,
          "ns": 0,
          "title": "Naoiphus"
        },
        {
          "pageid": 65922,
          "ns": 0,
          "title": "Napanon",
          "stub": true
        },
        {
          "pageid": 66273,
          "ns": 0,
          "title": "République du Napon",
          "stub": true
        },
        {
          "pageid": 48760,
          "ns": 0,
          "title": "Narentia"
        },
        {
          "pageid": 12489,
          "ns": 0,
          "title": "Republic of Nasatroe"
        },
        {
          "pageid": 150701,
          "ns": 0,
          "title": "Naswarian Empire"
        },
        {
          "pageid": 28291,
          "ns": 0,
          "title": "Kingdom of Natal"
        },
        {
          "pageid": 79150,
          "ns": 0,
          "title": "Nation of Oscana",
          "stub": true
        },
        {
          "pageid": 9065,
          "ns": 0,
          "title": "Nation of Rights, Freedom, and Expression",
          "stub": true
        },
        {
          "pageid": 91325,
          "ns": 0,
          "title": "National Parliament of the United Socialist States"
        },
        {
          "pageid": 129634,
          "ns": 0,
          "title": "National Republic of Miristan",
          "stub": true
        },
        {
          "pageid": 165335,
          "ns": 0,
          "title": "Nationalist Terrace",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 1997,
          "ns": 0,
          "title": "Bovic Dominion of Natopia"
        },
        {
          "pageid": 9174,
          "ns": 0,
          "title": "Nazcan Empire"
        },
        {
          "pageid": 9177,
          "ns": 0,
          "title": "Nebanian Florfinbourgish Socialist Republic"
        },
        {
          "pageid": 33443,
          "ns": 0,
          "title": "Democratic Extraterrestrial Republic of Nedland"
        },
        {
          "pageid": 42736,
          "ns": 2,
          "title": "User:Mikejones/Khanat de Nedland/fr"
        },
        {
          "pageid": 42727,
          "ns": 0,
          "title": "Khanate of Nedland/slin",
          "poor": true
        },
        {
          "pageid": 33536,
          "ns": 0,
          "title": "Nedlandic Autonomous Republic"
        },
        {
          "pageid": 41787,
          "ns": 0,
          "title": "Nedlandic Humanytaria"
        },
        {
          "pageid": 49574,
          "ns": 0,
          "title": "Kánit øv Nedlind/en-ned"
        },
        {
          "pageid": 7462,
          "ns": 0,
          "title": "Imperial Republic of Nemarkia"
        },
        {
          "pageid": 9194,
          "ns": 0,
          "title": "Nemkhav Federation"
        },
        {
          "pageid": 6387,
          "ns": 0,
          "title": "Federation of Nemkhavia",
          "stub": true
        },
        {
          "pageid": 12490,
          "ns": 0,
          "title": "Republic of Nemkhavia"
        },
        {
          "pageid": 11143,
          "ns": 0,
          "title": "Socialist Federal Republic of Nemkhavia"
        },
        {
          "pageid": 9212,
          "ns": 0,
          "title": "NeoNational Republic"
        },
        {
          "pageid": 72792,
          "ns": 0,
          "title": "Neonia",
          "stub": true
        },
        {
          "pageid": 118922,
          "ns": 0,
          "title": "NeoUK"
        },
        {
          "pageid": 157962,
          "ns": 0,
          "title": "Commonwealth of Neptunia"
        },
        {
          "pageid": 105165,
          "ns": 0,
          "title": "Principality of Nerivus"
        },
        {
          "pageid": 6301,
          "ns": 0,
          "title": "Neue Kronstadt"
        },
        {
          "pageid": 9219,
          "ns": 0,
          "title": "Neue Slowenische Kunst"
        },
        {
          "pageid": 179452,
          "ns": 0,
          "title": "Neustria"
        },
        {
          "pageid": 68791,
          "ns": 0,
          "title": "Neutnacia/hu"
        },
        {
          "pageid": 9230,
          "ns": 0,
          "title": "New Anglo"
        },
        {
          "pageid": 87003,
          "ns": 0,
          "title": "Republic of New Arc"
        },
        {
          "pageid": 98460,
          "ns": 0,
          "title": "New Athens"
        },
        {
          "pageid": 9232,
          "ns": 0,
          "title": "New Austin",
          "stub": true
        },
        {
          "pageid": 12492,
          "ns": 0,
          "title": "Republic of New Canada"
        },
        {
          "pageid": 50075,
          "ns": 0,
          "title": "New Castile",
          "stub": true
        },
        {
          "pageid": 12493,
          "ns": 0,
          "title": "Republic of New Dale"
        },
        {
          "pageid": 270507,
          "ns": 0,
          "title": "New Eastonstein"
        },
        {
          "pageid": 79159,
          "ns": 0,
          "title": "Principality of New Eiffel/hu",
          "stub": true
        },
        {
          "pageid": 6049,
          "ns": 0,
          "title": "Empire of New Europe"
        },
        {
          "pageid": 8076,
          "ns": 0,
          "title": "Kingdom of New Galicia"
        },
        {
          "pageid": 100408,
          "ns": 0,
          "title": "Democratic Weimar Republic"
        },
        {
          "pageid": 41117,
          "ns": 0,
          "title": "Socialist Principality of New Lithuania"
        },
        {
          "pageid": 264130,
          "ns": 0,
          "title": "New Macedonia"
        },
        {
          "pageid": 71750,
          "ns": 0,
          "title": "New Makuhero",
          "stub": true
        },
        {
          "pageid": 76187,
          "ns": 0,
          "title": "New Massachusetts"
        },
        {
          "pageid": 81315,
          "ns": 0,
          "title": "New McCowan"
        },
        {
          "pageid": 222764,
          "ns": 0,
          "title": "New Moscovian Wilayah",
          "stub": true
        },
        {
          "pageid": 78445,
          "ns": 0,
          "title": "Federal Republic of New Potato Land"
        },
        {
          "pageid": 64246,
          "ns": 0,
          "title": "Empire of New Providence"
        },
        {
          "pageid": 65153,
          "ns": 0,
          "title": "Republic of New Prussia"
        },
        {
          "pageid": 190261,
          "ns": 0,
          "title": "New Qatar"
        },
        {
          "pageid": 127008,
          "ns": 0,
          "title": "New Republic of Attimer"
        },
        {
          "pageid": 9328,
          "ns": 0,
          "title": "New Scireland (former state)"
        },
        {
          "pageid": 8915,
          "ns": 0,
          "title": "Monarchy of New Scotland"
        },
        {
          "pageid": 33451,
          "ns": 0,
          "title": "United Kingdoms of New Sussex and Hampshire",
          "stub": true
        },
        {
          "pageid": 134336,
          "ns": 0,
          "title": "Principality of New Tyne"
        },
        {
          "pageid": 12788,
          "ns": 0,
          "title": "Principality of New Utopia"
        },
        {
          "pageid": 151251,
          "ns": 0,
          "title": "New Venice"
        },
        {
          "pageid": 62687,
          "ns": 0,
          "title": "New Whiteyard",
          "stub": true
        },
        {
          "pageid": 6050,
          "ns": 0,
          "title": "Empire of New Winterdown"
        },
        {
          "pageid": 9342,
          "ns": 0,
          "title": "New Worcester Kingdom"
        },
        {
          "pageid": 102237,
          "ns": 0,
          "title": "New Year's Micronation"
        },
        {
          "pageid": 218693,
          "ns": 3000,
          "title": "Draft:Republic of New York"
        },
        {
          "pageid": 249708,
          "ns": 0,
          "title": "Republic of New York",
          "poor": true
        },
        {
          "pageid": 163670,
          "ns": 0,
          "title": "Republic of New-Estonia",
          "stub": true
        },
        {
          "pageid": 145816,
          "ns": 0,
          "title": "Newstonia"
        },
        {
          "pageid": 137864,
          "ns": 0,
          "title": "Nghlogwa rësmumlika",
          "stub": true
        },
        {
          "pageid": 164731,
          "ns": 0,
          "title": "Nicholasmas Micronation"
        },
        {
          "pageid": 5127,
          "ns": 0,
          "title": "Constitutional Republic of Niestata"
        },
        {
          "pageid": 211109,
          "ns": 0,
          "title": "Niriħyrese Despotate"
        },
        {
          "pageid": 1015,
          "ns": 0,
          "title": "Archduchy of Noamh Séamus"
        },
        {
          "pageid": 167507,
          "ns": 0,
          "title": "Nolius"
        },
        {
          "pageid": 90818,
          "ns": 0,
          "title": "Non-Normie Union"
        },
        {
          "pageid": 12498,
          "ns": 0,
          "title": "Republic of Nordica"
        },
        {
          "pageid": 66628,
          "ns": 0,
          "title": "Nordkavn Federation"
        },
        {
          "pageid": 124952,
          "ns": 0,
          "title": "Kingdom of Normandy"
        },
        {
          "pageid": 6970,
          "ns": 0,
          "title": "Grand Kingdom of Normark"
        },
        {
          "pageid": 79954,
          "ns": 0,
          "title": "Empire of North Africa"
        },
        {
          "pageid": 12501,
          "ns": 0,
          "title": "Republic of North Altania"
        },
        {
          "pageid": 9428,
          "ns": 0,
          "title": "North American Confederation"
        },
        {
          "pageid": 55271,
          "ns": 0,
          "title": "Kingdom of North Barchant"
        },
        {
          "pageid": 9446,
          "ns": 0,
          "title": "North Crawford"
        },
        {
          "pageid": 9452,
          "ns": 0,
          "title": "Kingdom of North Hill",
          "stub": true
        },
        {
          "pageid": 28240,
          "ns": 0,
          "title": "Kingdom of Northern Segacia"
        },
        {
          "pageid": 54256,
          "ns": 0,
          "title": "Northernmoolandia",
          "poor": true
        },
        {
          "pageid": 235475,
          "ns": 0,
          "title": "Northudankton"
        },
        {
          "pageid": 100914,
          "ns": 0,
          "title": "Northwestern Republic"
        },
        {
          "pageid": 9474,
          "ns": 0,
          "title": "Nortiforss",
          "poor": true
        },
        {
          "pageid": 162532,
          "ns": 0,
          "title": "Norumbega Pact"
        },
        {
          "pageid": 160800,
          "ns": 0,
          "title": "Norvætia",
          "poor": true
        },
        {
          "pageid": 39779,
          "ns": 0,
          "title": "Principality of Nossia"
        },
        {
          "pageid": 80275,
          "ns": 0,
          "title": "Kingdom of Notolis"
        },
        {
          "pageid": 122926,
          "ns": 0,
          "title": "Confederation of Nova Tromsø"
        },
        {
          "pageid": 73400,
          "ns": 0,
          "title": "Union of Nova-Occitania"
        },
        {
          "pageid": 25281,
          "ns": 0,
          "title": "Republic of Novaland"
        },
        {
          "pageid": 43492,
          "ns": 0,
          "title": "Principality of Novapara"
        },
        {
          "pageid": 89667,
          "ns": 0,
          "title": "Republic of Novopartia"
        },
        {
          "pageid": 41626,
          "ns": 0,
          "title": "People's Buddhist Republic of Noveria"
        },
        {
          "pageid": 51226,
          "ns": 0,
          "title": "Novian Republic"
        },
        {
          "pageid": 80192,
          "ns": 0,
          "title": "Kingdom of Novograd"
        },
        {
          "pageid": 92349,
          "ns": 0,
          "title": "Empire of Byzantium Novum"
        },
        {
          "pageid": 206496,
          "ns": 0,
          "title": "Nowosorby"
        },
        {
          "pageid": 126802,
          "ns": 0,
          "title": "Ntinelabia",
          "stub": true
        },
        {
          "pageid": 133612,
          "ns": 0,
          "title": "Kingdom of Nueva Esocia",
          "poor": true
        },
        {
          "pageid": 135266,
          "ns": 0,
          "title": "Republic of Nulug"
        },
        {
          "pageid": 8080,
          "ns": 0,
          "title": "Kingdom of Numenor",
          "poor": true
        },
        {
          "pageid": 87099,
          "ns": 0,
          "title": "Republic of Nut"
        },
        {
          "pageid": 9495,
          "ns": 0,
          "title": "Nutopia"
        },
        {
          "pageid": 170087,
          "ns": 0,
          "title": "Nîndor"
        },
        {
          "pageid": 11886,
          "ns": 0,
          "title": "Republic of the Oasis Islands"
        },
        {
          "pageid": 123749,
          "ns": 0,
          "title": "Occidian Empire"
        },
        {
          "pageid": 37015,
          "ns": 0,
          "title": "Popular Union of Occitania"
        },
        {
          "pageid": 35465,
          "ns": 0,
          "title": "Confederate States of Occitania"
        },
        {
          "pageid": 8081,
          "ns": 0,
          "title": "Kingdom of Oceanland"
        },
        {
          "pageid": 128307,
          "ns": 3000,
          "title": "Draft:Commonwealth of Ochana"
        },
        {
          "pageid": 9568,
          "ns": 0,
          "title": "Octavashire",
          "stub": true
        },
        {
          "pageid": 138524,
          "ns": 0,
          "title": "Old Republic of Coron",
          "poor": true
        },
        {
          "pageid": 23665,
          "ns": 0,
          "title": "Republic of Omahkulon"
        },
        {
          "pageid": 81952,
          "ns": 0,
          "title": "Kingdom of Onet",
          "stub": true
        },
        {
          "pageid": 121659,
          "ns": 0,
          "title": "Operative Locality of Agoria"
        },
        {
          "pageid": 60132,
          "ns": 0,
          "title": "Orange",
          "stub": true
        },
        {
          "pageid": 81734,
          "ns": 0,
          "title": "Orca Republic",
          "stub": true
        },
        {
          "pageid": 84079,
          "ns": 0,
          "title": "Ordonia"
        },
        {
          "pageid": 5823,
          "ns": 0,
          "title": "Duchy of Orenburg"
        },
        {
          "pageid": 61811,
          "ns": 0,
          "title": "Organisation for Defence of micronational Rights"
        },
        {
          "pageid": 12791,
          "ns": 0,
          "title": "Principality of Orient"
        },
        {
          "pageid": 67914,
          "ns": 0,
          "title": "Republic of Orion"
        },
        {
          "pageid": 9731,
          "ns": 0,
          "title": "Orphanian Republic"
        },
        {
          "pageid": 104356,
          "ns": 0,
          "title": "Republic of Ostland"
        },
        {
          "pageid": 72764,
          "ns": 0,
          "title": "Republic of Ostrov",
          "stub": true
        },
        {
          "pageid": 252155,
          "ns": 0,
          "title": "Ostwania"
        },
        {
          "pageid": 12863,
          "ns": 0,
          "title": "Democratic People's Republic of Ovižava"
        },
        {
          "pageid": 202950,
          "ns": 0,
          "title": "Oxfordshire"
        },
        {
          "pageid": 12869,
          "ns": 0,
          "title": "Oxi Dependency"
        },
        {
          "pageid": 185056,
          "ns": 0,
          "title": "Pacific Island of Jonja"
        },
        {
          "pageid": 117968,
          "ns": 0,
          "title": "Kingdom of Pacifica"
        },
        {
          "pageid": 12506,
          "ns": 0,
          "title": "Republic of Padrhom"
        },
        {
          "pageid": 97144,
          "ns": 0,
          "title": "Communist State of Pagan"
        },
        {
          "pageid": 12901,
          "ns": 0,
          "title": "Palacio"
        },
        {
          "pageid": 151080,
          "ns": 0,
          "title": "Palmal",
          "poor": true
        },
        {
          "pageid": 79514,
          "ns": 2,
          "title": "User:Cookieman1.1.1/sandbox"
        },
        {
          "pageid": 13086,
          "ns": 0,
          "title": "People's Republic of Pambia"
        },
        {
          "pageid": 23514,
          "ns": 0,
          "title": "Panarchist Republic Project"
        },
        {
          "pageid": 12919,
          "ns": 0,
          "title": "Pangean Empire"
        },
        {
          "pageid": 11818,
          "ns": 0,
          "title": "Republic of Pannonia/hu"
        },
        {
          "pageid": 22672,
          "ns": 0,
          "title": "Republic of Parabica"
        },
        {
          "pageid": 91466,
          "ns": 0,
          "title": "Federal States of Paragotnia"
        },
        {
          "pageid": 12931,
          "ns": 0,
          "title": "Paramount",
          "stub": true
        },
        {
          "pageid": 58696,
          "ns": 0,
          "title": "Paravian Humanytaria"
        },
        {
          "pageid": 82779,
          "ns": 3000,
          "title": "Draft:Kingdom of Parklandia"
        },
        {
          "pageid": 147761,
          "ns": 0,
          "title": "Parliamentary Monarchy of Duckionary"
        },
        {
          "pageid": 75664,
          "ns": 0,
          "title": "Parliamentary Republic of Stedfast"
        },
        {
          "pageid": 221823,
          "ns": 0,
          "title": "Parliamentary Republic of Zenith"
        },
        {
          "pageid": 33509,
          "ns": 0,
          "title": "Patistan"
        },
        {
          "pageid": 284206,
          "ns": 0,
          "title": "Patriarchate of the Holy China"
        },
        {
          "pageid": 74461,
          "ns": 0,
          "title": "Kingdom of Patrimia",
          "stub": true
        },
        {
          "pageid": 64864,
          "ns": 0,
          "title": "Governorate of Aleksandropil"
        },
        {
          "pageid": 113935,
          "ns": 0,
          "title": "Republic of Pawnoha"
        },
        {
          "pageid": 173745,
          "ns": 0,
          "title": "Paxia",
          "poor": true
        },
        {
          "pageid": 127371,
          "ns": 0,
          "title": "Principality of Pelkesa"
        },
        {
          "pageid": 41791,
          "ns": 0,
          "title": "Peltgorod",
          "stub": true
        },
        {
          "pageid": 11822,
          "ns": 0,
          "title": "Republic of Pelvon"
        },
        {
          "pageid": 6680,
          "ns": 0,
          "title": "Free Commonwealth of Penguinea"
        },
        {
          "pageid": 87682,
          "ns": 0,
          "title": "Pennluren",
          "poor": true
        },
        {
          "pageid": 202505,
          "ns": 0,
          "title": "People's Democratic Republic of Sprinskè"
        },
        {
          "pageid": 232257,
          "ns": 0,
          "title": "People's Holy Empire of Kelstinland"
        },
        {
          "pageid": 146372,
          "ns": 0,
          "title": "People's Nation of New Westfalen"
        },
        {
          "pageid": 13066,
          "ns": 0,
          "title": "People's Proper Republic of Wellington"
        },
        {
          "pageid": 13112,
          "ns": 0,
          "title": "People's reformed States Republic"
        },
        {
          "pageid": 227565,
          "ns": 0,
          "title": "People's Republic of Capia"
        },
        {
          "pageid": 76604,
          "ns": 0,
          "title": "People's Republic of Eskar",
          "poor": true
        },
        {
          "pageid": 105285,
          "ns": 0,
          "title": "People's Republic of Liancourt"
        },
        {
          "pageid": 149912,
          "ns": 0,
          "title": "People's Republic of Todt Hill"
        },
        {
          "pageid": 231991,
          "ns": 0,
          "title": "People's Republic of Vlechenia"
        },
        {
          "pageid": 130221,
          "ns": 0,
          "title": "People's Union of Chaveleir Socialists"
        },
        {
          "pageid": 164429,
          "ns": 0,
          "title": "Peoples Republic of Labotos"
        },
        {
          "pageid": 281213,
          "ns": 0,
          "title": "República Pepsica"
        },
        {
          "pageid": 30509,
          "ns": 0,
          "title": "Kingdom of Pereica"
        },
        {
          "pageid": 11823,
          "ns": 0,
          "title": "Republic of Petorio"
        },
        {
          "pageid": 99712,
          "ns": 0,
          "title": "Phoklandian Free State"
        },
        {
          "pageid": 101598,
          "ns": 0,
          "title": "Phoklandian Free State/af"
        },
        {
          "pageid": 70755,
          "ns": 0,
          "title": "Pinang/it"
        },
        {
          "pageid": 140044,
          "ns": 0,
          "title": "Pinsker"
        },
        {
          "pageid": 123216,
          "ns": 0,
          "title": "Pirate Republic of Anarcia",
          "poor": true
        },
        {
          "pageid": 101407,
          "ns": 0,
          "title": "Planetary Traentorian Empire"
        },
        {
          "pageid": 13170,
          "ns": 0,
          "title": "Platonian Republic",
          "poor": true
        },
        {
          "pageid": 66711,
          "ns": 0,
          "title": "Republic of Polanda"
        },
        {
          "pageid": 197658,
          "ns": 0,
          "title": "Polarveinn"
        },
        {
          "pageid": 75429,
          "ns": 0,
          "title": "Policía Micronacional"
        },
        {
          "pageid": 112854,
          "ns": 0,
          "title": "Political Lovers Syber State"
        },
        {
          "pageid": 191659,
          "ns": 0,
          "title": "Pommerland"
        },
        {
          "pageid": 52506,
          "ns": 0,
          "title": "Pommterr farm"
        },
        {
          "pageid": 136006,
          "ns": 0,
          "title": "Kingdom of Pontunia"
        },
        {
          "pageid": 11826,
          "ns": 0,
          "title": "Republic of Porto Claro"
        },
        {
          "pageid": 12573,
          "ns": 0,
          "title": "Post-Eran Secundomia"
        },
        {
          "pageid": 100715,
          "ns": 0,
          "title": "Praetorian Prefecture of Americania"
        },
        {
          "pageid": 77260,
          "ns": 0,
          "title": "Presidential Republic of Livettree",
          "stub": true
        },
        {
          "pageid": 52152,
          "ns": 0,
          "title": "Duchy of Preußenland"
        },
        {
          "pageid": 71955,
          "ns": 0,
          "title": "Primeira Liga Guanabara"
        },
        {
          "pageid": 75408,
          "ns": 0,
          "title": "Primera Presidencia"
        },
        {
          "pageid": 48079,
          "ns": 0,
          "title": "Primsland"
        },
        {
          "pageid": 58080,
          "ns": 0,
          "title": "Princess Anne Land"
        },
        {
          "pageid": 199909,
          "ns": 0,
          "title": "Principality of Bir Tawil"
        },
        {
          "pageid": 267059,
          "ns": 0,
          "title": "Principality of Cristus"
        },
        {
          "pageid": 133141,
          "ns": 0,
          "title": "Principality of Gardenland"
        },
        {
          "pageid": 165939,
          "ns": 0,
          "title": "Principality of Gerseland"
        },
        {
          "pageid": 171628,
          "ns": 0,
          "title": "Principality of Hains"
        },
        {
          "pageid": 157714,
          "ns": 0,
          "title": "Principality of Làas"
        },
        {
          "pageid": 294479,
          "ns": 0,
          "title": "Principality of Nesea"
        },
        {
          "pageid": 169211,
          "ns": 0,
          "title": "Principality of New Codrion",
          "stub": true
        },
        {
          "pageid": 194873,
          "ns": 0,
          "title": "Principality of Senkland"
        },
        {
          "pageid": 103739,
          "ns": 0,
          "title": "Principality of the Northern Forests"
        },
        {
          "pageid": 146468,
          "ns": 0,
          "title": "Principality of Vlachia"
        },
        {
          "pageid": 82703,
          "ns": 0,
          "title": "Principality of Woodlandia"
        },
        {
          "pageid": 123686,
          "ns": 0,
          "title": "Principauté de Deux-Acren"
        },
        {
          "pageid": 27854,
          "ns": 0,
          "title": "Principato di Otrebor/it",
          "poor": true
        },
        {
          "pageid": 6364,
          "ns": 0,
          "title": "Federated Commonwealth of Pristinia"
        },
        {
          "pageid": 143561,
          "ns": 0,
          "title": "Proletarian People's Federative Republic",
          "stub": true
        },
        {
          "pageid": 279602,
          "ns": 0,
          "title": "Provincist Republic of Schpecktenia"
        },
        {
          "pageid": 245399,
          "ns": 0,
          "title": "Provisional State of Lytpatri"
        },
        {
          "pageid": 193436,
          "ns": 0,
          "title": "Prussian Remnants"
        },
        {
          "pageid": 13046,
          "ns": 0,
          "title": "People's Democratic Republic of Pugguinia"
        },
        {
          "pageid": 86282,
          "ns": 0,
          "title": "Qaflana"
        },
        {
          "pageid": 6057,
          "ns": 0,
          "title": "Empire of Qootärlænt"
        },
        {
          "pageid": 12266,
          "ns": 0,
          "title": "Quorn"
        },
        {
          "pageid": 58096,
          "ns": 0,
          "title": "Qök Qoyunlu"
        },
        {
          "pageid": 184592,
          "ns": 0,
          "title": "Raphania"
        },
        {
          "pageid": 185243,
          "ns": 2,
          "title": "User:Rayneland"
        },
        {
          "pageid": 146241,
          "ns": 2,
          "title": "User:Real FlikaKepaKru"
        },
        {
          "pageid": 8092,
          "ns": 0,
          "title": "Kingdom of Redonda"
        },
        {
          "pageid": 258744,
          "ns": 0,
          "title": "Redrock Socialist Union"
        },
        {
          "pageid": 117602,
          "ns": 0,
          "title": "Reino de Cordova"
        },
        {
          "pageid": 179738,
          "ns": 0,
          "title": "Remorian Empire"
        },
        {
          "pageid": 80841,
          "ns": 0,
          "title": "Repubblica di Santa Rita",
          "stub": true
        },
        {
          "pageid": 292019,
          "ns": 0,
          "title": "Republic Kingdom of Imruland"
        },
        {
          "pageid": 191499,
          "ns": 0,
          "title": "Republic of Aledonia",
          "poor": true
        },
        {
          "pageid": 179618,
          "ns": 0,
          "title": "Republic of Anarcia"
        },
        {
          "pageid": 128034,
          "ns": 0,
          "title": "Republic of Asdenia",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 161339,
          "ns": 0,
          "title": "Republic of Aurelia"
        },
        {
          "pageid": 124135,
          "ns": 0,
          "title": "Republic of Aurora (2nd)"
        },
        {
          "pageid": 156476,
          "ns": 0,
          "title": "Republic of Avalonia"
        },
        {
          "pageid": 228943,
          "ns": 0,
          "title": "Republic of Avyanna and Taijana"
        },
        {
          "pageid": 199340,
          "ns": 0,
          "title": "Republic of Baltia"
        },
        {
          "pageid": 111120,
          "ns": 0,
          "title": "Republic of Bartonia"
        },
        {
          "pageid": 97807,
          "ns": 0,
          "title": "Republic of Belcity"
        },
        {
          "pageid": 295829,
          "ns": 3000,
          "title": "Draft:Republic of Bletusia"
        },
        {
          "pageid": 136274,
          "ns": 0,
          "title": "Republic of Bonumland"
        },
        {
          "pageid": 297209,
          "ns": 3000,
          "title": "Draft:Republic of Choson"
        },
        {
          "pageid": 133896,
          "ns": 0,
          "title": "Republic of Crotania",
          "stub": true
        },
        {
          "pageid": 248450,
          "ns": 0,
          "title": "Republic of Fortawia"
        },
        {
          "pageid": 151693,
          "ns": 2,
          "title": "User:Republic of Fâejakistan"
        },
        {
          "pageid": 292009,
          "ns": 0,
          "title": "Republic of Imruland"
        },
        {
          "pageid": 248915,
          "ns": 0,
          "title": "Republic of Kongar"
        },
        {
          "pageid": 168139,
          "ns": 0,
          "title": "Republic of LaiNovies"
        },
        {
          "pageid": 229186,
          "ns": 0,
          "title": "Republic of Llofriu"
        },
        {
          "pageid": 202972,
          "ns": 0,
          "title": "Republic of Maleyi"
        },
        {
          "pageid": 187388,
          "ns": 0,
          "title": "Republic of New Katy"
        },
        {
          "pageid": 209252,
          "ns": 0,
          "title": "Republic of New Riga"
        },
        {
          "pageid": 183311,
          "ns": 0,
          "title": "Republic of Roscamistan/hi"
        },
        {
          "pageid": 211524,
          "ns": 0,
          "title": "Republic of the Union of Ratchasima"
        },
        {
          "pageid": 280873,
          "ns": 0,
          "title": "Republic of Velaria"
        },
        {
          "pageid": 245331,
          "ns": 0,
          "title": "Republic of Veria"
        },
        {
          "pageid": 287977,
          "ns": 3000,
          "title": "Draft:Republic Of Yaddah"
        },
        {
          "pageid": 40272,
          "ns": 0,
          "title": "Republic Sebastianovska",
          "stub": true
        },
        {
          "pageid": 153868,
          "ns": 0,
          "title": "Republic Territory of Redditera"
        },
        {
          "pageid": 102906,
          "ns": 0,
          "title": "Republic of Ethosia"
        },
        {
          "pageid": 93075,
          "ns": 0,
          "title": "República Jubiana",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 11831,
          "ns": 0,
          "title": "Republic of Resoria"
        },
        {
          "pageid": 158765,
          "ns": 0,
          "title": "Revalian Kingdom/et"
        },
        {
          "pageid": 11913,
          "ns": 0,
          "title": "Rheymaanian Republic"
        },
        {
          "pageid": 67361,
          "ns": 0,
          "title": "Kingdom of Rhoss"
        },
        {
          "pageid": 28705,
          "ns": 0,
          "title": "Rhys Gregory of Oryland",
          "poor": true
        },
        {
          "pageid": 13088,
          "ns": 0,
          "title": "People's Republic of Richland"
        },
        {
          "pageid": 11832,
          "ns": 0,
          "title": "Republic of Ridiculum"
        },
        {
          "pageid": 79861,
          "ns": 0,
          "title": "Right- and left-hand traffic"
        },
        {
          "pageid": 92023,
          "ns": 0,
          "title": "Principality of Riloia"
        },
        {
          "pageid": 290344,
          "ns": 0,
          "title": "Rittia"
        },
        {
          "pageid": 6692,
          "ns": 0,
          "title": "Free Republic of Rocentia"
        },
        {
          "pageid": 134176,
          "ns": 0,
          "title": "Empire of Rodentia"
        },
        {
          "pageid": 144831,
          "ns": 2,
          "title": "User:RodrigoM/sandbox1"
        },
        {
          "pageid": 104782,
          "ns": 0,
          "title": "Romenzia"
        },
        {
          "pageid": 65567,
          "ns": 0,
          "title": "Principality of Rosebud",
          "stub": true
        },
        {
          "pageid": 180255,
          "ns": 2,
          "title": "User:Indradhanush/sandbox3"
        },
        {
          "pageid": 77867,
          "ns": 0,
          "title": "Kingdom of Rosston"
        },
        {
          "pageid": 151033,
          "ns": 0,
          "title": "Rotzinian Empire"
        },
        {
          "pageid": 11992,
          "ns": 0,
          "title": "Royal Commonwealth of Novaltia",
          "stub": true
        },
        {
          "pageid": 221201,
          "ns": 0,
          "title": "Royal Islamic Emirate of New Hindustan"
        },
        {
          "pageid": 12009,
          "ns": 0,
          "title": "Royal Kingdom of Eesha",
          "stub": true
        },
        {
          "pageid": 219394,
          "ns": 0,
          "title": "Royal Principality of Lumeria"
        },
        {
          "pageid": 12047,
          "ns": 0,
          "title": "Royal reformed States of America"
        },
        {
          "pageid": 30368,
          "ns": 0,
          "title": "Commonwealth of Rudno",
          "stub": true
        },
        {
          "pageid": 76456,
          "ns": 0,
          "title": "Kingdom of Ruritania"
        },
        {
          "pageid": 160459,
          "ns": 0,
          "title": "Russenorsk"
        },
        {
          "pageid": 11834,
          "ns": 0,
          "title": "Republic of Ruvia"
        },
        {
          "pageid": 30358,
          "ns": 0,
          "title": "Principality of Ržagorod",
          "stub": true
        },
        {
          "pageid": 249763,
          "ns": 0,
          "title": "Sabarian Federation"
        },
        {
          "pageid": 95495,
          "ns": 0,
          "title": "State of Sabotage",
          "stub": true
        },
        {
          "pageid": 66686,
          "ns": 0,
          "title": "Santos de los Ultimos Dias"
        },
        {
          "pageid": 29131,
          "ns": 0,
          "title": "State of Sanyo"
        },
        {
          "pageid": 83840,
          "ns": 0,
          "title": "Saor Éire",
          "stub": true,
          "poor": true
        },
        {
          "pageid": 8100,
          "ns": 0,
          "title": "Kingdom of Saqqara"
        },
        {
          "pageid": 67230,
          "ns": 0,
          "title": "Sariyal",
          "stub": true
        },
        {
          "pageid": 112052,
          "ns": 0,
          "title": "Republic of Savannah",
          "poor": true
        },
        {
          "pageid": 135412,
          "ns": 0,
          "title": "Saverio Castellaneta",
          "stub": true
        },
        {
          "pageid": 8102,
          "ns": 0,
          "title": "Kingdom of Savoy"
        },
        {
          "pageid": 12799,
          "ns": 0,
          "title": "Principality of Sealand/he"
        },
        {
          "pageid": 51529,
          "ns": 0,
          "title": "Holy Armed Republic of Sebastianovska",
          "stub": true
        },
        {
          "pageid": 122325,
          "ns": 0,
          "title": "Second American Empire"
        },
        {
          "pageid": 83202,
          "ns": 0,
          "title": "Second Kingdom of France",
          "stub": true
        },
        {
          "pageid": 108525,
          "ns": 0,
          "title": "Seconda Repubblica di Pinang/it"
        },
        {
          "pageid": 75416,
          "ns": 0,
          "title": "Secretario General de Los Estados Unidos Socialistas"
        },
        {
          "pageid": 75420,
          "ns": 0,
          "title": "Secretaría de Ciencia y Tecnología",
          "stub": true
        },
        {
          "pageid": 75426,
          "ns": 0,
          "title": "Secretaría de Comunicaciones y Transportes",
          "stub": true
        },
        {
          "pageid": 75419,
          "ns": 0,
          "title": "Secretaría de Deporte y Cultura",
          "stub": true
        },
        {
          "pageid": 75421,
          "ns": 0,
          "title": "Secretaría de Difusión"
        },
        {
          "pageid": 75424,
          "ns": 0,
          "title": "Secretaría de Educación",
          "stub": true
        },
        {
          "pageid": 75422,
          "ns": 0,
          "title": "Secretaría de la Tesorería"
        },
        {
          "pageid": 75423,
          "ns": 0,
          "title": "Secretaría de Salud",
          "stub": true
        },
        {
          "pageid": 75425,
          "ns": 0,
          "title": "Secretaría de Servicios Publicos",
          "stub": true
        },
        {
          "pageid": 28873,
          "ns": 0,
          "title": "Great Kingdom of Segacia"
        },
        {
          "pageid": 81118,
          "ns": 0,
          "title": "Confederation of Serosist Socialist Republics",
          "poor": true
        },
        {
          "pageid": 42236,
          "ns": 0,
          "title": "Kingdom of Shorewell",
          "stub": true
        },
        {
          "pageid": 57683,
          "ns": 0,
          "title": "Siberian Empire",
          "stub": true
        },
        {
          "pageid": 11703,
          "ns": 0,
          "title": "Kingdom of Siderum"
        },
        {
          "pageid": 11845,
          "ns": 0,
          "title": "Republic of Skillz"
        },
        {
          "pageid": 206696,
          "ns": 0,
          "title": "Skotian Republic"
        },
        {
          "pageid": 41418,
          "ns": 0,
          "title": "Republic of Skuliya"
        },
        {
          "pageid": 86154,
          "ns": 0,
          "title": "Kingdom of Slabovia"
        },
        {
          "pageid": 41509,
          "ns": 0,
          "title": "Slaviac Republic"
        },
        {
          "pageid": 11782,
          "ns": 0,
          "title": "Slinky Parliamentary Monarchy"
        },
        {
          "pageid": 221804,
          "ns": 3000,
          "title": "Draft:Smitthans"
        },
        {
          "pageid": 23363,
          "ns": 0,
          "title": "Grand Principality of Snežanopol"
        },
        {
          "pageid": 11133,
          "ns": 0,
          "title": "Social Republic of New Europe"
        },
        {
          "pageid": 255597,
          "ns": 0,
          "title": "Socialist Republic of Baltia"
        },
        {
          "pageid": 271479,
          "ns": 0,
          "title": "Socialist Republic of Paumanocia"
        },
        {
          "pageid": 172454,
          "ns": 0,
          "title": "Socialist States dollar"
        },
        {
          "pageid": 73039,
          "ns": 0,
          "title": "Tsardom of Socratia"
        },
        {
          "pageid": 281251,
          "ns": 0,
          "title": "Solar"
        },
        {
          "pageid": 68121,
          "ns": 0,
          "title": "Kingdom of Sollena/ro"
        },
        {
          "pageid": 11196,
          "ns": 0,
          "title": "Solvo Federation"
        },
        {
          "pageid": 8919,
          "ns": 0,
          "title": "Monarchy of Sophopolis"
        },
        {
          "pageid": 54626,
          "ns": 0,
          "title": "Sorority Empire",
          "stub": true
        },
        {
          "pageid": 50645,
          "ns": 0,
          "title": "Sorrenian Federation"
        },
        {
          "pageid": 60516,
          "ns": 0,
          "title": "Spireland"
        },
        {
          "pageid": 205502,
          "ns": 0,
          "title": "Sprinske Empire/sco"
        },
        {
          "pageid": 42421,
          "ns": 0,
          "title": "St. Patts and Nedis",
          "stub": true
        },
        {
          "pageid": 58458,
          "ns": 0,
          "title": "Kingdom of Star"
        },
        {
          "pageid": 31527,
          "ns": 0,
          "title": "State of Adjistan"
        },
        {
          "pageid": 153172,
          "ns": 0,
          "title": "State of Canal",
          "stub": true
        },
        {
          "pageid": 11381,
          "ns": 0,
          "title": "State of Central Alltgobhlach"
        },
        {
          "pageid": 107504,
          "ns": 0,
          "title": "State of Crolesia"
        },
        {
          "pageid": 5295,
          "ns": 0,
          "title": "State of Dakrit"
        },
        {
          "pageid": 180636,
          "ns": 0,
          "title": "State of Delmett"
        },
        {
          "pageid": 149376,
          "ns": 0,
          "title": "State of Devistation"
        },
        {
          "pageid": 151460,
          "ns": 0,
          "title": "State of Elbonia"
        },
        {
          "pageid": 78501,
          "ns": 0,
          "title": "State of Greater Soldeu"
        },
        {
          "pageid": 134521,
          "ns": 0,
          "title": "State of Herzetia"
        },
        {
          "pageid": 113380,
          "ns": 0,
          "title": "State of Malinovia",
          "stub": true
        },
        {
          "pageid": 9240,
          "ns": 0,
          "title": "State of New Catalonia"
        },
        {
          "pageid": 87344,
          "ns": 0,
          "title": "State of Samizdat"
        },
        {
          "pageid": 273206,
          "ns": 0,
          "title": "State of Stret Merdhin"
        },
        {
          "pageid": 202163,
          "ns": 0,
          "title": "State of Thejistan"
        },
        {
          "pageid": 267329,
          "ns": 0,
          "title": "State of Zemlyastan"
        },
        {
          "pageid": 33864,
          "ns": 0,
          "title": "State of Zenrax"
        },
        {
          "pageid": 11431,
          "ns": 0,
          "title": "Independent Sovereign State of Storej"
        },
        {
          "pageid": 48819,
          "ns": 0,
          "title": "Grand Duchy of the Storm Islands"
        },
        {
          "pageid": 178777,
          "ns": 0,
          "title": "Sublime State of Turan"
        },
        {
          "pageid": 11853,
          "ns": 0,
          "title": "Republic of Suidae Freedom",
          "stub": true
        },
        {
          "pageid": 22663,
          "ns": 0,
          "title": "Republic of Suntrain"
        },
        {
          "pageid": 182501,
          "ns": 0,
          "title": "Svane-szigeti Hercegség"
        },
        {
          "pageid": 221185,
          "ns": 0,
          "title": "Technophoenixia"
        },
        {
          "pageid": 284264,
          "ns": 0,
          "title": "Territorial Prelature of Goryeo and Nippon"
        },
        {
          "pageid": 250610,
          "ns": 3000,
          "title": "Draft:The Republic Of Balcova"
        },
        {
          "pageid": 296860,
          "ns": 3000,
          "title": "Draft:The Republic of British Kaleenia"
        },
        {
          "pageid": 290393,
          "ns": 3000,
          "title": "Draft:The Socialist Republic of Solania"
        },
        {
          "pageid": 289308,
          "ns": 3000,
          "title": "Draft:The United Socialist States"
        },
        {
          "pageid": 264553,
          "ns": 0,
          "title": "Twelvist Kapan of Arbores"
        },
        {
          "pageid": 10714,
          "ns": 0,
          "title": "United Imperium"
        },
        {
          "pageid": 74071,
          "ns": 0,
          "title": "United Socialist States"
        },
        {
          "pageid": 40970,
          "ns": 0,
          "title": "United Socialist States of Cades"
        },
        {
          "pageid": 291575,
          "ns": 3000,
          "title": "Draft:United States of Amongus"
        },
        {
          "pageid": 278034,
          "ns": 3000,
          "title": "Draft:United States of Kailasa"
        },
        {
          "pageid": 188706,
          "ns": 0,
          "title": "Kingdom of the United Baltics Benusia"
        },
        {
          "pageid": 245367,
          "ns": 0,
          "title": "Vaalyzööe"
        },
        {
          "pageid": 287620,
          "ns": 0,
          "title": "Valenowa"
        },
        {
          "pageid": 284395,
          "ns": 0,
          "title": "Verdania"
        },
        {
          "pageid": 244574,
          "ns": 3000,
          "title": "Draft:Veridian Empire"
        },
        {
          "pageid": 250603,
          "ns": 3000,
          "title": "Draft:Wdff"
        },
        {
          "pageid": 279771,
          "ns": 0,
          "title": "Westall"
        },
        {
          "pageid": 56805,
          "ns": 0,
          "title": "Westavia"
        },
        {
          "pageid": 10324,
          "ns": 0,
          "title": "WhY A Nation?",
          "poor": true
        },
        {
          "pageid": 294495,
          "ns": 2,
          "title": "User:Wyndela/sandbox"
        },
        {
          "pageid": 140196,
          "ns": 0,
          "title": "Republic of Yusienia"
        },
        {
          "pageid": 256578,
          "ns": 0,
          "title": "Zhao"
        }
      ]
    }
  },
  computed: {
    micronationsDirectory() {
      return store.getters.micronations;
    },
    micronationsInBothSources() {
      const that = this;
      let micronationCounter = 0;

      this.microWikiMicronations.forEach(function (element) {
        const check = that.micronationsDirectory.find(mic => element.title.includes(mic.name.main));

        if (check !== undefined) {
          micronationCounter++
        }
      });

      return micronationCounter;
    },
    micronationsStub() {
      length = this.microWikiMicronations.filter(function (item) {
        return item.stub;
      }).length;

      return length;
    },
    micronationsPoor() {
      length = this.microWikiMicronations.filter(function (item) {
        return item.poor;
      }).length;

      return length;
    }
  }
}
</script>

<style scoped>
.micronations-list {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  padding: 0 12px 9px 12px;
}

.directory-entry-container.stub {
  background-color: indianred;
}

.directory-entry-container.poor {
  background-color: red;
}

.directory-entry-container.present {
  background-color: green;
}
</style>
