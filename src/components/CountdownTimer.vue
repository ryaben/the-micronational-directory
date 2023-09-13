<script setup>
defineProps({
    expirationDate: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    preMessage: {
        type: String,
        required: false,
        default: ''
    },
    postMessage: {
        type: String,
        required: false,
        default: ''
    },
    finishMessage: {
        type: String,
        required: false,
        default: 'Countdown finished!'
    }
});
</script>

<template>
    <p class="countdown-timer">{{ preMessage }}{{ display }}{{ postMessage }}</p>
</template>

<script>
export default {
    name: 'CountdownTimer',
    data: () => {
        return {
            display: ''
        };
    },
    methods: {
        updateTimer(countDownDate) {
            let now = new Date().getTime();
            let distance = countDownDate - now;

            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            this.display = days + "d " + hours + "h " + minutes + "m " + seconds + "s";

            if (distance < 0) {
                this.display = this.finishMessage;
                this.$emit('startCountdownEnded');
            }
        }
    },
    mounted() {
        const that = this;
        setInterval(() => {
            that.updateTimer(that.expirationDate)
        }, 1000);
    }
}
</script>

<style scoped>
.countdown-timer {
    font-size: 32px;
    color: var(--vt-c-white-soft);
}
</style>