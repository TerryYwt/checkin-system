<template>
  <div class="scanner-container">
    <el-row :gutter="20">
      <!-- 左側：掃描區域 -->
      <el-col :span="16">
        <el-card class="scanner-card">
          <template #header>
            <div class="card-header">
              <span>QR Code 掃描</span>
              <el-button @click="toggleCamera">
                {{ isCameraActive ? '關閉相機' : '開啟相機' }}
              </el-button>
            </div>
          </template>
          
          <div class="camera-container" v-if="isCameraActive">
            <video 
              ref="videoElement"
              class="camera-preview"
              :class="{ scanning: isScanning }"
            ></video>
            <div class="scan-overlay">
              <div class="scan-line" v-show="isScanning"></div>
            </div>
          </div>
          
          <div class="manual-input" v-else>
            <el-input
              v-model="manualCode"
              placeholder="手動輸入 QR Code"
              clearable
            >
              <template #append>
                <el-button @click="handleManualInput">確認</el-button>
              </template>
            </el-input>
          </div>
        </el-card>

        <!-- 掃描結果 -->
        <el-card v-if="scanResult" class="mt-4">
          <template #header>
            <div class="card-header">
              <span>掃描結果</span>
            </div>
          </template>
          
          <el-result
            :icon="scanResult.success ? 'success' : 'error'"
            :title="scanResult.title"
            :sub-title="scanResult.message"
          >
            <template #extra>
              <el-button type="primary" @click="confirmCheckin" v-if="scanResult.success">
                確認到店
              </el-button>
              <el-button @click="resetScan">重新掃描</el-button>
            </template>
          </el-result>
        </el-card>
      </el-col>

      <!-- 右側：最近掃描記錄 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近掃描記錄</span>
              <el-button text @click="refreshHistory">
                刷新
              </el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in scanHistory"
              :key="index"
              :type="record.success ? 'success' : 'danger'"
              :timestamp="record.time"
              :hollow="true"
            >
              <h4>{{ record.customerName || 'Unknown' }}</h4>
              <p>{{ record.message }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 確認到店對話框 -->
    <el-dialog
      v-model="checkinDialogVisible"
      title="確認到店信息"
      width="500px"
    >
      <el-form :model="checkinForm" label-width="100px">
        <el-form-item label="顧客姓名">
          <el-input v-model="checkinForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="電話">
          <el-input v-model="checkinForm.phone" disabled />
        </el-form-item>
        <el-form-item label="到店時間">
          <el-input v-model="checkinForm.time" disabled />
        </el-form-item>
        <el-form-item label="備註">
          <el-input
            v-model="checkinForm.note"
            type="textarea"
            rows="3"
            placeholder="請輸入備註信息（選填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="checkinDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCheckin">
            確認到店
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import jsQR from 'jsqr'

// 相機狀態
const videoElement = ref(null)
const isCameraActive = ref(false)
const isScanning = ref(false)
const stream = ref(null)

// 掃描相關
const manualCode = ref('')
const scanResult = ref(null)
const scanHistory = ref([])

// 到店確認
const checkinDialogVisible = ref(false)
const checkinForm = ref({
  customerName: '',
  phone: '',
  time: '',
  note: ''
})

// 相機控制
const toggleCamera = async () => {
  if (isCameraActive.value) {
    stopCamera()
  } else {
    await startCamera()
  }
}

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    
    videoElement.value.srcObject = stream.value
    await videoElement.value.play()
    
    isCameraActive.value = true
    isScanning.value = true
    startScanning()
  } catch (error) {
    ElMessage.error('無法啟動相機')
    console.error('Camera error:', error)
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  isCameraActive.value = false
  isScanning.value = false
}

// QR Code 掃描
const startScanning = () => {
  if (!isScanning.value) return

  const video = videoElement.value
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  const scan = () => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        handleScanResult(code.data)
        return
      }
    }
    
    if (isScanning.value) {
      requestAnimationFrame(scan)
    }
  }

  requestAnimationFrame(scan)
}

// 處理掃描結果
const handleScanResult = async (code) => {
  isScanning.value = false
  try {
    // 這裡應該調用 API 驗證 QR Code
    // const response = await axios.post('/api/merchant/verify-qrcode', { code })
    // const data = response.data
    
    // 模擬 API 響應
    const data = {
      success: true,
      customerName: '張三',
      phone: '0912345678',
      message: 'QR Code 驗證成功'
    }

    scanResult.value = {
      success: data.success,
      title: data.success ? '掃描成功' : '掃描失敗',
      message: data.message,
      customerData: data
    }

    if (data.success) {
      checkinForm.value = {
        customerName: data.customerName,
        phone: data.phone,
        time: new Date().toLocaleString(),
        note: ''
      }
    }

    updateScanHistory({
      time: new Date().toLocaleString(),
      success: data.success,
      customerName: data.customerName,
      message: data.message
    })
  } catch (error) {
    ElMessage.error('驗證 QR Code 失敗')
  }
}

// 手動輸入處理
const handleManualInput = () => {
  if (!manualCode.value) {
    ElMessage.warning('請輸入 QR Code')
    return
  }
  handleScanResult(manualCode.value)
}

// 確認到店
const confirmCheckin = () => {
  checkinDialogVisible.value = true
}

const submitCheckin = async () => {
  try {
    // 這裡應該調用 API 提交到店信息
    // await axios.post('/api/merchant/checkin', checkinForm.value)
    ElMessage.success('確認到店成功')
    checkinDialogVisible.value = false
    resetScan()
  } catch (error) {
    ElMessage.error('確認到店失敗')
  }
}

// 重置掃描
const resetScan = () => {
  scanResult.value = null
  manualCode.value = ''
  if (isCameraActive.value) {
    isScanning.value = true
    startScanning()
  }
}

// 更新掃描歷史
const updateScanHistory = (record) => {
  scanHistory.value.unshift(record)
  if (scanHistory.value.length > 10) {
    scanHistory.value.pop()
  }
}

// 刷新歷史記錄
const refreshHistory = async () => {
  try {
    // 這裡應該調用 API 獲取最近的掃描記錄
    // const response = await axios.get('/api/merchant/scan-history')
    // scanHistory.value = response.data
    ElMessage.success('歷史記錄已更新')
  } catch (error) {
    ElMessage.error('更新歷史記錄失敗')
  }
}

// 生命週期鉤子
onMounted(() => {
  refreshHistory()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.scanner-container {
  padding: 20px;
}

.scanner-card {
  margin-bottom: 20px;
}

.camera-container {
  position: relative;
  width: 100%;
  height: 400px;
  background-color: #000;
  overflow: hidden;
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #67C23A;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: 100%;
  }
  100% {
    top: 0;
  }
}

.manual-input {
  padding: 40px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 16px;
}
</style> 