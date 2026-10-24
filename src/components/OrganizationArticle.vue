<script setup>
import { checkIcon } from '../utils/EntrySourceFunctions';
import EntrySource from '../components/EntrySource.vue';
import MemberSource from '../components/MemberSource.vue';
import ProfileArticleActions from './ProfileArticleActions.vue';
import ProfileArticleNavigation from './ProfileArticleNavigation.vue';
import ProfileDataCell from './ProfileDataCell.vue';
import UncertaintyToggle from './UncertaintyToggle.vue';
import store from '../store';

defineProps({
    info: {
        type: Object,
        required: true,
        default: {}
    },
    micronationsDirectory: {
        type: Array,
        required: false,
        default: store.getters.micronations
    },
    preview: {
        type: Boolean,
        default: false
    },
})
</script>

<template>
    <Transition mode="out-in">
        <div class="directory-article-container" :key="info.name.main">
            <div class="article-title">
                <div class="article-full-name">
                    <p class="article-text article-name">
                        <b>{{ info.name.main }}</b><UncertaintyToggle v-if="info.uncertain?.includes('name.main')" :active="true" disabled />&nbsp;({{ info.name.mainAlt }}<UncertaintyToggle v-if="info.uncertain?.includes('name.mainAlt')" :active="true" disabled />)
                    </p>
                </div>
                <ProfileArticleActions v-if="!preview" :title="info.name.main" :entry-id="info.id" entry-type="organizations" />
            </div>

            <div class="organization-article-content">
                <div class="organization-logo-panel">
                    <UncertaintyToggle v-if="info.uncertain?.includes('logo')" :active="true" disabled />
                    <img :src="info.logo" class="article-logo" alt="Logo">
                </div>

                <div class="organization-info-table">
                    <div class="organization-data-grid">
                    <ProfileDataCell variant="organization">
                        <span class="organization-data-label">Organization motto</span>
                        <span class="organization-data-value" v-if="info.motto !== ''"><span class="italicized">"{{ info.motto }}"</span><UncertaintyToggle v-if="info.uncertain?.includes('motto')" :active="true" disabled /></span>
                        <span class="organization-data-value" v-else>No motto.<UncertaintyToggle v-if="info.uncertain?.includes('motto')" :active="true" disabled /></span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="organization">
                        <span class="organization-data-label">Foundation</span>
                        <span class="organization-data-value">{{ cleanTimestamp(info.foundationDate) }}<UncertaintyToggle v-if="info.uncertain?.includes('foundationDate')" :active="true" disabled /></span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="organization">
                        <span class="organization-data-label">Languages</span>
                        <span class="organization-data-value"><span v-for="(language, i) in info.languages" :key="i">{{ language }}<span v-if="i !== info.languages.length - 1">, </span><span v-else>.</span></span><UncertaintyToggle v-if="info.uncertain?.includes('languages')" :active="true" disabled /></span>
                    </ProfileDataCell>
                    <ProfileDataCell variant="organization">
                        <span class="organization-data-label">Contact media</span>
                        <div class="organization-data-value">
                            <span v-if="!info.contactInfo.length">N/A.</span>
                            <div v-else class="sources-container">
                                <EntrySource class="entry-source" v-for="(contact, i) in info.contactInfo" :key="i"
                                    :href="contact" :flag-source="info.logo" :size="46" :micronation-name="info.name.main"
                                    :icon="checkIcon(contact, info.name.main)" />
                            </div>
                            <UncertaintyToggle v-if="info.uncertain?.includes('contactInfo')" :active="true" disabled />
                        </div>
                    </ProfileDataCell>
                    <ProfileDataCell variant="organization">
                        <span class="organization-data-label">Info sources</span>
                        <div class="organization-data-value">
                            <div class="sources-container">
                                <EntrySource class="entry-source" v-for="(website, i) in info.websites" :key="i"
                                    :href="website" :flag-source="info.logo" :size="46" :micronation-name="info.name.main"
                                    :icon="checkIcon(website, info.name.main)" />
                            </div>
                            <UncertaintyToggle v-if="info.uncertain?.includes('websites')" :active="true" disabled />
                        </div>
                    </ProfileDataCell>
                    <ProfileDataCell variant="organization">
                        <span class="organization-data-label">Try more info at</span>
                        <div class="organization-data-value">
                            <div class="sources-container">
                                <EntrySource class="entry-source" :flag-source="info.logo" :size="46"
                                    :micronation-name="info.name.main" :icon="'MicroWiki'"
                                    :href="'https://micronations.wiki/wiki/' + info.name.mainAlt" />
                            </div>
                        </div>
                    </ProfileDataCell>
                    </div>

                    <div class="organization-members-panel">
                        <div class="organization-members-heading">Historical members</div>
                        <div v-if="getMembers.length" class="sources-container members">
                            <MemberSource class="member-source" v-for="(member, i) in getMembers" :key="i"
                                :href="'/directory/' + member.name.main" :flag-source="member.flag" :width="60"
                                :height="40" :micronation-name="member.name.main" :icon="'flag'" />
                        </div>
                        <div v-else class="organization-empty-members">No historical members.</div>
                    </div>
                </div>
            </div>

            <ProfileArticleNavigation v-if="!preview" :route-base="'/organizations'" :previous="info.previous" :next="info.next"
                :author="info.author" :creation-date="info.creationDate" />
        </div>
    </Transition>
</template>

<script>
export default {
    name: 'OrganizationArticle',
    components: {
        EntrySource, MemberSource
    },
    computed: {
        getMembers() {
            const that = this;
            return this.micronationsDirectory.filter(element => element.approved && (element.memberships.includes(that.info.name.main) || element.memberships.includes(that.info.name.mainAlt)));
        }
    },
    methods: {
        cleanTimestamp(timestamp) {
            const seconds = timestamp?._seconds ?? timestamp?.seconds;
            const date = seconds != null ? new Date(seconds * 1000) : new Date(timestamp);
            if (Number.isNaN(date.getTime())) return 'Unknown';
            return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
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
    text-decoration: none;
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

.profile-header-action:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
    outline-offset: 2px;
}

.article-full-name:last-child {
    gap: 8px;
}

.article-text.article-name {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    color: var(--color-text);
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

.article-text .underlined {
    color: var(--color-accent);
    font-weight: 600;
}

.organization-article-content {
    display: grid;
    grid-template-columns: minmax(180px, 0.65fr) minmax(0, 3fr);
    padding: 28px;
    gap: 24px;
}

.organization-logo-panel {
    display: flex;
    align-self: start;
    align-items: center;
    background: var(--color-surface-raised);
    border-radius: var(--radius-lg);
    padding: 20px;
    border: 1px solid var(--color-border);
}

.organization-info-table {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
    align-self: start;
    min-width: 0;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.organization-data-grid,
.organization-members-panel {
    min-width: 0;
}

.organization-members-heading {
    color: var(--color-accent);
    font-size: 16px;
    font-weight: 600;
}

.organization-members-heading {
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
}

.organization-members-panel .sources-container.members {
    max-height: 420px;
    padding: 14px;
}

.organization-members-panel {
    border-left: 1px solid var(--color-border);
}

.organization-empty-members {
    padding: 14px 16px;
    color: var(--color-text);
}

.article-logo {
    width: 100%;
    height: auto;
    max-height: 280px;
    object-fit: contain;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    color: var(--color-text);
}

.sources-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.sources-container.members {
    max-height: 200px;
    overflow-y: auto;
    padding-right: 8px;
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
    font-size: 15px;
    font-weight: 700;
}

.profile-option-name {
    max-width: 190px;
    overflow: hidden;
    font-size: 14px;
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
    .organization-article-content {
        grid-template-columns: minmax(0, 1fr);
    }

    .organization-logo-panel {
        grid-column: 1 / -1;
        width: min(100%, 520px);
        justify-self: center;
    }
}

@media (max-width: 700px) {
    .organization-info-table {
        grid-template-columns: minmax(0, 1fr);
    }

    .article-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .organization-logo-panel {
        grid-column: auto;
        width: 100%;
        padding: 20px;
    }

    .organization-members-panel {
        border-left: 0;
        border-top: 1px solid var(--color-border);
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
