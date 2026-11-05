<script setup>
import OrganizationArticle from '../components/OrganizationArticle.vue';
import LimitedDirectoryArticle from '../components/LimitedDirectoryArticle.vue';
import store from '../store';
import { useDirectoryData } from '../composables/useDirectoryData.js';

defineProps({ organizationName: String, entryId: String });
const { micronationsDirectory, organizationsDirectory } = useDirectoryData();
</script>

<template>
    <div class="animation-error-avoider">
        <div v-show="organizationsDirectory.length === 0" class="loading-image-container">
            <img class="loading-image" src="/images/loading.gif" alt="Loading">
            <label>{{ $t('common.loadingDirectory') }}</label>
        </div>

        <LimitedDirectoryArticle v-if="requestedOrganization.info?.limited" entry-type="organization" :entry="requestedOrganization.info" />
        <OrganizationArticle v-else-if="requestedOrganization.info !== undefined" id="entryPreview" class="info-displayed"
            :micronations-directory="micronationsDirectory" :info="{
            id: requestedOrganization.info.id,
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
            uncertain: requestedOrganization.info.uncertain,
            approved: true,
            author: requestedOrganization.info.author.name,
            creationDate: requestedOrganization.info.creationDate,
            editHistory: requestedOrganization.info.editHistory,
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
                info: store.getters.organizations.filter(element => element.approved).find(element => that.entryId
                    ? String(element.id) === that.entryId
                    : String(element.id) === that.organizationName || element.name.main === that.organizationName),
                index: store.getters.organizations.filter(element => element.approved).findIndex(element => that.entryId
                    ? String(element.id) === that.entryId
                    : String(element.id) === that.organizationName || element.name.main === that.organizationName)
            }
        },
        previousOrganization() {
            try {
                return store.getters.organizations.filter(element => element.approved)[this.requestedOrganization.index - 1].name.main;
            } catch {
                return false;
            }
        },
        nextOrganization() {
            try {
                return store.getters.organizations.filter(element => element.approved)[this.requestedOrganization.index + 1].name.main;
            } catch {
                return false;
            }
        }
    }
}
</script>

