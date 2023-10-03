<template>
    <section class="site-section">
        <p>
            Since <b>The Micronational Directory</b> is an independent project without any kind of sponsoring, we are fully
            financed with the efforts of our team's personal income, who also run the website during free time. This is the
            list of services we consume and, thus, the expenses that arrive to our wallets every month:
        </p>
        <ul>
            <li><a href="https://vercel.com/" target="_blank">Vercel</a>: This provider allows to host our Vue.js webapp,
                and therefore being
                accesible in the Internet for all users. Vercel actually grants the base URL for TMD
                (https://the-micronational-directory.vercel.app/). We currently <b>don't have costs</b> related to this
                service but
                that can change in the future.
            </li>
            <li>
                <a href="https://nic.ar/" target="_blank">Nic.ar</a>: This is the official Argentinean domain registrar for
                websites. We have acquired a custom domain for our webapp, which is the probably the one you have accessed
                through your address bar. This plan demands us a cost of approximately <b>1 USD per year</b>.
            </li>
            <li>
                <a href="https://firebase.google.com/" target="_blank">Google Firebase</a>: This great backend solution
                holds and
                resolves all information regarding micronation entries, user accounts and contests. We are provided with
                databases, authentication resources and storage for the flags. Costs are on-demand and are currently low
                (<b>around 0.10 USD per month</b>) but they will increase as the website gets more traffic and usage.
            </li>
            <li>
                <a href="https://www.mapbox.com/" target="_blank">Mapbox</a>: This was the solution of our choice for
                handling maps when adding a new physical micronation entry or when selecting the map view for visualizing
                them all in the globe. The free plan covers a certain amount of monthly loads that, given our current
                traffic, we have not surpassed yet but can change in the future.
            </li>
            <li>
                <a href="https://www.emailjs.com/" target="_blank">EmailJS</a>: This service allows us to mainly send
                automatic emails to authors when their submissions are approved or rejected, plus any other kind of notices.
                The free plan is very limited (only 200 emails per month) and is not enough. The basic paid plan is <b>9 USD
                    per month</b> and we are evaluating acquiring it.
            </li>
        </ul>
        <p>
            Thank you for taking the time to read more about about our project and the operation behind it. If you like
            our work, and have the opportunity and interest in retributing this platform's usage with a donation, then that
            would be much appreciated! These are currently the methods we can handle:
        </p>
        <div class="donation-methods">
            <img class="crypto-address" src="/images/ETHaddressfordonations.png" alt="ETH address">
            <img class="crypto-address" src="/images/BTCaddressfordonations.png" alt="ETH address">
        </div>
    </section>
</template>
  
<script>
export default {
    methods: {}
}
</script>
  
<style scoped>
.donation-methods {
    display: flex;
    justify-content: center;
    
}

.crypto-address {
    width: 250px;
    margin-left: 15px;
    margin-right: 15px;
}
</style>
  