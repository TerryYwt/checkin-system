<template>
  <div class="app">
    <Navigation v-if="isAuthenticated" />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './store/auth'
import Navigation from './components/Navigation.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style>
.app {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  padding: 2rem;
  margin-top: 1rem;
}

/* 全局樣式 */
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style> 