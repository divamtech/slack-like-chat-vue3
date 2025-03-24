<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, nextTick, onUnmounted } from 'vue'
import { PaperClipIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import 'emoji-picker-element'
import AttachmentViewer from './AttachmentViewer.vue'
import { Attachment, Message, MessageGroup, Suggestion } from '@/types/chat'

const messages = ref<Message[]>([
  {
    id: '1',
    user: 'Batman Weave',
    avatar: 'BW',
    content: 'Hey @Chipi Chipa! Check #testing-mehuk-kanika-bhrugu',
    timestamp: new Date(new Date().setHours(14, 30)).toISOString(),
  },
  {
    id: '2',
    user: 'Chipi Chipa',
    avatar: 'CC',
    content: 'Just working on the new features in #general!',
    timestamp: new Date(new Date().setHours(14, 31)).toISOString(),
  },
])

const newMessage = ref('')
const showSuggestions = ref(false)
const cursorPosition = ref(0)
const attachments = ref<Attachment[]>([])
const showCommentInput = ref<string | null>(null)
const commentText = ref('')
const showEmojiPicker = ref(false)
const isDragging = ref(false)
const showEmojiPickerForMessage = ref<string | null>(null)
const selectedAttachment = ref<MessageAttachment | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const users = ['Batman Weave', 'Chipi Chipa', 'Nikunj Rami test']

const channels = ['testing-mehuk-kanika-bhrugu', 'general', 'random']

const suggestions = computed(() => {
  const text = newMessage.value.slice(0, cursorPosition.value)
  const mentionMatch = text.match(/@(\w*)$/)
  const channelMatch = text.match(/#(\w*)$/)

  if (mentionMatch) {
    const query = mentionMatch[1].toLowerCase()
    return users.filter((user) => user.toLowerCase().includes(query)).map((user) => ({ type: 'user' as const, text: user }))
  }

  if (channelMatch) {
    const query = channelMatch[1].toLowerCase()
    return channels.filter((channel) => channel.toLowerCase().includes(query)).map((channel) => ({ type: 'channel' as const, text: channel }))
  }

  return []
})

const handleInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  cursorPosition.value = textarea.selectionStart
  showSuggestions.value = suggestions.value.length > 0
}

const applySuggestion = (suggestion: Suggestion) => {
  const text = newMessage.value
  const beforeCursor = text.slice(0, cursorPosition.value)
  const afterCursor = text.slice(cursorPosition.value)

  const prefix = suggestion.type === 'user' ? '@' : '#'
  const lastIndex = beforeCursor.lastIndexOf(prefix)

  newMessage.value = beforeCursor.slice(0, lastIndex) + prefix + suggestion.text + ' ' + afterCursor

  showSuggestions.value = false
}

const createAttachmentPreview = (file: File): Attachment => {
  const isImage = file.type.startsWith('image/')
  const attachment: Attachment = {
    file,
    type: isImage ? 'image' : 'document',
  }

  if (isImage) {
    attachment.preview = URL.createObjectURL(file)
  }

  return attachment
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const newAttachments = Array.from(input.files).map(createAttachmentPreview)
    attachments.value = [...attachments.value, ...newAttachments]
  }
}

const removeAttachment = (index: number) => {
  if (attachments.value[index].preview) {
    URL.revokeObjectURL(attachments.value[index].preview!)
  }
  attachments.value.splice(index, 1)
}

// Clean up object URLs when component is unmounted
onBeforeUnmount(() => {
  attachments.value.forEach((attachment) => {
    if (attachment.preview) {
      URL.revokeObjectURL(attachment.preview)
    }
  })
})

const handleMentionClick = (username: string) => {
  const userElement = document.querySelector(`[data-username="${username}"]`)
  userElement?.scrollIntoView({ behavior: 'smooth' })
}

const handleChannelClick = (channel: string) => {
  const channelElement = document.querySelector(`[data-channel="${channel}"]`)
  channelElement?.scrollIntoView({ behavior: 'smooth' })
}

const formatMessage = (content: string): string => {
  return content
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/•\s(.*?)\n/g, '<li>$1</li>')
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    .replace(/#(\w+)/g, '<span class="channel">#$1</span>')
}

const sendMessage = async () => {
  if (newMessage.value.trim() || attachments.value.length > 0) {
    const messageAttachments = attachments.value.map((att) => ({
      name: att.file.name,
      type: att.type,
      preview: att.type === 'image' ? att.preview : undefined,
    }))

    messages.value.push({
      id: Date.now().toString(),
      user: 'You',
      avatar: 'ME',
      content: newMessage.value,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: messageAttachments,
    })

    newMessage.value = ''
    attachments.value = []

    // Wait for DOM update then scroll
    await nextTick()
    scrollToBottom()
  }
}

const addComment = async (messageId: string) => {
  const message = messages.value.find((m) => m.id === messageId)
  if (!message) return

  if (!message.comments) {
    message.comments = []
  }

  message.comments.push({
    id: Date.now().toString(),
    user: 'You',
    avatar: 'ME',
    content: commentText.value,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })

  commentText.value = ''
  showCommentInput.value = null

  // Wait for DOM update then scroll
  await nextTick()
  scrollToBottom()
}

const addReaction = (messageId: string, emoji: string) => {
  const message = messages.value.find((m) => m.id === messageId)
  if (!message) return

  if (!message.reactions) {
    message.reactions = []
  }

  const existing = message.reactions.find((r) => r.emoji === emoji)
  if (existing) {
    existing.count++
    existing.users.push('You')
  } else {
    message.reactions.push({
      emoji,
      count: 1,
      users: ['You'],
    })
  }
}

const insertEmoji = (event: CustomEvent) => {
  // Get the emoji from the event detail
  const emoji = event.detail.unicode
  const textarea = document.querySelector('textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    newMessage.value = newMessage.value.substring(0, start) + emoji + newMessage.value.substring(end)

    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      textarea.focus()
    }, 0)
  }
  showEmojiPicker.value = false
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Allow new line with Shift+Enter
      return
    }
    // Submit message with just Enter
    event.preventDefault()
    sendMessage()
  }
}

const handleDragOver = (event: DragEvent) => {
  isDragging.value = true
  event.dataTransfer!.dropEffect = 'copy'
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length > 0) {
    const newAttachments = files.map(createAttachmentPreview)
    attachments.value = [...attachments.value, ...newAttachments]
  }
}

const handlePaste = (event: ClipboardEvent) => {
  const files = Array.from(event.clipboardData?.files || [])
  if (files.length > 0) {
    attachments.value = [...attachments.value, ...files]
  }
}

const showReactionPicker = (messageId: string) => {
  showEmojiPickerForMessage.value = messageId
}

const addReactionFromPicker = (event: CustomEvent) => {
  const messageId = showEmojiPickerForMessage.value
  if (messageId) {
    addReaction(messageId, event.detail.unicode)
    showEmojiPickerForMessage.value = null
  }
}

const toggleReaction = (messageId: string, emoji: string) => {
  const message = messages.value.find((m) => m.id === messageId)
  if (!message) return

  if (!message.reactions) {
    message.reactions = []
  }

  const existing = message.reactions.find((r) => r.emoji === emoji)
  if (existing) {
    if (existing.users.includes('You')) {
      // Remove reaction
      existing.count--
      existing.users = existing.users.filter((u) => u !== 'You')
      if (existing.count === 0) {
        message.reactions = message.reactions.filter((r) => r.emoji !== emoji)
      }
    } else {
      // Add reaction
      existing.count++
      existing.users.push('You')
    }
  } else {
    message.reactions.push({
      emoji,
      count: 1,
      users: ['You'],
    })
  }
}

const adjustTextareaHeight = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  const messagesDiv = document.querySelector('.messages') as HTMLElement
  const maxHeight = messagesDiv ? messagesDiv.clientHeight / 3 : 200

  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'

  // Set new height based on content
  const newHeight = Math.min(textarea.scrollHeight, maxHeight)
  textarea.style.height = `${newHeight}px`

  // Add scrollbar if content exceeds maxHeight
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

const downloadAttachment = (attachment: Attachment) => {
  const link = document.createElement('a')
  link.href = attachment.preview || ''
  link.download = attachment.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  const textareas = document.querySelectorAll('textarea')
  textareas.forEach((textarea) => {
    adjustTextareaHeight({ target: textarea } as Event)
  })
})

// Helper function to format date
const formatDate = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }
}

// Compute message groups
const messageGroups = computed(() => {
  const groups: MessageGroup[] = []
  let currentDate = ''

  messages.value.forEach((message) => {
    // Convert timestamp to Date object
    const messageDate = new Date(message.timestamp)
    const dateStr = messageDate.toDateString()

    if (dateStr !== currentDate) {
      currentDate = dateStr
      groups.push({
        date: formatDate(messageDate),
        messages: [message],
      })
    } else {
      groups[groups.length - 1].messages.push(message)
    }
  })

  return groups
})

const applyFormat = (format: string) => {
  const textarea = document.querySelector('.message-input') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = newMessage.value.substring(start, end)

  const formats = {
    bold: { prefix: '*', suffix: '*' },
    italic: { prefix: '_', suffix: '_' },
    code: { prefix: '`', suffix: '`' },
    list: { prefix: '- ', suffix: '\n' },
  }

  const { prefix, suffix } = formats[format as keyof typeof formats]

  newMessage.value = newMessage.value.substring(0, start) + prefix + (selectedText || 'text') + suffix + newMessage.value.substring(end)

  // Set cursor position
  const newPosition = start + prefix.length
  textarea.focus()
  textarea.setSelectionRange(newPosition, newPosition + (selectedText || 'text').length)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    const container = messagesContainer.value
    container.scrollTop = container.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()

  // Optional: Handle window resize
  window.addEventListener('resize', scrollToBottom)

  // Optional: Clean up
  onUnmounted(() => {
    window.removeEventListener('resize', scrollToBottom)
  })
})
</script>

<template>
  <div class="chat-view">
    <div class="messages-container" ref="messagesContainer">
      <div class="messages">
        <div v-for="group in messageGroups" :key="group.date">
          <div class="date-separator">
            <div class="date-line"></div>
            <div class="date-text">{{ group.date }}</div>
            <div class="date-line"></div>
          </div>

          <div v-for="message in group.messages" :key="message.id" class="message">
            <div class="message-header">
              <div class="avatar-container">
                <div class="avatar">{{ message.avatar }}</div>
                <div class="status-dot" :class="{ online: message.online }"></div>
              </div>
              <span class="username">{{ message.user }}</span>
              <span class="timestamp">{{ message.timestamp }}</span>
            </div>
            <div class="message-content" v-html="formatMessage(message.content)"></div>
            <div v-if="message.attachments?.length" class="message-attachments">
              <div
                v-for="attachment in message.attachments"
                :key="attachment.name"
                class="message-attachment"
                @click="selectedAttachment = attachment"
              >
                <div class="attachment-content">
                  <div v-if="attachment.type === 'image'" class="attachment-thumbnail">
                    <img :src="attachment.preview" :alt="attachment.name" />
                    <div class="attachment-overlay">
                      <button class="overlay-button" @click.stop="downloadAttachment(attachment)">
                        <ArrowDownTrayIcon class="icon" />
                      </button>
                    </div>
                  </div>
                  <div v-else class="attachment-icon">
                    <PaperClipIcon class="icon" />
                    <button class="download-button" @click.stop="downloadAttachment(attachment)">
                      <ArrowDownTrayIcon class="icon" />
                    </button>
                  </div>
                  <span class="attachment-name">{{ attachment.name }}</span>
                </div>
              </div>
            </div>
            <div class="comments" v-if="message.comments?.length">
              <div v-for="comment in message.comments" :key="comment.id" class="comment">
                <div class="avatar">{{ comment.avatar }}</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="username">{{ comment.user }}</span>
                    <span class="timestamp">{{ comment.timestamp }}</span>
                  </div>
                  <div v-html="formatMessage(comment.content)"></div>
                </div>
              </div>
            </div>

            <button class="add-comment" @click="showCommentInput = message.id" v-if="showCommentInput !== message.id">Reply</button>

            <div v-if="showCommentInput === message.id" class="comment-input">
              <textarea
                v-model="commentText"
                placeholder="Add a comment..."
                @keydown.enter.prevent="addComment(message.id)"
                @input="adjustTextareaHeight"
              ></textarea>
              <button @click="addComment(message.id)">Send</button>
            </div>

            <div class="message-actions">
              <div class="reactions" v-if="message.reactions?.length">
                <div
                  v-for="reaction in message.reactions"
                  :key="reaction.emoji"
                  class="reaction-badge"
                  @click="toggleReaction(message.id, reaction.emoji)"
                  :class="{ active: reaction.users.includes('You') }"
                >
                  {{ reaction.emoji }} {{ reaction.count }}
                </div>
              </div>

              <!-- <button class="add-reaction" @click="showReactionPicker(message.id)">
                <span>😊</span>
              </button> -->
            </div>

            <emoji-picker v-if="showEmojiPickerForMessage === message.id" class="reaction-picker" @emoji-click="addReactionFromPicker"></emoji-picker>
          </div>
        </div>
      </div>
    </div>
    <div class="editor">
      <div
        class="editor-container"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        :class="{ 'drag-over': isDragging }"
      >
        <textarea
          v-model="newMessage"
          placeholder="Message #general (Use @ for mentions and # for channels)"
          @keydown="handleKeyDown"
          @input="
            (e) => {
              handleInput(e)
              adjustTextareaHeight(e)
            }
          "
          @paste="handlePaste"
        ></textarea>

        <emoji-picker v-if="showEmojiPicker" class="emoji-picker" @emoji-click="insertEmoji"></emoji-picker>

        <div v-if="showSuggestions" class="suggestions">
          <div v-for="suggestion in suggestions" :key="suggestion.text" class="suggestion" @click="applySuggestion(suggestion)">
            <span class="suggestion-prefix">{{ suggestion.type === 'user' ? '@' : '#' }}</span>
            {{ suggestion.text }}
          </div>
        </div>

        <div class="attachments-preview" v-if="attachments.length">
          <div v-for="(attachment, index) in attachments" :key="index" class="attachment">
            <div class="attachment-content">
              <div v-if="attachment.type === 'image'" class="attachment-thumbnail">
                <img :src="attachment.preview" alt="Preview" />
              </div>
              <div v-else class="attachment-icon">
                <PaperClipIcon class="icon" />
              </div>
              <span class="attachment-name">{{ attachment.file.name }}</span>
            </div>
            <button class="remove-attachment" @click="removeAttachment(index)">×</button>
          </div>
        </div>
        <div class="drag-overlay" v-if="isDragging">
          <div class="drag-message">Drop files to attach</div>
        </div>
      </div>

      <div class="editor-actions">
        <button class="emoji-button" @click="showEmojiPicker = !showEmojiPicker">😊</button>
        <label class="attachment-button">
          <PaperClipIcon class="icon" />
          <input type="file" multiple @change="handleFileUpload" style="display: none" />
        </label>
        <button class="send-button" @click="sendMessage">Send</button>
      </div>
    </div>
    <AttachmentViewer v-if="selectedAttachment" :attachment="selectedAttachment" @close="selectedAttachment = null" />
  </div>
</template>

<style scoped>
.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0; /* Add this to prevent overflow */
  background: #fafafa;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  width: 100%;
}

.message {
  margin-bottom: 20px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid white;
}

.status-dot.online {
  background: #44b700;
}

.username {
  font-weight: bold;
}

.timestamp {
  color: #666;
  font-size: 12px;
}

.message-content {
  margin-left: 44px;
  line-height: 1.4;
}

.message-content :deep(.mention) {
  color: #1264a3;
  background-color: #e8f5fa;
  padding: 0 4px;
  border-radius: 3px;
  cursor: pointer;
}

.message-content :deep(.mention):hover {
  text-decoration: underline;
}

.message-content :deep(.channel) {
  color: #1264a3;
  cursor: pointer;
}

.message-content :deep(.channel):hover {
  text-decoration: underline;
}

.editor {
  border-top: 1px solid #e5e5e5;
  padding: 16px;
  background: white;
  display: flex;
  flex-direction: column;
}

.editor-container {
  position: relative;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

textarea {
  width: 100%;
  max-width: 100%;
  min-height: 60px;
  resize: none; /* Change from vertical to none since we're handling height automatically */
  padding: 12px;
  padding-right: 40px; /* Space for emoji button */
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  overflow-y: hidden; /* Hide scrollbar by default */
  transition: height 0.1s ease-out;
}

textarea:focus {
  outline: none;
  border-color: #1a73e8;
}

.suggestions {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  width: 200px;
}

.suggestion {
  padding: 8px 12px;
  cursor: pointer;
}

.suggestion:hover {
  background: #f5f5f5;
}

.suggestion-prefix {
  color: #666;
  margin-right: 4px;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.emoji-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
}

.attachment-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

.attachment-button .icon {
  width: 20px;
  height: 20px;
  color: #666;
}

.send-button {
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.send-button:hover {
  background: #1557b0;
}

.attachments,
.attachments-preview {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.attachment-icon {
  width: 16px;
  height: 16px;
  color: #666;
}

.remove-attachment {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 4px;
}

.remove-attachment:hover {
  color: #ff4444;
}

.comments {
  margin-left: 44px;
  margin-top: 8px;
  border-left: 2px solid #e5e5e5;
  padding-left: 12px;
}

.comment {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.add-comment {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin-left: 44px;
  padding: 4px 0;
}

.comment-input {
  margin-left: 44px;
  margin-top: 8px;
}

.comment-input textarea {
  width: 100%;
  min-height: 60px;
  border: none;
  resize: none;
  padding: 8px;
  padding-right: 40px;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  overflow-y: hidden;
  transition: height 0.1s ease-out;
}

.reactions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  margin-left: 44px;
}

.reaction-badge {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
}

.add-reaction {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 12px;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.drag-message {
  padding: 20px;
  border: 2px dashed #1a73e8;
  border-radius: 8px;
  color: #1a73e8;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 44px;
  margin-top: 4px;
}

.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.reaction-badge {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reaction-badge.active {
  background: #e3f2fd;
  color: #1a73e8;
}

.reaction-badge:hover {
  background: #e0e0e0;
}

.add-reaction {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-reaction:hover {
  background: #f5f5f5;
}

.reaction-picker {
  position: absolute;
  bottom: 100%;
  left: 44px;
  z-index: 1000;
}

.attachments-preview {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  padding: 8px;
}

.attachment {
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.attachment:hover {
  transform: translateY(-2px);
}

.attachment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
}

.attachment-thumbnail {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
}

.attachment-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.attachment:hover .attachment-overlay {
  opacity: 1;
}

.overlay-button {
  background: white;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-button:hover {
  background: #f5f5f5;
}

.attachment-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
}

.download-button {
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  border: none;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.attachment:hover .download-button {
  opacity: 1;
}

.attachment-name {
  margin-top: 4px;
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 140px;
  text-align: center;
}

.icon {
  width: 24px;
  height: 24px;
  color: #666;
}

.message-attachments {
  margin-left: 44px;
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.message-attachment {
  cursor: pointer;
}

.attachment-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.attachment-thumbnail {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.attachment-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-attachment:hover .attachment-overlay {
  opacity: 1;
}

.overlay-button {
  background: white;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
}

.overlay-button:hover {
  background: #f5f5f5;
}

.attachment-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
}

.download-button {
  position: absolute;
  top: -4px;
  right: -4px;
  background: white;
  border: none;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s;
}

.message-attachment:hover .download-button {
  opacity: 1;
}

.attachment-name {
  font-size: 12px;
  color: #666;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon {
  width: 16px;
  height: 16px;
  color: #666;
}

.date-separator {
  display: flex;
  align-items: center;
  margin: 28px 0;
  padding: 0 16px;
}

.date-line {
  flex: 1;
  height: 1px;
  background: #e5e5e5;
}

.date-text {
  padding: 0 16px;
  color: #666;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.message-input-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 16px;
  background: white;
}

.options-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.left-options,
.right-options {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #616161;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-button:hover {
  background: #edeef0;
  color: #1a73e8;
}

.option-button .icon {
  width: 16px;
  height: 16px;
}

.formatting-toolbar {
  display: flex;
  gap: 2px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.format-button {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #616161;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.format-button:hover {
  background: #f5f5f5;
  color: #1a73e8;
}

.format-icon {
  width: 16px;
  height: 16px;
}

.input-wrapper {
  padding: 8px;
  display: flex;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  border: none;
  padding: 8px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  max-height: 150px;
  overflow-y: auto;
}

.message-input:focus {
  outline: none;
}

.input-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.action-button {
  background: none;
  border: none;
  padding: 4px;
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
  color: #616161;
}

/* Message formatting styles */
:deep(.message-content strong) {
  font-weight: 600;
}

:deep(.message-content em) {
  font-style: italic;
}

:deep(.message-content code) {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 90%;
}

:deep(.message-content li) {
  margin-left: 20px;
  list-style-type: disc;
}

:deep(.message-content .mention) {
  color: #1a73e8;
  font-weight: 500;
}

:deep(.message-content .channel) {
  color: #1a73e8;
  font-weight: 500;
}
</style>
