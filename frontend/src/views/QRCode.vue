<template>
  <div class="qrcode">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>我的 QR 碼</span>
          <el-button type="primary" @click="handleDownload">下載 QR 碼</el-button>
        </div>
      </template>

      <div class="qrcode-content">
        <el-image
          v-if="qrcodeUrl"
          :src="qrcodeUrl"
          :preview-src-list="[qrcodeUrl]"
          fit="contain"
          style="width: 300px; height: 300px"
        />
        <el-empty v-else description="暫無 QR 碼" />
      </div>

      <div class="qrcode-info">
        <p>掃描此 QR 碼進行簽到</p>
        <p class="text-muted">最後更新時間：{{ formatDate(lastUpdated) }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const qrcodeUrl = ref('')
const lastUpdated = ref('')

// 獲取 QR 碼
const fetchQRCode = async () => {
  try {
    const response = await axios.get('/api/user/qrcode')
    qrcodeUrl.value = response.data.qrcodeUrl
    lastUpdated.value = response.data.lastUpdated
  } catch (error) {
    ElMessage.error('獲取 QR 碼失敗')
  }
}

// 下載 QR 碼
const handleDownload = async () => {
  if (!qrcodeUrl.value) return
  
  try {
    const response = await axios.get('/api/user/qrcode/download', {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'my-qrcode.png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下載 QR 碼失敗')
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString()
}

// 初始化
onMounted(() => {
  fetchQRCode()
})
</script>

<style scoped>
.qrcode {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qrcode-content {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.qrcode-info {
  text-align: center;
  margin-top: 20px;
}

.text-muted {
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
}
</style> 