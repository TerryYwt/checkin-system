<template>
  <header class="header">
    <h1>{{ title }}</h1>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Check-in System'
  }
})
</script>

<style scoped>
.header {
  background-color: #f0f2f5;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0;
  color: #2c3e50;
}
</style> 