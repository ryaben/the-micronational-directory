<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sectionbar from '../components/Sectionbar.vue';

const Moderation = defineAsyncComponent(() => import('./Moderation.vue'));
const MediaWikiReader = defineAsyncComponent(() => import('./MediaWikiReader.vue'));
const MicronationalMapReader = defineAsyncComponent(() => import('./MicronationalMapReader.vue'));

const props = defineProps({
  micronationsDirectory: { type: Array, default: () => [] },
  supranationalMicronations: { type: Array, default: () => [] },
  organizationsDirectory: { type: Array, default: () => [] },
  visibleOrganizations: { type: Array, default: () => [] },
  organizationsModerationDirectory: { type: Array, default: () => [] },
  moderatorsList: { type: Array, default: () => [] },
  userIsModerator: { type: Boolean, default: false },
  user: { type: Object, default: () => ({}) }
});

const route = useRoute();
const router = useRouter();
const sections = [
  { text: 'User-made entries', target: 'submissions', display: true },
  { text: 'MediaWiki API reader', target: 'mediawiki', display: true },
  { text: 'Google My Maps processor', target: 'google-maps', display: true }
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
    <p v-if="!props.userIsModerator" class="moderation-access-denied">
      You don't have sufficient privileges to access moderation tools.
    </p>
    <Sectionbar v-else :sections="sections" :initial-selected-section="selectedSection"
      @section-change="navigateToSection">
      <template #submissions>
        <Moderation :micronations-directory="props.micronationsDirectory"
          :supranational-micronations="props.supranationalMicronations"
          :organizations-directory="props.organizationsDirectory" :visible-organizations="props.visibleOrganizations"
          :moderators-list="props.moderatorsList" :user-is-moderator="props.userIsModerator" :user="props.user" />
      </template>

      <template #mediawiki>
        <MediaWikiReader :micronations-directory="props.micronationsDirectory"
          :supranational-micronations="props.supranationalMicronations"
          :organizations-directory="props.organizationsDirectory" :visible-organizations="props.visibleOrganizations"
          :moderators-list="props.moderatorsList" :user-is-moderator="props.userIsModerator" :user="props.user" />
      </template>

      <template #google-maps>
        <MicronationalMapReader :micronations-directory="props.micronationsDirectory"
          :moderators-list="props.moderatorsList" :user-is-moderator="props.userIsModerator" :user="props.user" />
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
