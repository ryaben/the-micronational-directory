<script setup>
import OrganizationEntry from '../components/OrganizationEntry.vue';
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue';
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue';
import Settingsbar from '../components/Settingsbar.vue';
import store from '../store';
import { animateDirectoryCardEnter, animateDirectoryCardLeave, positionLeavingDirectoryCard } from '../utils/directoryCardTransitions.js';

defineProps({
  micronationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
  },
  organizationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.organizations
  },
  visibleOrganizations: {
    type: Array,
    required: false,
    default: store.getters.organizations.filter(element => element.approved && element.searchDisplay && element.filterDisplay)
  }
});
</script>

<template>
  <div class="animation-error-avoider">
    <section class="site-section site-section--flush">
      <Settingsbar :view-mode="'organizations'" :store-getter="'organizations'"
        :elements-directory="organizationsDirectory" @loaded-directory="loadPagedOrganizations"
        @updated-entry-width="updateOrganizationEntryWidth" />
      <div id="organizationsList" class="organizations-list" ref="organizationsList"
        :class="{ 'fixed-height': fixedHeight }">
        <TransitionGroup :css="false" @before-leave="positionLeavingDirectoryCard"
          @enter="animateDirectoryCardEnter" @leave="animateDirectoryCardLeave">
          <OrganizationEntry v-for="(item, i) in pagedOrganizationsDirectory" :key="item.id || item.name.main" :width="organizationEntryWidth"
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
    organizationsModerationDirectory() {
      return this.organizationsDirectory.filter((element) => !element.approved && element.searchDisplay && element.filterDisplay);
    },
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

</style>
