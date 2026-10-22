<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue';
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue';
import Settingsbar from '../components/Settingsbar.vue';
import { useDirectoryData } from '../composables/useDirectoryData.js';
import { animateDirectoryCardEnter, animateDirectoryCardLeave, positionLeavingDirectoryCard } from '../utils/directoryCardTransitions.js';

const { micronationsDirectory, supranationalMicronations, organizationsDirectory, visibleOrganizations } = useDirectoryData();
</script>

<template>
  <div class="animation-error-avoider">
    <section class="site-section site-section--flush">
      <div class="directory-container">
        <Settingsbar :view-mode="'micronations'" :store-getter="'micronations'"
          :elements-directory="micronationsDirectory" @loaded-directory="loadPagedMicronations"
          @view-mode-changed="updateViewMode" @updated-entry-width="updateEntryWidth" />
        <div id="micronationsList" class="micronations-list" ref="micronationsList"
          :class="{ 'fixed-height': fixedHeight }">
          <TransitionGroup :css="false" @before-leave="positionLeavingDirectoryCard"
            @enter="animateDirectoryCardEnter" @leave="animateDirectoryCardLeave">
            <DirectoryEntry v-for="(item, i) in pagedMicronationsDirectory" :key="item.id || item.name.main" :width="entryWidth"
              :flag-height="entryWidth * 0.6" :view-mode="viewMode" :micronations-directory="micronationsDirectory"
              :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
              :supranational-micronations="supranationalMicronations" :info="{
          id: item.id,
          name: item.name,
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
          </TransitionGroup>
        </div>
      </div>
    </section>

    <Transition name="opacity">
      <div class="go-to-top-button" v-show="!fixedHeight" @click="scrollToTop">⬆️</div>
    </Transition>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      pagedMicronationsDirectory: [],
      entryWidth: 180,
      viewMode: 'micronations',
      fixedHeight: false,
      fixedHeightValue: 400
    };
  },
  components: {
    DirectoryEntry,
    SettingsSubcontainer,
    SettingsSubcontainerTitle,
    SettingsSubcontainerParameter,
    Settingsbar
  },
  computed: {
    cssStyles() {
      return {
        "--micronations-list-width": this.$refs.micronationsList.offsetWidth + "px"
      }
    }
  },
  methods: {
    changeViewMode(newValue) {
      this.viewMode = newValue;
    },
    loadPagedMicronations(payload) {
      this.pagedMicronationsDirectory = payload;
    },
    updateViewMode(payload) {
      this.viewMode = payload;
    },
    updateEntryWidth(payload) {
      this.entryWidth = payload;
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    }
  }
}
</script>

<style scoped>
.micronations-list {
  position: relative;
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  padding: 0 12px 9px 12px;
}

.micronations-list.fixed-height {
  max-height: calc(v-bind('fixedHeightValue') * 1px);
  overflow-y: scroll;
}

@media only screen and (max-width: 960px) {
  .directory-settings>div:not(div:last-of-type) {
    margin-bottom: 12px;
  }
}
</style>
