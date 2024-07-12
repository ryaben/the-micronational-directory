<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import store from '../store';
import Tweet from "vue-tweet";
</script>

<template>
  <section class="site-section">
    <div class="header-container">
      <img src="/images/plain-logo1.png" alt="Logo" width="48" height="47" style="margin-right: 12px;">
      <h3>Welcome visitor, to <span class="underlined">The Micronational Directory</span>!</h3>
    </div>
    <div class="grid-area">
      <div class="grid-column no-padding fixed">
        <Tweet tweet-id="1806869757930430633" theme="dark"><template v-slot:loading>Loading tweets...</template></Tweet>
        <Tweet tweet-id="1810669133278978511" theme="dark" />
        <Tweet tweet-id="1806387092844380160" theme="dark" />
        <Tweet tweet-id="1798143137354842583" theme="dark" />
        <Tweet tweet-id="1763676546244423681" theme="dark" />
        <Tweet tweet-id="1759267756489199847" theme="dark" />
        <Tweet tweet-id="1758515270337908963" theme="dark" />
        <Tweet tweet-id="1724417215812792675" theme="dark" />
        <Tweet tweet-id="1710813001916264776" theme="dark" />
        <Tweet tweet-id="1709033903229460701" theme="dark" />
        <Tweet tweet-id="1702059403506004428" theme="dark" />
        <Tweet tweet-id="1699201531675840814" theme="dark" />
        <Tweet tweet-id="1697325411447742682" theme="dark" />
      </div>
      <div class="grid-column">
        <p style="margin: 0; text-align: justify; text-justify: auto;">
          <a href="https://en.wikipedia.org/wiki/Micronation" target="_blank"><b>Micronations</b></a> are quite a
          particular political phenomena
          that have decades, and even arguably centuries of existence. There could be many different reasons for a
          micronation to be founded
          and to aspire for a long run of activity, and legacy. Some cases may be linked with ethnicity or social
          conflicts, others are a demonstration of
          political debate and experiment, there are also fraudulent scams, as well as examples of mere exercise of
          the human imagination or ambition, and some are even basically jokes. No matter the origin, they all share
          a common root: their founders and citizens <span class="italicized">
            "[...] claim that they belong to an independent nation or sovereign state, but which lacks legal
            recognition
            by world governments or major international
            organizations [...]"</span>, as described by Wikipedia.
          <br><br>
          These small political entities are scattered all around the world. That means not only Earth, but also the
          digital realm and some even
          have territorial pretensions over other planets and the space itself. But also within a vast range of time:
          there are cases that can fall
          within this category that were founded in the 19th century, and up to this day, when nowadays social media
          provide home to a plethora of virtual
          micronations.
          <br><br>
          The goal of <b>The Micronational Directory</b> team of micronationalists and developers is
          to build <router-link :to="'/directory'">the most complete and unified list of entries
            for micronations</router-link> as possible, in order to have a common,
          massive database for listing everything in one place, inspite of characteristics and criteria.
          It's not the intention of this website to dive deeper in debate or description, nor to
          compose an article for each case, since there are other well-renowned previously-existing platforms for this
          purpose, such as
          <a href="https://micronations.wiki/wiki/Main_Page" target="_blank">MicroWiki</a>
          and <a href="https://sites.google.com/view/micro-flag-archive" target="_blank">Micro Flag Archive</a>.
          Let's accomplish this together, leave your mark and create the place that our community deserves!
        </p>
      </div>
      <div class="grid-column centered colored">
        <p class="larger">Random featured entry:</p>
        <img v-if="randomEntry === undefined" class="loading-image" src="/images/loading.gif" alt="Loading">
        <DirectoryEntry id="randomEntry" v-if="randomEntry !== undefined" :info="{
            id: randomEntry.id,
            name: {
              main: randomEntry.name.main,
              mainAlt: randomEntry.name.mainAlt,
              title: randomEntry.name.title,
              titleAlt: randomEntry.name.titleAlt
            },
            flag: randomEntry.flag,
            motto: randomEntry.motto,
            type: randomEntry.type,
            languages: randomEntry.languages,
            capital: randomEntry.capital,
            currency: randomEntry.currency,
            foundationDate: randomEntry.foundationDate,
            location: randomEntry.location,
            memberships: randomEntry.memberships,
            contactInfo: randomEntry.contactInfo,
            websites: randomEntry.websites,
            author: randomEntry.author,
            approved: randomEntry.approved,
            creationDate: randomEntry.creationDate
          }" />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data: () => {
    return {

    };
  },
  computed: {
    micronationsDirectory() {
      return store.getters.micronations;
    },
    approvedMicronations() {
      return this.micronationsDirectory.filter(element => element.approved);
    },
    randomEntry() {
      const randomInteger = Math.floor(Math.random() * (this.approvedMicronations.length - 0 + 1) + 0);
      return this.approvedMicronations[randomInteger];
    }
  },
  methods: {

  },
}
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border-bottom: 3px solid var(--vt-c-text-dark-2);
  padding-bottom: 20px;
}

.grid-area {
  display: grid;
  width: auto;
  grid-template-columns: 1fr 2fr 1fr;
  column-gap: 2%;
  margin-top: 30px;
}

.column-area {
  display: grid;
  grid-template-columns: 2fr 1fr;
}

.grid-column.no-padding {
  padding: 0;
}

.grid-column {
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.grid-column.centered {
  align-items: center;
}

.grid-column.colored {
  border-radius: 10px;
  background-color: var(--vt-c-black-mute);
}

.grid-column.fixed {
  overflow-y: auto;
  max-height: 660px;
}

p.larger {
  font-size: 18px;
}
</style>
