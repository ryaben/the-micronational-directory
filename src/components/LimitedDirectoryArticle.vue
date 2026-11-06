<script setup>
import { computed } from 'vue'
import SimpleDirectoryArticle from './SimpleDirectoryArticle.vue'
import { toLimitedEntryPresentation } from '../utils/limitedEntryPresentation.js'

const props = defineProps({
  entry: { type: Object, required: true },
  entryType: { type: String, default: 'micronation' }
})

const articleInfo = computed(() => toLimitedEntryPresentation(props.entry, props.entryType))
</script>

<template>
  <SimpleDirectoryArticle :info="articleInfo" />
</template>
