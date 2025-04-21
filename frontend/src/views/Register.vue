<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>用戶註冊</h2>
        </div>
      </template>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用戶名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密碼"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="確認密碼"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <!-- 密碼強度提示 -->
        <div class="password-requirements" v-if="registerForm.password">
          <div class="requirement" :class="{ satisfied: hasUpperCase }">
            <el-icon><Check /></el-icon>
            包含大寫字母
          </div>
          <div class="requirement" :class="{ satisfied: hasLowerCase }">
            <el-icon><Check /></el-icon>
            包含小寫字母
          </div>
          <div class="requirement" :class="{ satisfied: hasNumbers }">
            <el-icon><Check /></el-icon>
            包含數字
          </div>
          <div class="requirement" :class="{ satisfied: hasSpecialChar }">
            <el-icon><Check /></el-icon>
            包含特殊字符
          </div>
        </div>
        
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">
            註冊
          </el-button>
        </el-form-item>
        <el-form-item>
          <div class="login-link">
            已有帳號？
            <router-link to="/login">立即登錄</router-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Check } from '@element-plus/icons-vue'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 密碼強度檢查
const hasUpperCase = computed(() => /[A-Z]/.test(registerForm.password))
const hasLowerCase = computed(() => /[a-z]/.test(registerForm.password))
const hasNumbers = computed(() => /\d/.test(registerForm.password))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(registerForm.password))

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 3, max: 20, message: '用戶名長度應為3-20個字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用戶名只能包含字母、數字和下劃線', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能少於6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    
    // 檢查密碼強度
    if (!hasUpperCase.value || !hasLowerCase.value || !hasNumbers.value || !hasSpecialChar.value) {
      ElMessage.error('密碼強度不足，請滿足所有要求')
      return
    }
    
    loading.value = true
    
    const response = await axios.post('/api/auth/register', {
      username: registerForm.username,
      password: registerForm.password
    })
    
    ElMessage.success('註冊成功')
    router.push('/login')
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '註冊失敗')
    } else {
      ElMessage.error('註冊失敗，請重試')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.register-card {
  width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.password-requirements {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  margin: 5px 0;
}

.requirement.satisfied {
  color: #67c23a;
}

.login-link {
  text-align: center;
  color: #606266;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 