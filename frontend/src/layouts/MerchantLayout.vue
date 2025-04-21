<template>
  <div class="merchant-layout">
    <el-container>
      <el-aside width="250px">
        <el-menu
          :router="true"
          class="el-menu-vertical"
          :default-active="$route.path"
          background-color="#fff"
          text-color="#303133"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/merchant/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>儀表板</span>
          </el-menu-item>
          <el-menu-item index="/merchant/checkins">
            <el-icon><Calendar /></el-icon>
            <span>打卡記錄</span>
          </el-menu-item>
          <el-menu-item index="/merchant/scanner">
            <el-icon><Cellphone /></el-icon>
            <span>掃碼工具</span>
          </el-menu-item>
          <el-menu-item index="/merchant/campaigns">
            <el-icon><Promotion /></el-icon>
            <span>活動</span>
          </el-menu-item>
          <el-menu-item index="/merchant/settings">
            <el-icon><Setting /></el-icon>
            <span>設置</span>
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
import { HomeFilled, Calendar, Cellphone, Setting, Promotion } from '@element-plus/icons-vue'
</script>

<style scoped>
.merchant-layout {
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