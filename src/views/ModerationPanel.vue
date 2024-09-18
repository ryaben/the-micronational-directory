<script setup>
import store from '../store';

defineProps({
    moderatorsList: {
        type: Array,
        required: true,
        default: store.getters.moderators
    },
    userIsModerator: {
        type: Boolean,
        required: false,
        default: false
    },
    user: {
        type: Object,
        required: true,
        default: {}
    },
});
</script>

<template>
    <section class="site-section">
        <div v-if="userIsModerator">
            <h2 class="centered">Welcome to the <span class="underlined">Moderation Tools Panel</span>, {{
            user.displayName }}
            </h2>

            <div class="options-container">
                <div class="option-column">
                    <h3 class="option-column-title">User-made entries approval</h3>
                    <p class="option-description">
                        Access an unpublished directory that contains only offline, user-submitted entries. You can
                        approve them so they immediately get published to the definitive Directory, or reject (and
                        delete) them instead if they don't comply with our requirements. Users are automatically
                        notified via email for every action performed here.
                    </p>
                    <router-link :to="'/moderation'" class="styled-link login-button color-transition">Use
                        directory</router-link>
                </div>
                <div class="option-column">
                    <h3 class="option-column-title">MediaWiki API reader</h3>
                    <p class="option-description">
                        A webtool that automatically renders potential entries out of an array of articles of certain
                        category, gathered using a request on the MediaWiki API. These potential entries attempt to
                        process data from the articles, but since in most wikis there's not strict standard for writing
                        the info, most times not all fields are correctly populated.
                    </p>
                    <router-link :to="'/mediawiki-reader'" class="styled-link login-button color-transition">Use
                        MediaWiki tool</router-link>
                </div>
                <div class="option-column">
                    <h3 class="option-column-title">Google My Maps processor</h3>
                    <p class="option-description">
                        Another webtool that renders cards containing geoposition for micronations, obtained out of KML
                        files downloaded from Google My Map's maps. Each card includes a title of the pin, the
                        coordinates, a description included by the creator, and attempts to detect if there's already
                        an entry for the micronation on TMD. If so, you can add (or update) the geophysical location to
                        it.
                    </p>
                    <router-link :to="'/googlemymaps-reader'" class="styled-link login-button color-transition">Use map
                        processor</router-link>
                </div>
            </div>
        </div>
        <div v-if="!userIsModerator">
            You don't have sufficient privileges in order to use moderation tools.
        </div>
    </section>
</template>

<script>
export default {
    components: {

    },
    data() {
        return {

        }
    }
}
</script>

<style scoped>
.centered {
    text-align: center;
}

.options-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 20px;
    margin-top: 30px;
}

.option-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid var(--site-section-border-color);
    border-radius: 8px;
    background-color: var(--vt-c-black-mute);
    padding: 12px;
}

.option-column-title {
    font-size: 20px;
    text-align: center;
}

.option-description {
    text-align: justify;
    text-justify: auto;
    margin-bottom: 20px;
}

.multi-buttons-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.styled-link {
    width: 48%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    text-align: center;
}
</style>
