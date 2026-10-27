<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sectionbar from '../components/Sectionbar.vue';
import { useDirectoryData } from '../composables/useDirectoryData.js';

const Moderation = defineAsyncComponent(() => import('./Moderation.vue'));
const MediaWikiReader = defineAsyncComponent(() => import('./MediaWikiReader.vue'));
const MicronationalMapReader = defineAsyncComponent(() => import('./MicronationalMapReader.vue'));
const SourceResearchConsole = defineAsyncComponent(() => import('../components/SourceResearchConsole.vue'));

const { userIsModerator } = useDirectoryData();

const route = useRoute();
const router = useRouter();
const sections = [
  { textKey: 'sectionTabs.submissions', target: 'submissions', display: true },
  { textKey: 'sectionTabs.sourceResearch', target: 'source-research', display: true },
  { textKey: 'sectionTabs.mediaWiki', target: 'mediawiki', display: true },
  { textKey: 'sectionTabs.googleMaps', target: 'google-maps', display: true }
];
const allowedSections = new Set(sections.map(section => section.target));
const selectedSection = computed(() => allowedSections.has(route.query.section) ? route.query.section : 'submissions');

function navigateToSection(target) {
  router.replace({
    name: 'ModerationHub',
    query: { ...route.query, section: target === 'submissions' ? undefined : target }
  });
}
</script>

<template>
  <div class="moderation-hub">
    <p v-if="!userIsModerator" class="moderation-access-denied">
      You don't have sufficient privileges to access moderation tools.
    </p>
    <Sectionbar v-else :sections="sections" :initial-selected-section="selectedSection"
      @section-change="navigateToSection">
      <template #submissions>
        <Moderation />
      </template>

      <template #mediawiki>
        <MediaWikiReader />
      </template>

      <template #google-maps>
        <MicronationalMapReader />
      </template>

      <template #source-research>
        <section class="site-section site-section--flush site-section--flat-top">
          <SourceResearchConsole />
        </section>
      </template>
    </Sectionbar>
  </div>
</template>

<script>
export default { name: 'ModerationHub' };
</script>

<style scoped>
.moderation-hub {
  min-width: 0;
}

.moderation-access-denied {
  margin: 20px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  background: var(--color-surface-raised);
  line-height: 1.5;
}
</style>
