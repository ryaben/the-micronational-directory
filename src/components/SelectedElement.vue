<script setup>
defineProps({
    elementText: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['remove-element']);
</script>

<template>
    <span class="selected-element">
        <span class="element-text">{{ elementText }}</span>
        <button class="remove-element" type="button" :aria-label="`Remove ${elementText}`"
            @click="emit('remove-element', elementText)">
            <span aria-hidden="true">×</span>
        </button>
    </span>
</template>

<script>
export default { name: 'SelectedElement' };
</script>

<style scoped>
.selected-element {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    min-height: 28px;
    padding: 3px 5px 3px 10px;
    border: 1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border));
    border-radius: var(--radius-full);
    color: var(--color-heading);
    background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface));
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
    transition: background-color var(--transition-fast) ease, border-color var(--transition-fast) ease,
        box-shadow var(--transition-fast) ease;
}

.selected-element:hover {
    border-color: color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
    background: color-mix(in srgb, var(--color-accent) 13%, var(--color-surface));
    box-shadow: 0 2px 6px rgb(15 23 42 / 9%);
}

.element-text {
    overflow: hidden;
    font-size: 13px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.remove-element {
    display: inline-grid;
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    color: var(--color-muted);
    background: transparent;
    cursor: pointer;
    transition: color var(--transition-fast) ease, background-color var(--transition-fast) ease;
}

.remove-element:hover {
    color: var(--failure-tone);
    background: color-mix(in srgb, var(--failure-tone) 12%, transparent);
}

.remove-element span {
    font-size: 19px;
    line-height: 1;
    transform: translateY(-1px);
}

.remove-element:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
}

@media (prefers-reduced-motion: reduce) {
    .selected-element,
    .remove-element {
        transition: none;
    }
}
</style>
