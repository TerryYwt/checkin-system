<template>
  <div class="settings">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商家設置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本設置 -->
        <el-tab-pane label="基本設置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item label="商店名稱" prop="storeName">
              <el-input v-model="basicForm.storeName" />
            </el-form-item>
            <el-form-item label="商店描述" prop="storeDescription">
              <el-input
                v-model="basicForm.storeDescription"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="聯絡人" prop="contactPerson">
              <el-input v-model="basicForm.contactPerson" />
            </el-form-item>
            <el-form-item label="聯絡電話" prop="contactPhone">
              <el-input v-model="basicForm.contactPhone" />
            </el-form-item>
            <el-form-item label="電子郵件" prop="email">
              <el-input v-model="basicForm.email" />
            </el-form-item>
            <el-form-item label="商店地址" prop="storeAddress">
              <el-input
                v-model="basicForm.storeAddress"
                type="textarea"
                :rows="2"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBasicSubmit">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 營業設置 -->
        <el-tab-pane label="營業設置" name="business">
          <el-form
            ref="businessFormRef"
            :model="businessForm"
            :rules="businessRules"
            label-width="120px"
          >
            <el-form-item label="營業時間" prop="businessHours">
              <el-time-picker
                v-model="businessForm.businessHours"
                is-range
                range-separator="至"
                start-placeholder="開始時間"
                end-placeholder="結束時間"
                placeholder="選擇時間範圍"
              />
            </el-form-item>
            <el-form-item label="休息日" prop="restDays">
              <el-checkbox-group v-model="businessForm.restDays">
                <el-checkbox label="1">星期一</el-checkbox>
                <el-checkbox label="2">星期二</el-checkbox>
                <el-checkbox label="3">星期三</el-checkbox>
                <el-checkbox label="4">星期四</el-checkbox>
                <el-checkbox label="5">星期五</el-checkbox>
                <el-checkbox label="6">星期六</el-checkbox>
                <el-checkbox label="0">星期日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="最低消費" prop="minConsumption">
              <el-input-number
                v-model="businessForm.minConsumption"
                :min="0"
                :precision="0"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBusinessSubmit">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知設置 -->
        <el-tab-pane label="通知設置" name="notification">
          <el-form
            ref="notificationFormRef"
            :model="notificationForm"
            :rules="notificationRules"
            label-width="120px"
          >
            <el-form-item label="簽到通知" prop="checkinNotification">
              <el-switch v-model="notificationForm.checkinNotification" />
            </el-form-item>
            <el-form-item label="活動通知" prop="campaignNotification">
              <el-switch v-model="notificationForm.campaignNotification" />
            </el-form-item>
            <el-form-item label="通知方式" prop="notificationMethods">
              <el-checkbox-group v-model="notificationForm.notificationMethods">
                <el-checkbox label="email">電子郵件</el-checkbox>
                <el-checkbox label="sms">短信</el-checkbox>
                <el-checkbox label="app">應用內通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleNotificationSubmit">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { merchantApi } from '../../services/api'

// 當前激活的標籤頁
const activeTab = ref('basic')

// 表單引用
const basicFormRef = ref()
const businessFormRef = ref()
const notificationFormRef = ref()

// 基本設置表單
const basicForm = ref({
  storeName: '',
  storeDescription: '',
  contactPerson: '',
  contactPhone: '',
  email: '',
  storeAddress: ''
})

// 營業設置表單
const businessForm = ref({
  businessHours: [new Date(2024, 0, 1, 9, 0), new Date(2024, 0, 1, 18, 0)],
  restDays: [],
  minConsumption: 0
})

// 通知設置表單
const notificationForm = ref({
  checkinNotification: true,
  campaignNotification: true,
  notificationMethods: ['email', 'app']
})

// 基本設置驗證規則
const basicRules = {
  storeName: [
    { required: true, message: '請輸入商店名稱', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '請輸入聯絡人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '請輸入聯絡電話', trigger: 'blur' },
    { pattern: /^[0-9]{10}$/, message: '請輸入正確的電話號碼', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  storeAddress: [
    { required: true, message: '請輸入商店地址', trigger: 'blur' }
  ]
}

// 營業設置驗證規則
const businessRules = {
  businessHours: [
    { required: true, message: '請設置營業時間', trigger: 'change' }
  ]
}

// 通知設置驗證規則
const notificationRules = {
  notificationMethods: [
    { required: true, message: '請選擇至少一種通知方式', trigger: 'change' }
  ]
}

// 初始化數據
const fetchSettings = async () => {
  try {
    const [basicResponse, businessResponse, notificationResponse] = await Promise.all([
      merchantApi.get('/settings/basic'),
      merchantApi.get('/settings/business'),
      merchantApi.get('/settings/notification')
    ])
    
    basicForm.value = basicResponse.data
    businessForm.value = businessResponse.data
    notificationForm.value = notificationResponse.data
  } catch (error) {
    ElMessage.error('獲取設置失敗')
  }
}

// 提交基本設置
const handleBasicSubmit = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    await merchantApi.post('/settings/basic', basicForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失敗')
  }
}

// 提交營業設置
const handleBusinessSubmit = async () => {
  if (!businessFormRef.value) return
  
  try {
    await businessFormRef.value.validate()
    await merchantApi.post('/settings/business', businessForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失敗')
  }
}

// 提交通知設置
const handleNotificationSubmit = async () => {
  if (!notificationFormRef.value) return
  
  try {
    await notificationFormRef.value.validate()
    await merchantApi.post('/settings/notification', notificationForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失敗')
  }
}

// 初始化
fetchSettings()
</script>

<style scoped>
.settings {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  max-width: 600px;
  margin: 0 auto;
}
</style> 