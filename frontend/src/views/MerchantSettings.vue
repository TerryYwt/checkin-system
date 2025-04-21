<template>
  <div class="merchant-settings">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商戶設置</span>
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
            <el-form-item label="聯繫人" prop="contactPerson">
              <el-input v-model="basicForm.contactPerson" />
            </el-form-item>
            <el-form-item label="聯繫電話" prop="phone">
              <el-input v-model="basicForm.phone" />
            </el-form-item>
            <el-form-item label="電子郵箱" prop="email">
              <el-input v-model="basicForm.email" />
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input
                v-model="basicForm.address"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBasicSubmit">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 密碼設置 -->
        <el-tab-pane label="密碼設置" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
          >
            <el-form-item label="當前密碼" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密碼" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="確認新密碼" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePasswordSubmit">修改密碼</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知設置 -->
        <el-tab-pane label="通知設置" name="notifications">
          <el-form
            ref="notificationFormRef"
            :model="notificationForm"
            label-width="120px"
          >
            <el-form-item label="簽到通知">
              <el-switch v-model="notificationForm.checkinNotification" />
            </el-form-item>
            <el-form-item label="活動通知">
              <el-switch v-model="notificationForm.campaignNotification" />
            </el-form-item>
            <el-form-item label="系統通知">
              <el-switch v-model="notificationForm.systemNotification" />
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
import axios from 'axios'

// 當前激活的標籤頁
const activeTab = ref('basic')

// 表單引用
const basicFormRef = ref()
const passwordFormRef = ref()
const notificationFormRef = ref()

// 基本設置表單
const basicForm = ref({
  storeName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: ''
})

// 密碼設置表單
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 通知設置表單
const notificationForm = ref({
  checkinNotification: true,
  campaignNotification: true,
  systemNotification: true
})

// 基本設置驗證規則
const basicRules = {
  storeName: [
    { required: true, message: '請輸入商店名稱', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '請輸入聯繫人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入聯繫電話', trigger: 'blur' },
    { pattern: /^[0-9]{10}$/, message: '請輸入正確的電話號碼', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '請輸入地址', trigger: 'blur' }
  ]
}

// 密碼設置驗證規則
const passwordRules = {
  currentPassword: [
    { required: true, message: '請輸入當前密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能小於6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認新密碼', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('兩次輸入的密碼不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化數據
const fetchSettings = async () => {
  try {
    const response = await axios.get('/api/merchant/settings')
    const data = response.data
    
    basicForm.value = {
      storeName: data.storeName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address
    }
    
    notificationForm.value = {
      checkinNotification: data.checkinNotification,
      campaignNotification: data.campaignNotification,
      systemNotification: data.systemNotification
    }
  } catch (error) {
    ElMessage.error('獲取設置失敗')
  }
}

// 提交基本設置
const handleBasicSubmit = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    await axios.post('/api/merchant/settings/basic', basicForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失敗')
    }
  }
}

// 提交密碼設置
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    await axios.post('/api/merchant/settings/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    ElMessage.success('密碼修改成功')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密碼修改失敗')
    }
  }
}

// 提交通知設置
const handleNotificationSubmit = async () => {
  try {
    await axios.post('/api/merchant/settings/notifications', notificationForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失敗')
  }
}

// 初始化
fetchSettings()
</script>

<style scoped>
.merchant-settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 