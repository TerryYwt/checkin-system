<template>
  <div class="merchant-detail">
    <el-page-header @back="goBack" :title="`商戶ID: ${merchantId}`">
      <template #content>
        <span class="page-header-title">{{ merchant.storeName || '商戶詳情' }}</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="openEditDialog">編輯商戶</el-button>
        <el-button 
          :type="merchant.status === 'active' ? 'danger' : 'success'"
          @click="toggleStatus"
        >
          {{ merchant.status === 'active' ? '禁用商戶' : '啟用商戶' }}
        </el-button>
      </template>
    </el-page-header>

    <div class="loading-container" v-if="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="merchant-details-container">
      <!-- 商戶基本信息卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <h3>商戶基本信息</h3>
          </div>
        </template>
        <div class="merchant-info">
          <div class="info-row">
            <div class="info-item">
              <span class="label">帳號:</span>
              <span class="value">{{ merchant.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">商店名稱:</span>
              <span class="value">{{ merchant.storeName }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">聯絡人:</span>
              <span class="value">{{ merchant.contactPerson }}</span>
            </div>
            <div class="info-item">
              <span class="label">電話:</span>
              <span class="value">{{ merchant.phone }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value">{{ merchant.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">地址:</span>
              <span class="value">{{ merchant.storeAddress }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">狀態:</span>
              <span class="value">
                <el-tag :type="merchant.status === 'active' ? 'success' : 'danger'">
                  {{ merchant.status === 'active' ? '啟用' : '禁用' }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">註冊日期:</span>
              <span class="value">{{ formatDate(merchant.createdAt) }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">最後登入:</span>
              <span class="value">{{ formatDate(merchant.lastLogin) }}</span>
            </div>
            <div class="info-item">
              <span class="label">更新日期:</span>
              <span class="value">{{ formatDate(merchant.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 統計數據卡片 -->
      <el-row :gutter="20" class="stat-cards">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <h3>總簽到次數</h3>
            <div class="stat-value">{{ stats.checkinCount || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <h3>活動數量</h3>
            <div class="stat-value">{{ stats.campaignCount || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <h3>QR碼數量</h3>
            <div class="stat-value">{{ stats.qrcodeCount || 0 }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 近期活動 -->
      <el-card class="activities-card">
        <template #header>
          <div class="card-header">
            <h3>近期活動</h3>
            <el-button type="primary" link @click="viewAllActivities">查看全部</el-button>
          </div>
        </template>
        <el-table :data="recentActivities" style="width: 100%" v-loading="loadingActivities">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="type" label="類型" width="120">
            <template #default="{ row }">
              <el-tag :type="getActivityTypeTag(row.type)">
                {{ getActivityTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="createdAt" label="日期" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 編輯商戶對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="編輯商戶"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="帳號" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="店名" prop="storeName">
          <el-input v-model="form.storeName" />
        </el-form-item>
        <el-form-item label="聯絡人" prop="contactPerson">
          <el-input v-model="form.contactPerson" />
        </el-form-item>
        <el-form-item label="電話" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item label="地址" prop="storeAddress">
          <el-input v-model="form.storeAddress" />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-select v-model="form.status">
            <el-option label="啟用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 路由參數
const route = useRoute()
const router = useRouter()
const merchantId = computed(() => route.params.id)

// 狀態變量
const merchant = ref({})
const stats = ref({})
const recentActivities = ref([])
const loading = ref(true)
const loadingActivities = ref(true)
const dialogVisible = ref(false)

// 表單相關
const formRef = ref(null)
const form = reactive({
  username: '',
  storeName: '',
  contactPerson: '',
  phone: '',
  email: '',
  storeAddress: '',
  status: 'active'
})

// 表單驗證規則
const rules = {
  storeName: [
    { required: true, message: '請輸入店名', trigger: 'blur' },
    { min: 2, max: 50, message: '長度應為2到50個字符', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '請輸入聯絡人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入電話', trigger: 'blur' },
    { pattern: /^[0-9\-+]{8,15}$/, message: '請輸入有效的電話號碼', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入Email', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的Email地址', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '請選擇狀態', trigger: 'change' }
  ]
}

// 獲取商戶詳情
const fetchMerchantDetails = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/admin/merchants/${merchantId.value}`)
    merchant.value = response.data
    
    // 填充表單數據
    Object.keys(form).forEach(key => {
      if (merchant.value[key] !== undefined) {
        form[key] = merchant.value[key]
      }
    })
    
    loading.value = false
  } catch (error) {
    ElMessage.error('獲取商戶詳情失敗')
    console.error('Error fetching merchant details:', error)
    loading.value = false
  }
}

// 獲取商戶統計數據
const fetchMerchantStats = async () => {
  try {
    const response = await axios.get(`/api/admin/merchants/${merchantId.value}/stats`)
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching merchant stats:', error)
  }
}

// 獲取商戶近期活動
const fetchRecentActivities = async () => {
  try {
    loadingActivities.value = true
    const response = await axios.get(`/api/admin/merchants/${merchantId.value}/activities?limit=5`)
    recentActivities.value = response.data
    loadingActivities.value = false
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    loadingActivities.value = false
  }
}

// 返回上一頁
const goBack = () => {
  router.push('/admin/merchants')
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString()
}

// 開啟編輯對話框
const openEditDialog = () => {
  dialogVisible.value = true
}

// 提交表單
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.put(`/api/admin/merchants/${merchantId.value}`, form)
        
        if (response.data) {
          ElMessage.success('更新成功')
          merchant.value = { ...merchant.value, ...form }
          dialogVisible.value = false
        }
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '更新失敗')
      }
    }
  })
}

// 切換狀態
const toggleStatus = async () => {
  const newStatus = merchant.value.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '啟用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `確定要${action}商戶 "${merchant.value.storeName}" 嗎?`, 
      '提示', 
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await axios.put(`/api/admin/merchants/${merchantId.value}/status`, {
      status: newStatus
    })
    
    if (response.data) {
      ElMessage.success(`${action}成功`)
      merchant.value.status = newStatus
      form.status = newStatus
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || `${action}失敗`)
    }
  }
}

// 查看全部活動
const viewAllActivities = () => {
  router.push(`/admin/merchants/${merchantId.value}/activities`)
}

// 獲取活動類型標籤
const getActivityTypeTag = (type) => {
  const typeMap = {
    'login': 'info',
    'checkin': 'success',
    'campaign': 'warning',
    'qrcode': 'primary',
    'update': 'info'
  }
  return typeMap[type] || 'info'
}

// 獲取活動類型標簽
const getActivityTypeLabel = (type) => {
  const typeMap = {
    'login': '登入',
    'checkin': '簽到',
    'campaign': '活動',
    'qrcode': 'QR碼',
    'update': '更新'
  }
  return typeMap[type] || type
}

// 初始化
onMounted(async () => {
  await fetchMerchantDetails()
  await Promise.all([
    fetchMerchantStats(),
    fetchRecentActivities()
  ])
})
</script>

<style scoped>
.merchant-detail {
  padding: 20px;
}

.page-header-title {
  font-size: 18px;
  font-weight: bold;
}

.loading-container {
  margin-top: 20px;
}

.merchant-details-container {
  margin-top: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.merchant-info {
  padding: 10px;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.label {
  width: 90px;
  color: #606266;
  font-weight: bold;
}

.value {
  flex: 1;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-card h3 {
  margin-top: 0;
  color: #606266;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  margin-top: 10px;
}

.activities-card {
  margin-bottom: 20px;
}
</style> 