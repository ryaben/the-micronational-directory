<script setup>
import DirectoryArticle from '../components/DirectoryArticle.vue';
import store from '../store';
</script>

<template>
    <div class="animation-error-avoider">
        <div v-show="micronationsDirectory.length === 0" class="loading-image-container">
            <img src="/images/loading.gif" alt="Loading">
            <label>Loading Directory...</label>
        </div>

        <DirectoryArticle v-if="requestedMicronation.info.length" id="entryPreview" class="info-displayed" :info="{
            name: {
                main: requestedMicronation.info[0].name.main,
                mainAlt: requestedMicronation.info[0].name.mainAlt,
                title: requestedMicronation.info[0].name.title,
                titleAlt: requestedMicronation.info[0].name.titleAlt
            },
            flag: requestedMicronation.info[0].flag,
            motto: requestedMicronation.info[0].motto,
            type: requestedMicronation.info[0].type,
            languages: requestedMicronation.info[0].languages,
            capital: requestedMicronation.info[0].capital,
            currency: requestedMicronation.info[0].currency,
            location: requestedMicronation.info[0].location,
            foundationDate: requestedMicronation.info[0].foundationDate,
            memberships: requestedMicronation.info[0].memberships,
            contactInfo: requestedMicronation.info[0].contactInfo,
            websites: requestedMicronation.info[0].websites,
            approved: true,
            author: requestedMicronation.info[0].author.name,
            creationDate: requestedMicronation.info[0].creationDate,
            previous: previousMicronation,
            next: nextMicronation
        }" />

        <p class="no-entries" v-if="micronationsDirectory.length && requestedMicronation.info.length === 0">There is no
            entry for a micronation with that name.</p>
    </div>
</template>
  
<script>
export default {
    data() {
        return {

        }
    },
    computed: {
        micronationsDirectory() {
            return store.getters.directory;
        },
        approvedMicronations() {
            return this.micronationsDirectory.filter(element => element.approved);
        },
        requestedMicronation() {
            const that = this;
            return {
                info: this.approvedMicronations.filter(element => element.name.main === that.$route.params.micronationName),
                index: this.approvedMicronations.findIndex(element => element.name.main === that.$route.params.micronationName)
            }
        },
        previousMicronation() {
            try {
                return this.approvedMicronations[this.requestedMicronation.index - 1].name.main;
            } catch {
                return false;
            }
        },
        nextMicronation() {
            try {
                return this.approvedMicronations[this.requestedMicronation.index + 1].name.main;
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
  