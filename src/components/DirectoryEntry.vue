<script setup>
import { checkIcon } from '../utils/EntrySourceFunctions';
import EntrySource from '../components/EntrySource.vue';
import AnimateHeight from 'vue-animate-height';
import store from '../store';
import FavoriteToggle from './FavoriteToggle.vue';

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
    disableFullProfileButton: {
        type: Boolean,
        required: false,
        default: false
    },
    alwaysExpanded: {
        type: Boolean,
        default: false
    },
    inlineProfilePreview: {
        type: Boolean,
        default: false
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
const emit = defineEmits(['open-profile'])
</script>

<template>
    <div class="directory-entry-container"
        :class="{ 'collage-mode': viewMode === 'collage', 'info-displayed': infoView }" :style="cssProps"
        @click="toggleInfo">
        <FavoriteToggle v-if="info.approved" :entry-id="info.directoryId || info.id || ''" entry-type="micronations" />

        <img :src="info.flag" class="entry-flag" :style="{ 'height': flagHeight + 'px' }" alt="Flag">

        <div v-show="viewMode !== 'collage'" class="entry-info">
            <p class="entry-text entry-name" :class="{ 'expanded': infoView }"><b>{{ info.name.main }}</b><span
                    v-if="info.name.title !== ''">,<br>{{ info.name.title }}</span>
            </p>

            <AnimateHeight id="animatedHeight" :duration="400" :height="height" :animate-opacity="true">
                <div class="expanded-details">
                    <p v-if="info.motto" class="detail-motto">“{{ info.motto }}”</p>

                    <div class="entry-facts">
                        <div class="entry-fact">
                            <span class="fact-label">Languages</span>
                            <strong>{{ info.languages?.length ? info.languages.join(', ') : 'Not listed' }}</strong>
                        </div>
                        <div class="entry-fact">
                            <span class="fact-label">Founded</span>
                            <strong>{{ info.foundationDateDisplay || formatFoundation(info.foundationDate) }}</strong>
                        </div>
                    </div>

                    <section class="entry-sources-section">
                        <div class="sources-heading">
                            <span>Contact media</span>
                            <small>{{ info.contactInfo?.length || 0 }}</small>
                        </div>
                        <div class="sources-container">
                            <EntrySource v-for="(contact, i) in info.contactInfo" :key="contact + i"
                                :href="contact" :flag-source="info.flag" :size="28" :micronation-name="info.name.main"
                                :icon="checkIcon(contact, info.name.main)" />
                        </div>
                        <p v-if="!info.contactInfo?.length" class="source-empty">No contact media listed</p>
                    </section>

                    <section class="entry-sources-section">
                        <div class="sources-heading">
                            <span>Info sources</span>
                            <small>{{ info.websites?.length || 0 }}</small>
                        </div>
                        <div class="sources-container">
                            <EntrySource v-for="(website, i) in info.websites" :key="website + i"
                                :href="website" :flag-source="info.flag" :size="28" :micronation-name="info.name.main"
                                :icon="checkIcon(website, info.name.main)" />
                        </div>
                        <p v-if="!info.websites?.length" class="source-empty">No sources listed</p>
                    </section>
                </div>
            </AnimateHeight>
        </div>

        <div v-if="viewMode !== 'collage' && infoView" class="info-buttons-container">
            <button v-if="inlineProfilePreview" type="button" class="info-button full-width" @click.stop="emit('open-profile')">See full profile</button>
            <router-link v-else-if="!disableFullProfileButton" :to="'/directory/' + info.name.main"
                class="info-button full-width">See full profile</router-link>
            <span v-else class="info-button full-width disabled">See full profile</span>
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
    data() {
        return {
            infoView: this.alwaysExpanded,
            height: this.alwaysExpanded ? 'auto' : 0
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
            if (this.alwaysExpanded) return;
            this.infoView = !this.infoView;
            this.updateHeight();
        },
        updateHeight() {
            return this.height = this.height === 0 ? 'auto' : 0;
        },
        formatFoundation(date) {
            if (!date) return 'Unknown';
            const seconds = date?._seconds ?? date?.seconds;
            const parsedDate = seconds != null
                ? new Date(seconds * 1000)
                : new Date(date);
            if (Number.isNaN(parsedDate.getTime())) return 'Unknown';
            return parsedDate.getFullYear();
        },
        findOrg(name) {
            const orgQuery = this.visibleOrganizations.find(org => org.name.main === name || org.name.mainAlt === name);
            const supranationalQuery = this.supranationalMicronations.find(org => org.name.main === name || org.name.mainAlt === name);

            if (orgQuery === undefined) {
                if (supranationalQuery === undefined) {
                    return {
                        href: null,
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
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: var(--container-width);
    height: max-content;
    max-height: max-content;
    background-color: var(--directory-entry-background-color);
    color: var(--directory-entry-text-color);
    border-radius: var(--radius-sm);
    border: none;
    padding: 15px;
    padding-bottom: 15px;
    margin: 0 3px 6px 3px;
    transition: transform var(--transition-base) ease, background-color var(--transition-base) ease, box-shadow var(--transition-base) ease;
    cursor: pointer;
}

.directory-entry-container.info-displayed {
    padding: 12px;
    padding-bottom: 0;
    border: 1px solid color-mix(in srgb, var(--color-accent) 24%, var(--color-border));
    border-radius: var(--radius-md);
    background: linear-gradient(155deg,
        color-mix(in srgb, var(--color-accent) 6%, var(--directory-entry-background-color)),
        var(--directory-entry-background-color) 48%);
    box-shadow: 0 8px 20px color-mix(in srgb, var(--color-heading) 9%, transparent);
}

.directory-entry-container.info-displayed:hover {
    transform: translateY(-2px);
}

.directory-entry-container:hover {
    transform: translateY(-4px);
    background-color: var(--navbar-tab-background-color-hover);
    box-shadow: var(--shadow-soft);
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
    color: var(--directory-entry-text-color);
}

.directory-entry-container :deep(.entry-text),
.directory-entry-container :deep(.entry-text a) {
    color: inherit;
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
    margin-bottom: 2px;
}

.expanded-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 8px;
}

.entry-alt-name {
    margin: 0;
    color: var(--color-muted);
    font-size: 11px;
    font-style: italic;
    word-break: normal;
    text-align: center;
}

.detail-motto {
    margin: 0;
    padding: 8px 10px;
    border-left: 3px solid var(--color-accent);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface));
    font-size: 12px;
    font-style: italic;
    line-height: 1.4;
    text-align: left;
    overflow-wrap: anywhere;
}

.entry-facts {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
}

.entry-fact {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    padding: 7px 8px;
    border: 1px solid color-mix(in srgb, var(--color-border) 85%, transparent);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-surface) 72%, transparent);
    text-align: left;
}

.fact-label {
    color: var(--color-muted);
    font-size: 9px;
    font-weight: 750;
    letter-spacing: 0.07em;
    text-transform: uppercase;
}

.entry-fact strong {
    color: var(--color-heading);
    font-size: 11px;
    line-height: 1.35;
    overflow-wrap: anywhere;
}

.entry-sources-section {
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--color-border) 88%, transparent);
}

.sources-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 7px;
    color: var(--color-muted);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.sources-heading small {
    display: grid;
    min-width: 19px;
    height: 19px;
    padding: 0 4px;
    place-items: center;
    border-radius: var(--radius-full);
    color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
    font-size: 10px;
    letter-spacing: normal;
}

.expanded-details .sources-container {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    gap: 6px;
}

.source-empty {
    margin: 0;
    color: var(--color-muted);
    font-size: 11px;
    font-style: italic;
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
    margin-top: 10px;
    width: calc(100% + 24px);
}

.info-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 5px 8px;
    text-align: center;
    font-size: 13px;
    font-family: inherit;
    line-height: 1.3;
    text-decoration: none;
    background: var(--vt-c-indigo);
    border: 1px solid var(--color-border);
    border-bottom: none;
    color: var(--vt-c-white-soft);
    cursor: pointer;
    transition: background-color 220ms ease, color 220ms ease, box-shadow 220ms ease;
}

.info-button.full-width {
    width: 100%;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);
    border-left: none;
    border-right: none;
}

.info-button:hover {
    background: color-mix(in srgb, var(--vt-c-indigo) 86%, var(--color-heading));
    color: var(--vt-c-white-soft);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--vt-c-indigo) 20%, transparent);
}

.info-button.disabled {
    opacity: 0.6;
    pointer-events: none;
}

</style>
