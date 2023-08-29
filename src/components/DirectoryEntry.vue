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
    <div class="directory-entry-container"
        :class="{ 'collage-mode': this.viewMode === 'collage', 'info-displayed': this.infoView }" :style="cssProps"
        @click="toggleInfo">

        <img :src="this.info.flag" class="entry-flag" :style="{ 'height': this.flagHeight + 'px' }" alt="Flag">
        <div v-show="viewMode !== 'collage'">
            <p class="entry-text entry-name"><b>{{ this.info.name.main }}</b>,<br>{{ this.info.name.title }}</p>
            <p v-if="this.info.name.mainAlt != '' || this.info.name.titleAlt != ''" class="entry-text entry-alt-name">(<b>{{
                this.info.name.mainAlt }}</b>, {{ this.info.name.titleAlt }})</p>

            <hr class="light-divider">

            <p v-if="this.info.motto != ''" class="entry-text"><span class="underlined italicized">"{{
                this.info.motto }}"</span></p>
            <p class="entry-text">
                <span v-for="(type, i) in this.info.type" :key="i">{{ type }}<span
                        v-if="i !== this.info.type.length - 1">,&nbsp;</span><span
                        v-if="i === this.info.type.length - 1">.</span></span>
            </p>
            <p class="entry-text">
                <span v-for="(language, i) in this.info.languages" :key="i">{{ language }}<span
                        v-if="i !== this.info.languages.length - 1">,&nbsp;</span><span
                        v-if="i === this.info.languages.length - 1">.</span></span>
            </p>

            <hr class="light-divider">

            <p class="entry-text"><span class="underlined">Foundation:</span>&nbsp;{{
                new Date(this.info.foundationDate.seconds * 1000).toDateString() }}</p>
            <p class="entry-text"><span class="underlined">Capital:</span>&nbsp;<span v-if="this.info.capital !== ''">{{
                this.info.capital }}.</span><span v-if="this.info.capital === ''">None.</span></p>
            <p v-if="this.info.currency != ''" class="entry-text"><span class="underlined">Currency:</span>&nbsp;{{
                this.info.currency }}.</p>
            <p class="entry-text">
                <span class="underlined">Memberships:</span>&nbsp;<span v-if="this.info.memberships == ''">None.</span><span
                    v-if="this.info.memberships != ''" v-for="(membership, i) in this.info.memberships" :key="i">{{
                        membership }}<span v-if="i !== this.info.memberships.length - 1">,&nbsp;</span><span
                        v-if="i === this.info.memberships.length - 1">.</span></span>
            </p>

            <hr class="light-divider">

            <p class="entry-text">
                <span class="underlined">Contact info:</span><br><span v-for="(contact, i) in this.info.contactInfo"
                    :key="i"><span class="contact-email"><a :href="contact">{{ contact }}</a></span><span
                        v-if="i !== this.info.contactInfo.length - 1"><br></span></span>
            </p>
            <p class="entry-text">
                <span class="underlined">Websites:</span><br><span v-for="(website, i) in this.info.websites" :key="i"><span
                        class="website-link"><a :href="website" target="_blank">{{ website }}</a></span><span
                        v-if="i !== this.info.websites.length - 1"><br></span></span>
            </p>
        </div>

    </div>
</template>

<script>
export default {
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
