<template>
  <div class="dashboard-content">
    <el-row :gutter="20">
      <!-- 統計卡片 -->
      <el-col :span="6" v-for="(stat, index) in stats" :key="index">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="stat-header">
              <el-icon :size="24" :class="stat.icon">
                <component :is="stat.icon" />
              </el-icon>
              <span>{{ stat.title }}</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-trend" :class="{ 'up': stat.trend > 0, 'down': stat.trend < 0 }">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 活動圖表 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活動趨勢</span>
              <el-radio-group v-model="chartPeriod" size="small">
                <el-radio-button label="week">週</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- 這裡將添加圖表組件 -->
          </div>
        </el-card>
      </el-col>

      <!-- 最近活動 -->
      <el-col :span="8">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活動</span>
              <el-button text>查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in recentActivities"
              :key="index"
              :timestamp="activity.time"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 系統狀態 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系統狀態</span>
              <el-button text>刷新</el-button>
            </div>
          </template>
          <el-table :data="systemStatus" style="width: 100%">
            <el-table-column prop="name" label="服務" />
            <el-table-column prop="status" label="狀態">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
                  {{ row.status === 'normal' ? '正常' : '異常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uptime" label="運行時間" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 待處理事項 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待處理事項</span>
              <el-button text>查看全部</el-button>
            </div>
          </template>
          <el-table :data="todoItems" style="width: 100%">
            <el-table-column prop="title" label="事項" />
            <el-table-column prop="priority" label="優先級">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)">
                  {{ row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="deadline" label="截止時間" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  User,
  Shop,
  Ticket,
  Money,
} from '@element-plus/icons-vue'

// 統計數據
const stats = ref([
  {
    title: '總用戶數',
    value: '1,234',
    trend: 15,
    icon: 'User'
  },
  {
    title: '商戶數量',
    value: '56',
    trend: 8,
    icon: 'Shop'
  },
  {
    title: '今日簽到',
    value: '328',
    trend: 12,
    icon: 'Ticket'
  },
  {
    title: '本月收入',
    value: '¥12,345',
    trend: -5,
    icon: 'Money'
  }
])

// 圖表週期
const chartPeriod = ref('week')

// 最近活動
const recentActivities = ref([
  {
    content: '新增商戶 "ABC店鋪"',
    time: '10分鐘前',
    type: 'success'
  },
  {
    content: '用戶 "張三" 完成註冊',
    time: '23分鐘前',
    type: 'info'
  },
  {
    content: '系統更新完成',
    time: '1小時前',
    type: 'warning'
  }
])

// 系統狀態
const systemStatus = ref([
  {
    name: '用戶服務',
    status: 'normal',
    uptime: '30天'
  },
  {
    name: '數據庫',
    status: 'normal',
    uptime: '30天'
  },
  {
    name: 'API服務',
    status: 'normal',
    uptime: '15天'
  }
])

// 待處理事項
const todoItems = ref([
  {
    title: '審核新商戶申請',
    priority: '高',
    deadline: '今天'
  },
  {
    title: '處理用戶反饋',
    priority: '中',
    deadline: '明天'
  },
  {
    title: '系統維護',
    priority: '低',
    deadline: '本週五'
  }
])

// 獲取優先級標籤類型
const getPriorityType = (priority) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[priority] || 'info'
}
</script>

<style scoped>
.dashboard-content {
  margin-top: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.stat-trend {
  font-size: 14px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

.mt-4 {
  margin-top: 16px;
}

.activity-card {
  height: 400px;
  overflow-y: auto;
}
</style> 