<template>
  <div class="merchant-management">
    <!-- 搜索和篩選 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.search"
            placeholder="店名/聯絡人/電話"
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
          <el-button link @click="resetFilter">重置</el-button>
          <el-button type="success" @click="openAddDialog">新增商戶</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商戶列表 -->
    <el-card class="mt-4">
      <el-table
        :data="merchants"
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="帳號" width="120" />
        <el-table-column prop="storeName" label="店名" width="180" />
        <el-table-column prop="contactPerson" label="聯絡人" width="120" />
        <el-table-column prop="phone" label="電話" width="120" />
        <el-table-column prop="email" label="Email" width="180" />
        <el-table-column prop="storeAddress" label="地址" show-overflow-tooltip />
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
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewMerchantDetails(row)">
              詳情
            </el-button>
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

    <!-- 新增/編輯商戶對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯商戶' : '新增商戶'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="帳號" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密碼" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
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
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="地址" prop="storeAddress">
          <el-input v-model="form.storeAddress" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button link @click="dialogVisible = false">取消</el-button>
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
import { useRouter } from 'vue-router'

// Add router
const router = useRouter()

// 表格數據
const loading = ref(false)
const merchants = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 篩選表單
const filterForm = reactive({
  search: '',
  status: ''
})

// 對話框相關
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = reactive({
  username: '',
  password: '',
  storeName: '',
  contactPerson: '',
  phone: '',
  email: '',
  storeAddress: '',
  status: 'active'
})

// 表單驗證規則
const rules = {
  username: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 3, max: 20, message: '長度在 3 到 20 個字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能小於 6 位', trigger: 'blur' }
  ],
  storeName: [
    { required: true, message: '請輸入店名', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '請輸入聯絡人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入電話', trigger: 'blur' },
    { pattern: /^[0-9]{10}$/, message: '請輸入正確的電話號碼', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的 Email 地址', trigger: 'blur' }
  ],
  storeAddress: [
    { required: true, message: '請輸入地址', trigger: 'blur' }
  ]
}

// 獲取商戶列表
const fetchMerchants = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/merchants', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        username: filterForm.search,
        status: filterForm.status
      }
    })
    merchants.value = response.data.data
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('獲取商戶列表失敗')
  } finally {
    loading.value = false
  }
}

// 搜索處理
const handleSearch = () => {
  currentPage.value = 1
  fetchMerchants()
}

// 重置篩選
const resetFilter = () => {
  filterForm.search = ''
  filterForm.status = ''
  handleSearch()
}

// 打開新增對話框
const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    username: '',
    password: '',
    storeName: '',
    contactPerson: '',
    phone: '',
    email: '',
    storeAddress: '',
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
          await axios.put(`/api/admin/merchants/${form.id}`, {
            ...form,
            password: undefined
          })
          ElMessage.success('商戶更新成功')
        } else {
          await axios.post('/api/admin/merchants', form)
          ElMessage.success('商戶創建成功')
        }
        dialogVisible.value = false
        fetchMerchants()
      } catch (error) {
        ElMessage.error(isEdit.value ? '商戶更新失敗' : '商戶創建失敗')
      }
    }
  })
}

// 切換狀態
const toggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    await axios.put(`/api/admin/merchants/${row.id}`, {
      ...row,
      status: newStatus
    })
    ElMessage.success('狀態更新成功')
    fetchMerchants()
  } catch (error) {
    ElMessage.error('狀態更新失敗')
  }
}

// 分頁處理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchMerchants()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchMerchants()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// View merchant details
const viewMerchantDetails = (row) => {
  router.push(`/admin/merchants/${row.id}`)
}

// 初始化
onMounted(() => {
  fetchMerchants()
})
</script>

<style scoped>
.merchant-management {
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