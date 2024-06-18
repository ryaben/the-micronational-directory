<script setup>
import {checkHref, checkIcon, cleanString} from '../assets/EntrySourceFunctions';

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
    size: {
        type: Number,
        required: false,
        default: 46
    },
    micronationName: {
        type: String,
        required: true,
        default: ''
    }
})
</script>

<template>
    <a class="source-container" :class="icon"
        :style="[{ 'width': size + 'px' }, { 'height': size + 'px' }]"
        :href="checkHref(href)" target="_blank">
        <img :src="icon !== 'flag' ? '/images/' + icon + '.png' : flagSource" alt="icon">
    </a>
</template>

<script>
export default {
    name: 'EntrySource',
    data() {
        return {
        }
    }
}
</script>

<style scoped>
.source-container {
    display: block;
    border-radius: 50%;
    cursor: pointer;
    background-color: var(--vt-c-white);
    background-size: cover;
    background-position: center;
    border: 2px solid black;
    overflow: hidden;
}

.source-container:hover {
    background: var(--vt-c-white);
    background-size: cover;
    background-position: center;
    border: 2px solid indianred;
}

.source-container img {
    width: 100%;
    height: 100%;
}
</style>
