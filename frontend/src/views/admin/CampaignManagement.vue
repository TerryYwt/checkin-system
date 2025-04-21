<template>
  <div class="campaign-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>營銷活動管理</span>
          <el-button type="primary" @click="dialogVisible = true">新增活動</el-button>
        </div>
      </template>

      <!-- 搜索表單 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline mb-4">
        <el-form-item label="活動名稱">
          <el-input v-model="searchForm.name" placeholder="請輸入活動名稱" />
        </el-form-item>
        <el-form-item label="活動類型">
          <el-select v-model="searchForm.type" placeholder="請選擇活動類型">
            <el-option label="簽到獎勵" value="checkin" />
            <el-option label="消費優惠" value="discount" />
            <el-option label="積分活動" value="points" />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態">
            <el-option label="進行中" value="active" />
            <el-option label="已結束" value="ended" />
            <el-option label="未開始" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 活動列表 -->
      <el-table :data="campaigns" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活動名稱" />
        <el-table-column prop="type" label="活動類型">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="開始時間">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="結束時間">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participantsCount" label="參與人數" width="100" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">編輯</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '結束' : '啟動' }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleViewStats(row)"
            >統計</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '編輯活動' : '新增活動'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活動名稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="活動類型" prop="type">
          <el-select v-model="form.type" placeholder="請選擇活動類型">
            <el-option label="簽到獎勵" value="checkin" />
            <el-option label="消費優惠" value="discount" />
            <el-option label="積分活動" value="points" />
          </el-select>
        </el-form-item>
        <el-form-item label="活動時間" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          />
        </el-form-item>
        <el-form-item label="活動描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="獎勵設置" prop="reward">
          <el-input-number
            v-model="form.reward"
            :min="1"
            :max="1000"
            :precision="0"
          />
          <span class="ml-2">{{ getRewardUnit(form.type) }}</span>
        </el-form-item>
        <el-form-item label="參與條件" prop="conditions">
          <el-input
            v-model="form.conditions"
            type="textarea"
            :rows="2"
            placeholder="請輸入參與條件"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 統計對話框 -->
    <el-dialog
      v-model="statsDialogVisible"
      title="活動統計"
      width="800px"
    >
      <el-row :gutter="20" v-if="stats">
        <el-col :span="8">
          <div class="stats-card">
            <div class="stats-label">參與人數</div>
            <div class="stats-value">{{ stats.participantsCount }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stats-card">
            <div class="stats-label">完成率</div>
            <div class="stats-value">{{ stats.completionRate }}%</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stats-card">
            <div class="stats-label">發放獎勵</div>
            <div class="stats-value">{{ stats.rewardsGiven }}</div>
          </div>
        </el-col>
      </el-row>
      
      <div ref="statsChartRef" style="height: 300px; margin-top: 20px"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import * as echarts from 'echarts'

// 數據
const campaigns = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const statsDialogVisible = ref(false)
const formRef = ref()
const statsChartRef = ref(null)
let statsChart = null
const stats = ref(null)

// 搜索表單
const searchForm = ref({
  name: '',
  type: '',
  status: ''
})

// 表單數據
const form = ref({
  id: '',
  name: '',
  type: '',
  dateRange: [],
  description: '',
  reward: 1,
  conditions: ''
})

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入活動名稱', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '請選擇活動類型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '請選擇活動時間', trigger: 'change' }
  ],
  description: [
    { required: true, message: '請輸入活動描述', trigger: 'blur' }
  ],
  reward: [
    { required: true, message: '請設置獎勵', trigger: 'blur' }
  ],
  conditions: [
    { required: true, message: '請輸入參與條件', trigger: 'blur' }
  ]
}

// 初始化
onMounted(async () => {
  await fetchCampaigns()
})

// 獲取活動列表
const fetchCampaigns = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    }
    const response = await axios.get('/api/admin/campaigns', { params })
    campaigns.value = response.data.campaigns
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('獲取活動列表失敗')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchCampaigns()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    name: '',
    type: '',
    status: ''
  }
  handleSearch()
}

// 編輯活動
const handleEdit = (row) => {
  form.value = {
    ...row,
    dateRange: [row.startDate, row.endDate]
  }
  dialogVisible.value = true
}

// 切換狀態
const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `確定要${row.status === 'active' ? '結束' : '啟動'}該活動嗎？`,
      '提示',
      {
        type: 'warning'
      }
    )
    await axios.put(`/api/admin/campaigns/${row.id}/status`, {
      status: row.status === 'active' ? 'ended' : 'active'
    })
    ElMessage.success('操作成功')
    fetchCampaigns()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失敗')
    }
  }
}

// 查看統計
const handleViewStats = async (row) => {
  try {
    const response = await axios.get(`/api/admin/campaigns/${row.id}/stats`)
    stats.value = response.data
    statsDialogVisible.value = true
    
    // 初始化圖表
    setTimeout(() => {
      if (!statsChart) {
        statsChart = echarts.init(statsChartRef.value)
      }
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['參與人數', '完成人數']
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
            name: '參與人數',
            type: 'line',
            data: response.data.participants
          },
          {
            name: '完成人數',
            type: 'line',
            data: response.data.completions
          }
        ]
      }
      
      statsChart.setOption(option)
    })
  } catch (error) {
    ElMessage.error('獲取統計數據失敗')
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    const data = {
      ...form.value,
      startDate: form.value.dateRange[0],
      endDate: form.value.dateRange[1]
    }
    delete data.dateRange
    
    if (data.id) {
      await axios.put(`/api/admin/campaigns/${data.id}`, data)
      ElMessage.success('更新成功')
    } else {
      await axios.post('/api/admin/campaigns', data)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchCampaigns()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失敗')
    }
  }
}

// 分頁
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchCampaigns()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchCampaigns()
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 獲取類型標籤樣式
const getTypeTagType = (type) => {
  const types = {
    checkin: 'success',
    discount: 'warning',
    points: 'info'
  }
  return types[type] || 'info'
}

// 獲取類型標籤文字
const getTypeLabel = (type) => {
  const types = {
    checkin: '簽到獎勵',
    discount: '消費優惠',
    points: '積分活動'
  }
  return types[type] || type
}

// 獲取狀態標籤樣式
const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    ended: 'info',
    pending: 'warning'
  }
  return types[status] || 'info'
}

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const types = {
    active: '進行中',
    ended: '已結束',
    pending: '未開始'
  }
  return types[status] || status
}

// 獲取獎勵單位
const getRewardUnit = (type) => {
  const units = {
    checkin: '積分',
    discount: '折',
    points: '積分'
  }
  return units[type] || '積分'
}
</script>

<style scoped>
.campaign-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.mb-4 {
  margin-bottom: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.stats-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style> 