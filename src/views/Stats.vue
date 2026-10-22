<script setup>
import store from '../store';
import EntriesRanking from '../components/EntriesRanking.vue';
import ContestOverview from '../components/ContestOverview.vue';
import { useDirectoryData } from '../composables/useDirectoryData.js';

const { micronationsApprovedDirectory, organizationsApprovedDirectory, user } = useDirectoryData();
</script>

<template>
    <section class="site-section stats-page">
        <header class="stats-hero">
            <h1>Community statistics</h1>
            <p class="stats-intro">Explore the contributors behind our growing directories. Every approved entry helps preserve micronational history. Want to take part? <router-link to="/login">Create an account</router-link> and <router-link to="/new-entry">submit an entry</router-link>.</p>
        </header>
        <div class="stats-overview" aria-label="Directory totals">
            <article class="overview-card"><span class="overview-label">Micronations</span><strong class="overview-value">{{ micronationsApprovedDirectory.length }}</strong><span class="overview-caption">approved directory entries</span></article>
            <article class="overview-card"><span class="overview-label">Organizations</span><strong class="overview-value">{{ organizationsApprovedDirectory.length }}</strong><span class="overview-caption">approved directory entries</span></article>
            <article class="overview-card overview-note"><span class="overview-label">Community recognition</span><strong class="overview-value">50+</strong><span class="overview-caption">entries earns a place in <router-link to="/about">Special thanks</router-link></span></article>
        </div>
        <section class="stats-section" aria-labelledby="contributors-title">
            <div class="section-heading"><div><h2 id="contributors-title">Contributors</h2></div><p>All-time submissions across each directory</p></div>
        <div class="tables-container">
            <div class="ranking-container ranking-panel">
                <EntriesRanking title="Top Micronations Contributors" :tmd-entry="true"
                    directory="micronations" :micronations-approved-directory="micronationsApprovedDirectory"
                    :organizations-approved-directory="organizationsApprovedDirectory"
                    :current-user-email="user.email" />
            </div>

            <div class="ranking-container ranking-panel">
                <EntriesRanking title="Top Organizations Contributors" :tmd-entry="true"
                    directory="organizations" :micronations-approved-directory="micronationsApprovedDirectory"
                    :organizations-approved-directory="organizationsApprovedDirectory"
                    :current-user-email="user.email" />
            </div>

        </div>
        </section>
        <section class="stats-section contests-section" aria-labelledby="contests-title">
            <div class="section-heading">
                <div>
                    <h2 id="contests-title">Contests history</h2>
                </div>
                <p class="contest-terms"><router-link to="/terms-of-contests">Terms and conditions for contests</router-link></p>
            </div>
        <!-- <div class="tables-container">
            <ContestOverview :contest-info="activeContest" />
            <EntriesRanking title="Ongoing Ranking" :tmd-entry="false"
                :start-timestamp="(activeContest.startDate.seconds || activeContest.startDate._seconds)" :end-timestamp="(activeContest.endDate.seconds || activeContest.endDate._seconds)" />
            </div> -->
        <div class="tables-container">
            <div class="ranking-container">
                <div class="stats-container contest-history">
                    <div class="scrollable-container statistics-table directory">
                        <p class="table-header">Event</p>
                        <p class="table-header">Start date</p>
                        <p class="table-header">End date</p>

                        <div v-for="(contest, i) in contestsList" :key="i"
                            class="table-values-container clickable first" @click="selectedContest = contest">
                            <p class="table-value">{{ contest.name }}</p>
                        </div>
                        <div v-for="(contest, i) in contestsList" :key="i"
                            class="table-values-container clickable second" @click="selectedContest = contest">
                            <p class="table-value">{{ new Date((contest.startDate.seconds || contest.startDate._seconds) * 1000).toDateString() }}</p>
                        </div>
                        <div v-for="(contest, i) in contestsList" :key="i"
                            class="table-values-container clickable third" @click="selectedContest = contest">
                            <p class="table-value">{{ new Date((contest.endDate.seconds || contest.endDate._seconds) * 1000).toDateString() }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ranking-container ranking-panel contest-ranking-panel">
                <Transition name="fade">
                    <EntriesRanking v-if="selectedContest" :title="selectedContest.name" :tmd-entry="false"
                        :directory="selectedContest.directory" :start-timestamp="(selectedContest.startDate.seconds || selectedContest.startDate._seconds)"
                        :end-timestamp="(selectedContest.endDate.seconds || selectedContest.endDate._seconds)"
                        :micronations-approved-directory="micronationsApprovedDirectory"
                        :organizations-approved-directory="organizationsApprovedDirectory"
                        :current-user-email="user.email" />
                </Transition>
                <p v-if="!selectedContest" class="contest-empty-state">Select a contest from the list to see its contributor ranking.</p>
            </div>
        </div>
    </section>
    </section>
</template>

<script>
export default {
    components: {
        EntriesRanking,
        ContestOverview
    },
    data() {
        return {
            selectedContest: ''
        }
    },
    computed: {
        contestsList() {
            return store.getters.contests;
        },
        typeValues() {
            return this.collectDirectoryValues(store.getters.micronations.filter(entry => entry.approved), 'type', 'descending');
        },
        languageValues() {
            return this.collectDirectoryValues(store.getters.micronations.filter(entry => entry.approved), 'languages', 'descending');
        },
        membershipValues() {
            return this.collectDirectoryValues(store.getters.micronations.filter(entry => entry.approved), 'memberships', 'descending');
        },
        activeContest() {
            return this.findContest('BJdYq4eegJuYLwz3lfvd');
        }
    },
    methods: {
        collectDirectoryValues(array, propertyValue, sorting) {
            let collectedValues = [];
            let collectedValuesObject = {};
            let collectedValuesArray = [];

            array.forEach(function (element) {
                if (element[propertyValue] != false) {
                    element[propertyValue].forEach(function (property) {
                        collectedValues.push(property);
                    });
                }
            });

            for (const prop of collectedValues) {
                collectedValuesObject[prop] = collectedValuesObject[prop] ? collectedValuesObject[prop] + 1 : 1;
            }
            for (const [key, value] of Object.entries(collectedValuesObject)) {
                collectedValuesArray.push({
                    key: key,
                    amount: value
                });
            }

            switch (sorting) {
                case 'ascending':
                    collectedValuesArray.sort((a, b) => a.amount - b.amount);
                    break;
                case 'descending':
                    collectedValuesArray.sort((a, b) => b.amount - a.amount);
                    break;
                default:
                    break;
            }

            return collectedValuesArray;
        },
        findContest(contestId) {
            return this.contestsList.find(function (element) {
                return element.id === contestId;
            });
        }
    },
    async mounted() {
        if (!store.getters.contests.length) await store.dispatch('getContests');
    }
}
</script>

<style scoped>
.stats-page { display:flex; flex-direction:column; align-items:center; gap:28px; }
.stats-hero { width:min(100%, 820px); margin:4px auto 0; text-align:center; }
.stats-hero h1 { margin:0; }
.stats-intro { max-width:680px; margin:12px auto 0; color:var(--color-muted); font-size:16px; }
.stats-overview { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; width:100%; }
.overview-card { display:flex; flex-direction:column; gap:3px; min-height:125px; padding:18px 20px; border:1px solid var(--color-border); border-radius:var(--radius-xl); background:linear-gradient(145deg,var(--color-surface-raised),var(--color-surface)); }
.overview-label,.overview-caption { color:var(--color-muted); }
.overview-label { font-size:13px; font-weight:650; }
.overview-caption { font-size:12px; }
.overview-value { color:var(--color-heading); font-size:32px; line-height:1.2; }
.stats-section { width:100%; }
.section-heading { margin-bottom:14px; }
.section-heading h2 { margin:0; }
.section-heading > p { max-width:440px; margin:0 0 3px; color:var(--color-muted); text-align:right; }
.section-heading > p.contest-terms { max-width:none; white-space:nowrap; }
.tables-container { display:flex; align-items:stretch; gap:18px; width:100%; }
.ranking-container { display:flex; flex-direction:column; align-items:center; min-width:0; width:100%; }
.ranking-panel,.contest-history { padding:18px; border:1px solid var(--color-border); border-radius:var(--radius-xl); background:var(--color-background-soft); }
.contest-ranking-panel { justify-content:center; min-height:250px; }
.contest-empty-state { margin:0; color:var(--color-muted); text-align:center; }
.ranking-container :deep(.stats-container) { width:100%; }
.ranking-container :deep(.container-title) { min-height:2.5em; margin:0 0 14px; font-size:19px; }
.ranking-container :deep(.contributors-ranking) { max-height:390px; border-radius:var(--radius-lg); background:var(--color-surface); }
.contest-history h2 { margin-top:0; font-size:19px; }
.statistics-table.directory { display:grid; grid-template-columns:1.3fr 1fr 1fr; grid-template-rows:min-content; min-height:0; max-height:390px; }
.table-header { position:sticky; top:0; z-index:1; margin:0; padding:10px 6px; background:var(--color-background-mute); color:var(--color-heading); font-size:13px; font-weight:700; text-align:center; }
.table-values-container { display:flex; flex-direction:column; align-items:center; height:fit-content; }
.table-values-container:nth-of-type(even),.table-header:nth-of-type(even) { border-right:1px solid var(--color-border); border-left:1px solid var(--color-border); }
.table-values-container.clickable { cursor:pointer; }
.table-values-container.clickable:hover { background:var(--navbar-tab-background-color-hover); }
.table-value { display:flex; align-items:center; justify-content:center; width:100%; min-height:44px; margin:0; padding:8px; border-bottom:1px solid var(--color-border); text-align:center; font-size:13px; }
.contests-section > .tables-container > .ranking-container { flex:1; }
@media (max-width:760px) { .stats-page { gap:22px; } .stats-overview { grid-template-columns:repeat(2,minmax(0,1fr)); } .overview-note { grid-column:1 / -1; min-height:auto; } .section-heading { align-items:start; flex-direction:column; gap:6px; } .section-heading > p { text-align:left; white-space:normal; } .contests-section > .tables-container { flex-direction:column; } }
@media (max-width:500px) { .stats-overview { gap:9px; } .overview-card { min-height:110px; padding:14px; } .overview-value { font-size:27px; } .ranking-panel,.contest-history { padding:12px; } .ranking-container :deep(.container-title) { font-size:17px; } }
</style>

