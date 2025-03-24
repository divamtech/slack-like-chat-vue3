<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

interface DirectMessage {
  id: string
  name: string
  avatar: string
  online: boolean
}

const directMessages: DirectMessage[] = [
  { id: '1', name: 'batman weave', avatar: 'BW', online: false },
  { id: '2', name: 'Chipi Chipa', avatar: 'CC', online: false },
  { id: '3', name: 'Nikunj Rami test', avatar: 'NR', online: false },
]

const isChannelsExpanded = ref(true)
const isDMsExpanded = ref(true)

const toggleChannels = () => {
  isChannelsExpanded.value = !isChannelsExpanded.value
}

const toggleDMs = () => {
  isDMsExpanded.value = !isDMsExpanded.value
}
</script>

<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="header">
      <div class="header-title">
        <h1>Team Chat</h1>
        <ChevronDownIcon class="icon" />
      </div>
      <PencilSquareIcon class="icon" />
    </div>

    <!-- Mentions -->
    <div class="section">
      <div class="flex-row">
        <span class="text-gray">@</span>
        <span>Mentions</span>
      </div>
    </div>

    <!-- Channels -->
    <div class="section">
      <div class="flex-row space-between">
        <div class="flex-row clickable" @click="toggleChannels">
          <ChevronDownIcon class="icon" :class="{ 'rotate-icon': !isChannelsExpanded }" />
          <span>Groups</span>
        </div>
        <button class="add-button">+</button>
      </div>
      <div v-show="isChannelsExpanded" class="channel-list">
        <p class="text-gray"># testing-mehuk-kanika-bhrugu</p>
      </div>
      <button v-show="isChannelsExpanded" class="add-button full">
        <span>+</span>
        <span>Add Group</span>
      </button>
    </div>

    <!-- Direct Messages -->
    <div class="section">
      <div class="flex-row space-between">
        <div class="flex-row clickable" @click="toggleDMs">
          <ChevronDownIcon class="icon" :class="{ 'rotate-icon': !isDMsExpanded }" />
          <span>Direct Messages</span>
        </div>
        <button class="add-button">+</button>
      </div>
      <div v-show="isDMsExpanded" class="dm-list">
        <div v-for="dm in directMessages" :key="dm.id" class="dm-item">
          <div class="avatar-container">
            <div class="avatar">
              {{ dm.avatar }}
            </div>
            <div class="status-dot" :class="{ online: dm.online }"></div>
          </div>
          <span>{{ dm.name }}</span>
        </div>
        <button class="add-button full">
          <span>+</span>
          <span>Add Direct Message</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px; /* Add this to prevent sidebar from shrinking */
  background: white;
  border-right: 1px solid #e5e5e5;
  height: 100vh;
  overflow-y: auto;
}

.header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.section {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.section:last-child {
  border-bottom: none;
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.space-between {
  justify-content: space-between;
}

.text-gray {
  color: #666;
}

.icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.rotate-icon {
  transform: rotate(-90deg);
}

.channel-list {
  margin-top: 8px;
  padding-left: 28px;
}

.add-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-button.full {
  padding-left: 28px;
  margin-top: 8px;
}

.dm-list {
  margin-top: 8px;
}

.dm-item {
  padding-left: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid white;
}

.status-dot.online {
  background: #44b700;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  opacity: 0.8;
}
</style>
