<template>
  <div class="admin-container">
    <el-tabs v-model="activeTab" type="card">
      <!-- 儀表板 -->
      <el-tab-pane label="儀表板" name="dashboard">
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
        
        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>最近活動</span>
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in recentActivities"
                  :key="index"
                  :timestamp="activity.time"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>系統狀態</span>
                </div>
              </template>
              <el-table :data="systemStatus" style="width: 100%">
                <el-table-column prop="component" label="組件" />
                <el-table-column prop="status" label="狀態">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 使用者管理 -->
      <el-tab-pane label="使用者管理" name="users">
        <div class="action-bar">
          <el-button type="primary" @click="showAddUserDialog">新增使用者</el-button>
          <el-input
            v-model="userSearchQuery"
            placeholder="搜索使用者"
            style="width: 200px; margin-left: 16px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用戶名" width="120" />
          <el-table-column prop="email" label="電子郵件" width="180" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
                {{ row.role === 'admin' ? '管理員' : '商戶' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '啟用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="editUser(row)">編輯</el-button>
              <el-button link type="danger" @click="deleteUser(row)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 商戶管理 -->
      <el-tab-pane label="商戶管理" name="merchants">
        <div class="action-bar">
          <el-button type="primary" @click="showAddMerchantDialog">新增商戶</el-button>
          <el-input
            v-model="merchantSearchQuery"
            placeholder="搜索商戶"
            style="width: 200px; margin-left: 16px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-table :data="filteredMerchants" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="商戶名稱" width="150" />
          <el-table-column prop="contact" label="聯繫人" width="120" />
          <el-table-column prop="phone" label="電話" width="120" />
          <el-table-column prop="email" label="電子郵件" width="180" />
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '啟用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="editMerchant(row)">編輯</el-button>
              <el-button link type="danger" @click="deleteMerchant(row)">刪除</el-button>
              <el-button link type="success" @click="manageStores(row)">管理商店</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 商店管理 -->
      <el-tab-pane label="商店管理" name="stores">
        <div class="action-bar">
          <el-button type="primary" @click="showAddStoreDialog">新增商店</el-button>
          <el-select v-model="selectedMerchant" placeholder="選擇商戶" style="width: 200px; margin-left: 16px;">
            <el-option
              v-for="merchant in merchants"
              :key="merchant.id"
              :label="merchant.name"
              :value="merchant.id"
            />
          </el-select>
          <el-input
            v-model="storeSearchQuery"
            placeholder="搜索商店"
            style="width: 200px; margin-left: 16px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-table :data="filteredStores" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="商店名稱" width="150" />
          <el-table-column prop="merchant" label="所屬商戶" width="150" />
          <el-table-column prop="address" label="地址" />
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '啟用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="editStore(row)">編輯</el-button>
              <el-button link type="danger" @click="deleteStore(row)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- QR Code 管理 -->
      <el-tab-pane label="QR Code 管理" name="qrcodes">
        <div class="action-bar">
          <el-button type="primary" @click="generateQRCodes">生成 QR Code</el-button>
          <el-select v-model="qrCodeFilter.merchant" placeholder="選擇商戶" style="width: 200px; margin-left: 16px;">
            <el-option
              v-for="merchant in merchants"
              :key="merchant.id"
              :label="merchant.name"
              :value="merchant.id"
            />
          </el-select>
          <el-select v-model="qrCodeFilter.status" placeholder="選擇狀態" style="width: 200px; margin-left: 16px;">
            <el-option label="全部" value="" />
            <el-option label="未使用" value="unused" />
            <el-option label="已使用" value="used" />
            <el-option label="已過期" value="expired" />
          </el-select>
        </div>

        <el-table :data="filteredQRCodes" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="code" label="QR Code" width="150" />
          <el-table-column prop="merchant" label="所屬商戶" width="150" />
          <el-table-column prop="store" label="所屬商店" width="150" />
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="getQRCodeStatusType(row.status)">
                {{ getQRCodeStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="生成時間" width="180" />
          <el-table-column prop="expiresAt" label="過期時間" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewQRCode(row)">查看</el-button>
              <el-button link type="danger" @click="deleteQRCode(row)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 行銷活動管理 -->
      <el-tab-pane label="行銷活動" name="campaigns">
        <div class="action-bar">
          <el-button type="primary" @click="showAddCampaignDialog">新增活動</el-button>
          <el-select v-model="campaignFilter.status" placeholder="選擇狀態" style="width: 200px; margin-left: 16px;">
            <el-option label="全部" value="" />
            <el-option label="進行中" value="active" />
            <el-option label="已結束" value="ended" />
            <el-option label="已暫停" value="paused" />
          </el-select>
        </div>

        <el-table :data="filteredCampaigns" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="活動名稱" width="150" />
          <el-table-column prop="type" label="類型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.type === 'whatsapp' ? 'success' : 'primary'">
                {{ row.type === 'whatsapp' ? 'WhatsApp' : 'QR Code' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="getCampaignStatusType(row.status)">
                {{ getCampaignStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="開始時間" width="180" />
          <el-table-column prop="endDate" label="結束時間" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="editCampaign(row)">編輯</el-button>
              <el-button link type="danger" @click="deleteCampaign(row)">刪除</el-button>
              <el-button link type="success" @click="viewCampaignStats(row)">統計</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 數據分析 -->
      <el-tab-pane label="數據分析" name="analytics">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>數據篩選</span>
                </div>
              </template>
              <el-form :inline="true" :model="analyticsFilter">
                <el-form-item label="時間範圍">
                  <el-date-picker
                    v-model="analyticsFilter.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="開始日期"
                    end-placeholder="結束日期"
                  />
                </el-form-item>
                <el-form-item label="商戶">
                  <el-select v-model="analyticsFilter.merchant" placeholder="選擇商戶">
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="merchant in merchants"
                      :key="merchant.id"
                      :label="merchant.name"
                      :value="merchant.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="updateAnalytics">更新數據</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>用戶註冊趨勢</span>
                </div>
              </template>
              <!-- 這裡可以添加圖表組件 -->
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>到店報到趨勢</span>
                </div>
              </template>
              <!-- 這裡可以添加圖表組件 -->
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mt-4">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>轉換率分析</span>
                </div>
              </template>
              <!-- 這裡可以添加轉換率分析表格 -->
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 系統設置 -->
      <el-tab-pane label="系統設置" name="settings">
        <el-form :model="settings" label-width="120px">
          <el-form-item label="系統名稱">
            <el-input v-model="settings.systemName" />
          </el-form-item>
          <el-form-item label="WhatsApp API 設置">
            <el-input v-model="settings.whatsappApiKey" placeholder="API Key" />
            <el-input v-model="settings.whatsappApiSecret" placeholder="API Secret" class="mt-2" />
          </el-form-item>
          <el-form-item label="QR Code 設置">
            <el-input-number v-model="settings.qrCodeExpiryDays" :min="1" :max="30" />
            <span class="ml-2">天後過期</span>
          </el-form-item>
          <el-form-item label="數據保留期限">
            <el-input-number v-model="settings.dataRetentionDays" :min="30" :max="365" />
            <span class="ml-2">天</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存設置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 各種對話框組件將在這裡添加 -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'

// 狀態管理
const activeTab = ref('dashboard')
const loading = ref(false)

// 儀表板數據
const dashboardStats = ref([
  { title: '總用戶數', value: '1,234', trend: 12 },
  { title: '總商戶數', value: '56', trend: 5 },
  { title: '總商店數', value: '89', trend: 8 },
  { title: '今日到店數', value: '45', trend: -2 }
])

const recentActivities = ref([
  { time: '2024-04-20 10:00', content: '新用戶註冊' },
  { time: '2024-04-20 09:30', content: '新商戶註冊' },
  { time: '2024-04-20 09:00', content: '系統更新完成' }
])

const systemStatus = ref([
  { component: '數據庫', status: '正常' },
  { component: 'API 服務', status: '正常' },
  { component: 'WhatsApp 服務', status: '正常' }
])

// 使用者管理
const userSearchQuery = ref('')
const users = ref([])
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value
  const query = userSearchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// 商戶管理
const merchantSearchQuery = ref('')
const merchants = ref([])
const filteredMerchants = computed(() => {
  if (!merchantSearchQuery.value) return merchants.value
  const query = merchantSearchQuery.value.toLowerCase()
  return merchants.value.filter(merchant => 
    merchant.name.toLowerCase().includes(query) ||
    merchant.contact.toLowerCase().includes(query)
  )
})

// 商店管理
const selectedMerchant = ref('')
const storeSearchQuery = ref('')
const stores = ref([])
const filteredStores = computed(() => {
  let result = stores.value
  if (selectedMerchant.value) {
    result = result.filter(store => store.merchantId === selectedMerchant.value)
  }
  if (storeSearchQuery.value) {
    const query = storeSearchQuery.value.toLowerCase()
    result = result.filter(store => 
      store.name.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query)
    )
  }
  return result
})

// QR Code 管理
const qrCodeFilter = reactive({
  merchant: '',
  status: ''
})
const qrcodes = ref([])
const filteredQRCodes = computed(() => {
  let result = qrcodes.value
  if (qrCodeFilter.merchant) {
    result = result.filter(qr => qr.merchantId === qrCodeFilter.merchant)
  }
  if (qrCodeFilter.status) {
    result = result.filter(qr => qr.status === qrCodeFilter.status)
  }
  return result
})

// 行銷活動管理
const campaignFilter = reactive({
  status: ''
})
const campaigns = ref([])
const filteredCampaigns = computed(() => {
  if (!campaignFilter.status) return campaigns.value
  return campaigns.value.filter(campaign => campaign.status === campaignFilter.status)
})

// 數據分析
const analyticsFilter = reactive({
  dateRange: [],
  merchant: ''
})

// 系統設置
const settings = reactive({
  systemName: '簽到系統',
  whatsappApiKey: '',
  whatsappApiSecret: '',
  qrCodeExpiryDays: 7,
  dataRetentionDays: 90
})

// 工具函數
const getQRCodeStatusType = (status) => {
  const types = {
    unused: 'success',
    used: 'info',
    expired: 'danger'
  }
  return types[status] || 'info'
}

const getQRCodeStatusText = (status) => {
  const texts = {
    unused: '未使用',
    used: '已使用',
    expired: '已過期'
  }
  return texts[status] || status
}

const getCampaignStatusType = (status) => {
  const types = {
    active: 'success',
    ended: 'info',
    paused: 'warning'
  }
  return types[status] || 'info'
}

const getCampaignStatusText = (status) => {
  const texts = {
    active: '進行中',
    ended: '已結束',
    paused: '已暫停'
  }
  return texts[status] || status
}

// 生命週期鉤子
onMounted(async () => {
  await loadInitialData()
})

// 數據加載函數
async function loadInitialData() {
  loading.value = true
  try {
    // 這裡應該調用 API 獲取數據
    // 示例：
    // const response = await axios.get('/api/dashboard/stats')
    // dashboardStats.value = response.data
  } catch (error) {
    ElMessage.error('加載數據失敗')
  } finally {
    loading.value = false
  }
}

// 各種操作函數
async function saveSettings() {
  try {
    // 調用 API 保存設置
    ElMessage.success('設置已保存')
  } catch (error) {
    ElMessage.error('保存設置失敗')
  }
}

async function updateAnalytics() {
  try {
    // 調用 API 更新分析數據
    ElMessage.success('數據已更新')
  } catch (error) {
    ElMessage.error('更新數據失敗')
  }
}

// 其他操作函數將在這裡添加
</script>

<style scoped>
.admin-container {
  padding: 20px;
}

.action-bar {
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

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 