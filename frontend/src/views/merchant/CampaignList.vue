<template>
  <div class="campaign-list">
    <div class="header">
      <h1>行銷活動管理</h1>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        新增活動
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="活動狀態"
              clearable
              @change="fetchCampaigns"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.type"
              :items="typeOptions"
              label="活動類型"
              clearable
              @change="fetchCampaigns"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Campaign List -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="campaigns"
        :loading="loading"
        :items-per-page="10"
        :server-items-length="totalItems"
        @update:options="handleOptionsUpdate"
      >
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            @click="viewDetails(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="editCampaign(item)"
            :disabled="item.status !== 'draft'"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="deleteCampaign(item)"
            :disabled="item.status !== 'draft'"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800px">
      <campaign-form
        v-if="dialog"
        :campaign="selectedCampaign"
        @save="handleSave"
        @close="dialog = false"
      />
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="1000px">
      <campaign-details
        v-if="detailsDialog"
        :campaign="selectedCampaign"
        @close="detailsDialog = false"
      />
    </v-dialog>
  </div>
</template>

<script>
import CampaignForm from './CampaignForm.vue'
import CampaignDetails from './CampaignDetails.vue'
import { campaignApi } from '../../services/api'

export default {
  name: 'CampaignList',
  components: {
    CampaignForm,
    CampaignDetails
  },
  data() {
    return {
      loading: false,
      campaigns: [],
      totalItems: 0,
      dialog: false,
      detailsDialog: false,
      selectedCampaign: null,
      filters: {
        status: null,
        type: null
      },
      headers: [
        { text: '活動名稱', value: 'name' },
        { text: '類型', value: 'type' },
        { text: '開始日期', value: 'start_date' },
        { text: '結束日期', value: 'end_date' },
        { text: '狀態', value: 'status' },
        { text: '操作', value: 'actions', sortable: false }
      ],
      statusOptions: [
        { text: '草稿', value: 'draft' },
        { text: '進行中', value: 'active' },
        { text: '已暫停', value: 'paused' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' }
      ],
      typeOptions: [
        { text: '折扣', value: 'discount' },
        { text: '積分', value: 'points' },
        { text: '禮品', value: 'gift' },
        { text: '試用', value: 'trial' }
      ]
    }
  },
  created() {
    this.fetchCampaigns()
  },
  methods: {
    async fetchCampaigns(options = {}) {
      this.loading = true
      try {
        const params = {
          page: options.page || 1,
          limit: options.itemsPerPage || 10,
          ...this.filters
        }
        const response = await campaignApi.get(`/campaigns/merchant/${this.$store.state.user.merchant_id}`, { params })
        this.campaigns = response.data.campaigns
        this.totalItems = response.data.total
      } catch (error) {
        console.error('Error fetching campaigns:', error)
        this.$store.dispatch('showError', '獲取活動列表失敗')
      } finally {
        this.loading = false
      }
    },
    handleOptionsUpdate(options) {
      this.fetchCampaigns(options)
    },
    openCreateDialog() {
      this.selectedCampaign = null
      this.dialog = true
    },
    editCampaign(campaign) {
      this.selectedCampaign = { ...campaign }
      this.dialog = true
    },
    viewDetails(campaign) {
      this.selectedCampaign = campaign
      this.detailsDialog = true
    },
    async deleteCampaign(campaign) {
      if (!confirm('確定要刪除此活動嗎？')) return
      
      try {
        await campaignApi.delete(`/campaigns/${campaign.id}`)
        this.$store.dispatch('showSuccess', '活動已刪除')
        this.fetchCampaigns()
      } catch (error) {
        console.error('Error deleting campaign:', error)
        this.$store.dispatch('showError', '刪除活動失敗')
      }
    },
    async handleSave(campaign) {
      try {
        if (campaign.id) {
          await campaignApi.put(`/campaigns/${campaign.id}`, campaign)
          this.$store.dispatch('showSuccess', '活動已更新')
        } else {
          await campaignApi.post('/campaigns', campaign)
          this.$store.dispatch('showSuccess', '活動已創建')
        }
        this.dialog = false
        this.fetchCampaigns()
      } catch (error) {
        console.error('Error saving campaign:', error)
        this.$store.dispatch('showError', '保存活動失敗')
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
    }
  }
}
</script>

<style scoped>
.campaign-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.v-data-table {
  margin-top: 20px;
}
</style> 