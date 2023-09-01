<script setup>
import store from '../store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/init.js';
</script>

<template>
    <section class="site-section">
        <div class="events-bar">
            <p class="events-notice">Future events or submission campaigns will be listed here, and you'll be able to follow up the terms and
                everything related. In them, <b>the users with most contributions will qualify for prizes</b>. Also, <b>contributions provided
                now will count for the first event</b>, when the time comes. So you are already playing!</p>
        </div>
        <div class="tables-container">
            <div class="stats-container">
                <h2>Directory Statistics</h2>
                <p class="stats-entry main">Total micronations: <b>{{ micronationsDirectory.length }}</b></p>
                <div class="scrollable-container statistics-table directory">
                    <p class="table-header">Type</p>
                    <p class="table-header">Language</p>
                    <p class="table-header">Membership</p>

                    <div class="table-values-container">
                        <p v-for="(entry, i) in typeValues" :key="i" class="table-value">{{ entry.key }}: <b>{{ entry.amount
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
                </div>
            </div>
            <div class="stats-container">
                <h2>All-time Top Contributors</h2>
                <div class="contributor-entry special">
                    <p class="contributor-name">The Micronational Directory Team</p>
                    <p class="contributor-contributions">{{ countContributions(micronationsDirectory,
                        "themicronationaldirectory@gmail.com") }}</p>
                </div>
                <div class="scrollable-container contributors-ranking">
                    <div v-for="(contributor, i) in contributorsList" :key="i" class="contributor-entry"
                        :class="{ 'current-user': contributor.email === user.email, 'hidden': contributor.email === 'themicronationaldirectory@gmail.com' }">
                        <p class="contributor-rank">{{ i + 1 }}.</p>
                        <p class="contributor-name">{{ contributor.name }}<span
                                v-if="contributor.email === user.email">&nbsp;(it's you!)</span></p>
                        <p class="contributor-contributions">{{ contributor.contributions }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
  
<script>
export default {
    data() {
        return {
            user: {}
        }
    },
    computed: {
        micronationsDirectory() {
            return store.getters.directory;
        },
        contributorsList() {
            return this.listContributors(this.micronationsDirectory);
        },
        typeValues() {
            return this.collectDirectoryValues(this.micronationsDirectory, 'type');
        },
        languageValues() {
            return this.collectDirectoryValues(this.micronationsDirectory, 'languages');
        },
        membershipValues() {
            return this.collectDirectoryValues(this.micronationsDirectory, 'memberships');
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
        collectDirectoryValues(array, propertyValue) {
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

            collectedValuesArray.sort(function (a, b) {
                return b.amount - a.amount;
            });

            return collectedValuesArray;
        },
        listContributors(array) {
            let contributors = [];
            const that = this;

            array.forEach(function (element) {
                if (!contributors.some(el => el.email === element.author.email)) {
                    contributors.push({
                        name: element.author.name,
                        email: element.author.email,
                        contributions: that.countContributions(array, element.author.email)
                    });
                }
            });

            let tmd = contributors.find(function (element) {
                return element.email === 'themicronationaldirectory@gmail.com';
            });
            contributors.splice(contributors.indexOf(tmd), 1);

            contributors.sort(function (a, b) {
                return b.contributions - a.contributions;
            });

            return contributors;
        },
        countContributions(array, value) {
            let count = 0;

            array.forEach(element => {
                if (element.author.email === value) {
                    count += 1;
                }
            });

            return count;
        }
    },
    async mounted() {
        this.authListener();
    }
}
</script>
  
<style scoped>
.site-section {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.events-bar {
    display: flex;
    justify-content: center;
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

.stats-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
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


.table-value {
    margin: 0;
    padding: 10px 0 10px 0;
    width: 100%;
    text-align: center;
    border-bottom: 2px solid var(--vt-c-white);
}

/* .table-value:last-of-type {
    border-bottom: none;
} */

.stats-entry {
    font-size: 18px;
}

.stats-entry.main {
    text-align: center;
    font-size: 20px;
    padding: 3px 12px 3px 12px;
    border-radius: 8px;
    border: 2px solid white;
    margin-bottom: 25px;
}

.contributor-entry {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 3px solid var(--vt-c-indigo);
    padding: 0 10px 0 10px;
}

.contributor-entry.hidden {
    display: none;
}

.contributor-entry.special {
    padding: 5px;
    width: 85%;
    border-bottom: none;
    margin-bottom: 13px;
}

.contributor-entry.current-user {
    background-color: var(--vt-c-white);
    color: var(--vt-c-black);
}

.contributors-ranking .contributor-entry:nth-of-type(1) {
    background: linear-gradient(138deg, var(--gold) 0%, var(--gold-dark) 70%);
}

.contributors-ranking .contributor-entry:nth-of-type(1) p:nth-child(2)::after {
    content: "🥇";
}

.contributors-ranking .contributor-entry:nth-of-type(2) {
    background: linear-gradient(138deg, var(--silver) 0%, var(--silver-dark) 70%);
}

.contributors-ranking .contributor-entry:nth-of-type(2) p:nth-child(2)::after {
    content: "🥈";
}

.contributors-ranking .contributor-entry:nth-of-type(3) {
    background: linear-gradient(138deg, var(--bronze) 0%, var(--bronze-dark) 70%);
}

.contributors-ranking .contributor-entry:nth-of-type(3) p:nth-child(2)::after {
    content: "🥉";
}

.contributors-ranking .contributor-entry:nth-of-type(1) p,
.contributors-ranking .contributor-entry:nth-of-type(2) p,
.contributors-ranking .contributor-entry:nth-of-type(3) p {
    color: var(--vt-c-black);
}

.contributors-ranking .contributor-entry:last-of-type {
    border-bottom: none;
}

.contributor-rank {
    font-size: 17px;
    margin-right: 5px;
    font-weight: bold;
}

.contributor-name {
    font-size: 17px;
    width: 100%;
    font-weight: bold;
}

.contributor-contributions {
    font-size: 20px;
    font-weight: bold;
}
</style>
  