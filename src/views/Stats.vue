<script setup>
import store from '../store';
import EntriesRanking from '../components/EntriesRanking.vue';
import ContestOverview from '../components/ContestOverview.vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/init.js';
</script>

<template>
    <section class="site-section">
        <div class="events-bar">
            <p class="events-notice">
                These are the rankings for most entries submitted, on both micronations and organizations directories.
                We thank a lot all these users who participated on our platform by adding a piece of micronational
                legacy
                and history. Remember that anybody can participate on TMD! You just need to <router-link :to="'/login'">
                    register and verify you account</router-link> and then head to our <router-link :to="'/new-entry'">
                    new entry form</router-link>. Contributors that reach 50+ entries on The Micronational Directory are
                featured on the <router-link :to="'/about'">'Special thanks'</router-link> section of our website!
            </p>
        </div>
        <div class="tables-container">
            <div class="ranking-container">
                <p class="stats-entry main">Total micronations: <b>{{
                    micronationsApprovedDirectory.length }}</b></p>
                <EntriesRanking title="All-time Top Micronations Contributors" :tmd-entry="true"
                    directory="micronations" :current-user-email="user.email" />
            </div>

            <div class="ranking-container">
                <p class="stats-entry main">Total organizations: <b>{{
                    organizationsApprovedDirectory.length }}</b></p>
                <EntriesRanking title="All-time Top Organizations Contributors" :tmd-entry="true"
                    directory="organizations" :current-user-email="user.email" />
            </div>

            <!-- <div class="scrollable-container statistics-table directory">
                    <p class="table-header">Type</p>
                    <p class="table-header">Language</p>
                    <p class="table-header">Memberships</p>

                    <div class="table-values-container">
                        <p v-for="(entry, i) in typeValues" :key="i" class="table-value">{{ entry.key }}: <b>{{
                        entry.amount
                    }}</b></p>
                    </div>
                    <div class="table-values-container">
                        <p v-for="(entry, i) in languageValues" :key="i" class="table-value">{{ entry.key }}: <b>{{
                        entry.amount
                    }}</b></p>
                    </div>
                    <div class="table-values-container">
                        <p v-for="(entry, i) in membershipValues" :key="i" class="table-value">{{ entry.key }}: <b>{{
                        entry.amount }}</b></p>
                    </div>
                </div> -->
        </div>

        <hr class="divider" />

        <div class="events-bar">
            <p class="events-notice">Future events or submission campaigns will be listed here, and you'll be able
                to follow up the terms and everything related. In them, <b>users with most contributions will qualify
                    for prizes</b>. Carefully read the <router-link :to="'/terms-of-contests'">terms and
                    conditions</router-link> to know all the details. To check past contests, check the table below
                and click on any desired row.
            </p>
        </div>
        <!-- <div class="tables-container">
            <ContestOverview :contest-info="activeContest" />
            <EntriesRanking title="Ongoing Ranking" :tmd-entry="false"
                :start-timestamp="activeContest.startDate.seconds" :end-timestamp="activeContest.endDate.seconds" />
            </div> -->
        <div class="tables-container">
            <div class="ranking-container">
                <div class="stats-container">
                    <h2>Contests History</h2>
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
                            <p class="table-value">{{ new Date(contest.startDate.seconds * 1000).toDateString() }}</p>
                        </div>
                        <div v-for="(contest, i) in contestsList" :key="i"
                            class="table-values-container clickable third" @click="selectedContest = contest">
                            <p class="table-value">{{ new Date(contest.endDate.seconds * 1000).toDateString() }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ranking-container">
                <Transition name="fade">
                    <EntriesRanking v-if="selectedContest" :title="selectedContest.name" :tmd-entry="false"
                        :directory="selectedContest.directory" :start-timestamp="selectedContest.startDate.seconds"
                        :end-timestamp="selectedContest.endDate.seconds" :current-user-email="user.email" />
                </Transition>
            </div>
        </div>
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
            user: {},
            selectedContest: ''
        }
    },
    computed: {
        micronationsApprovedDirectory() {
            return store.getters.micronations.filter(element => element.approved);
        },
        organizationsApprovedDirectory() {
            return store.getters.organizations.filter(element => element.approved);
        },
        contestsList() {
            return store.getters.contests;
        },
        typeValues() {
            return this.collectDirectoryValues(this.micronationsApprovedDirectory, 'type', 'descending');
        },
        languageValues() {
            return this.collectDirectoryValues(this.micronationsApprovedDirectory, 'languages', 'descending');
        },
        membershipValues() {
            return this.collectDirectoryValues(this.micronationsApprovedDirectory, 'memberships', 'descending');
        },
        activeContest() {
            return this.findContest('BJdYq4eegJuYLwz3lfvd');
        }
    },
    methods: {
        authListener() {
            onAuthStateChanged(auth, user => {
                if (user) {
                    this.user = JSON.parse(localStorage.getItem('firebase-auth-user'));
                }
            });
        },
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
        this.authListener();
    }
}
</script>

<style scoped>
hr.divider {
    width: 95%;
    margin: 30px 0 30px 0;
}

.site-section {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.events-bar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 80%;
    margin-bottom: 25px;
}

.events-notice {
    text-align: center;
}

.tables-container {
    display: flex;
    width: 100%;
}

#rankingsContainer {
    display: flex;
    width: 100%;
    justify-content: center;
}

.ranking-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.statistics-table.directory {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: min-content;
}

.table-header {
    font-size: 16px;
    text-align: center;
    font-weight: bold;
    background-color: var(--vt-c-divider-dark-1);
    margin: 0;
    padding-top: 10px;
    padding-bottom: 10px;
}

.table-values-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: fit-content;
}

.table-values-container:nth-of-type(even),
.table-header:nth-of-type(even) {
    border-right: 2px solid var(--vt-c-white);
    border-left: 2px solid var(--vt-c-white);
}

.table-values-container:first-of-type,
.table-header:first-of-type {
    border-left: none;
}

.table-values-container:last-of-type,
.table-header:last-of-type {
    border-right: none;
}

.table-values-container.clickable {
    cursor: pointer;
}

.table-value {
    margin: 0;
    padding: 10px 0 10px 0;
    width: 100%;
    text-align: center;
    border-bottom: 2px solid var(--vt-c-white);
}

.stats-container {
    width: 80%;
}

.stats-container:deep(.contributors-ranking),
.stats-container:deep(.statistics-table) {
    width: 100%;
}

.stats-entry {
    font-size: 18px;
}

.stats-entry.main {
    text-align: center;
    font-size: 20px;
    padding: 3px 12px 3px 12px;
    border-radius: 8px;
    border: 2px solid var(--vt-c-white);
    margin-bottom: 15px;
    margin-right: 8px;
    width: fit-content;
}

.stats-entry.main:last-of-type {
    margin-right: 0;
}

.half-sized {
    width: 50%;
}
</style>