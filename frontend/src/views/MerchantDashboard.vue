<template>
  <div class="merchant-dashboard">
    <!-- 頂部統計卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(stat, index) in dashboardStats" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要內容區 -->
    <el-row :gutter="20" class="mt-4">
      <!-- 左側：今日到店列表 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>今日到店列表</span>
              <div>
                <el-button type="primary" @click="openScanner">掃描 QR Code</el-button>
                <el-button @click="refreshCheckins">刷新</el-button>
              </div>
            </div>
          </template>
          <el-table :data="todayCheckins" style="width: 100%" v-loading="loading">
            <el-table-column prop="time" label="時間" width="180" />
            <el-table-column prop="customerName" label="顧客姓名" width="120" />
            <el-table-column prop="phone" label="電話" width="120" />
            <el-table-column prop="status" label="狀態">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button 
                  link 
                  type="primary" 
                  @click="updateStatus(row)"
                  :disabled="row.status === 'completed'"
                >
                  更新狀態
                </el-button>
                <el-button link type="primary" @click="viewDetails(row)">
                  查看詳情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右側：快速操作和提醒 -->
      <el-col :span="8">
        <el-card class="mb-4">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" icon="Plus" @click="openScanner">
              掃描到店
            </el-button>
            <el-button type="success" icon="Document" @click="viewReports">
              查看報表
            </el-button>
            <el-button type="info" icon="Setting" @click="openSettings">
              商店設置
            </el-button>
          </div>
        </el-card>

        <el-card>
          <template #header>
            <div class="card-header">
              <span>待處理提醒</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(reminder, index) in reminders"
              :key="index"
              :type="reminder.type"
              :timestamp="reminder.time"
            >
              {{ reminder.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 更新狀態對話框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新顧客狀態"
      width="400px"
    >
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="當前狀態">
          <el-tag :type="getStatusType(currentCustomer?.status)">
            {{ getStatusText(currentCustomer?.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新狀態">
          <el-select v-model="statusForm.newStatus" style="width: 100%">
            <el-option
              v-for="status in availableStatuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="備註">
          <el-input
            v-model="statusForm.note"
            type="textarea"
            rows="3"
            placeholder="請輸入備註信息（選填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStatusUpdate">
            確認更新
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 顧客詳情對話框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="顧客詳情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">
          {{ currentCustomer?.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="電話">
          {{ currentCustomer?.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="到店時間">
          {{ currentCustomer?.time }}
        </el-descriptions-item>
        <el-descriptions-item label="當前狀態">
          <el-tag :type="getStatusType(currentCustomer?.status)">
            {{ getStatusText(currentCustomer?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="備註" :span="2">
          {{ currentCustomer?.note || '無' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider>歷史記錄</el-divider>
      
      <el-timeline>
        <el-timeline-item
          v-for="(record, index) in currentCustomer?.history"
          :key="index"
          :timestamp="record.time"
          :type="record.type"
        >
          {{ record.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

// 儀表板統計數據
const dashboardStats = ref([
  { title: '今日到店', value: '23', trend: 15 },
  { title: '待處理', value: '5', trend: -2 },
  { title: '完成服務', value: '18', trend: 20 },
  { title: '轉換率', value: '78%', trend: 5 }
])

// 今日到店列表
const todayCheckins = ref([])

// 提醒事項
const reminders = ref([
  { 
    time: '10:30',
    content: '張小姐預約取貨',
    type: 'warning'
  },
  {
    time: '11:00',
    content: '李先生到店提醒',
    type: 'primary'
  },
  {
    time: '14:30',
    content: '庫存盤點提醒',
    type: 'info'
  }
])

// 狀態管理
const statusDialogVisible = ref(false)
const detailsDialogVisible = ref(false)
const currentCustomer = ref(null)
const statusForm = reactive({
  newStatus: '',
  note: ''
})

const availableStatuses = [
  { label: '已到店', value: 'arrived' },
  { label: '試戴中', value: 'trying' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

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
const openScanner = () => {
  router.push('/merchant/scanner')
}

const viewReports = () => {
  router.push('/merchant/reports')
}

const openSettings = () => {
  router.push('/merchant/settings')
}

const refreshCheckins = async () => {
  loading.value = true
  try {
    // 調用 API 獲取今日到店數據
    // const response = await axios.get('/api/merchant/checkins/today')
    // todayCheckins.value = response.data
    ElMessage.success('數據已更新')
  } catch (error) {
    ElMessage.error('更新數據失敗')
  } finally {
    loading.value = false
  }
}

const updateStatus = (customer) => {
  currentCustomer.value = customer
  statusForm.newStatus = customer.status
  statusForm.note = ''
  statusDialogVisible.value = true
}

const viewDetails = (customer) => {
  currentCustomer.value = customer
  detailsDialogVisible.value = true
}

const submitStatusUpdate = async () => {
  try {
    // 調用 API 更新狀態
    // await axios.post(`/api/merchant/customers/${currentCustomer.value.id}/status`, statusForm)
    ElMessage.success('狀態更新成功')
    statusDialogVisible.value = false
    await refreshCheckins()
  } catch (error) {
    ElMessage.error('更新狀態失敗')
  }
}

// 初始化
onMounted(async () => {
  await refreshCheckins()
})
</script>

<style scoped>
.merchant-dashboard {
  padding: 20px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-actions .el-button {
  margin-left: 0;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style> 