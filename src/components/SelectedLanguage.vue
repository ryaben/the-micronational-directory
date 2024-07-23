<script setup>
defineProps({
    langText: {
        type: String,
        required: true,
        default: 'Language'
    }
});
</script>

<template>
    <div class="selected-language-container">
        <label class="language-text">{{ langText }}</label>
        <label class="remove-language" @click="removeLanguage">❌</label>
    </div>
</template>
  
<script>
export default {
    name: 'SelectedLanguage',
    methods: {
       removeLanguage() {
        this.$emit('remove-language', this.langText);
       }
    }
}
</script>

<style scoped> 
.selected-language-container {
    display: flex;
    align-items: center;
    border-radius: 13px;
    width: fit-content;
    background-color: var(--vt-c-text-dark-2);
    padding: 3px;
    margin: 6px 3px 0 0;
}

.language-text {
    font-size: 13px;
    color: var(--vt-c-black);
}

.remove-language {
    margin-left: 3px;
    color: var(--failure-tone);
    cursor: pointer;
}
</style>