<script setup>
import { VueRecaptcha } from 'vue-recaptcha';

const siteKey = import.meta.env.VITE_RECAPTCHA_SITEKEY;
</script>

<template>
    <VueRecaptcha :sitekey="siteKey" :load-recaptcha-script="true" @expired="handleExpire" @verify="handleSuccess" @error="handleError" :badge="'inline'" />
</template>
  
<script>
export default {
    name: 'ReCaptcha',
    components: {
        VueRecaptcha
    },
    data() {
        return {
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