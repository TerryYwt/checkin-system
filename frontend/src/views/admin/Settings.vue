<template>
  <div class="settings">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系統設置</span>
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
            <el-form-item label="系統名稱" prop="systemName">
              <el-input v-model="basicForm.systemName" />
            </el-form-item>
            <el-form-item label="系統描述" prop="systemDescription">
              <el-input
                v-model="basicForm.systemDescription"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="聯繫郵箱" prop="contactEmail">
              <el-input v-model="basicForm.contactEmail" />
            </el-form-item>
            <el-form-item label="聯繫電話" prop="contactPhone">
              <el-input v-model="basicForm.contactPhone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBasicSubmit">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 郵件設置 -->
        <el-tab-pane label="郵件設置" name="email">
          <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            label-width="120px"
          >
            <el-form-item label="SMTP服務器" prop="smtpHost">
              <el-input v-model="emailForm.smtpHost" />
            </el-form-item>
            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input v-model="emailForm.smtpPort" />
            </el-form-item>
            <el-form-item label="郵箱賬號" prop="smtpUser">
              <el-input v-model="emailForm.smtpUser" />
            </el-form-item>
            <el-form-item label="郵箱密碼" prop="smtpPass">
              <el-input v-model="emailForm.smtpPass" type="password" />
            </el-form-item>
            <el-form-item label="發件人名稱" prop="senderName">
              <el-input v-model="emailForm.senderName" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleEmailSubmit">保存</el-button>
              <el-button @click="handleTestEmail">發送測試郵件</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全設置 -->
        <el-tab-pane label="安全設置" name="security">
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            :rules="securityRules"
            label-width="120px"
          >
            <el-form-item label="密碼最小長度" prop="passwordMinLength">
              <el-input-number
                v-model="securityForm.passwordMinLength"
                :min="6"
                :max="20"
              />
            </el-form-item>
            <el-form-item label="密碼複雜度" prop="passwordComplexity">
              <el-checkbox-group v-model="securityForm.passwordComplexity">
                <el-checkbox label="uppercase">必須包含大寫字母</el-checkbox>
                <el-checkbox label="lowercase">必須包含小寫字母</el-checkbox>
                <el-checkbox label="numbers">必須包含數字</el-checkbox>
                <el-checkbox label="special">必須包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="登錄嘗試次數" prop="loginAttempts">
              <el-input-number
                v-model="securityForm.loginAttempts"
                :min="3"
                :max="10"
              />
            </el-form-item>
            <el-form-item label="鎖定時間(分鐘)" prop="lockoutDuration">
              <el-input-number
                v-model="securityForm.lockoutDuration"
                :min="5"
                :max="60"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSecuritySubmit">保存</el-button>
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
const emailFormRef = ref()
const securityFormRef = ref()

// 基本設置表單
const basicForm = ref({
  systemName: '',
  systemDescription: '',
  contactEmail: '',
  contactPhone: ''
})

// 郵件設置表單
const emailForm = ref({
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpPass: '',
  senderName: ''
})

// 安全設置表單
const securityForm = ref({
  passwordMinLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'numbers'],
  loginAttempts: 5,
  lockoutDuration: 30
})

// 基本設置驗證規則
const basicRules = {
  systemName: [
    { required: true, message: '請輸入系統名稱', trigger: 'blur' }
  ],
  systemDescription: [
    { required: true, message: '請輸入系統描述', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '請輸入聯繫郵箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '請輸入聯繫電話', trigger: 'blur' },
    { pattern: /^[0-9]{10}$/, message: '請輸入正確的電話號碼', trigger: 'blur' }
  ]
}

// 郵件設置驗證規則
const emailRules = {
  smtpHost: [
    { required: true, message: '請輸入SMTP服務器', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '請輸入SMTP端口', trigger: 'blur' },
    { pattern: /^[0-9]+$/, message: '端口必須為數字', trigger: 'blur' }
  ],
  smtpUser: [
    { required: true, message: '請輸入郵箱賬號', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  smtpPass: [
    { required: true, message: '請輸入郵箱密碼', trigger: 'blur' }
  ],
  senderName: [
    { required: true, message: '請輸入發件人名稱', trigger: 'blur' }
  ]
}

// 安全設置驗證規則
const securityRules = {
  passwordMinLength: [
    { required: true, message: '請設置密碼最小長度', trigger: 'blur' }
  ],
  passwordComplexity: [
    { required: true, message: '請選擇密碼複雜度要求', trigger: 'change' }
  ],
  loginAttempts: [
    { required: true, message: '請設置登錄嘗試次數', trigger: 'blur' }
  ],
  lockoutDuration: [
    { required: true, message: '請設置鎖定時間', trigger: 'blur' }
  ]
}

// 初始化數據
const fetchSettings = async () => {
  try {
    const [basicResponse, emailResponse, securityResponse] = await Promise.all([
      axios.get('/admin/settings/basic'),
      axios.get('/admin/settings/email'),
      axios.get('/admin/settings/security')
    ])
    
    basicForm.value = basicResponse.data
    emailForm.value = emailResponse.data
    securityForm.value = securityResponse.data
  } catch (error) {
    ElMessage.error('獲取設置失敗')
  }
}

// 提交基本設置
const handleBasicSubmit = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    await axios.post('/admin/settings/basic', basicForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失敗')
    }
  }
}

// 提交郵件設置
const handleEmailSubmit = async () => {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
    await axios.post('/admin/settings/email', emailForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失敗')
    }
  }
}

// 發送測試郵件
const handleTestEmail = async () => {
  try {
    await axios.post('/admin/settings/email/test')
    ElMessage.success('測試郵件發送成功')
  } catch (error) {
    ElMessage.error('測試郵件發送失敗')
  }
}

// 提交安全設置
const handleSecuritySubmit = async () => {
  if (!securityFormRef.value) return
  
  try {
    await securityFormRef.value.validate()
    await axios.post('/admin/settings/security', securityForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失敗')
    }
  }
}

// 初始化
fetchSettings()
</script>

<style scoped>
.settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 