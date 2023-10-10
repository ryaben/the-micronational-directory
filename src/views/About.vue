<template>
  <section class="site-section">
    <p>
      It's hard to tell when the actual concept of <b>The Micronational Directory</b> was conceived,
      because we can say it existed as a fantasy prior to its proper development. Although, the
      creation <i>per se</i> occurred during the first days of August 2023, and not so long after
      (specifically on August 31) the platform had its official launch for the first
      <i>beta</i> version.<br />
      Our team is composed of a few micronationalists (that also happen to be web developers),
      guided and encouraged by the same spirit that most other micronationalists have: an
      inexplicable thirst for knowing more and more about these political phenomena that we all
      contribute to create. But it's not just about that on itself — it's also for having a
      complete, accurate, scalable, accesible, universal and perpetual resource for recording all
      that knowledge. And that's where we've decided to come in, because <b>TMD</b> aims no purpose
      other than that.<br />
      Yes, it sounds very bold, and there are different platforms that serve a similar function. But
      they can't guarantee all those concepts at once. And given the basis this Directory is founded
      on, we think we may achieve the totality of what is necessary to guarantee that. Using the
      framework Vue.js 3 and Google Firebase for handling the data, the result is a robust, fast and
      modern webapp that provides the user with a fluid dynamic for searching <i>any</i>
      micronation in a single place. And what better decision than sharing the power with our
      forementioned peers from this community — we can all participate here in registering our
      inventions: the micronations of yesterday, today and tomorrow, and no matter where from. Be
      sure to leave your mark!
    </p>
    <p class="large-text">
      <b>- Ramiro, admin at The Micronational Directory</b>
    </p>
    <hr class="divider" />
    <div class="bottom-container">
      <div class="bottom-side-container">
        <h3 class="large-margin">Special thanks to</h3>
        <div class="scrollable-container">
          <div class="listing-entry">
            <img src="/images/microflag.png" alt="MicroFlag" height="110px" />
            <p>
              <a href="https://microflag.net/" target="_blank">MicroFlag</a>,
              for cooperating and setting up a partnership with us in order to offer prizes for our users during events
              and contests.
            </p>
          </div>
          <div class="listing-entry">
            <img src="/images/lflugo.jpg" alt="lflugo" width="110px" />
            <p>
              <span class="underlined">Luis Felipe Lugo</span> (<b>lflugo</b>),
              for contributing 50+ entries in our Directory, focusing mainly in Spanish-speaking and OMU micronations.
              Contact via <a href="mailto:eldoradogov@hotmail.com">email</a> or <a href="https://twitter.com/luisfelugo" target="_blank">X (former Twitter)</a>.
            </p>
          </div>
        </div>
      </div>
      <div class="bottom-side-container">
        <h3 class="large-margin">TMD is featured in</h3>
        <div class="scrollable-container">
          <div class="listing-entry">
            <img src="/images/micronaciones.png" alt="Micronaciones.com" width="180px" height="52px" />
            <p>
              <a href="https://micronaciones.com/avanza-el-desarrollo-del-proyecto-the-micronational-directory/"
                target="_blank">News article</a>
              informing the upcoming launch of the platform and composed by
              <a href="https://micronaciones.com/" target="_blank">Micronaciones.com</a>, one of the
              most renowned Spanish-speaking news portal on micronations.
            </p>
          </div>
          <div class="listing-entry">
            <img src="/images/daily-star.png" alt="The Daily Star" width="120px" height="62px" />
            <p>
              <a href="https://coiningoverment.blogspot.com/2023/08/your-go-to-micronational-news-source_25.html"
                target="_blank">News article</a>
              informing the upcoming launch of the platform and composed by The Daily Star, which is
              the
              <a href="https://coiningoverment.blogspot.com/" target="_blank">Coinin Free State News Service</a>.
            </p>
          </div>
          <div class="listing-entry">
            <img src="/images/moriel-prensa.png" alt="Moriel Prensa" width="120px" height="72px" />
            <p>
              <a href="http://morielpress.blogspot.com/2023/08/avanza-el-desarrollo-del-proyecto.html"
                target="_blank">News article</a>
              informing the upcoming launch of the platform and composed by Moriel Prensa, which is
              the State journal from
              <a href="https://gobierno-nacional-moriel.blogspot.com/" target="_blank">Moriel</a>.
            </p>
          </div>
          <div class="listing-entry">
            <img src="/images/la-gaceta-eldorado.png" alt="La Gaceta El Dorado" width="120px" height="72px" />
            <p>
              <a href="https://lagaceta-eldorado.blogspot.com/2023/09/el-dorado-comienza-participacion-activa.html"
                target="_blank">News article</a>
              informing the participation of El Dorado in TMD, from
              <a href="https://lagaceta-eldorado.blogspot.com/" target="_blank">La Gaceta</a>.
            </p>
          </div>
          <div class="listing-entry">
            <img src="/images/dove-archives.png" alt="Dove Archives" width="200px" height="102px" />
            <p>
              <a href="https://www.dovearchives.wiki/wiki/The_Micronational_Directory" target="_blank">Encyclopedic
                article</a>
              describing general aspects about The Micronational Directory, created by Malus and
              hosted in <a href="https://www.dovearchives.wiki" target="_blank">Dove Archives</a>.
            </p>
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
  margin: 20px 0 30px 0;
  font-size: 17px;
}

.bottom-container {
  display: flex;
  justify-content: space-between;
}

.bottom-side-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
}

.scrollable-container {
  padding: 15px;
  width: 87%;
}

.listing-entry {
  display: flex;
  align-items: center;
}

.listing-entry img {
  margin-right: 15px;
}
</style>
