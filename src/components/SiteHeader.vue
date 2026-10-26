<script setup>
defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})
</script>

<template>
  <header class="site-header">
    <a href="/" class="logo-link" aria-label="The Micronational Directory home">
      <img
        id="logo"
        :src="theme === 'light' ? '/images/brand/plain-logo1-black.png' : '/images/brand/plain-logo1.png'"
        alt=""
      />
      <hr class="brand-divider" :class="{ 'brand-divider--light': theme === 'light' }" />
      <span class="brand-name">The Micronational Directory</span>
    </a>
  </header>
</template>

<style scoped>
.site-header {
  display: flex;
  width: auto;
  flex-direction: column;
  align-items: center;
  line-height: 1.5;
}

.logo-link:hover {
  background: none;
}

.logo-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: inherit;
  text-decoration: none;
  gap: 20px;
}

#logo {
  height: clamp(54px, 7vw, 84px);
  object-fit: contain;
}

.brand-divider {
  width: 3px;
  height: clamp(46px, 6vw, 70px);
  margin: 0;
  border: 0;
  background: #fff;
}

.brand-divider--light {
  background: #000;
}

.brand-name {
  color: var(--color-heading);
  font-size: clamp(18px, 2.8vw, 34px);
  font-weight: 700;
  letter-spacing: 0.015em;
  line-height: 1.1;
}

@media (max-width: 760px) {
  .site-header--mobile-nav { display: none; }
}
</style>
