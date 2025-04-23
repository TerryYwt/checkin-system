<template>
  <div class="store-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商店管理</span>
          <el-button type="primary" @click="dialogVisible = true">新增商店</el-button>
        </div>
      </template>

      <!-- 搜索表單 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline mb-4">
        <el-form-item label="商店名稱">
          <el-input v-model="searchForm.storeName" placeholder="請輸入商店名稱" />
        </el-form-item>
        <el-form-item label="商戶">
          <el-select v-model="searchForm.merchantId" placeholder="請選擇商戶">
            <el-option
              v-for="merchant in merchants"
              :key="merchant.id"
              :label="merchant.storeName"
              :value="merchant.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 商店列表 -->
      <el-table :data="stores" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="storeName" label="商店名稱" />
        <el-table-column prop="merchant.storeName" label="所屬商戶" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="phone" label="聯絡電話" />
        <el-table-column prop="status" label="狀態">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '營業中' : '已關閉' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">編輯</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >刪除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '編輯商店' : '新增商店'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商店名稱" prop="storeName">
          <el-input v-model="form.storeName" />
        </el-form-item>
        <el-form-item label="所屬商戶" prop="merchantId">
          <el-select v-model="form.merchantId" placeholder="請選擇商戶">
            <el-option
              v-for="merchant in merchants"
              :key="merchant.id"
              :label="merchant.storeName"
              :value="merchant.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="聯絡電話" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-select v-model="form.status">
            <el-option label="營業中" value="active" />
            <el-option label="已關閉" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 數據
const stores = ref([])
const merchants = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref()

// 搜索表單
const searchForm = ref({
  storeName: '',
  merchantId: ''
})

// 表單數據
const form = ref({
  id: '',
  storeName: '',
  merchantId: '',
  address: '',
  phone: '',
  status: 'active'
})

// 表單驗證規則
const rules = {
  storeName: [
    { required: true, message: '請輸入商店名稱', trigger: 'blur' }
  ],
  merchantId: [
    { required: true, message: '請選擇所屬商戶', trigger: 'change' }
  ],
  address: [
    { required: true, message: '請輸入地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入聯絡電話', trigger: 'blur' },
    { pattern: /^[0-9]{10}$/, message: '請輸入正確的電話號碼', trigger: 'blur' }
  ]
}

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchStores(),
    fetchMerchants()
  ])
})

// 獲取商店列表
const fetchStores = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    }
    const response = await axios.get('/admin/stores', { params })
    stores.value = response.data.stores || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('獲取商店列表失敗:', error)
    ElMessage.error('獲取商店列表失敗')
  } finally {
    loading.value = false
  }
}

// 獲取商戶列表
const fetchMerchants = async () => {
  try {
    const response = await axios.get('/admin/merchants')
    merchants.value = response.data.merchants || []
  } catch (error) {
    ElMessage.error('獲取商戶列表失敗')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchStores()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    storeName: '',
    merchantId: ''
  }
  handleSearch()
}

// 編輯商店
const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

// 刪除商店
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('確定要刪除該商店嗎？', '提示', {
      type: 'warning'
    })
    await axios.delete(`/admin/stores/${row.id}`)
    ElMessage.success('刪除成功')
    fetchStores()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (form.value.id) {
      await axios.put(`/admin/stores/${form.value.id}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await axios.post('/admin/stores', form.value)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchStores()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失敗')
    }
  }
}

// 分頁
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchStores()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchStores()
}
</script>

<style scoped>
.store-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.mb-4 {
  margin-bottom: 16px;
}
</style> 