<template>
  <div class="checkin">
    <h2>簽到</h2>
    <div class="checkin-form">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="用戶" prop="userId">
          <el-select v-model="form.userId" placeholder="請選擇用戶" style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.name} (${user.department})`"
              :value="user.id"
              :disabled="user.status !== 'active'"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="備註" prop="note">
          <el-input
            v-model="form.note"
            type="textarea"
            placeholder="請輸入備註（選填）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            簽到
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 今日簽到記錄 -->
    <div class="today-records" v-if="todayRecords.length > 0">
      <h3>今日簽到記錄</h3>
      <el-table :data="todayRecords" style="width: 100%">
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="department" label="部門" width="120" />
        <el-table-column prop="checkInTime" label="簽到時間" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.checkInTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="note" label="備註" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const formRef = ref(null)
const loading = ref(false)
const users = ref([])
const todayRecords = ref([])

const form = ref({
  userId: '',
  note: ''
})

const rules = {
  userId: [
    { required: true, message: '請選擇用戶', trigger: 'change' }
  ]
}

// 獲取用戶列表
const fetchUsers = async () => {
  try {
    const response = await axios.get('/users')
    users.value = response.data
  } catch (error) {
    ElMessage.error('獲取用戶列表失敗')
  }
}

// 獲取今日簽到記錄
const fetchTodayRecords = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const response = await axios.get(`/checkin-records?startDate=${today}`)
    todayRecords.value = response.data
  } catch (error) {
    ElMessage.error('獲取今日簽到記錄失敗')
  }
}

// 格式化日期時間
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 提交簽到
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await axios.post('/checkin', form.value)
    ElMessage.success('簽到成功！')
    
    // 重置表單
    form.value.userId = ''
    form.value.note = ''
    
    // 重新獲取今日記錄
    await fetchTodayRecords()
  } catch (error) {
    if (error.response?.data?.error) {
      ElMessage.error(error.response.data.error)
    } else {
      ElMessage.error('簽到失敗：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchTodayRecords()
})
</script>

<style scoped>
.checkin {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.checkin-form {
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.today-records {
  margin-top: 2rem;
}

h3 {
  margin-bottom: 1rem;
  color: #606266;
}
</style> 