<script setup>
import OrganizationArticle from '../components/OrganizationArticle.vue';
import store from '../store';
</script>

<template>
    <div class="animation-error-avoider">
        <div v-show="organizationsDirectory.length === 0" class="loading-image-container">
            <img src="/images/loading.gif" alt="Loading">
            <label>Loading Directory...</label>
        </div>

        <OrganizationArticle v-if="requestedOrganization.info.length" id="entryPreview" class="info-displayed" :info="{
            name: {
                main: requestedOrganization.info[0].name.main,
                mainAlt: requestedOrganization.info[0].name.mainAlt
            },
            logo: requestedOrganization.info[0].logo,
            motto: requestedOrganization.info[0].motto,
            languages: requestedOrganization.info[0].languages,
            foundationDate: requestedOrganization.info[0].foundationDate,
            contactInfo: requestedOrganization.info[0].contactInfo,
            websites: requestedOrganization.info[0].websites,
            approved: true,
            author: requestedOrganization.info[0].author.name,
            creationDate: requestedOrganization.info[0].creationDate,
            previous: previousOrganization,
            next: nextOrganization
        }" />

        <p class="no-entries" v-if="organizationsDirectory.length && requestedOrganization.info.length === 0">There is no
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
        organizationsDirectory() {
            return store.getters.organizations;
        },
        approvedOrganizations() {
            return this.organizationsDirectory.filter(element => element.approved);
        },
        requestedOrganization() {
            const that = this;
            return {
                info: this.approvedOrganizations.filter(element => element.name.main === that.$route.params.organizationName),
                index: this.approvedOrganizations.findIndex(element => element.name.main === that.$route.params.organizationName)
            }
        },
        previousOrganization() {
            try {
                return this.approvedOrganizations[this.requestedOrganization.index - 1].name.main;
            } catch {
                return false;
            }
        },
        nextOrganization() {
            try {
                return this.approvedOrganizations[this.requestedOrganization.index + 1].name.main;
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
  