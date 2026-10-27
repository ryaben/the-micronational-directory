<script setup>
import { ref, watch } from 'vue';
import imageCompression from 'browser-image-compression';

const props = defineProps({
  modelValue: { type: String, default: '' },
  initialMode: { type: String, default: 'url' },
  imageName: { type: String, default: 'entry' },
  assetType: { type: String, default: 'flag' }
});
const emit = defineEmits(['update:modelValue', 'image-change', 'image-error', 'image-processing']);
const mode = ref(props.initialMode);
const externalUrl = ref(props.modelValue && !props.modelValue.startsWith('data:') ? props.modelValue : '');
const uploading = ref(false);

watch(() => props.initialMode, value => { mode.value = value; });
watch(() => props.modelValue, value => {
  if (value && !value.startsWith('data:')) externalUrl.value = value;
});

function updateUrl() {
  emit('update:modelValue', externalUrl.value.trim());
  emit('image-change', { mode: 'url', url: externalUrl.value.trim() });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

async function selectFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploading.value = true;
  emit('image-processing', true);
  try {
    if (!file.type.startsWith('image/')) throw new Error('Choose a valid image file.');
    const processedFile = file.size <= 35 * 1024
      ? file
      : await imageCompression(file, {
        maxSizeMB: 0.035,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        fileType: file.type
      });
    const base64 = await fileToBase64(processedFile);
    if (base64.length > 50000) {
      throw new Error('The image is too large for a GitHub issue. Choose a smaller image.');
    }
    const safeName = props.imageName.trim().replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/^-+|-+$/g, '') || 'entry';
    const sourceExtension = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || file.type.split('/')[1]?.replace(/\+.*/, '').toLowerCase() || 'png';
    const extension = sourceExtension === 'jpeg' ? 'jpg' : sourceExtension;
    const fileName = `${safeName}-moderated-${Date.now()}.${extension}`;
    const folder = props.assetType === 'logo' ? 'logos' : 'flags';
    const previewUrl = `data:${processedFile.type || file.type};base64,${base64}`;
    emit('update:modelValue', previewUrl);
    emit('image-change', {
      mode: 'upload',
      name: fileName,
      path: `public/images/${folder}/${fileName}`,
      base64,
      previewUrl
    });
  } catch (error) {
    emit('image-error', error.message || 'Could not process the selected image.');
  } finally {
    uploading.value = false;
    emit('image-processing', false);
    event.target.value = '';
  }
}
</script>

<template>
  <div class="moderation-image-editor">
    <div class="moderation-image-modes">
      <label><input v-model="mode" type="radio" value="file"> {{ $t('settings.imageLocal') }}</label>
      <label><input v-model="mode" type="radio" value="url"> {{ $t('settings.imageExternal') }}</label>
    </div>
    <input v-if="mode === 'url'" type="text" inputmode="url" :value="externalUrl" :placeholder="$t('settings.imageUrl', { type: assetType })" @input="externalUrl = $event.target.value; updateUrl()">
    <input v-else type="file" accept="image/*" :disabled="uploading" @change="selectFile">
    <small v-if="uploading">{{ $t('settings.compressing') }}</small>
    <small v-else>{{ $t('settings.imageHelp') }}</small>
  </div>
</template>

<style scoped>
.moderation-image-editor {
  display: grid;
  gap: 8px;
  width: 100%;
  margin-top: 12px;
}

.moderation-image-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.moderation-image-modes label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-heading);
  font-size: 13px;
}

.moderation-image-editor > input:not([type="radio"]) {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-heading);
  background: var(--color-surface);
  font: inherit;
}

.moderation-image-editor small {
  color: var(--color-muted);
  font-size: 11px;
}
</style>
