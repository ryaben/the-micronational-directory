<script setup>
import { checkHref, checkIcon, cleanString } from '../assets/EntrySourceFunctions';
import EntrySource from '../components/EntrySource.vue';
import MemberSource from '../components/MemberSource.vue';
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
})
</script>

<template>
    <Transition mode="out-in">
        <div class="directory-article-container" :key="componentKey">
            <div class="article-title">
                <div class="article-full-name">
                    <p class="article-text article-name">
                        <b>{{ info.name.main }}</b>&nbsp;({{ info.name.mainAlt }})
                    </p>
                </div>
                <div class="article-full-name">
                    <span class="article-text">Try more info at:</span>
                    <div class="external-container">
                        <EntrySource class="entry-source" :flag-source="info.logo" :size="46"
                            :micronation-name="info.name.main" :icon="'MicroWiki'"
                            :href="'https://micronations.wiki/wiki/' + info.name.mainAlt" />
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-column logo">
                    <img :src="info.logo" class="article-logo" alt="Logo">
                </div>

                <div class="article-column">
                    <p class="article-text"><span class="underlined">Organization motto:</span><br><span
                            v-if="info.motto !== ''" class="italicized">"{{
            info.motto }}"</span><span v-if="info.motto === ''">No motto.</span></p>
                    <p class="article-text"><span class="underlined">Foundation:</span><br>{{
            cleanTimestamp(info.foundationDate) }}</p>
                    <p class="article-text">
                        <span class="underlined">Languages:</span><br>
                        <span v-for="(language, i) in info.languages" :key="i">{{ language }}<span
                                v-if="i !== info.languages.length - 1">,&nbsp;</span><span
                                v-if="i === info.languages.length - 1">.</span></span>
                    </p>
                </div>

                <div class="article-column">
                    <div class="entry-group extended">
                        <p class="article-text"><span class="underlined">Historical members:</span></p>
                        <div class="sources-container members">
                            <MemberSource class="member-source" v-for="(member, i) in getMembers" :key="i"
                                :href="'/directory/' + member.name.main" :flag-source="member.flag" :width="60"
                                :height="40" :micronation-name="member.name.main" :icon="'flag'" />
                        </div>
                    </div>
                </div>

                <div class="article-column">
                    <div>
                        <p class="article-text breakable underlined">Contact media:
                            <span v-if="!info.contactInfo.length"><br>N/A.</span>
                        </p>
                        <div class="sources-container">
                            <EntrySource class="entry-source" v-for="(contact, i) in info.contactInfo" :key="i"
                                :href="contact" :flag-source="info.logo" :size="46" :micronation-name="info.name.main"
                                :icon="checkIcon(contact, info.name.main)" />
                        </div>
                    </div>

                    <div>
                        <p class="article-text breakable underlined">Info sources:</p>
                        <div class="sources-container">
                            <EntrySource class="entry-source" v-for="(website, i) in info.websites" :key="i"
                                :href="website" :flag-source="info.logo" :size="46" :micronation-name="info.name.main"
                                :icon="checkIcon(website, info.name.main)" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="article-profiles-control">
                <span v-if="!info.previous">This is the first entry.</span>
                <router-link v-if="info.previous" :to="'/organizations/' + info.previous" @click="incrementKey"
                    class="profile-option login-button color-transition">
                    ⬅️ Previous<br>{{ info.previous }}
                </router-link>
                <span class="article-text contribution-info">Submitted by <b>{{ info.author }}</b> on {{
            cleanTimestamp(info.creationDate) }}.</span>
                <router-link v-if="info.next" :to="'/organizations/' + info.next" @click="incrementKey"
                    class="profile-option login-button color-transition">
                    Next ➡️<br>{{ info.next }}
                </router-link>
                <span v-if="!info.next">This is the last entry.</span>
            </div>
        </div>
    </Transition>
</template>

<script>
export default {
    name: 'OrganizationArticle',
    data() {
        return {
            componentKey: 0
        }
    },
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
        generateMFALink(organization) {
            const cleanString = organization.replace(/\s+/g, '-').toLowerCase();
            return cleanString;
        },
        cleanTimestamp(timestamp) {
            return new Date(timestamp.seconds * 1000).toDateString();
        },
        incrementKey() {
            this.componentKey++;
        }
    }
}
</script>

<style scoped>
.directory-article-container {
    background-color: var(--directory-entry-background-color);
    color: var(--directory-entry-text-color);
    border-radius: 8px;
    border: 2px solid var(--site-section-border-color);
    padding: 15px;
    margin: 0 3px 6px 3px;
    width: auto;
}

.article-content {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    column-gap: 15px;
    height: max-content;
    max-height: max-content;
}

.profile-option {
    width: 15%;
    height: min-content;
    font-size: 14px;
    text-decoration: none;
    text-align: center;
    border-width: 1px;
}

.external-container {
    display: flex;
    margin-left: 5px;
}

.article-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-evenly;
    border-right: 1px solid white;
    padding: 0 5px 0 5px;
}

.article-column:first-of-type,
.article-column:last-of-type {
    border-right: none;
}

.article-column.logo {
    align-items: center;
}

.article-logo {
    width: 100%;
    height: auto;
    max-height: 250px;
}

.article-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid white;
    margin-bottom: 15px;
    padding-bottom: 5px;
}

.article-full-name {
    display: flex;
    align-items: center;
}

.article-profiles-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 2px solid white;
    margin-top: 15px;
    padding-top: 10px;
}

.contribution-info {
    text-align: center;
}

.article-text {
    font-size: 17px;
    margin-block-start: 0;
    margin-block-end: 0;
    word-break: break-word;
    overflow-wrap: break-word;
}

.article-text.breakable {
    word-break: break-all;
}

.article-text.article-name {
    font-size: 22px;
    margin-block-start: 0px;
    margin-right: 6px;
}

.article-text.article-alt-name {
    font-size: 18px;
    font-style: italic;
}

.sources-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.sources-container.members {
    margin-top: 4px;
    padding: 2px 0 2px 0;
    height: 180px;
    width: auto;
    overflow-y: auto;
    align-content: start;
}

.member-source {
    margin-bottom: 4px;
}

.entry-source {
    margin-right: 4px;
}

.entry-source:last-of-type {
    margin-right: 0;
}

.contact-email,
.website-link,
.article-profiles-control a.profile-option {
    display: flex;
    align-items: center;
    word-break: break-all;
    overflow: hidden;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
}

.article-profiles-control a.profile-option {
    padding: 4px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
}

.contact-email a {
    color: var(--directory-contact-email-color);
}

.website-link a {
    color: var(--directory-website-link-color);
}

.website-link.centered {
    display: flex;
    align-items: center;
}

#MFALink {
    margin: 10px 0 0 0;
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.15s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
