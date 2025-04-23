<template>
  <div class="records">
    <h2>簽到記錄</h2>
    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用戶">
          <el-select v-model="searchForm.userId" placeholder="請選擇用戶" clearable>
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.name} (${user.department})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期範圍">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="records" style="width: 100%" v-loading="loading">
      <el-table-column prop="userName" label="姓名" width="120" />
      <el-table-column prop="department" label="部門" width="120" />
      <el-table-column prop="checkInTime" label="簽到時間" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.checkInTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="note" label="備註" />
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const searchForm = ref({
  userId: '',
  dateRange: []
})

const records = ref([])
const users = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 獲取用戶列表
const fetchUsers = async () => {
  try {
    const response = await axios.get('/users')
    users.value = response.data
  } catch (error) {
    ElMessage.error('獲取用戶列表失敗')
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

const handleSearch = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    if (searchForm.value.userId) {
      params.append('userId', searchForm.value.userId)
    }
    
    if (searchForm.value.dateRange?.length === 2) {
      params.append('startDate', searchForm.value.dateRange[0])
      params.append('endDate', searchForm.value.dateRange[1])
    }

    const response = await axios.get(`/checkin-records?${params.toString()}`)
    records.value = response.data
    total.value = response.data.length
  } catch (error) {
    ElMessage.error('搜索失敗：' + error.message)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.value = {
    userId: '',
    dateRange: []
  }
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

onMounted(() => {
  fetchUsers()
  handleSearch()
})
</script>

<style scoped>
.records {
  padding: 2rem;
}

.search-form {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}
</style> 