<script setup>
import store from '../store';
import { auth } from '../firebase/init.js';

defineProps({
    title: {
        type: String,
        required: false,
        default: "Entries ranking"
    },
    tmdEntry: {
        type: Boolean,
        required: false,
        default: false
    },
    startTimestamp: {
        type: Number,
        required: false,
        default: 653067132
    },
    endTimestamp: {
        type: Number,
        required: false,
        default: 7280033532
    }
})
</script>

<template>
    <div class="stats-container">
        <h2>{{ title }}</h2>
        <div v-if="tmdEntry" class="contributor-entry special">
            <p class="contributor-name">The Micronational Directory Team</p>
            <p class="contributor-contributions">{{ TMDContributions }}&nbsp;({{ TMDContributionsPercentage }}%)</p>
        </div>
        <div class="scrollable-container contributors-ranking">
            <div v-for="(contributor, i) in contributorsList" :key="i" class="contributor-entry"
                :class="{ 'current-user': contributor.email === auth.currentUser.email, 'hidden': contributor.email === 'themicronationaldirectory@gmail.com' }">
                <p class="contributor-rank">{{ i + 1 }}.</p>
                <p class="contributor-name">{{ contributor.name }}<span
                        v-if="contributor.email === auth.currentUser.email">&nbsp;(it's
                        you!)</span></p>
                <p class="contributor-contributions">{{ contributor.contributions }}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'EntriesRanking',
    data() {
        return {
            contest: {}
        }
    },
    computed: {
        micronationsApprovedDirectory() {
            return store.getters.directory.filter(element => element.approved);
        },
        contributorsList() {
            return this.listContributors(this.micronationsApprovedDirectory);
        },
        TMDContributions() {
            return this.countContributions(this.micronationsApprovedDirectory, "themicronationaldirectory@gmail.com");
        },
        TMDContributionsPercentage() {
            return ((this.TMDContributions * 100) / this.micronationsApprovedDirectory.length).toFixed(2);
        },

    },
    methods: {
        listContributors(array) {
            let contributors = [];
            const that = this;

            array.forEach(function (element) {
                if (!contributors.some(el => el.email === element.author.email)) {
                    if (element.author.email !== 'themicronationaldirectory@gmail.com') {
                        const creationDate = new Date(element.creationDate.seconds * 1000);
                        const startDate = new Date(that.startTimestamp * 1000);
                        const endDate = new Date(that.endTimestamp * 1000);

                        if (creationDate >= startDate && creationDate <= endDate) {
                            contributors.push({
                                name: element.author.name,
                                email: element.author.email,
                                contributions: that.countContributions(array, element.author.email)
                            });
                        }
                    }
                }
            });

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
}
</script>

<style scoped>
.stats-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
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
