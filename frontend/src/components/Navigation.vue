<!-- frontend/src/components/Navigation.vue -->
<template>
  <nav class="navigation">
    <!-- 管理員導航 -->
    <template v-if="isAdmin">
      <router-link to="/admin" class="nav-item">
        <el-icon><Monitor /></el-icon>
        管理儀表板
      </router-link>
      <router-link to="/admin/users" class="nav-item">
        <el-icon><User /></el-icon>
        用戶管理
      </router-link>
      <router-link to="/admin/merchants" class="nav-item">
        <el-icon><Shop /></el-icon>
        商戶管理
      </router-link>
      <router-link to="/admin/stores" class="nav-item">
        <el-icon><House /></el-icon>
        商店管理
      </router-link>
      <router-link to="/admin/qrcodes" class="nav-item">
        <el-icon><Document /></el-icon>
        QR Code管理
      </router-link>
      <router-link to="/admin/campaigns" class="nav-item">
        <el-icon><Promotion /></el-icon>
        營銷活動
      </router-link>
      <router-link to="/admin/analytics" class="nav-item">
        <el-icon><DataLine /></el-icon>
        數據分析
      </router-link>
      <router-link to="/admin/settings" class="nav-item">
        <el-icon><Setting /></el-icon>
        系統設置
      </router-link>
    </template>

    <!-- 商戶導航 -->
    <template v-else-if="isMerchant">
      <router-link to="/merchant/dashboard" class="nav-item">
        <el-icon><Monitor /></el-icon>
        商戶儀表板
      </router-link>
      <router-link to="/merchant/checkins" class="nav-item">
        <el-icon><List /></el-icon>
        簽到記錄
      </router-link>
      <router-link to="/merchant/scanner" class="nav-item">
        <el-icon><Aim /></el-icon>
        掃碼簽到
      </router-link>
      <router-link to="/merchant/settings" class="nav-item">
        <el-icon><Setting /></el-icon>
        商戶設置
      </router-link>
    </template>

    <!-- 普通用戶導航 -->
    <template v-else>
      <router-link to="/checkin" class="nav-item">
        <el-icon><Calendar /></el-icon>
        簽到
      </router-link>
      <router-link to="/records" class="nav-item">
        <el-icon><List /></el-icon>
        記錄查詢
      </router-link>
      <router-link to="/qrcode" class="nav-item">
        <el-icon><Document /></el-icon>
        QR Code掃描
      </router-link>
    </template>

    <!-- 用戶信息和登出 -->
    <div class="user-info">
      <span>{{ username }}</span>
      <el-button link @click="handleLogout">登出</el-button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import {
  Monitor,
  User,
  Shop,
  House,
  Document,
  Promotion,
  DataLine,
  Setting,
  Calendar,
  List,
  Aim
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)
const isMerchant = computed(() => authStore.user?.role === 'merchant')
const username = computed(() => authStore.user?.username)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navigation {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #606266;
  text-decoration: none;
  margin-right: 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  color: #409EFF;
  background-color: #ecf5ff;
}

.nav-item .el-icon {
  margin-right: 0.5rem;
}

.user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.router-link-active {
  color: #409EFF;
  background-color: #ecf5ff;
}
</style> 