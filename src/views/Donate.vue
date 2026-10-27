<template>
    <section class="site-section">
        <p v-html="$t('donatePage.intro')"></p>
        <ul>
            <li v-html="$t('donatePage.vercel')"></li>
            <li v-html="$t('donatePage.nic')"></li>
            <li v-html="$t('donatePage.firebase')"></li>
            <li v-html="$t('donatePage.mapbox')"></li>
            <li v-html="$t('donatePage.emailjs')"></li>
        </ul>
        <p v-html="$t('donatePage.thanks')"></p>
        <div class="donation-methods">
            <img class="crypto-address" src="/images/ETHaddressfordonations.png" :alt="$t('donatePage.ethAddressAlt')">
            <img class="crypto-address" src="/images/BTCaddressfordonations.png" :alt="$t('donatePage.btcAddressAlt')">
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
  
