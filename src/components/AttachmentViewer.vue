<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon, ArrowDownTrayIcon, PaperClipIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  attachment: {
    name: string
    type: 'image' | 'document'
    preview?: string
  }
}>()

const emit = defineEmits(['close'])

const downloadAttachment = () => {
  const link = document.createElement('a')
  link.href = props.attachment.preview || ''
  link.download = props.attachment.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="attachment-viewer-overlay" @click="emit('close')">
    <div class="attachment-viewer-content" @click.stop>
      <div class="attachment-viewer-header">
        <h3>{{ attachment.name }}</h3>
        <div class="attachment-viewer-actions">
          <button class="action-button" @click="downloadAttachment" title="Download">
            <ArrowDownTrayIcon class="icon" />
          </button>
          <button class="action-button" @click="emit('close')" title="Close">
            <XMarkIcon class="icon" />
          </button>
        </div>
      </div>
      <div class="attachment-viewer-body">
        <img v-if="attachment.type === 'image'" :src="attachment.preview" :alt="attachment.name" />
        <div v-else class="document-preview">
          <div class="document-icon">
            <PaperClipIcon class="icon" />
          </div>
          <span>{{ attachment.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attachment-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.attachment-viewer-content {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.attachment-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.attachment-viewer-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.attachment-viewer-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  background: #f5f5f5;
}

.icon {
  width: 20px;
  height: 20px;
  color: #666;
}

.attachment-viewer-body {
  padding: 24px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-viewer-body img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.document-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.document-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.document-icon .icon {
  width: 32px;
  height: 32px;
}
</style>
