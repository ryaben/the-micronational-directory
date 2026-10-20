<script setup>
import { checkIcon } from '../utils/EntrySourceFunctions';
import EntrySource from '../components/EntrySource.vue';
import MemberSource from '../components/MemberSource.vue';
import ProfileArticleActions from './ProfileArticleActions.vue';
import ProfileArticleNavigation from './ProfileArticleNavigation.vue';
import ProfileDataCell from './ProfileDataCell.vue';
import store from '../store';

defineProps({
    info: {
        type: Object,
        required: true,
        default: {}
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
    },
    preview: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <Transition mode="out-in">
        <div class="directory-article-container" :key="info.name.main">
            <div class="article-title">
                <div class="article-full-name">
                    <EntrySource class="entry-source gmaps"
                        :flag-source="info.flag" :size="36" :micronation-name="info.name.main" :icon="'Google Maps'"
                        :href="googleMapsUrl()" />
                    <div class="article-name-group">
                        <p class="article-text article-name"><b>{{ info.name.main }}</b><span
                                v-if="info.name.title !== ''">,</span>
                            {{ info.name.title }}
                        </p>
                        <p v-if="info.name.mainAlt !== '' || info.name.titleAlt !== ''"
                            class="article-text article-alt-name">
                            (<b>{{ info.name.mainAlt }}</b><span v-if="info.name.titleAlt !== ''">,&nbsp;</span>{{
                info.name.titleAlt }})
                        </p>
                    </div>
                </div>
                <ProfileArticleActions v-if="!preview" :title="info.name.main" />
            </div>

            <div class="directory-article-content">
                <div class="article-column flag">
                    <img :src="info.flag" class="article-flag" alt="Flag">
                </div>

                <div class="article-data-grid">
                    <ProfileDataCell variant="directory">
                        <span class="data-label">National motto</span>
                        <span class="data-value" v-if="info.motto !== ''"><span class="italicized">"{{ info.motto }}"</span></span>
                        <span class="data-value" v-else>No motto.</span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Foundation</span>
                        <span class="data-value">{{ cleanTimestamp(info.foundationDate) }}</span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Micronation type</span>
                        <span class="data-value"><span v-for="(type, i) in info.type" :key="i">{{ type }}<span v-if="i !== info.type.length - 1">, </span><span v-else>.</span></span></span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Capital</span>
                        <span class="data-value">{{ info.capital ? info.capital + '.' : 'None.' }}</span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Languages</span>
                        <span class="data-value"><span v-for="(language, i) in info.languages" :key="i">{{ language }}<span v-if="i !== info.languages.length - 1">, </span><span v-else>.</span></span></span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Currency</span>
                        <span class="data-value">{{ info.currency ? info.currency + '.' : 'None.' }}</span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Historical memberships</span>
                        <div class="data-value">
                            <span v-if="!info.memberships.length">None.</span>
                            <div v-else class="sources-container">
                                <MemberSource class="member-source" v-for="(member, i) in info.memberships" :key="i"
                                    :href="findOrg(member).href" :flag-source="findOrg(member).logo" :width="60"
                                    :height="40" :micronation-name="member" :icon="'flag'" />
                            </div>
                        </div>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Contact media</span>
                        <div class="data-value">
                            <span v-if="!info.contactInfo.length">N/A.</span>
                            <div v-else class="sources-container">
                                <EntrySource class="entry-source" v-for="(contact, i) in info.contactInfo" :key="i"
                                    :href="contact" :flag-source="info.flag" :size="46" :micronation-name="info.name.main"
                                    :icon="checkIcon(contact, info.name.main)" />
                            </div>
                        </div>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Info sources</span>
                        <div class="data-value">
                            <div class="sources-container">
                                <EntrySource class="entry-source" v-for="(website, i) in info.websites" :key="i"
                                    :href="website" :flag-source="info.flag" :size="46" :micronation-name="info.name.main"
                                    :icon="checkIcon(website, info.name.main)" />
                            </div>
                        </div>
                    </ProfileDataCell>
                    <ProfileDataCell variant="directory">
                        <span class="data-label">Try more info at</span>
                        <div class="data-value">
                            <div class="sources-container">
                                <EntrySource class="entry-source" :flag-source="info.flag" :size="46"
                                    :micronation-name="info.name.main" :icon="'Micro Flag Archive'"
                                    :href="'https://sites.google.com/view/micro-flag-archive/micronational-flags-and-emblems/' + generateMFALink(info.name.main)" />
                                <EntrySource class="entry-source" :flag-source="info.flag" :size="46"
                                    :micronation-name="info.name.main" :icon="'MicroWiki'"
                                    :href="'https://micronations.wiki/wiki/' + info.name.main" />
                            </div>
                        </div>
                    </ProfileDataCell>
                </div>
            </div>

            <ProfileArticleNavigation v-if="!preview" :route-base="'/directory'" :previous="info.previous" :next="info.next"
                :author="info.author" :creation-date="info.creationDate" />
        </div>
    </Transition>
</template>

<script>
export default {
    name: 'DirectoryArticle',
    components: {
        EntrySource, MemberSource
    },
    methods: {
        cleanTimestamp(timestamp) {
            const seconds = timestamp?._seconds ?? timestamp?.seconds;
            const date = seconds != null ? new Date(seconds * 1000) : new Date(timestamp);
            if (Number.isNaN(date.getTime())) return 'Unknown';
            return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
        },
        generateMFALink(micronation) {
            const cleanString = micronation.replace(/\s+/g, '-').toLowerCase();
            return cleanString;
        },
        googleMapsUrl() {
            const latitude = this.info.location?._latitude;
            const longitude = this.info.location?._longitude;
            const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) &&
                (latitude !== 0 || longitude !== 0);
            const query = hasCoordinates ? `${latitude},${longitude}` : this.info.name.main;
            return 'https://maps.google.com/?q=' + encodeURIComponent(query);
        },
        findOrg(name) {
            const orgQuery = this.visibleOrganizations.find(org => org.name.main === name || org.name.mainAlt === name);
            const supranationalQuery = this.supranationalMicronations.find(org => org.name.main === name || org.name.mainAlt === name);

            if (orgQuery === undefined) {
                if (supranationalQuery === undefined) {
                    return {
                        href: '/organizations/' + name,
                        logo: '/images/missing-flag.png',
                        name: {
                            main: name,
                            mainAlt: name
                        }
                    }
                } else {
                    return {
                        href: '/directory/' + supranationalQuery.name.main,
                        logo: supranationalQuery.flag,
                        name: { main: supranationalQuery.name.main }
                    }
                }

            } else {
                return {
                    href: '/organizations/' + orgQuery.name.main,
                    logo: orgQuery.logo,
                    name: { main: orgQuery.name.main }
                }
            }
        },
    }
}
</script>

<style>
.directory-article-container {
    background: linear-gradient(135deg, var(--directory-entry-background-color) 0%, var(--color-background-mute) 100%);
    color: var(--directory-entry-text-color);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border);
    padding: 0;
    margin: 0 3px 6px 3px;
    width: auto;
    box-shadow: var(--shadow-soft);
    overflow: hidden;
}

.article-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px;
    background: var(--color-surface-raised);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 0;
}

.article-full-name {
    display: flex;
    align-items: center;
    gap: 12px;
}

.profile-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-header-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-heading);
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    transition: background-color var(--transition-base) ease, border-color var(--transition-base) ease,
        color var(--transition-base) ease, transform var(--transition-base) ease;
}

.profile-header-action:hover {
    border-color: var(--color-accent);
    background: var(--navbar-tab-background-color-hover);
    color: var(--color-accent);
    transform: translateY(-1px);
}

.profile-header-action svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
}

.copy-action-label {
    display: none;
}

.profile-header-action:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
    outline-offset: 2px;
}

.article-full-name:last-child {
    gap: 8px;
}

.article-name-group {
    min-width: 0;
}

.article-text.article-name {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-heading) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.article-text.article-alt-name {
    font-size: 18px;
    font-style: italic;
    color: var(--color-muted);
    margin: 0;
}

.article-text {
    font-size: 16px;
    margin-block-start: 0;
    margin-block-end: 12px;
    word-break: break-word;
    overflow-wrap: break-word;
    color: var(--color-text);
}

.article-text.breakable {
    word-break: break-all;
}

.article-text .underlined,
.article-text.underlined {
    color: var(--color-accent);
    font-weight: 600;
    font-size: 18px;
    text-decoration: none;
}

.directory-article-content {
    display: grid;
    grid-template-columns: minmax(260px, 0.85fr) minmax(0, 2fr);
    padding: 28px;
    gap: 24px;
}

.article-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.article-column.flag {
    align-items: center;
    align-self: start;
    background: var(--color-surface-raised);
    border-radius: var(--radius-lg);
    padding: 20px;
    border: 1px solid var(--color-border);
}

.article-flag {
    width: 100%;
    max-width: 100%;
    height: auto;
    max-height: 280px;
    object-fit: contain;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-data-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.external-container {
    display: flex;
    gap: 8px;
    align-items: center;
}

.article-title .article-text {
    font-size: 14px;
    color: var(--color-muted);
    font-weight: 500;
    margin: 0;
}

.article-title .article-text.article-name {
    font-size: 24px;
}

.sources-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.entry-source {
    margin: 0;
}

.member-source {
    margin-bottom: 8px;
}


.article-profiles-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    background: var(--color-surface-raised);
    border-top: 1px solid var(--color-border);
    margin-top: 0;
    gap: 16px;
}

.profile-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 140px;
    height: min-content;
    gap: 2px;
    text-decoration: none;
    text-align: center;
    padding: 9px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--color-surface-raised);
    color: var(--color-heading);
    transition: background-color var(--transition-base) ease, border-color var(--transition-base) ease,
        color var(--transition-base) ease, transform var(--transition-base) ease, box-shadow var(--transition-base) ease;
}

.profile-option:hover {
    background: var(--navbar-tab-background-color-hover);
    border-color: var(--color-accent);
    color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-soft);
}

.profile-option-label {
    font-size: 13px;
    font-weight: 700;
}

.profile-option-name {
    max-width: 190px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.contribution-info {
    text-align: center;
    font-size: 14px;
    color: var(--color-muted);
    flex: 1;
}

.contribution-info b {
    color: var(--color-accent);
}

.contact-email a {
    color: var(--directory-contact-email-color);
}

.website-link a {
    color: var(--directory-website-link-color);
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

@media (max-width: 1200px) {
    .directory-article-content {
        grid-template-columns: minmax(0, 1fr);
    }

    .article-column.flag {
        grid-column: 1 / -1;
        width: min(100%, 520px);
        justify-self: center;
        padding: 14px;
    }

    .article-flag {
        width: 88%;
        max-height: 220px;
    }
}

@media (max-width: 900px) {
    .article-column.flag {
        width: min(100%, 520px);
        justify-self: center;
        padding: 14px;
    }

    .article-flag {
        width: 88%;
        max-height: 220px;
    }
}

@media (max-width: 600px) {
    .article-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .copy-action-label {
        display: inline;
    }

    .directory-article-content {
        padding: 20px;
    }

    .article-data-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .article-column.flag {
        order: -1;
    }

    .article-profiles-control {
        flex-direction: column;
        gap: 12px;
    }

    .profile-option {
        width: 100%;
    }
}
</style>
