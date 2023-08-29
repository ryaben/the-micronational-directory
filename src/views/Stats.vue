<script setup>
import store from '../store';
</script>

<template>
    <section class="site-section">
        <div class="stats-container">
            <h2>Directory Statistics</h2>
            <p class="stats-entry main">Total micronations: <b>{{ micronationsDirectory.length }}</b></p>
            <div class="statistics-table directory">
                <p class="table-header">Type</p>
                <p class="table-header">Language</p>
                <p class="table-header">Membership</p>
            </div>
        </div>
        <div class="stats-container">
            <h2>All-time Top Contributors</h2>
            <div class="contributor-entry special">
                <p class="contributor-name">The Micronational Directory Team</p>
                <p class="contributor-contributions">{{ this.countContributions(micronationsDirectory, "themicronationaldirectory@gmail.com") }}</p>
            </div>
            <div class="contributors-ranking">
                <div v-for="(contributor, i) in contributorsList" :key="i" class="contributor-entry"
                    :class="{ 'current-user': contributor.email === this.user.email, 'hidden': contributor.email === 'themicronationaldirectory@gmail.com' }">
                    <p class="contributor-rank">{{ i + 1 }}.</p>
                    <p class="contributor-name">{{ contributor.name }}<span
                            v-if="contributor.email === this.user.email">&nbsp;(it's you!)</span></p>
                    <p class="contributor-contributions">{{ contributor.contributions }}</p>
                </div>
            </div>
        </div>
    </section>
</template>
  
<script>
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/init.js';

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

            let tmd = contributors.find(function(element) {
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
    justify-content: space-between
}

.stats-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
}

.contributors-ranking,
.statistics-table {
    display: flex;
    flex-direction: column;
    width: 85%;
    border: 3px solid var(--vt-c-indigo);
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    min-height: 350px;
    max-height: 350px;
    overflow-y: scroll;
}

.statistics-table.directory {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    row-gap: 10px;
}

.table-header {
    font-size: 16px;
    text-align: center;
    font-weight: bold;
}

.stats-entry {
    font-size: 18px;
}

.stats-entry.main {
    text-align: center;
    font-size: 20px;
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
    width: 85%;
    border-bottom: none;
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
  