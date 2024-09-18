<script setup>
import OrganizationArticle from '../components/OrganizationArticle.vue';
import store from '../store';

defineProps({
    organizationName: {
        id: String
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
    organizationsApprovedDirectory: {
        type: Array,
        required: false,
        default: store.getters.organizations.filter(element => element.approved)
    }
});
</script>

<template>
    <div class="animation-error-avoider">
        <div v-show="organizationsDirectory.length === 0" class="loading-image-container">
            <img class="loading-image" src="/images/loading.gif" alt="Loading">
            <label>Loading Directory...</label>
        </div>

        <OrganizationArticle v-if="requestedOrganization.info !== undefined" id="entryPreview" class="info-displayed"
            :micronations-directory="micronationsDirectory" :info="{
            name: {
                main: requestedOrganization.info.name.main,
                mainAlt: requestedOrganization.info.name.mainAlt
            },
            logo: requestedOrganization.info.logo,
            motto: requestedOrganization.info.motto,
            languages: requestedOrganization.info.languages,
            foundationDate: requestedOrganization.info.foundationDate,
            contactInfo: requestedOrganization.info.contactInfo,
            websites: requestedOrganization.info.websites,
            approved: true,
            author: requestedOrganization.info.author.name,
            creationDate: requestedOrganization.info.creationDate,
            previous: previousOrganization,
            next: nextOrganization
        }" />

        <p class="no-entries" v-if="organizationsDirectory.length && requestedOrganization.info === undefined">There is
            no
            entry for an organization with that name.</p>
    </div>
</template>

<script>
export default {
    components: {
        OrganizationArticle
    },
    data() {
        return {

        }
    },
    computed: {
        requestedOrganization() {
            const that = this;
            return {
                info: this.organizationsApprovedDirectory.find(element => element.name.main === that.organizationName),
                index: this.organizationsApprovedDirectory.findIndex(element => element.name.main === that.organizationName)
            }
        },
        previousOrganization() {
            try {
                return this.organizationsApprovedDirectory[this.requestedOrganization.index - 1].name.main;
            } catch {
                return false;
            }
        },
        nextOrganization() {
            try {
                return this.organizationsApprovedDirectory[this.requestedOrganization.index + 1].name.main;
            } catch {
                return false;
            }
        }
    }
}
</script>

<style scoped>
.no-entries {
    width: auto;
    font-size: 22px;
    text-align: center;
}
</style>