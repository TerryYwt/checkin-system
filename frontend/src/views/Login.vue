<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>系統登錄</h2>
        </div>
      </template>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用戶名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密碼"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">記住我</el-checkbox>
          <el-button type="link" @click="showResetDialog = true" style="float: right">
            忘記密碼？
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登錄
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 重置密碼對話框 -->
    <el-dialog
      v-model="showResetDialog"
      title="重置密碼"
      width="400px"
    >
      <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="resetForm.username"
            placeholder="用戶名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="oldPassword">
          <el-input
            v-model="resetForm.oldPassword"
            type="password"
            placeholder="舊密碼"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="新密碼"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="確認新密碼"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showResetDialog = false">取消</el-button>
          <el-button type="primary" @click="handleResetPassword" :loading="resetLoading">
            確認
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref(null)
const resetFormRef = ref(null)
const loading = ref(false)
const resetLoading = ref(false)
const showResetDialog = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const resetForm = reactive({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetForm.newPassword) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' }
  ]
}

const resetRules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' }
  ],
  oldPassword: [
    { required: true, message: '請輸入舊密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能少於6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認新密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    await authStore.login(
      loginForm.username,
      loginForm.password,
      loginForm.rememberMe
    )
    
    ElMessage.success('登錄成功')
    router.push('/')
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '登錄失敗')
    } else {
      ElMessage.error('登錄失敗，請重試')
    }
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    resetLoading.value = true
    
    await authStore.resetPassword(
      resetForm.oldPassword,
      resetForm.newPassword
    )
    
    ElMessage.success('密碼重置成功')
    showResetDialog.value = false
    resetFormRef.value.resetFields()
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '密碼重置失敗')
    } else {
      ElMessage.error('密碼重置失敗，請重試')
    }
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 