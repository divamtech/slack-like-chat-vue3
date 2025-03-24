<script setup lang="ts">
import { ref, computed } from 'vue'
import { PaperClipIcon } from '@heroicons/vue/24/outline'

interface Message {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
  attachments?: string[]
}

interface Suggestion {
  type: 'user' | 'channel'
  text: string
}

const messages = ref<Message[]>([
  {
    id: '1',
    user: 'Batman Weave',
    avatar: 'BW',
    content: 'Hey @Chipi Chipa! Check #testing-mehuk-kanika-bhrugu',
    timestamp: '2:30 PM'
  },
  {
    id: '2',
    user: 'Chipi Chipa',
    avatar: 'CC',
    content: 'Just working on the new features in #general!',
    timestamp: '2:31 PM'
  }
])

const newMessage = ref('')
const showSuggestions = ref(false)
const cursorPosition = ref(0)
const attachments = ref<File[]>([])

const users = [
  'Batman Weave',
  'Chipi Chipa',
  'Nikunj Rami test'
]

const channels = [
  'testing-mehuk-kanika-bhrugu',
  'general',
  'random'
]

const suggestions = computed(() => {
  const text = newMessage.value.slice(0, cursorPosition.value)
  const mentionMatch = text.match(/@(\w*)$/)
  const channelMatch = text.match(/#(\w*)$/)

  if (mentionMatch) {
    const query = mentionMatch[1].toLowerCase()
    return users
      .filter(user => user.toLowerCase().includes(query))
      .map(user => ({ type: 'user' as const, text: user }))
  }

  if (channelMatch) {
    const query = channelMatch[1].toLowerCase()
    return channels
      .filter(channel => channel.toLowerCase().includes(query))
      .map(channel => ({ type: 'channel' as const, text: channel }))
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
  
  newMessage.value = 
    beforeCursor.slice(0, lastIndex) + 
    prefix + suggestion.text + ' ' + 
    afterCursor

  showSuggestions.value = false
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    attachments.value = [...attachments.value, ...Array.from(input.files)]
  }
}

const removeAttachment = (index: number) => {
  attachments.value.splice(index, 1)
}

const formatMessage = (content: string) => {
  content = content.replace(/@(\w+\s?\w+)/g, '<span class="mention">@$1</span>')
  content = content.replace(/#([\w-]+)/g, '<span class="channel">#$1</span>')
  return content
}

const sendMessage = () => {
  if (newMessage.value.trim() || attachments.value.length > 0) {
    messages.value.push({
      id: Date.now().toString(),
      user: 'You',
      avatar: 'ME',
      content: newMessage.value,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.value.map(file => file.name)
    })
    newMessage.value = ''
    attachments.value = []
  }
}
</script>

<template>
  <div class="chat-view">
    <div class="messages">
      <div v-for="message in messages" :key="message.id" class="message">
        <div class="message-header">
          <div class="avatar">{{ message.avatar }}</div>
          <span class="username">{{ message.user }}</span>
          <span class="timestamp">{{ message.timestamp }}</span>
        </div>
        <div class="message-content" v-html="formatMessage(message.content)"></div>
        <div v-if="message.attachments?.length" class="attachments">
          <div v-for="attachment in message.attachments" :key="attachment" class="attachment">
            <PaperClipIcon class="attachment-icon" />
            {{ attachment }}
          </div>
        </div>
      </div>
    </div>
    <div class="editor">
      <div class="editor-container">
        <textarea
          v-model="newMessage"
          placeholder="Message #general (Use @ for mentions and # for channels)"
          @keydown.enter.prevent="sendMessage"
          @input="handleInput"
        ></textarea>
        
        <div v-if="showSuggestions" class="suggestions">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.text"
            class="suggestion"
            @click="applySuggestion(suggestion)"
          >
            <span class="suggestion-prefix">{{ suggestion.type === 'user' ? '@' : '#' }}</span>
            {{ suggestion.text }}
          </div>
        </div>

        <div class="attachments-preview" v-if="attachments.length">
          <div v-for="(file, index) in attachments" :key="file.name" class="attachment">
            <PaperClipIcon class="attachment-icon" />
            {{ file.name }}
            <button class="remove-attachment" @click="removeAttachment(index)">×</button>
          </div>
        </div>
      </div>

      <div class="editor-actions">
        <label class="attachment-button">
          <PaperClipIcon class="icon" />
          <input
            type="file"
            multiple
            @change="handleFileUpload"
            style="display: none"
          >
        </label>
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
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
  color: #1264A3;
  background-color: #E8F5FA;
  padding: 0 4px;
  border-radius: 3px;
  cursor: pointer;
}

.message-content :deep(.mention):hover {
  text-decoration: underline;
}

.message-content :deep(.channel) {
  color: #1264A3;
  cursor: pointer;
}

.message-content :deep(.channel):hover {
  text-decoration: underline;
}

.editor {
  border-top: 1px solid #e5e5e5;
  padding: 20px;
  background: white;
}

.editor-container {
  position: relative;
}

textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  resize: none;
  margin-bottom: 8px;
  font-family: inherit;
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
}

.attachment-button {
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.attachment-button:hover {
  background: #f5f5f5;
}

.icon {
  width: 20px;
  height: 20px;
  color: #666;
}

button {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1557b0;
}

.attachments, .attachments-preview {
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
</style>