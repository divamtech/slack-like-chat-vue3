<script setup lang="ts">
import ChatSidebar from './components/ChatSidebar.vue'
import ChatView from './components/ChatView.vue'
</script>

<template>
  <div class="chat-container">
    <ChatSidebar />
    <ChatView />
  </div>
</template>

<style>
#app {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.chat-container {
  display: flex;
  width: 100%;
  height: 100%;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
