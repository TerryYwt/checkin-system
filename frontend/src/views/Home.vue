<template>
  <div class="home">
    <h1>Welcome to Check-in System</h1>
    <el-button type="primary" @click="checkHealth">Check Backend Health</el-button>
    <p v-if="status">Backend Status: {{ status }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const status = ref('')

const checkHealth = async () => {
  try {
    const response = await axios.get('/api/health')
    status.value = response.data.status
  } catch (error) {
    status.value = 'Error: ' + error.message
  }
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  margin-bottom: 2rem;
}

p {
  margin-top: 1rem;
}
</style> 