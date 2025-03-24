<script setup lang="ts">
import ChatSidebar from './components/ChatSidebar.vue'
import ChatView from './components/ChatView.vue'
</script>

<template>
  <div class="app-container">
    <ChatSidebar />
    <ChatView />
  </div>
</template>

<style>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
