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
            siteKey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
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