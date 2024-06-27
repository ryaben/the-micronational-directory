<script setup>
import { checkHref, checkIcon, cleanString } from '../assets/EntrySourceFunctions';
import EntrySource from '../components/EntrySource.vue';
import MemberSource from '../components/MemberSource.vue';
import AnimateHeight from 'vue-animate-height';
import store from '../store';

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
        default: 'micronations'
    },
    flagHeight: {
        type: Number,
        required: false,
        default: 120
    },
    micronationsDirectory: {
        type: Array,
        required: false,
        default: store.getters.micronations
    },
    organizationsDirectory: {
        type: Array,
        required: false,
        default: store.getters.organizations
    },
    visibleOrganizations: {
        type: Array,
        required: false,
        default: store.getters.organizations.filter(element => element.approved && element.searchDisplay && element.filterDisplay)
    },
    supranationalMicronations: {
        type: Array,
        required: false,
        default: store.getters.micronations.filter(element => element.supranational)
    }
})
</script>

<template>
    <div class="directory-entry-container" :class="{ 'collage-mode': viewMode === 'collage', 'info-displayed': infoView }"
        :style="cssProps">

        <img :src="info.flag" class="entry-flag" :style="{ 'height': flagHeight + 'px' }" alt="Flag">

        <div v-show="viewMode !== 'collage'" class="entry-info">
            <p class="entry-text entry-name" :class="{ 'expanded': infoView }"><b>{{ info.name.main }}</b><span
                    v-if="info.name.title !== ''">,</span><br>
                <br v-if="info.name.title === ''" v-show="!infoView">
                {{ info.name.title }}
            </p>

            <AnimateHeight id="animatedHeight" :duration="400" :height="height" :animate-opacity="true">
                <div class="animated-info">
                    <p v-if="info.name.mainAlt !== '' || info.name.titleAlt !== ''" class="entry-text entry-alt-name">(<b>{{
                        info.name.mainAlt }}</b><span v-if="info.name.titleAlt !== ''">, </span>{{ info.name.titleAlt }})
                    </p>

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
                    <p class="entry-text"><span class="underlined">Currency:</span>&nbsp;<span
                            v-if="info.currency !== ''">{{
                                info.currency }}.</span><span v-if="info.currency === ''">None.</span></p>

                    <hr class="light-divider">

                    <div class="entry-group extended">
                        <p class="entry-text"><span class="underlined">Memberships:</span>
                            <span v-if="info.memberships == ''">&nbsp;None.</span>
                        </p>
                        <div v-if="info.memberships.length" class="sources-container">
                            <MemberSource class="member-source" v-for="(member, i) in info.memberships" :key="i"
                                :href="findOrg(member).href" :flag-source="findOrg(member).logo" :width="56" :height="40"
                                :micronation-name="member" :icon="'flag'" />
                        </div>
                    </div>

                    <hr class="light-divider">

                    <div class="entry-group">
                        <p class="entry-text">Contact media:</p>
                        <div class="sources-container">
                            <EntrySource class="entry-source" v-for="(contact, i) in info.contactInfo" :key="i"
                                :href="contact" :flag-source="info.flag" :size="32" :micronation-name="info.name.main"
                                :icon="checkIcon(contact, info.name.main)" />
                        </div>
                    </div>
                    <div class="entry-group">
                        <p class="entry-text">Info sources:</p>
                        <div class="sources-container">
                            <EntrySource class="entry-source" v-for="(website, i) in info.websites" :key="i" :href="website"
                                :flag-source="info.flag" :size="32" :micronation-name="info.name.main"
                                :icon="checkIcon(website, info.name.main)" />
                        </div>
                    </div>
                </div>
            </AnimateHeight>
        </div>

        <div v-show="viewMode !== 'collage'" class="info-buttons-container">
            <button class="info-button" @click="toggleInfo">{{ infoView ? 'Collapse' : 'Expand' }}</button>
            <router-link :to="'/directory/' + info.name.main" class="info-button">Full profile</router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DirectoryEntry',
    components: {
        EntrySource,
        AnimateHeight
    },
    data: () => {
        return {
            infoView: false,
            height: 0
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
            this.updateHeight();
        },
        updateHeight() {
            return this.height = this.height === 0 ? 'auto' : 0;
        },
        findOrg(name) {
            const orgQuery = this.visibleOrganizations.find(org => org.name.main === name || org.name.mainAlt === name);
            const supranationalQuery = this.supranationalMicronations.find(org => org.name.main === name || org.name.mainAlt === name);

            if (orgQuery === undefined) {
                if (supranationalQuery === undefined) {
                    return {
                        href: `/organizations/${name}`,
                        logo: '/images/missing-flag.png',
                        name: {
                            main: name,
                            mainAlt: name
                        }
                    }
                } else {
                    return {
                        href: `/directory/${supranationalQuery.name.main}`,
                        logo: supranationalQuery.flag,
                        name: { main: supranationalQuery.name.main }
                    }
                }

            } else {
                return {
                    href: `/organizations/${orgQuery.name.main}`,
                    logo: orgQuery.logo,
                    name: { main: orgQuery.name.main }
                }
            }
        },
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
    padding: 15px 15px 0 15px;
    margin: 0 3px 6px 3px;
    transition: linear background-color 0.3s, linear color 0.3s;
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

.entry-info {
    width: 100%;
}

.entry-text {
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

.entry-text.entry-name.expanded {
    -webkit-line-clamp: 5;
    line-clamp: 5;
}

.entry-text.entry-alt-name {
    font-size: 11px;
    font-style: italic;
    margin-block-start: 3px;
    word-break: normal;
}

.light-divider {
    width: 100%;
}

.contact-email a,
.entry-text.entry-name a.website-link {
    color: var(--triggerable);
}

.website-link a {
    color: var(--directory-website-link-color);
}

.sources-container {
    display: flex;
    width: auto;
    justify-content: center;
    flex-wrap: wrap;
}

.entry-group:not(:last-of-type) .sources-container a.source-container {
    margin-bottom: 4px;
}

.entry-group:not(:last-of-type) .sources-container {
    margin-bottom: 2px;
}

.entry-source {
    margin-right: 4px;
}

.entry-source:last-of-type {
    margin-right: 0;
}

.info-buttons-container {
    display: flex;
    margin-top: 12px;
    width: calc(100% + 28px);
}

.info-button {
    width: 50%;
    text-align: center;
    font-size: 12px;
    text-decoration: none;
    background: var(--vt-c-indigo);
    border: 1px solid var(--vt-c-black);
    border-bottom: none;
    color: var(--vt-c-white-soft);
    cursor: pointer;
}

.info-buttons-container .info-button:first-child {
    border-bottom-left-radius: 8px;
    border-left: none;
}

.info-buttons-container .info-button:last-child {
    border-bottom-right-radius: 8px;
    border-right: none;
}

.info-button:hover {
    background: var(--soft-beige);
    color: var(--vt-c-indigo-dark);
}
</style>
