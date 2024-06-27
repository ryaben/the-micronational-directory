<script setup>
defineProps({
    icon: {
        type: String,
        required: false,
        default: 'www'
    },
    flagSource: {
        type: String,
        required: true,
        default: '/'
    },
    href: {
        type: String,
        required: true,
        default: '/'
    },
    width: {
        type: Number,
        required: false,
        default: 46
    },
    height: {
        type: Number,
        required: false,
        default: 28
    }
})
</script>

<template>
    <router-link :to="href" class="source-container" :class="icon"
        :style="[{ 'width': width + 'px' }, { 'height': height + 'px' }]">
        <img :src="icon !== 'flag' ? '/images/' + icon + '.png' : flagSource" alt="icon">
    </router-link>
</template>

<script>
export default {
    name: 'MemberSource',
    data() {
        return {
        }
    }
}
</script>

<style scoped>
.source-container {
    display: block;
    cursor: pointer;
    background-color: var(--vt-c-white);
    background-size: cover;
    background-position: center;
    overflow: hidden;
    margin-left: 2px;
    margin-right: 2px;
}

.source-container:hover {
    background: var(--vt-c-white);
    background-size: cover;
    background-position: center;
    outline: 2px solid var(--triggerable);
}

.source-container img {
    width: 100%;
    height: 100%;
}
</style>
