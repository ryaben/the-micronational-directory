<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import SettingsSubcontainer from '../components/SettingsSubcontainer.vue';
import SettingsSubcontainerTitle from '../components/SettingsSubcontainerTitle.vue';
import SettingsSubcontainerParameter from '../components/SettingsSubcontainerParameter.vue';
import Settingsbar from '../components/Settingsbar.vue';
import NewEntryForm from '../components/NewEntryForm.vue';
import store from '../store';

defineProps({
  micronationsDirectory: {
    type: Array,
    required: false,
    default: store.getters.micronations
  },
  visibleMicronations: {
    type: Array,
    required: true,
    default: store.getters.micronations.filter(element => element.approved && element.searchDisplay && element.filterDisplay)
  },
  supranationalMicronations: {
    type: Array,
    required: false,
    default: store.getters.micronations.filter(element => element.supranational)
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
  },
});
</script>

<template>
  <div class="animation-error-avoider">
    <section class="site-section">
      <div class="directory-container">
        <Settingsbar :view-mode="'micronations'" :store-getter="'micronations'"
          :elements-directory="micronationsDirectory" @loaded-directory="loadPagedMicronations"
          @view-mode-changed="updateViewMode" @updated-entry-width="updateEntryWidth" />
        <div id="micronationsList" class="micronations-list" ref="micronationsList"
          :class="{ 'fixed-height': fixedHeight }">
          <TransitionGroup>
            <DirectoryEntry v-for="(item, i) in pagedMicronationsDirectory" :key="i" :width="entryWidth"
              :flag-height="entryWidth * 0.6" :view-mode="viewMode" :micronations-directory="micronationsDirectory"
              :organizations-directory="organizationsDirectory" :visible-organizations="visibleOrganizations"
              :supranational-micronations="supranationalMicronations" :info="{
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
    Settingsbar,
    NewEntryForm
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
.site-section {
  padding: 0px;
}

.micronations-list {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  padding: 0 12px 9px 12px;
}

.micronations-list.fixed-height {
  max-height: calc(v-bind('fixedHeightValue') * 1px);
  overflow-y: scroll;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

@media only screen and (max-width: 960px) {
  .directory-settings>div:not(div:last-of-type) {
    margin-bottom: 12px;
  }
}
</style>
