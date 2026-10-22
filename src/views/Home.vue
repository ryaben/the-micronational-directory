<script setup>
import DirectoryEntry from '../components/DirectoryEntry.vue';
import XPostCard from '../components/XPostCard.vue';
import { computed, onMounted, ref } from 'vue';
import { useDirectoryData } from '../composables/useDirectoryData.js';

const props = defineProps({ theme: { type: String, default: 'dark' } });
const { micronationsDirectory, micronationsApprovedDirectory, organizationsDirectory, visibleOrganizations, supranationalMicronations } = useDirectoryData();
const randomEntry = computed(() => {
  const entries = micronationsApprovedDirectory.value;
  return entries.length ? entries[Math.floor(Math.random() * entries.length)] : undefined;
});

const postIds = [
  '1829912548499734802', '1806869757930430633', '1810669133278978511',
  '1798143137354842583', '1763676546244423681', '1759267756489199847',
  '1758515270337908963', '1724417215812792675', '1710813001916264776',
  '1709033903229460701', '1702059403506004428', '1699201531675840814',
  '1692292135146394097'
];
const posts = ref([]);
const postsLoading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch('/api/x-posts');
    if (!response.ok) throw new Error('Could not load X posts');
    const loadedPosts = await response.json();
    if (!Array.isArray(loadedPosts) || !loadedPosts.length) throw new Error('No X post previews were returned');
    posts.value = loadedPosts;
  } catch {
    posts.value = [];
  } finally {
    postsLoading.value = false;
  }
});
</script>

<template>
  <section class="site-section">
    <div class="home-hero">
      <div class="hero-mark">
        <img :src="props.theme === 'light' ? '/images/plain-logo1-black.png' : '/images/plain-logo1.png'" alt="" width="48"
          height="47">
        <span>THE MICRONATIONAL DIRECTORY</span>
      </div>
      <p class="hero-copy">Discover the micronations and organizations shaping our community, across the world and
        throughout history. <b>The way it was always meant to be.</b></p>
      <div class="hero-actions">
        <router-link class="home-action primary" to="/directory">Explore the directory <span
            aria-hidden="true">→</span></router-link>
        <router-link class="home-action secondary" to="/global-map">View the world map</router-link>
      </div>
    </div>
    <div class="home-content-grid">
      <aside class="social-column">
        <div class="section-heading">
          <h2>Latest updates</h2>
        </div>
        <div class="social-feed">
          <p v-if="postsLoading" class="posts-status" role="status">Loading updates…</p>
          <XPostCard v-for="post in posts" :key="post.id" :post="post" />
          <a v-if="!postsLoading && !posts.length" class="posts-status posts-unavailable"
            href="https://x.com/the_micro_direc" target="_blank" rel="noopener noreferrer">
            Updates couldn’t load. View the account on X ↗
          </a>
        </div>
      </aside>
      <article class="intro-card">
        <div class="section-heading">
          <h2>Small nations. Big stories.</h2>
        </div>
        <div class="intro-copy">
          <p>
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
              recognition by world governments or major international organizations [...]"</span>, as described by
            Wikipedia.
          </p>
          <p>
            These small political entities are scattered all around the world. That means not only Earth, but also the
            digital realm and some even
            have territorial pretensions over other planets and the space itself. But also within a vast range of time:
            there are cases that can fall
            within this category that were founded in the 19th century, and up to this day, when nowadays social media
            provide home to a plethora of virtual
            micronations.
          </p>
          <p>
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
      </article>
      <aside class="featured-card">
        <div class="section-heading">
          <h2>Featured entry</h2>
        </div>
        <img v-if="randomEntry === undefined" class="loading-image" src="/images/loading.gif" alt="Loading">
        <DirectoryEntry id="randomEntry" v-if="randomEntry !== undefined" :width="220"
          :micronations-directory="micronationsDirectory" :organizations-directory="organizationsDirectory"
          :visible-organizations="visibleOrganizations" :supranational-micronations="supranationalMicronations" :info="{
            id: randomEntry.id,
            name: randomEntry.name,
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
        <router-link class="text-link" to="/directory">Browse all entries <span
            aria-hidden="true">→</span></router-link>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 5vw, 48px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  background:
    radial-gradient(ellipse at 85% 0%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 48%),
    linear-gradient(135deg, var(--color-background-soft), var(--color-surface));
}

.hero-mark {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
  margin-bottom: 15px;
}

.hero-mark img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.home-hero h1 {
  max-width: 740px;
  margin: 24px 0 12px;
  font-size: clamp(36px, 6vw, 66px);
  letter-spacing: -.045em;
  line-height: 1.04;
}

.hero-copy {
  max-width: 800px;
  margin: 0;
  color: var(--color-muted);
  font-size: clamp(16px, 2vw, 19px);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.home-action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 17px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: 700;
  text-decoration: none;
  transition: transform var(--transition-base) ease, background var(--transition-base) ease;
}

.home-action:hover {
  transform: translateY(-2px);
}

.home-action.primary {
  border-color: transparent;
  background: var(--color-accent);
  color: var(--color-background);
}

.home-action.primary:hover {
  color: var(--color-background);
  filter: brightness(1.08);
}

.home-action.secondary {
  background: var(--color-surface);
  color: var(--color-text);
}

.home-action.secondary:hover {
  background: var(--navbar-tab-background-color-hover);
}

.home-content-grid {
  display: grid;
  grid-template-columns: minmax(230px, .85fr) minmax(0, 1.65fr) minmax(250px, .9fr);
  align-items: start;
  gap: 18px;
  margin-top: 20px;
}

.social-column,
.intro-card,
.featured-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}

.social-column {
  max-height: 720px;
  overflow-y: auto;
}

.social-feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.posts-status {
  margin: 0;
  padding: 10px 12px;
  color: var(--color-muted);
  font-size: 13px;
}

.section-heading {
  margin-bottom: 16px;
}

.section-heading h2 {
  margin: 5px 0 0;
  font-size: 21px;
  letter-spacing: -.025em;
}

.intro-copy {
  color: var(--color-text);
}

.intro-copy p {
  margin: 0 0 16px;
  line-height: 1.8;
}

.intro-copy p:last-child {
  margin-bottom: 0;
}

.featured-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.featured-card .section-heading {
  width: 100%;
}

.text-link {
  margin-top: 14px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.social-feed:deep(div:first-of-type .twitter-tweet-rendered) {
  margin-top: 0 !important;
}

.social-feed:deep(div:last-of-type .twitter-tweet-rendered) {
  margin-bottom: 0 !important;
}

.social-feed:deep(div .twitter-tweet-rendered) {
  margin-top: 2px !important;
  margin-bottom: 2px !important;
}

@media (max-width: 1200px) {
  .home-content-grid {
    grid-template-columns: minmax(0, 1.5fr) minmax(250px, .9fr);
  }

  .social-column {
    grid-column: 1 / -1;
    max-height: 420px;
  }
}

@media (max-width: 760px) {
  .home-content-grid {
    grid-template-columns: 1fr;
  }

  .social-column {
    grid-column: auto;
  }

  .desktop-break {
    display: none;
  }

  .home-hero {
    padding: 26px 20px;
  }
}
</style>
