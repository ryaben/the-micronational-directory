<script setup>
const props = defineProps({
  post: { type: Object, required: true }
});

const formatDate = value => value
  ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
  : '';
</script>

<template>
  <article class="x-post-card">
    <header class="x-post-header">
      <img class="x-post-avatar" src="/images/black-logo1-mini.png" alt="">
      <div class="x-post-author">
        <strong>The Micronational Directory</strong>
        <span>@the_micro_direc<span v-if="formatDate(post.createdAt)"> · {{ formatDate(post.createdAt) }}</span></span>
      </div>
      <a class="x-post-follow" href="https://x.com/the_micro_direc" target="_blank" rel="noopener noreferrer">Follow</a>
    </header>

    <p v-if="post.text" class="x-post-text">{{ post.text }}</p>
    <div v-if="post.media?.length" class="x-post-media" :class="{ 'multiple-media': post.media.length > 1 }">
      <a v-for="(media, index) in post.media" :key="media.url" :href="media.link" target="_blank"
        rel="noopener noreferrer" :aria-label="media.alt || `Open post image ${index + 1} on X`">
        <img :src="media.url" :alt="media.alt" loading="lazy" decoding="async">
      </a>
    </div>

    <a class="x-post-link" :href="post.url" target="_blank" rel="noopener noreferrer">
      View post on X <span aria-hidden="true">↗</span>
    </a>
  </article>
</template>

<style scoped>
.x-post-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background-soft);
  color: var(--color-text);
}

.x-post-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 9px;
  padding: 12px 12px 0;
  line-height: normal;
  text-align: left;
}

.x-post-avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border: 1px solid var(--color-border);
  border-radius: 50%;
}

.x-post-author {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  line-height: 1.35;
}

.x-post-author strong {
  overflow: hidden;
  color: var(--color-heading);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.x-post-author span {
  color: var(--color-muted);
  font-size: 12px;
}

.x-post-follow {
  flex: 0 0 auto;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-background) !important;
  font-size: 12px;
  font-weight: 750;
  text-decoration: none;
}

.x-post-text {
  margin: 10px 13px 12px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.55;
}

.x-post-media {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3px;
  overflow: hidden;
  max-height: 360px;
}

.x-post-media.multiple-media {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.x-post-media a {
  display: block;
  min-width: 0;
  overflow: hidden;
  background: var(--color-background-mute);
}

.x-post-media img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 360px;
  object-fit: cover;
}

.x-post-link {
  display: block;
  padding: 9px 13px 11px;
  color: var(--color-link) !important;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}
</style>
