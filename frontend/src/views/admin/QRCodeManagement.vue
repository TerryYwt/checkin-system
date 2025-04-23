<template>
  <div class="qrcode-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>QR碼管理</span>
          <el-button type="primary" @click="dialogVisible = true">生成QR碼</el-button>
        </div>
      </template>

      <!-- 搜索表單 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline mb-4">
        <el-form-item label="商店">
          <el-select v-model="searchForm.store_id" placeholder="請選擇商店">
            <el-option
              v-for="store in stores"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態">
            <el-option label="啟用" value="active"></el-option>
            <el-option label="停用" value="inactive"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- QR碼列表 -->
      <el-table :data="qrcodes" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="store.storeName" label="商店名稱"></el-table-column>
        <el-table-column label="QR碼" width="150">
          <template #default="{ row }">
            <el-image
              style="width: 100px; height: 100px"
              :src="row.qrcodeUrl"
              :preview-src-list="[row.qrcodeUrl]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="status" label="狀態">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '啟用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="創建時間">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleDownload(row)">下載</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '啟用' }}
            </el-button>
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
        ></el-pagination>
      </div>
    </el-card>

    <!-- 生成QR碼對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="生成QR碼"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商店" prop="store_id">
          <el-select v-model="form.store_id" placeholder="請選擇商店">
            <el-option
              v-for="store in stores"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入QR碼用途描述"
          ></el-input>
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
const qrcodes = ref([])
const stores = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref()

// 搜索表單
const searchForm = ref({
  store_id: '',
  status: ''
})

// 表單數據
const form = ref({
  store_id: '',
  description: ''
})

// 表單驗證規則
const rules = {
  store_id: [
    { required: true, message: '請選擇商店', trigger: 'change' }
  ],
  description: [
    { required: true, message: '請輸入描述', trigger: 'blur' }
  ]
}

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchQRCodes(),
    fetchStores()
  ])
})

// 獲取QR碼列表
const fetchQRCodes = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    }
    const response = await axios.get('/admin/qrcodes', { params })
    qrcodes.value = response.data.qrcodes
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('獲取QR碼列表失敗')
  } finally {
    loading.value = false
  }
}

// 獲取商店列表
const fetchStores = async () => {
  try {
    const response = await axios.get('/admin/stores')
    stores.value = response.data.stores
  } catch (error) {
    ElMessage.error('獲取商店列表失敗')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchQRCodes()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    store_id: '',
    status: ''
  }
  handleSearch()
}

// 下載QR碼
const handleDownload = async (row) => {
  try {
    const response = await axios.get(`/admin/qrcodes/${row.id}/download`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `qrcode-${row.id}.png`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下載失敗')
  }
}

// 切換狀態
const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `確定要${row.status === 'active' ? '停用' : '啟用'}該QR碼嗎？`,
      '提示',
      {
        type: 'warning'
      }
    )
    await axios.put(`/admin/qrcodes/${row.id}/status`, {
      status: row.status === 'active' ? 'inactive' : 'active'
    })
    ElMessage.success('操作成功')
    fetchQRCodes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失敗')
    }
  }
}

// 刪除QR碼
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('確定要刪除該QR碼嗎？', '提示', {
      type: 'warning'
    })
    await axios.delete(`/admin/qrcodes/${row.id}`)
    ElMessage.success('刪除成功')
    fetchQRCodes()
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
    await axios.post('/admin/qrcodes', form.value)
    ElMessage.success('生成成功')
    dialogVisible.value = false
    fetchQRCodes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('生成失敗')
    }
  }
}

// 分頁
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchQRCodes()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchQRCodes()
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.qrcode-management {
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