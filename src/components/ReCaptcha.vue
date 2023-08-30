<script setup>
import { VueRecaptcha } from 'vue-recaptcha';
</script>

<template>
    <VueRecaptcha :sitekey="this.siteKey" :load-recaptcha-script="true" @expired="handleExpire" @verify="handleSuccess" @error="handleError" :badge="'inline'" />
</template>
  
<script>
export default {
    name: 'ReCaptcha',
    components: {
        VueRecaptcha
    },
    data() {
        return {
            siteKey: "6Lcs9LAnAAAAAD6e4Oqe0K0ZWcI0zgRpnKMfhJq2"
        }
    },
    methods: {
        handleSuccess() {
            this.$emit('checkbox', true);
        },
        handleExpire() {
            this.$emit('checkbox', false);
        },
        handleError() {
            this.$emit('error', true);
        }
    }
}
</script>