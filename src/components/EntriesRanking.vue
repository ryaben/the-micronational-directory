<script setup>
import store from '../store';

defineProps({
    titleKey: {
        type: String,
        required: false,
        default: "ranking.entries"
    },
    title: {
        type: String,
        required: false,
        default: ""
    },
    directory: {
        type: String,
        required: false,
        default: "micronations"
    },
    currentUserEmail: {
        type: String,
        required: false,
        default: ""
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
    },
    micronationsApprovedDirectory: {
        type: Array,
        required: false,
        default: store.getters.micronations.filter(element => element.approved)
    },
    organizationsApprovedDirectory: {
        type: Array,
        required: false,
        default: store.getters.organizations.filter(element => element.approved)
    }
});
</script>

<template>
    <div class="stats-container">
        <h2 class="container-title">{{ title || $t(titleKey) }}</h2>
        <div v-if="tmdEntry" class="contributor-entry special">
            <p class="contributor-name">The Micronational Directory Team</p>
            <p class="contributor-contributions">{{ TMDContributions }}&nbsp;({{ TMDContributionsPercentage }}%)</p>
        </div>
        <div class="scrollable-container contributors-ranking">
            <div v-for="(contributor, i) in contributorsList.filter(contrib => contrib.contributions > 0)" :key="i" class="contributor-entry"
                :class="{ 'current-user': contributor.email === currentUserEmail, 'hidden': contributor.email === 'themicronationaldirectory@gmail.com' }">
                <p class="contributor-rank" :aria-label="$t('ranking.rank', { rank: i + 1 })">{{ i + 1 }}</p>
                <p class="contributor-name">{{ contributor.name }}<span
                        v-if="contributor.email === currentUserEmail">&nbsp;{{ $t('ranking.you') }}</span></p>
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
        contributorsList() {
            return this.listContributors(this[`${this.directory}ApprovedDirectory`]);
        },
        TMDContributions() {
            return this.countContributions(this[`${this.directory}ApprovedDirectory`], "themicronationaldirectory@gmail.com", new Date(this.startTimestamp * 1000), new Date(this.endTimestamp * 1000));
        },
        TMDContributionsPercentage() {
            return ((this.TMDContributions * 100) / this[`${this.directory}ApprovedDirectory`].length).toFixed(2);
        },

    },
    methods: {
        listContributors(array) {
            let contributors = [];
            const startDate = new Date(this.startTimestamp * 1000);
            const endDate = new Date(this.endTimestamp * 1000);
            const that = this;

            array.forEach(function (element) {
                if (!contributors.some(el => el.email === element.author.email)) {
                    if (element.author.email !== 'themicronationaldirectory@gmail.com') {
                        contributors.push({
                            name: element.author.name,
                            email: element.author.email,
                            contributions: that.countContributions(array, element.author.email, startDate, endDate)
                        });
                    }
                }
            });

            contributors.sort(function (a, b) {
                return b.contributions - a.contributions;
            });

            return contributors;
        },
        countContributions(array, value, startDate, endDate) {
            let count = 0;

            array.forEach(element => {
                const creationDate = new Date(element.creationDate._seconds * 1000);

                if (element.author.email === value) {
                    if (creationDate >= startDate && creationDate <= endDate) {
                        count += 1;
                    }
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
    align-items: stretch;
    width: 100%;
    min-width: 0;
}

.container-title {
    color: var(--color-heading);
    text-align: left;
}

.contributors-ranking {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-height: 150px;
    padding: 7px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background-soft);
}

.contributor-entry {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 52px;
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    transition: transform var(--transition-fast) ease, border-color var(--transition-fast) ease, box-shadow var(--transition-fast) ease;
}

.contributor-entry:hover {
    transform: translateY(-1px);
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-soft);
}

.contributor-entry.hidden {
    display: none;
}

.contributor-entry.special {
    justify-content: space-between;
    width: 100%;
    margin: 0 0 9px;
    padding: 10px 13px;
    border-color: color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
    background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
}

.contributor-entry.current-user {
    border-color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 12%, var(--color-surface));
    color: var(--color-heading);
}

.contributor-rank {
    display: grid;
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    place-items: center;
    margin: 0;
    border-radius: var(--radius-full);
    background: var(--color-background-mute);
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 750;
}

.contributor-name {
    flex: 1;
    min-width: 0;
    margin: 0;
    color: inherit;
    font-size: 15px;
    font-weight: 650;
    overflow-wrap: anywhere;
}

.contributor-contributions {
    flex: 0 0 auto;
    min-width: 38px;
    margin: 0;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    background: var(--color-background-mute);
    color: var(--color-heading);
    font-size: 15px;
    font-weight: 750;
    text-align: center;
}

.contributors-ranking .contributor-entry:nth-of-type(1) {
    border-color: var(--gold-dark);
    background: linear-gradient(105deg, var(--gold) 0%, var(--gold-dark) 100%);
    color: #302700;
}

.contributors-ranking .contributor-entry:nth-of-type(1) .contributor-rank { background: var(--gold); color: #332800; }
.contributors-ranking .contributor-entry:nth-of-type(1) .contributor-contributions { background: color-mix(in srgb, #302700 12%, transparent); color: #302700; }
.contributors-ranking .contributor-entry:nth-of-type(1) .contributor-name::after { content: "  🥇"; }

.contributors-ranking .contributor-entry:nth-of-type(2) {
    border-color: var(--silver-dark);
    background: linear-gradient(105deg, var(--silver) 0%, var(--silver-dark) 100%);
    color: #202020;
}

.contributors-ranking .contributor-entry:nth-of-type(2) .contributor-rank { background: var(--silver); color: #252525; }
.contributors-ranking .contributor-entry:nth-of-type(2) .contributor-contributions { background: color-mix(in srgb, #202020 12%, transparent); color: #202020; }
.contributors-ranking .contributor-entry:nth-of-type(2) .contributor-name::after { content: "  🥈"; }

.contributors-ranking .contributor-entry:nth-of-type(3) {
    border-color: var(--bronze-dark);
    background: linear-gradient(105deg, var(--bronze) 0%, var(--bronze-dark) 100%);
    color: #fff;
}

.contributors-ranking .contributor-entry:nth-of-type(3) .contributor-rank { background: var(--bronze); color: #fff; }
.contributors-ranking .contributor-entry:nth-of-type(3) .contributor-contributions { background: color-mix(in srgb, #000 20%, transparent); color: #fff; }
.contributors-ranking .contributor-entry:nth-of-type(3) .contributor-name::after { content: "  🥉"; }

.contributor-entry.special .contributor-name::after { content: none !important; }

@media (max-width: 500px) {
    .contributors-ranking { gap: 6px; padding: 6px; }
    .contributor-entry { gap: 8px; min-height: 48px; padding: 7px 9px; }
    .contributor-rank { flex-basis: 27px; width: 27px; height: 27px; }
    .contributor-name { font-size: 14px; }
    .contributor-contributions { min-width: 34px; padding: 4px 8px; font-size: 14px; }
}
</style>
