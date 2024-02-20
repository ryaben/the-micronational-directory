<script setup>
import CountdownTimer from '../components/CountdownTimer.vue';

defineProps({
    contestInfo: {
        type: Object,
        required: true,
        default: {}
    }
});
</script>

<template>
    <div class="stats-container compact">
        <h1 class="underlined">{{ contestInfo.name }}</h1>
        <h3>{{ startingDate }} - {{ endingDate }}</h3>
        <CountdownTimer v-show="!alreadyStarted" :expiration-date="contestInfo.startDate.seconds * 1000"
            finish-message="The event has started!" pre-message="Begins in: " />
        <CountdownTimer v-show="alreadyStarted" :expiration-date="contestInfo.endDate.seconds * 1000"
            finish-message="The event has finished!" pre-message="Ends in: " />
        <p style="margin-top: 10px;">
            You are invited to <a href="/login">create an account</a> at our website (if you don't have one yet) and
            to participate by <a href="/directory">adding entries to the Directory</a>! The most important contributors at
            the end of the Contest will qualify for the following amazing prizes:
        </p>
        <div class="prizes-container">
            <img v-if="contestInfo.partnerInfo" :src="'/images/' + contestInfo.partnerInfo.image"
                :alt="contestInfo.partnerInfo.name" width="100" />
            <p>
                We are awarding
                <span v-if="contestInfo.partnerInfo">
                    alongside our partner
                    <a :href="contestInfo.partnerInfo.website" target="_blank">{{ contestInfo.partnerInfo.name }}</a>
                </span>:<br>
                <span v-for="(prize, i) in contestInfo.prizes" :key="i">{{ prize }}<br></span>
            </p>
        </div>
        <p>
            Carefully read the <router-link :to="'/terms-of-contests'">terms and conditions</router-link> to know all the details.
            <span v-if="contestInfo.name === 'Inaugural Contest 2023'">
                <br>
                <b>ONLY</b> in the case of this initial event, <b>all entries submitted since the launching of TMD (August
                    31) are applicable for this Contest</b>! So all your entries so far worth points!
            </span>
        </p>
    </div>
</template>

<script>
export default {
    name: 'ContestOverview',
    components: {
        CountdownTimer
    },
    data: () => {
        return {
        };
    },
    computed: {
        startingDate() {
            const dateString = new Date(this.contestInfo.startDate.seconds * 1000);
            const dateFullMonth = dateString.toLocaleString('default', { month: 'long' });

            return dateFullMonth + ' ' + dateString.getDate();
        },
        endingDate() {
            const dateString = new Date(this.contestInfo.endDate.seconds * 1000);
            const dateFullMonth = dateString.toLocaleString('default', { month: 'long' });

            return dateFullMonth + ' ' + dateString.getDate();;
        },
        alreadyStarted() {
            return (this.contestInfo.startDate.seconds * 1000) < new Date().getTime();
        }
    }
}
</script>

<style scoped>
.stats-container.compact>p,
.stats-container.compact>h1,
.stats-container.compact>h3 {
    width: 90%;
    margin: 0;
    text-align: center;
}

.prizes-container {
    width: 85%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 5px;
    margin-bottom: 10px;
}

.prizes-container p {
    margin-left: 20px;
}
</style>