<template>
  <div class="scanner">
    <h2>QR Code 掃描</h2>
    
    <div class="scanner-container">
      <!-- 切換模式按鈕 -->
      <div class="mode-switch">
        <el-radio-group v-model="mode" @change="handleModeChange">
          <el-radio-button label="scan">掃描 QR Code</el-radio-button>
          <el-radio-button label="manual">手動輸入</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 掃描模式 -->
      <template v-if="mode === 'scan'">
        <div class="video-container" v-show="!scanResult">
          <video ref="video" class="scanner-video"></video>
          <div class="scan-region-highlight"></div>
          <div class="scan-region-highlight-svg"></div>
        </div>

        <div class="controls">
          <el-button 
            type="primary" 
            :icon="scanning ? 'VideoCamera' : 'VideoCameraFilled'"
            @click="toggleScanner"
          >
            {{ scanning ? '停止掃描' : '開始掃描' }}
          </el-button>
        </div>
      </template>

      <!-- 手動輸入模式 -->
      <template v-else>
        <div class="manual-input">
          <el-form :model="manualForm" :rules="manualRules" ref="manualFormRef">
            <el-form-item label="Register ID Code" prop="code">
              <el-input 
                v-model="manualForm.code" 
                placeholder="請輸入 Register ID Code"
                :maxlength="36"
                show-word-limit
              >
                <template #append>
                  <el-button @click="handleManualSubmit">
                    確認
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </template>

      <!-- 結果顯示 -->
      <div v-if="scanResult" class="result-container">
        <el-result
          :icon="resultIcon"
          :title="resultTitle"
          :sub-title="resultMessage"
        >
          <template #extra>
            <el-button type="primary" @click="resetScan">繼續{{ mode === 'scan' ? '掃描' : '輸入' }}</el-button>
          </template>
        </el-result>
      </div>
    </div>

    <!-- 掃描記錄 -->
    <div class="scan-history" v-if="todayScans.length > 0">
      <h3>今日掃描記錄</h3>
      <el-table :data="todayScans" style="width: 100%">
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="department" label="部門" width="120" />
        <el-table-column prop="checkInTime" label="掃描時間" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.checkInTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失敗' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="備註" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoCamera, VideoCameraFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import jsQR from 'jsqr'

const mode = ref('scan')
const video = ref(null)
const scanning = ref(false)
const scanResult = ref(null)
const stream = ref(null)
const todayScans = ref([])
const manualFormRef = ref(null)

// 手動輸入表單
const manualForm = ref({
  code: ''
})

// 表單驗證規則
const manualRules = {
  code: [
    { required: true, message: '請輸入 Coupon', trigger: 'blur' },
    { 
      pattern: /^[a-z][0-9]{7}$/,
      message: '必須是一個小寫字母後跟7位數字',
      trigger: 'blur'
    }
  ]
}

// 結果顯示相關
const resultIcon = ref('success')
const resultTitle = ref('')
const resultMessage = ref('')

// 處理模式切換
const handleModeChange = (newMode) => {
  if (newMode === 'scan') {
    startScanning()
  } else {
    stopScanning()
  }
  scanResult.value = null
}

// 開始掃描
const startScanning = async () => {
  if (mode.value !== 'scan') return
  
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    
    video.value.srcObject = stream.value
    video.value.play()
    
    scanning.value = true
    scanFrame()
  } catch (error) {
    ElMessage.error('無法訪問攝像頭：' + error.message)
  }
}

// 停止掃描
const stopScanning = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  scanning.value = false
}

// 切換掃描狀態
const toggleScanner = () => {
  if (scanning.value) {
    stopScanning()
  } else {
    startScanning()
  }
}

// 掃描視頻幀
const scanFrame = () => {
  if (!scanning.value) return

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  if (video.value.readyState === video.value.HAVE_ENOUGH_DATA) {
    canvas.width = video.value.videoWidth
    canvas.height = video.value.videoHeight
    
    context.drawImage(video.value, 0, 0, canvas.width, canvas.height)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code) {
      handleQrCode(code.data)
      return
    }
  }
  
  requestAnimationFrame(scanFrame)
}

// 處理掃描到的 QR Code
const handleQrCode = async (data) => {
  try {
    const qrData = JSON.parse(data)
    if (qrData.type !== 'checkin') {
      throw new Error('無效的 QR Code 類型')
    }

    await verifyCode(qrData.token)
  } catch (error) {
    handleVerificationError(error)
  }
}

// 獲取有效的 Coupons（用於測試）
const fetchValidCoupons = async () => {
  try {
    const response = await axios.get('/api/valid-coupons')
    console.log('可用的 Coupons:', response.data)
  } catch (error) {
    console.error('獲取 Coupons 失敗:', error)
  }
}

// 處理手動提交
const handleManualSubmit = async () => {
  if (!manualFormRef.value) return
  
  try {
    await manualFormRef.value.validate()
    await verifyCode(null, manualForm.value.code)
    manualForm.value.code = '' // 清空輸入
  } catch (error) {
    if (error.message) {
      handleVerificationError(error)
    }
  }
}

// 驗證碼驗證
const verifyCode = async (token, registerId) => {
  const response = await axios.post('/api/verify-qrcode', { 
    token,
    registerId
  })
  
  resultIcon.value = 'success'
  resultTitle.value = '驗證成功'
  resultMessage.value = registerId ? 
    `Coupon ${registerId} 使用成功` : 
    'QR Code 驗證成功'
  
  // 添加到今日掃描記錄
  todayScans.value.unshift({
    ...response.data.record,
    status: 'success',
    message: '驗證成功'
  })

  scanResult.value = true
  if (mode.value === 'scan') {
    stopScanning()
  }
}

// 處理驗證錯誤
const handleVerificationError = (error) => {
  resultIcon.value = 'error'
  resultTitle.value = '驗證失敗'
  resultMessage.value = error.response?.data?.error || error.message
  
  // 添加到今日掃描記錄
  todayScans.value.unshift({
    checkInTime: new Date().toISOString(),
    status: 'error',
    message: error.response?.data?.error || error.message
  })

  scanResult.value = true
  if (mode.value === 'scan') {
    stopScanning()
  }
}

// 重置掃描
const resetScan = () => {
  scanResult.value = null
  if (mode.value === 'scan') {
    startScanning()
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

onMounted(() => {
  if (mode.value === 'scan') {
    startScanning()
  }
  // 獲取可用的 Coupons 列表（僅用於測試）
  fetchValidCoupons()
})

onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
.scanner {
  padding: 2rem;
}

.scanner-container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.mode-switch {
  margin-bottom: 2rem;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
}

.scanner-video {
  width: 100%;
  height: auto;
  background-color: #000;
}

.scan-region-highlight {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.scan-region-highlight-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.manual-input {
  max-width: 400px;
  margin: 2rem auto;
}

.controls {
  margin-top: 2rem;
}

.result-container {
  margin: 2rem 0;
}

.scan-history {
  margin-top: 3rem;
}

h3 {
  margin-bottom: 1rem;
  color: #606266;
}
</style> 