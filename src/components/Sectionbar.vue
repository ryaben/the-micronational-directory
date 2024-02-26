<script setup>
defineProps({
    sections: {
        type: Array,
        required: true,
        default: [{
            text: "Main", target: "display", display: true
        }]
    },
    initialSelectedTab: {
        type: String,
        required: true,
        default: 'tab'
    }
})
</script>

<template>
    <div class="section-bar">
        <div v-for="(tab, i) in sections" :key="i" v-show="tab.display" class="section-tab" :class="tab.classes">
            <label class="section-text" :id="`${tab.target}Tab${i}`" :class="{'selected': selectedTab === `${tab.target}Tab${i}`}"
                @click="showTarget(tab.target); selectTab($event)">{{ tab.text }}</label>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Navbar',
    data() {
        return {
            selectedTab: this.initialSelectedTab
        }
    },
    methods: {
        showTarget(element) {
            this.$emit('showTargetTab', element);
        },
        selectTab(event) {
            this.selectedTab = event.target.getAttribute('id');
        }
    }
}
</script>

<style scoped>
.section-bar {
    display: flex;
    padding: 15px;
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
    border-bottom: 4px solid var(--vt-c-white-soft);
    background-color: var(--directory-settings-background-color);
}

.section-tab {
    padding-left: 12px;
    padding-right: 12px;
}

.section-tab.border-left {
    border-left: 3px solid var(--vt-c-white-soft);
    padding-left: 24px;
    margin-left: 12px;
}

.section-text {
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.1s ease all;
}

.section-text.selected {
    color: var(--vt-c-white-soft);
    border-bottom: 3px solid var(--vt-c-white-soft);
}
</style>
