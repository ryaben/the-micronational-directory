<script setup>
defineProps({
  info: { type: Object, required: true },
})
</script>

<template>
  <article class="simple-directory-article">
    <header class="simple-article-header">
      <img v-if="info.logo" :src="info.logo" class="simple-article-logo" :alt="`${info.title} logo`" />
      <h1 v-if="info.name"><span>{{ info.name.main }}</span><span v-if="info.name.title">, {{ info.name.title }}</span></h1>
      <h1 v-else>{{ info.title }}</h1>
    </header>
    <ul v-if="info.texts?.length" class="simple-article-facts">
      <li v-for="(item, index) in info.texts" :key="`${item.source}-${index}`">
        <p>{{ item.content }}</p>
        <a :href="item.source" target="_blank" rel="noopener noreferrer">{{ item.source }}</a>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.simple-directory-article {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--directory-entry-background-color), var(--color-background-mute));
  color: var(--color-text);
  box-shadow: var(--shadow-soft);
}
.simple-article-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-raised);
}
.simple-article-header h1 { margin: 0; color: var(--color-heading); font-size: 24px; overflow-wrap: anywhere; }
.simple-article-logo { width: min(120px, 25%); max-height: 100px; object-fit: contain; }
.simple-article-facts { display: grid; gap: 12px; margin: 0; padding: 24px 28px 24px 48px; }
.simple-article-facts li { padding-left: 4px; }
.simple-article-facts p { margin: 0 0 6px; line-height: 1.55; overflow-wrap: anywhere; }
.simple-article-facts a { color: var(--color-accent); font-size: 13px; overflow-wrap: anywhere; }
@media (max-width: 600px) {
  .simple-article-header { padding: 18px; }
  .simple-article-facts { padding: 18px 18px 18px 38px; }
}
</style>
