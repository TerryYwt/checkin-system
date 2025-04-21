<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center" style="width: 100%">
        <span>{{ campaign.name }}</span>
        <v-chip :color="getStatusColor(campaign.status)">
          {{ getStatusText(campaign.status) }}
        </v-chip>
      </div>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="8">
          <!-- Campaign Info -->
          <v-card outlined class="mb-4">
            <v-card-title>活動信息</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">活動類型</div>
                  <div class="text-body-1">{{ getTypeText(campaign.type) }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">預算</div>
                  <div class="text-body-1">NT$ {{ campaign.budget }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">開始日期</div>
                  <div class="text-body-1">{{ formatDate(campaign.start_date) }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">結束日期</div>
                  <div class="text-body-1">{{ formatDate(campaign.end_date) }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="text-subtitle-1">活動描述</div>
                  <div class="text-body-1">{{ campaign.description }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Campaign Rules -->
          <v-card outlined class="mb-4">
            <v-card-title>活動規則</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">最低簽到次數</div>
                  <div class="text-body-1">{{ campaign.rules?.minCheckins || '無' }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">每次簽到獲得積分</div>
                  <div class="text-body-1">{{ campaign.rules?.pointsPerCheckin || '無' }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Campaign Rewards -->
          <v-card outlined class="mb-4">
            <v-card-title>獎勵設置</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">折扣比例</div>
                  <div class="text-body-1">{{ campaign.rewards?.discount ? `${campaign.rewards.discount}%` : '無' }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-subtitle-1">獎勵積分</div>
                  <div class="text-body-1">{{ campaign.rewards?.points || '無' }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Analytics -->
          <v-card outlined class="mb-4">
            <v-card-title>活動數據</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1">總掃描次數</div>
                  <div class="text-h4">{{ analytics.totalScans || 0 }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="text-subtitle-1">總簽到次數</div>
                  <div class="text-h4">{{ analytics.totalCheckins || 0 }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="text-subtitle-1">參與用戶數</div>
                  <div class="text-h4">{{ analytics.uniqueUsers || 0 }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="text-subtitle-1">QR碼數量</div>
                  <div class="text-h4">{{ analytics.qrCodes || 0 }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Status Actions -->
          <v-card outlined>
            <v-card-title>狀態管理</v-card-title>
            <v-card-text>
              <v-select
                v-model="newStatus"
                :items="statusOptions"
                label="更新狀態"
                :disabled="!canUpdateStatus"
              ></v-select>
              <v-btn
                color="primary"
                block
                @click="updateStatus"
                :disabled="!canUpdateStatus || !newStatus"
                :loading="updatingStatus"
              >
                更新狀態
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Check-in Chart -->
      <v-card outlined class="mt-4">
        <v-card-title>簽到趨勢</v-card-title>
        <v-card-text>
          <line-chart
            v-if="checkinData.length"
            :data="checkinData"
            :options="chartOptions"
          ></line-chart>
          <div v-else class="text-center py-4">
            暫無簽到數據
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('close')">關閉</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { campaignApi } from '../../services/api'
import LineChart from '../../components/charts/LineChart.vue'

export default {
  name: 'CampaignDetails',
  components: {
    LineChart
  },
  props: {
    campaign: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      analytics: {},
      newStatus: '',
      updatingStatus: false,
      statusOptions: [
        { text: '進行中', value: 'active' },
        { text: '暫停', value: 'paused' },
        { text: '完成', value: 'completed' },
        { text: '取消', value: 'cancelled' }
      ],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }
  },
  computed: {
    canUpdateStatus() {
      return ['draft', 'active', 'paused'].includes(this.campaign.status)
    },
    checkinData() {
      if (!this.analytics.checkinsByDate) return []
      
      return {
        labels: Object.keys(this.analytics.checkinsByDate),
        datasets: [{
          label: '簽到次數',
          data: Object.values(this.analytics.checkinsByDate),
          borderColor: '#1976D2',
          tension: 0.1
        }]
      }
    }
  },
  created() {
    this.fetchAnalytics()
  },
  methods: {
    async fetchAnalytics() {
      try {
        const response = await campaignApi.get(`/campaigns/${this.campaign.id}/analytics`)
        this.analytics = response.data
      } catch (error) {
        console.error('Error fetching analytics:', error)
        this.$store.dispatch('showError', '獲取活動數據失敗')
      }
    },
    async updateStatus() {
      if (!this.newStatus) return
      
      this.updatingStatus = true
      try {
        await campaignApi.patch(`/campaigns/${this.campaign.id}/status`, { status: this.newStatus })
        this.$store.dispatch('showSuccess', '狀態已更新')
        this.$emit('status-updated', this.newStatus)
        this.newStatus = ''
      } catch (error) {
        console.error('Error updating status:', error)
        this.$store.dispatch('showError', '更新狀態失敗')
      } finally {
        this.updatingStatus = false
      }
    },
    getStatusColor(status) {
      const colors = {
        draft: 'grey',
        active: 'success',
        paused: 'warning',
        completed: 'info',
        cancelled: 'error'
      }
      return colors[status] || 'grey'
    },
    getStatusText(status) {
      const texts = {
        draft: '草稿',
        active: '進行中',
        paused: '已暫停',
        completed: '已完成',
        cancelled: '已取消'
      }
      return texts[status] || status
    },
    getTypeText(type) {
      const texts = {
        discount: '折扣',
        points: '積分',
        gift: '禮品',
        trial: '試用'
      }
      return texts[type] || type
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-TW')
    }
  }
}
</script> 