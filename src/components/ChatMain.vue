<script setup lang="ts">
import ChatSidebar from './ChatSidebar.vue'
import ChatView from './ChatView.vue'
</script>

<template>
  <div class="chat-container">
    <ChatSidebar />
    <ChatView />
  </div>
</template>

<style>
.chat-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
