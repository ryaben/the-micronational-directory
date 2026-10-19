<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
    sections: {
        type: Array,
        required: true,
        default: () => [{ text: 'Main', target: 'main', display: true }]
    },
    initialSelectedSection: {
        type: String,
        default: ''
    }
});
const emit = defineEmits(['section-change']);

const firstVisibleSection = computed(() => props.sections.find(section => section.display !== false)?.target || '');
const selectedSection = ref(props.initialSelectedSection || firstVisibleSection.value);
const visibleSection = ref(selectedSection.value);
const isLeaving = ref(false);
const visitedSections = ref([selectedSection.value]);
let panelSwitchTimer;

function selectSection(target, notify = true) {
    if (target === selectedSection.value) return;
    selectedSection.value = target;
    if (!visitedSections.value.includes(target)) visitedSections.value.push(target);
    isLeaving.value = true;
    clearTimeout(panelSwitchTimer);
    panelSwitchTimer = setTimeout(() => {
        visibleSection.value = target;
        isLeaving.value = false;
    }, 70);
    if (notify) emit('section-change', target);
}

watch(() => props.initialSelectedSection, target => {
    if (target && props.sections.some(section => section.target === target && section.display !== false)) {
        selectSection(target, false);
    }
});

watch(firstVisibleSection, target => {
    if (!props.sections.some(section => section.target === selectedSection.value && section.display !== false)) {
        selectedSection.value = target;
        visibleSection.value = target;
        if (!visitedSections.value.includes(target)) visitedSections.value.push(target);
        isLeaving.value = false;
    }
});

onBeforeUnmount(() => clearTimeout(panelSwitchTimer));
</script>

<template>
    <div class="section-switcher">
        <div class="section-bar" role="tablist">
            <div v-for="(tab, i) in sections" :key="tab.target" v-show="tab.display !== false"
                class="section-tab" :class="tab.classes">
                <button class="section-text" type="button" role="tab" :id="`${tab.target}Tab${i}`"
                    :aria-controls="`${tab.target}Panel`" :aria-selected="selectedSection === tab.target"
                    :class="{ selected: selectedSection === tab.target }"
                    @click="selectSection(tab.target)">{{ tab.text }}</button>
            </div>
        </div>

        <div class="section-panels">
            <template v-for="(tab, i) in sections" :key="`${tab.target}-panel`">
                <div v-if="visitedSections.includes(tab.target)"
                    v-show="tab.display !== false && visibleSection === tab.target"
                    class="section-panel" :class="{
                        active: visibleSection === tab.target && !isLeaving,
                        leaving: visibleSection === tab.target && isLeaving && selectedSection !== tab.target
                    }"
                    role="tabpanel" :id="`${tab.target}Panel`" :aria-labelledby="`${tab.target}Tab${i}`">
                    <slot :name="tab.target" />
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default { name: 'Sectionbar' };
</script>

<style scoped>
.section-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px 0;
    border: 1px solid var(--color-border);
    border-bottom-color: color-mix(in srgb, var(--color-accent) 28%, var(--color-border));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    background: linear-gradient(180deg, var(--color-surface-raised), var(--color-surface));
}

.section-tab {
    display: flex;
    align-items: center;
    padding: 0 2px;
}

.section-tab.border-left {
    border-left: 1px solid var(--color-border);
    padding-left: 14px;
    margin-left: 8px;
}

.section-text {
    position: relative;
    border: 0;
    border-radius: 0;
    padding: 11px 14px 13px;
    color: var(--color-muted);
    background: transparent;
    font: inherit;
    font-size: 15px;
    font-weight: 650;
    cursor: pointer;
    transition: color var(--transition-fast) ease,
        background-color var(--transition-fast) ease,
        box-shadow var(--transition-fast) ease,
        transform var(--transition-fast) ease;
}

.section-text:hover {
    color: var(--color-heading);
    background-color: color-mix(in srgb, var(--color-accent) 7%, transparent);
    transform: translateY(-1px);
}

.section-text.selected {
    color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.section-text.selected::after {
    position: absolute;
    right: 9px;
    bottom: -1px;
    left: 9px;
    height: 3px;
    border-radius: 999px 999px 0 0;
    background: var(--color-accent);
    content: '';
    animation: section-indicator-in var(--transition-base) ease-out both;
}

.section-text:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
}

.section-panel {
    min-width: 0;
    opacity: 0;
    transition: opacity 120ms ease;
}

.section-panel.active {
    opacity: 1;
}

.section-panel.leaving {
    opacity: 0;
}

@keyframes section-indicator-in {
    from { transform: scaleX(0.55); opacity: 0.35; }
    to { transform: scaleX(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .section-text,
    .section-text.selected::after,
    .section-panel {
        transition: none;
        animation: none;
    }
}

@media (max-width: 520px) {
    .section-bar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
        gap: 4px;
        padding: 6px 8px 0;
        overflow: visible;
    }

    .section-tab {
        min-width: 0;
        padding: 0;
    }

    .section-text {
        width: 100%;
        padding: 10px 6px 12px;
        font-size: 13px;
        line-height: 1.3;
        text-align: center;
        white-space: normal;
        overflow-wrap: anywhere;
    }
}
</style>
