<script setup>
import { computed, onBeforeUnmount, onMounted, nextTick, ref } from 'vue'

const props = defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  includeSelectAll: { type: Boolean, default: false },
  includeSelectNone: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  dropdownHeight: { type: [Number, String], default: 240 },
  placeholder: { type: String, default: '' },
  selectAllLabel: { type: String, default: 'Select all' },
  selectNoneLabel: { type: String, default: 'Clear selection' },
  selectedCountLabel: { type: String, default: '{count} selected' },
  searchPlaceholder: { type: String, default: 'Search options...' },
  noOptionsLabel: { type: String, default: 'No options found' },
  ariaLabel: { type: String, default: 'Select options' }
})

const emit = defineEmits(['update:modelValue'])
const dropdownRoot = ref(null)
const dropdownTrigger = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')

function optionValue(option) {
  return typeof option === 'object' && option !== null ? option.value : option
}

function optionLabel(option) {
  return typeof option === 'object' && option !== null
    ? option.label ?? String(option.value)
    : String(option)
}

const allValues = computed(() => props.options.map(optionValue))
const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()
  if (!query) return props.options
  return props.options.filter(option => optionLabel(option).toLocaleLowerCase().includes(query))
})
const allSelected = computed(
  () => allValues.value.length > 0 && (
    props.modelValue.length === 0 || allValues.value.every(value => props.modelValue.includes(value))
  )
)
const summaryLabel = computed(() => {
  if (!props.modelValue.length) return props.placeholder
  if (allSelected.value && props.includeSelectAll) return props.selectAllLabel
  if (props.modelValue.length === 1) {
    const option = props.options.find(item => optionValue(item) === props.modelValue[0])
    return option ? optionLabel(option) : props.modelValue[0]
  }
  return props.selectedCountLabel.replace('{count}', String(props.modelValue.length))
})
const dropdownStyle = computed(() => ({
  maxHeight: typeof props.dropdownHeight === 'number'
    ? `${props.dropdownHeight}px`
    : props.dropdownHeight
}))

function updateOption(option, checked) {
  const value = optionValue(option)
  const selected = new Set(props.modelValue)
  if (checked) selected.add(value)
  else selected.delete(value)
  emit('update:modelValue', [...selected])
}

function updateAll(checked) {
  emit('update:modelValue', checked ? allValues.value : [])
}

function updateNone(checked) {
  emit('update:modelValue', checked ? [] : allValues.value)
}

function handleOutsidePointer(event) {
  if (!dropdownRoot.value?.contains(event.target)) isOpen.value = false
}

function handleKeydown(event) {
  if (event.key !== 'Escape' || !isOpen.value) return
  isOpen.value = false
  nextTick(() => dropdownTrigger.value?.focus())
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointer)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div ref="dropdownRoot" class="multi-select-dropdown" :class="{ 'is-open': isOpen }">
    <button
      ref="dropdownTrigger"
      class="multi-select-trigger"
      type="button"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="multi-select-summary-label">{{ summaryLabel || placeholder }}</span>
      <span class="multi-select-chevron" aria-hidden="true"></span>
    </button>
    <Transition name="multi-select">
      <div
        v-if="isOpen"
        class="multi-select-options"
        :style="dropdownStyle"
        role="group"
        :aria-label="ariaLabel"
      >
        <div v-if="includeSelectAll || includeSelectNone" class="multi-select-actions">
          <label v-if="includeSelectAll" class="multi-select-option">
            <input type="checkbox" :checked="allSelected" @change="updateAll($event.target.checked)" />
            {{ selectAllLabel }}
          </label>
          <label v-if="includeSelectNone" class="multi-select-option">
            <input
              type="checkbox"
              :checked="modelValue.length === 0"
              @change="updateNone($event.target.checked)"
            />
            {{ selectNoneLabel }}
          </label>
        </div>
        <input
          v-if="searchable"
          v-model="searchQuery"
          class="multi-select-search"
          type="search"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
        />
        <div
          v-if="(includeSelectAll || includeSelectNone) && filteredOptions.length"
          class="multi-select-divider"
          role="separator"
        ></div>
        <div class="multi-select-option-list">
        <label v-for="option in filteredOptions" :key="optionValue(option)" class="multi-select-option">
          <input
            type="checkbox"
            :checked="modelValue.includes(optionValue(option))"
            @change="updateOption(option, $event.target.checked)"
          />
          <span>{{ optionLabel(option) }}</span>
        </label>
        <span v-if="searchable && !filteredOptions.length" class="multi-select-empty">{{ noOptionsLabel }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.multi-select-dropdown {
  position: relative;
  z-index: 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.multi-select-dropdown.is-open {
  z-index: 1;
}

.multi-select-trigger {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 40px;
  padding: 7px 11px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  background: var(--color-surface);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.multi-select-summary-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-select-chevron {
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  margin: -4px 2px 0 0;
  border-right: 1.5px solid var(--color-muted);
  border-bottom: 1.5px solid var(--color-muted);
  transform: rotate(45deg);
  transition: transform 160ms ease, margin 160ms ease;
}

.multi-select-dropdown.is-open .multi-select-chevron {
  margin-top: 4px;
  transform: rotate(225deg);
}

.multi-select-options {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-soft);
}

.multi-select-enter-active,
.multi-select-leave-active {
  transform-origin: top center;
  transition: opacity 150ms ease, transform 150ms ease;
}

.multi-select-enter-from,
.multi-select-leave-to {
  opacity: 0;
  transform: translateY(-6px) scaleY(0.98);
}

.multi-select-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.multi-select-search {
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 7px 9px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text);
  background: var(--color-surface);
  font: inherit;
}

.multi-select-option-list {
  min-height: 0;
  overflow-y: auto;
}

.multi-select-divider {
  display: block;
  flex: 0 0 auto;
  width: calc(100% - 24px);
  height: 0;
  margin: 7px auto;
  border-top: 1px solid color-mix(in srgb, var(--color-muted) 55%, var(--color-border));
}

.multi-select-option {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 34px;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--color-text);
  cursor: pointer;
}

.multi-select-option span {
  min-width: 0;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.multi-select-empty {
  display: block;
  padding: 8px;
  color: var(--color-muted);
  white-space: nowrap;
}

.multi-select-option:hover {
  background: var(--navbar-tab-background-color-hover);
}

.multi-select-option input[type='checkbox'] {
  flex: 0 0 16px;
  width: 16px;
  margin: 0;
  accent-color: var(--color-accent);
}
</style>
