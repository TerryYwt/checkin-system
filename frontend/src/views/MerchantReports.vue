<template>
  <div class="reports-container">
    <!-- 篩選器 -->
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>數據篩選</span>
        </div>
      </template>
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="時間範圍">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="filterForm.status" placeholder="選擇狀態">
            <el-option label="全部" value="" />
            <el-option label="已到店" value="arrived" />
            <el-option label="試戴中" value="trying" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateReports">更新數據</el-button>
          <el-button @click="exportData">導出報表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 數據概覽 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            <span class="trend-label">較上期</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 圖表區域 -->
    <el-row :gutter="20" class="mt-4">
      <!-- 到店趨勢圖 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>到店趨勢</span>
              <el-radio-group v-model="trendTimeUnit" size="small">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">週</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- 這裡將添加趨勢圖表 -->
          </div>
        </el-card>
      </el-col>

      <!-- 轉換漏斗圖 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>轉換漏斗</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 這裡將添加漏斗圖表 -->
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 詳細數據表格 -->
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>詳細數據</span>
          <div class="table-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索"
              style="width: 200px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredRecords"
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="date" label="日期" width="180" sortable />
        <el-table-column prop="customerName" label="顧客姓名" width="120" />
        <el-table-column prop="phone" label="電話" width="120" />
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="arrivalTime" label="到店時間" width="180" sortable />
        <el-table-column prop="completionTime" label="完成時間" width="180" sortable />
        <el-table-column prop="duration" label="處理時長" width="120" sortable />
        <el-table-column prop="note" label="備註" show-overflow-tooltip />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 篩選表單
const filterForm = reactive({
  dateRange: [],
  status: ''
})

// 日期快捷選項
const dateShortcuts = [
  {
    text: '最近一週',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一個月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三個月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 統計數據
const statistics = ref([
  { title: '總到店人數', value: '234', trend: 15 },
  { title: '完成率', value: '85%', trend: 5 },
  { title: '平均處理時間', value: '45分鐘', trend: -10 },
  { title: '轉換率', value: '60%', trend: 8 }
])

// 圖表相關
const trendTimeUnit = ref('day')

// 表格相關
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)
const records = ref([])

// 計算屬性：過濾後的記錄
const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value
  const query = searchQuery.value.toLowerCase()
  return records.value.filter(record => 
    record.customerName.toLowerCase().includes(query) ||
    record.phone.includes(query) ||
    record.note?.toLowerCase().includes(query)
  )
})

// 工具函數
const getStatusType = (status) => {
  const types = {
    arrived: 'primary',
    trying: 'warning',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    arrived: '已到店',
    trying: '試戴中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 操作函數
const updateReports = async () => {
  loading.value = true
  try {
    // 這裡應該調用 API 獲取報表數據
    // const response = await axios.get('/api/merchant/reports', { params: filterForm })
    // records.value = response.data.records
    // totalRecords.value = response.data.total
    ElMessage.success('數據已更新')
  } catch (error) {
    ElMessage.error('更新數據失敗')
  } finally {
    loading.value = false
  }
}

const exportData = async () => {
  try {
    // 這裡應該調用 API 導出數據
    // const response = await axios.get('/api/merchant/reports/export', { 
    //   params: filterForm,
    //   responseType: 'blob'
    // })
    // const url = window.URL.createObjectURL(new Blob([response.data]))
    // const link = document.createElement('a')
    // link.href = url
    // link.setAttribute('download', `報表_${new Date().toLocaleDateString()}.xlsx`)
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
    ElMessage.success('報表導出成功')
  } catch (error) {
    ElMessage.error('導出報表失敗')
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  updateReports()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  updateReports()
}

// 初始化
onMounted(async () => {
  // 設置默認時間範圍為最近一個月
  filterForm.dateRange = dateShortcuts[1].value()
  await updateReports()
})
</script>

<style scoped>
.reports-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.stat-trend {
  font-size: 12px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.trend-label {
  color: #909399;
  margin-left: 4px;
}

.chart-container {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 16px;
}
</style> 