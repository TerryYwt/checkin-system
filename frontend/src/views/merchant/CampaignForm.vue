<template>
  <v-card>
    <v-card-title>
      {{ isEdit ? '編輯活動' : '新增活動' }}
    </v-card-title>

    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="活動名稱"
              :rules="[v => !!v || '請輸入活動名稱']"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="活動描述"
              rows="3"
            ></v-textarea>
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              v-model="form.type"
              :items="typeOptions"
              label="活動類型"
              :rules="[v => !!v || '請選擇活動類型']"
              required
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.budget"
              label="預算"
              type="number"
              prefix="NT$"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6">
            <v-menu
              ref="startDateMenu"
              v-model="startDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="form.start_date"
                  label="開始日期"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[v => !!v || '請選擇開始日期']"
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="form.start_date"
                @input="startDateMenu = false"
                :min="new Date().toISOString().substr(0, 10)"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="6">
            <v-menu
              ref="endDateMenu"
              v-model="endDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="form.end_date"
                  label="結束日期"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[
                    v => !!v || '請選擇結束日期',
                    v => v > form.start_date || '結束日期必須晚於開始日期'
                  ]"
                  required
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="form.end_date"
                @input="endDateMenu = false"
                :min="form.start_date || new Date().toISOString().substr(0, 10)"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12">
            <v-card outlined>
              <v-card-title>活動規則</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.rules.minCheckins"
                      label="最低簽到次數"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.rules.pointsPerCheckin"
                      label="每次簽到獲得積分"
                      type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card outlined>
              <v-card-title>獎勵設置</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.rewards.discount"
                      label="折扣比例"
                      type="number"
                      suffix="%"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.rewards.points"
                      label="獎勵積分"
                      type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card outlined>
              <v-card-title>目標受眾</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="form.target_audience.userTypes"
                      :items="userTypeOptions"
                      label="用戶類型"
                      multiple
                      chips
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.target_audience.minPoints"
                      label="最低積分要求"
                      type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('close')">取消</v-btn>
      <v-btn
        color="primary"
        @click="handleSubmit"
        :loading="loading"
        :disabled="!valid"
      >
        保存
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'CampaignForm',
  props: {
    campaign: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      valid: false,
      loading: false,
      startDateMenu: false,
      endDateMenu: false,
      form: {
        name: '',
        description: '',
        type: '',
        start_date: '',
        end_date: '',
        budget: '',
        rules: {
          minCheckins: '',
          pointsPerCheckin: ''
        },
        rewards: {
          discount: '',
          points: ''
        },
        target_audience: {
          userTypes: [],
          minPoints: ''
        }
      },
      typeOptions: [
        { text: '折扣', value: 'discount' },
        { text: '積分', value: 'points' },
        { text: '禮品', value: 'gift' },
        { text: '試用', value: 'trial' }
      ],
      userTypeOptions: [
        { text: '新用戶', value: 'new' },
        { text: '活躍用戶', value: 'active' },
        { text: 'VIP用戶', value: 'vip' }
      ]
    }
  },
  computed: {
    isEdit() {
      return !!this.campaign
    }
  },
  watch: {
    campaign: {
      handler(val) {
        if (val) {
          this.form = {
            ...val,
            rules: val.rules || {},
            rewards: val.rewards || {},
            target_audience: val.target_audience || {}
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.$refs.form.validate()) return

      this.loading = true
      try {
        const campaignData = {
          ...this.form,
          merchant_id: this.$store.state.user.merchant_id
        }
        this.$emit('save', campaignData)
      } catch (error) {
        console.error('Error saving campaign:', error)
        this.$store.dispatch('showError', '保存活動失敗')
      } finally {
        this.loading = false
      }
    }
  }
}
</script> 