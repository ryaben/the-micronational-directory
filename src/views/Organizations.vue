<script setup>
import OrganizationEntry from '../components/OrganizationEntry.vue';
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue';
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue';
import Settingsbar from '../components/Settingsbar.vue';
import { useDirectoryData } from '../composables/useDirectoryData.js';
import { animateDirectoryCardEnter, animateDirectoryCardLeave, positionLeavingDirectoryCard } from '../utils/directoryCardTransitions.js';

const { micronationsDirectory, organizationsDirectory } = useDirectoryData();
</script>

<template>
  <div class="animation-error-avoider">
    <section class="site-section site-section--flush">
      <Settingsbar :view-mode="'organizations'" :store-getter="'organizations'"
        :elements-directory="organizationsDirectory" @loaded-directory="loadPagedOrganizations"
        @updated-entry-width="updateOrganizationEntryWidth" @updated-fixed-height="updateFixedHeight"
        @updated-fixed-height-value="updateFixedHeightValue" />
      <div id="organizationsList" class="organizations-list" ref="organizationsList"
        :class="{ 'fixed-height': fixedHeight }">
        <TransitionGroup :css="false" @before-leave="positionLeavingDirectoryCard"
          @enter="animateDirectoryCardEnter" @leave="animateDirectoryCardLeave">
          <OrganizationEntry v-for="(item, i) in pagedOrganizationsDirectory" :key="item.id || item.name.main" :width="organizationEntryWidth"
            :fixed-height="fixedHeight" :fixed-height-value="fixedHeightValue"
            :logo-height="organizationEntryWidth * 0.6" :micronations-directory="micronationsDirectory" :info="{
        id: item.id,
        name: {
          main: item.name.main,
          mainAlt: item.name.mainAlt,
        },
        logo: item.logo,
        motto: item.motto,
        languages: item.languages,
        foundationDate: item.foundationDate,
        contactInfo: item.contactInfo,
        websites: item.websites,
        author: item.author,
        approved: item.approved,
        creationDate: item.creationDate
      }" />
        </TransitionGroup>
      </div>
    </section>

    <Transition name="opacity">
      <div class="go-to-top-button" v-show="!fixedHeight" @click="scrollToTop">⬆️</div>
    </Transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pagedOrganizationsDirectory: [],
      organizationEntryWidth: 180,
      fixedHeight: false,
      fixedHeightValue: 400
    }
  },
  computed: {
  },
  components: {
    OrganizationEntry,
    SettingsSubcontainer,
    SettingsSubcontainerTitle,
    SettingsSubcontainerParameter,
    Settingsbar
  },
  methods: {
    updateOrganizationEntryWidth(payload) {
      this.organizationEntryWidth = payload;
    },
    updateFixedHeight(payload) {
      this.fixedHeight = payload;
    },
    updateFixedHeightValue(payload) {
      this.fixedHeightValue = payload;
    },
    loadPagedOrganizations(payload) {
      this.pagedOrganizationsDirectory = payload;
    }
  },
}
</script>

<style scoped>
.organizations-list {
  position: relative;
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  padding: 0 12px 9px 12px;
}

.organizations-list.fixed-height {
  max-height: calc(v-bind('fixedHeightValue') * 1px);
  overflow-y: auto;
}

</style>
