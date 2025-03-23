<script setup lang="ts">
// Главный компонент приложения
</script>

<template>
  <router-view />
</template>

<style>
:root {
  --primary-color: #003399;
  --background-color: #fff;
  --text-color: #333;
  --border-color: #ddd;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.5;
  min-height: 100vh;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}
</style>
