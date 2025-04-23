<template>
  <div class="analytics">
    <el-row :gutter="20">
      <!-- 概覽卡片 -->
      <el-col :span="6" v-for="card in overviewCards" :key="card.title">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-value">{{ card.value }}</div>
            <div class="card-change" :class="{ 'positive': card.change > 0, 'negative': card.change < 0 }">
              {{ card.change > 0 ? '+' : '' }}{{ card.change }}%
              較上週
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 趨勢圖 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>使用趨勢</span>
              <el-radio-group v-model="trendTimeRange" size="small">
                <el-radio-button label="week">週</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>

      <!-- 分布圖 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用戶分布</span>
            </div>
          </template>
          <div ref="distributionChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 商店排名 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>商店排名</span>
              <el-select v-model="storeRankingType" size="small">
                <el-option label="簽到次數" value="checkins" />
                <el-option label="活躍用戶" value="activeUsers" />
              </el-select>
            </div>
          </template>
          <el-table :data="storeRankings" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="storeName" label="商店名稱" />
            <el-table-column prop="value" label="數值" width="120">
              <template #default="{ row }">
                {{ row.value }}
                {{ storeRankingType === 'checkins' ? '次' : '人' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 最近活動 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近活動</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.time"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as echarts from 'echarts'

// 數據
const overviewCards = ref([
  { title: '總用戶數', value: 0, change: 0 },
  { title: '本月新增用戶', value: 0, change: 0 },
  { title: '今日簽到數', value: 0, change: 0 },
  { title: '活躍商店數', value: 0, change: 0 }
])

const trendTimeRange = ref('week')
const storeRankingType = ref('checkins')
const trendChartRef = ref(null)
const distributionChartRef = ref(null)
let trendChart = null
let distributionChart = null

const storeRankings = ref([])
const recentActivities = ref([])

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchOverviewData(),
    fetchTrendData(),
    fetchDistributionData(),
    fetchStoreRankings(),
    fetchRecentActivities()
  ])
  
  // 初始化圖表
  trendChart = echarts.init(trendChartRef.value)
  distributionChart = echarts.init(distributionChartRef.value)
  
  // 監聽窗口大小變化
  window.addEventListener('resize', () => {
    trendChart?.resize()
    distributionChart?.resize()
  })
})

// 監聽時間範圍變化
watch(trendTimeRange, () => {
  fetchTrendData()
})

// 監聽排名類型變化
watch(storeRankingType, () => {
  fetchStoreRankings()
})

// 獲取概覽數據
const fetchOverviewData = async () => {
  try {
    const response = await axios.get('/admin/analytics/overview')
    overviewCards.value = response.data
  } catch (error) {
    ElMessage.error('獲取概覽數據失敗')
  }
}

// 獲取趨勢數據
const fetchTrendData = async () => {
  try {
    const response = await axios.get('/admin/analytics/trend', {
      params: { timeRange: trendTimeRange.value }
    })
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['簽到數', '新增用戶']
      },
      xAxis: {
        type: 'category',
        data: response.data.dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '簽到數',
          type: 'line',
          data: response.data.checkins,
          smooth: true
        },
        {
          name: '新增用戶',
          type: 'line',
          data: response.data.newUsers,
          smooth: true
        }
      ]
    }
    
    trendChart?.setOption(option)
  } catch (error) {
    ElMessage.error('獲取趨勢數據失敗')
  }
}

// 獲取分布數據
const fetchDistributionData = async () => {
  try {
    const response = await axios.get('/admin/analytics/distribution')
    
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '用戶分布',
          type: 'pie',
          radius: '50%',
          data: response.data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    
    distributionChart?.setOption(option)
  } catch (error) {
    ElMessage.error('獲取分布數據失敗')
  }
}

// 獲取商店排名
const fetchStoreRankings = async () => {
  try {
    const response = await axios.get('/admin/analytics/store-rankings', {
      params: { type: storeRankingType.value }
    })
    storeRankings.value = response.data
  } catch (error) {
    ElMessage.error('獲取商店排名失敗')
  }
}

// 獲取最近活動
const fetchRecentActivities = async () => {
  try {
    const response = await axios.get('/admin/analytics/recent-activities')
    recentActivities.value = response.data
  } catch (error) {
    ElMessage.error('獲取最近活動失敗')
  }
}
</script>

<style scoped>
.analytics {
  padding: 20px;
}

.overview-card {
  height: 120px;
}

.card-content {
  text-align: center;
}

.card-title {
  font-size: 14px;
  color: #909399;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.card-change {
  font-size: 12px;
}

.card-change.positive {
  color: #67C23A;
}

.card-change.negative {
  color: #F56C6C;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 16px;
}
</style> 