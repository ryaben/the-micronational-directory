<template>
  <section class="site-section about-page">
    <section class="about-intro" aria-labelledby="about-title">
      <div class="about-copy">
        <h2 id="about-title">{{ $t('aboutPage.title') }}</h2>
        <p v-html="$t('aboutPage.intro')"></p>
        <p v-html="$t('aboutPage.team')"></p>
        <p v-html="$t('aboutPage.mission')"></p>
        <p class="large-text"><b>— Ramiro</b><span>{{ $t('aboutPage.admin') }}</span></p>
      </div>
      <div class="about-media">
        <iframe class="about-video" src="https://www.youtube-nocookie.com/embed/EC1C1eSGmpk?si=EHoLRW50t3uHbt3l" :title="$t('aboutPage.videoTitle')"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
      </div>
    </section>
    <hr class="divider" />
    <div class="bottom-container">
      <div class="bottom-side-container">
        <h3 class="large-margin">{{ $t('aboutPage.specialThanks') }}</h3>
        <div class="scrollable-container about-list">
          <div class="listing-entry">
            <img src="/images/about-us/special-thanks/microflag.png" alt="MicroFlag" />
            <p v-html="$t('aboutPage.microflag')"></p>
          </div>
          <div class="listing-entry">
            <img src="/images/about-us/special-thanks/lflugo.jpg" alt="lflugo" />
            <p v-html="$t('aboutPage.luisFelipeLugo')"></p>
          </div>
        </div>
      </div>
      <div class="bottom-side-container">
        <h3 class="large-margin">{{ $t('aboutPage.similarProjects') }}</h3>
        <div class="scrollable-container about-list">
          <div class="listing-entry">
            <img src="/images/about-us/similar-projects/microwiki-full.png" alt="MicroWiki" />
            <p v-html="$t('aboutPage.microwiki')"></p>
          </div>
          <div class="listing-entry">
            <img src="/images/about-us/similar-projects/microflagarchive.png" alt="Micro Flag Archive" />
            <p v-html="$t('aboutPage.microFlagArchive')"></p>
          </div>
          <div class="listing-entry">
            <img src="/images/about-us/similar-projects/TAM.png" alt="Tutmonda Alianco de Mikronacioj" />
            <p v-html="$t('aboutPage.tam')"></p>
          </div>
          <div class="listing-entry">
            <img class="museum-logo" src="/images/about-us/similar-projects/micronational-banknote-museum.png" alt="Micronational Banknote Museum logo" />
            <p v-html="$t('aboutPage.banknoteMuseum')"></p>
          </div>
        </div>
      </div>
    </div>
    <br>
    <div class="bottom-container">
      <div class="bottom-side-container">
        <h3 class="large-margin">{{ $t('aboutPage.featuredIn') }}</h3>
        <div class="scrollable-container about-list">
          <div class="listing-entry">
            <img src="/images/about-us/featured-in/micronaciones.png" alt="Micronaciones.com" />
            <p v-html="$t('aboutPage.micronacionesArticle')"></p>
          </div>
          <div class="listing-entry">
            <img src="/images/about-us/featured-in/daily-star.png" alt="The Daily Star" />
            <p v-html="$t('aboutPage.dailyStarArticle')"></p>
          </div>
          <div class="listing-entry">
            <img src="/images/about-us/featured-in/moriel-prensa.png" alt="Moriel Prensa" />
            <p v-html="$t('aboutPage.morielArticle')"></p>
          </div>
          <div class="listing-entry">
            <img src="/images/about-us/featured-in/la-gaceta-eldorado.png" alt="La Gaceta El Dorado" />
            <p v-html="$t('aboutPage.laGacetaArticle')"></p>
          </div>
          <div class="listing-entry">
            <img src="/images/about-us/featured-in/batyrtimes.png" alt="Batyr Times" />
            <p v-html="$t('aboutPage.batyrTimesArticle')"></p>
          </div>
          <hr class="divider">
          <div class="listing-entry">
            <img src="/images/about-us/featured-in/dove-archives.png" alt="Dove Archives" />
            <p v-html="$t('aboutPage.doveArchivesArticle')"></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  methods: {}
}
</script>

<style scoped>
.large-margin {
  margin: 20px 0 20px 0;
}

.large-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 24px 0 0;
  font-size: 17px;
}

.large-text span { color: var(--color-muted); font-size: 14px; }

.about-intro {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(300px, .88fr);
  align-items: center;
  gap: clamp(24px, 5vw, 64px);
  padding: clamp(4px, 2vw, 20px) 0 30px;
}

.about-copy { max-width: 760px; }
.about-copy h1 { margin: 8px 0 20px; font-size: clamp(30px, 4vw, 46px); letter-spacing: -.035em; }
.about-copy p { color: var(--color-text); line-height: 1.75; }
.about-media { padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-3xl); background: var(--color-background-soft); box-shadow: var(--shadow-soft); }

.bottom-container {
  display: flex;
  align-items: flex-start;
  gap: clamp(20px, 4vw, 56px);
}

.bottom-side-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
}

.listing-entry {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 10px 0;
}

.listing-entry img {
  flex: 0 0 132px;
  width: 132px;
  height: 82px;
  max-width: 30%;
  object-fit: contain;
  margin-right: 0;
}

.listing-entry img.museum-logo {
  padding: 4px;
  border-radius: 6px;
  background: #000;
}

.listing-entry p { min-width: 0; margin: 8px 0; }

.about-video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  border: 0;
  border-radius: var(--radius-xl);
}

.divider {
  width: 100%;
}

.bottom-container h3 { align-self: flex-start; }
.listing-entry + .listing-entry { border-top: 1px solid var(--color-border); }
.listing-entry p { line-height: 1.6; }

@media (max-width: 760px) {
  .about-intro { grid-template-columns: 1fr; gap: 22px; }
  .about-copy { max-width: none; }
  .about-media { order: -1; }
  .bottom-container { flex-direction: column; gap: 20px; }
  .bottom-side-container { width: 100%; flex-basis: auto; }
}

@media (max-width: 480px) {
  .listing-entry { gap: 10px; }
  .listing-entry img { max-width: 26%; }
}
</style>
