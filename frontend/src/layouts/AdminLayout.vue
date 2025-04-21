<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="250px">
        <el-menu
          :router="true"
          class="el-menu-vertical"
          :default-active="$route.path"
        >
          <el-menu-item index="/admin">
            <el-icon><Monitor /></el-icon>
            <span>儀表板</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用戶管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/merchants">
            <el-icon><Shop /></el-icon>
            <span>商家管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/stores">
            <el-icon><House /></el-icon>
            <span>店鋪管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/qrcodes">
            <el-icon><Document /></el-icon>
            <span>QR碼管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/campaigns">
            <el-icon><Promotion /></el-icon>
            <span>活動管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/analytics">
            <el-icon><TrendCharts /></el-icon>
            <span>數據分析</span>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系統設置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { Monitor, User, Shop, House, Document, Promotion, TrendCharts, Setting } from '@element-plus/icons-vue'
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.el-container {
  height: 100vh;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.el-menu {
  border-right: none;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-menu-vertical {
  height: 100%;
}
</style> 