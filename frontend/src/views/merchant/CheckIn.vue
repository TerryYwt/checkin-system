# 商家簽到介面

<template>
  <div class="checkin-container">
    <el-card class="checkin-card">
      <template #header>
        <div class="card-header">
          <span>用戶簽到</span>
          <el-radio-group v-model="checkInMethod" size="small">
            <el-radio-button label="qr">QR Code</el-radio-button>
            <el-radio-button label="manual">手動輸入</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- QR Code 掃描 -->
      <div v-if="checkInMethod === 'qr'" class="qr-scanner">
        <div class="scanner-container">
          <qrcode-stream @decode="onDecode" @init="onInit">
            <div class="scan-frame"></div>
          </qrcode-stream>
        </div>
        <div class="scanner-hint">
          請將用戶的 QR Code 對準掃描框
        </div>
      </div>

      <!-- 手動輸入 -->
      <div v-else class="manual-input">
        <el-form :model="form" label-width="100px">
          <el-form-item label="Trial ID">
            <el-input 
              v-model="form.trialId" 
              placeholder="請輸入用戶的 Trial ID"
              @keyup.enter="handleManualCheckIn"
            >
              <template #append>
                <el-button @click="handleManualCheckIn">
                  簽到
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 最近簽到記錄 -->
      <div class="recent-checkins">
        <h3>最近簽到記錄</h3>
        <el-table :data="recentCheckins" style="width: 100%">
          <el-table-column prop="time" label="時間" width="180">
            <template #default="{ row }">
              {{ formatDate(row.time) }}
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用戶" />
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                {{ row.status === 'success' ? '成功' : '失敗' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { format } from 'date-fns'

const checkInMethod = ref('qr')
const form = ref({
  trialId: ''
})
const recentCheckins = ref([])
let camera = null

// 處理 QR Code 掃描結果
const onDecode = async (result) => {
  try {
    const response = await axios.post('/merchant/checkin', {
      trialId: result,
      method: 'qr'
    })
    
    if (response.data.success) {
      ElMessage.success('簽到成功')
      addCheckinRecord({
        time: new Date(),
        username: response.data.user.username,
        status: 'success'
      })
    } else {
      ElMessage.error(response.data.message || '簽到失敗')
      addCheckinRecord({
        time: new Date(),
        username: '未知用戶',
        status: 'failed'
      })
    }
  } catch (error) {
    ElMessage.error('簽到失敗：' + (error.response?.data?.message || error.message))
  }
}

// 初始化相機
const onInit = async (promise) => {
  try {
    camera = await promise
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      ElMessage.error('請允許使用相機')
    } else if (error.name === 'NotFoundError') {
      ElMessage.error('找不到相機')
    } else if (error.name === 'NotSupportedError') {
      ElMessage.error('瀏覽器不支援相機')
    } else if (error.name === 'NotReadableError') {
      ElMessage.error('無法訪問相機')
    } else if (error.name === 'OverconstrainedError') {
      ElMessage.error('找不到合適的相機')
    } else if (error.name === 'StreamApiNotSupportedError') {
      ElMessage.error('瀏覽器不支援串流 API')
    } else {
      ElMessage.error('相機初始化失敗')
    }
  }
}

// 手動簽到
const handleManualCheckIn = async () => {
  if (!form.value.trialId) {
    ElMessage.warning('請輸入 Trial ID')
    return
  }

  try {
    const response = await axios.post('/merchant/checkin', {
      trialId: form.value.trialId,
      method: 'manual'
    })
    
    if (response.data.success) {
      ElMessage.success('簽到成功')
      form.value.trialId = ''
      addCheckinRecord({
        time: new Date(),
        username: response.data.user.username,
        status: 'success'
      })
    } else {
      ElMessage.error(response.data.message || '簽到失敗')
      addCheckinRecord({
        time: new Date(),
        username: '未知用戶',
        status: 'failed'
      })
    }
  } catch (error) {
    ElMessage.error('簽到失敗：' + (error.response?.data?.message || error.message))
  }
}

// 添加簽到記錄
const addCheckinRecord = (record) => {
  recentCheckins.value.unshift(record)
  if (recentCheckins.value.length > 10) {
    recentCheckins.value.pop()
  }
}

// 格式化日期
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
}

// 組件卸載時停止相機
onUnmounted(() => {
  if (camera) {
    camera.stop()
  }
})
</script>

<style scoped>
.checkin-container {
  padding: 20px;
}

.checkin-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qr-scanner {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.scanner-container {
  width: 300px;
  height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px solid #409EFF;
  border-radius: 8px;
}

.scanner-hint {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.manual-input {
  max-width: 400px;
  margin: 20px auto;
}

.recent-checkins {
  margin-top: 30px;
}

.recent-checkins h3 {
  margin-bottom: 15px;
  color: #303133;
}
</style> 