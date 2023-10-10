<script setup>
defineProps({
    width: {
        type: Number,
        required: false,
        default: 180,
    },
    info: {
        type: Object,
        required: true,
        default: {}
    },
    viewMode: {
        type: String,
        required: false,
        default: 'cards'
    },
    flagHeight: {
        type: Number,
        required: false,
        default: 120
    }
})
</script>

<template>
    <div class="directory-entry-container" :class="{ 'collage-mode': viewMode === 'collage', 'info-displayed': infoView }"
        :style="cssProps" @click="toggleInfo">

        <img :src="info.flag" class="entry-flag" :style="{ 'height': flagHeight + 'px' }" alt="Flag">

        <div v-show="viewMode !== 'collage'" class="entry-info">
            <div>
                <p class="entry-text entry-name"><b>{{ info.name.main }}</b><span v-if="info.name.title !== ''">,</span><br>
                    <br v-if="info.name.title === ''" v-show="!infoView">
                    {{ info.name.title }}
                </p>
                <p v-if="info.name.mainAlt !== '' || info.name.titleAlt !== ''" class="entry-text entry-alt-name">(<b>{{
                    info.name.mainAlt }}</b><span v-if="info.name.titleAlt !== ''">, </span>{{ info.name.titleAlt }})
                </p>
            </div>

            <hr class="light-divider">

            <p class="entry-text"><span v-if="info.motto !== ''" class="underlined italicized">"{{
                info.motto }}"</span><span v-if="info.motto === ''">No motto.</span></p>
            <p class="entry-text">
                <span v-for="(type, i) in info.type" :key="i">{{ type }}<span
                        v-if="i !== info.type.length - 1">,&nbsp;</span><span
                        v-if="i === info.type.length - 1">.</span></span>
            </p>
            <p class="entry-text">
                <span v-for="(language, i) in info.languages" :key="i">{{ language }}<span
                        v-if="i !== info.languages.length - 1">,&nbsp;</span><span
                        v-if="i === info.languages.length - 1">.</span></span>
            </p>

            <hr class="light-divider">

            <p class="entry-text"><span class="underlined">Foundation:</span>&nbsp;{{
                new Date(info.foundationDate.seconds * 1000).toDateString() }}</p>
            <p class="entry-text"><span class="underlined">Capital:</span>&nbsp;<span v-if="info.capital !== ''">{{
                info.capital }}.</span><span v-if="info.capital === ''">None.</span></p>
            <p class="entry-text"><span class="underlined">Currency:</span>&nbsp;<span v-if="info.currency !== ''">{{
                info.currency }}.</span><span v-if="info.currency === ''">None.</span></p>
            <p class="entry-text">
                <span class="underlined">Memberships:</span>&nbsp;<span v-if="info.memberships == ''">None.</span><span
                    v-if="info.memberships != ''" v-for="(membership, i) in info.memberships" :key="i">{{
                        membership }}<span v-if="i !== info.memberships.length - 1">,&nbsp;</span><span
                        v-if="i === info.memberships.length - 1">.</span></span>
            </p>

            <hr class="light-divider">

            <p class="entry-text">
                <span class="underlined">Contact info:</span><br><span v-for="(contact, i) in info.contactInfo"
                    :key="i"><span class="contact-email"><a :href="contact" target="_blank">{{ contact }}</a></span><span
                        v-if="i !== info.contactInfo.length - 1"><br></span></span>
            </p>
            <p class="entry-text">
                <span class="underlined">Websites:</span><br><span v-for="(website, i) in info.websites" :key="i"><span
                        class="website-link"><a :href="website" target="_blank">{{ website }}</a></span><span
                        v-if="i !== info.websites.length - 1"><br></span></span>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DirectoryEntry',
    data: () => {
        return {
            infoView: false
        };
    },
    computed: {
        cssProps() {
            return {
                '--container-width': (this.width) + "px"
            }
        }
    },
    methods: {
        toggleInfo() {
            if (this.viewMode !== 'collage') {
                this.infoView = !this.infoView;
            }
        }
    }
}
</script>

<style scoped>
.directory-entry-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: var(--container-width);
    height: max-content;
    max-height: max-content;
    background-color: var(--directory-entry-background-color);
    color: var(--directory-entry-text-color);
    border-radius: 8px;
    border: 2px solid var(--site-section-border-color);
    padding: 15px;
    margin: 0 3px 6px 3px;
    transition: linear background-color 0.2s, linear color 0.2s;
    cursor: pointer;
}

.directory-entry-container.info-displayed .entry-text,
.directory-entry-container.info-displayed .entry-text.entry-name,
.directory-entry-container.info-displayed .light-divider {
    display: block;
    max-height: none;
}

.directory-entry-container.collage-mode {
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 0px;
    cursor: default;
}

.directory-entry-container:hover {
    background-color: var(--navbar-tab-background-color-hover);
    color: var(--navbar-text-color-hover);
}

.entry-flag {
    width: 100%;
    height: auto;
}

.entry-text {
    display: none;
    font-size: 13px;
    margin-block-start: 0;
    margin-block-end: 0;
    text-align: center;
    word-break: break-all;
}

.entry-text.entry-name {
    font-size: 15px;
    margin-block-start: 5px;
    word-break: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.entry-text.entry-alt-name {
    font-size: 11px;
    font-style: italic;
    margin-block-start: 3px;
    word-break: normal;
}

.light-divider {
    display: none;
    width: 100%;
}

.contact-email a {
    color: var(--directory-contact-email-color);
}

.website-link a {
    color: var(--directory-website-link-color);
}
</style>
