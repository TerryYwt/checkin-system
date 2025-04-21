<template>
  <div class="user-management">
    <!-- 搜索和篩選 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.search"
            placeholder="用戶名/電話/Email"
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filterForm.role" placeholder="選擇角色" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="普通用戶" value="user" />
            <el-option label="商戶" value="merchant" />
            <el-option label="管理員" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="filterForm.status" placeholder="選擇狀態" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="啟用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="openAddDialog">新增用戶</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用戶列表 -->
    <el-card class="mt-4">
      <el-table
        :data="users"
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用戶名" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="電話" width="120" />
        <el-table-column prop="email" label="Email" width="180" />
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '啟用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最後登入" width="180">
          <template #default="{ row }">
            {{ formatDate(row.lastLogin) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">
              編輯
            </el-button>
            <el-button 
              link 
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '啟用' }}
            </el-button>
            <el-button 
              link 
              type="warning"
              @click="resetPassword(row)"
            >
              重置密碼
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/編輯用戶對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯用戶' : '新增用戶'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用戶名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密碼" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" :disabled="isEdit">
            <el-option label="普通用戶" value="user" />
            <el-option label="商戶" value="merchant" />
            <el-option label="管理員" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="電話" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">確認</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'

// 表格數據
const loading = ref(false)
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 篩選表單
const filterForm = reactive({
  search: '',
  role: '',
  status: ''
})

// 對話框相關
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = reactive({
  username: '',
  password: '',
  role: 'user',
  phone: '',
  email: '',
  status: 'active'
})

// 表單驗證規則
const rules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 3, max: 20, message: '長度在 3 到 20 個字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能小於 6 位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '請選擇角色', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '請輸入電話', trigger: 'blur' },
    { pattern: /^[0-9]{10}$/, message: '請輸入正確的電話號碼', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的 Email 地址', trigger: 'blur' }
  ]
}

// 獲取用戶列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...filterForm
      }
    })
    users.value = response.data.users
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('獲取用戶列表失敗')
  } finally {
    loading.value = false
  }
}

// 搜索處理
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 重置篩選
const resetFilter = () => {
  filterForm.search = ''
  filterForm.role = ''
  filterForm.status = ''
  handleSearch()
}

// 打開新增對話框
const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    username: '',
    password: '',
    role: 'user',
    phone: '',
    email: '',
    status: 'active'
  })
  dialogVisible.value = true
}

// 打開編輯對話框
const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表單
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await axios.put(`/api/admin/users/${form.id}`, {
            ...form,
            password: undefined
          })
          ElMessage.success('用戶更新成功')
        } else {
          await axios.post('/api/admin/users', form)
          ElMessage.success('用戶創建成功')
        }
        dialogVisible.value = false
        fetchUsers()
      } catch (error) {
        ElMessage.error(isEdit.value ? '用戶更新失敗' : '用戶創建失敗')
      }
    }
  })
}

// 切換狀態
const toggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    await axios.put(`/api/admin/users/${row.id}`, {
      ...row,
      status: newStatus
    })
    ElMessage.success('狀態更新成功')
    fetchUsers()
  } catch (error) {
    ElMessage.error('狀態更新失敗')
  }
}

// 重置密碼
const resetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(
      '確定要重置該用戶的密碼嗎？',
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await axios.post(`/api/admin/users/${row.id}/reset-password`)
    ElMessage.success('密碼重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失敗')
    }
  }
}

// 分頁處理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 角色相關
const getRoleType = (role) => {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'merchant':
      return 'warning'
    case 'user':
      return 'info'
    default:
      return ''
  }
}

const getRoleText = (role) => {
  switch (role) {
    case 'admin':
      return '管理員'
    case 'merchant':
      return '商戶'
    case 'user':
      return '普通用戶'
    default:
      return role
  }
}

// 初始化
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 16px;
}
</style> 