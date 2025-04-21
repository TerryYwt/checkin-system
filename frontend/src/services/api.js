import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Campaign API endpoints
export const campaignApi = {
  // Get all campaigns for current merchant
  getCampaigns: (params) => api.get('/merchant/campaigns', { params }),
  
  // Get campaign details
  getCampaign: (id) => api.get(`/merchant/campaigns/${id}`),
  
  // Create new campaign
  createCampaign: (data) => api.post('/merchant/campaigns', data),
  
  // Update campaign
  updateCampaign: (id, data) => api.put(`/merchant/campaigns/${id}`, data),
  
  // Delete campaign
  deleteCampaign: (id) => api.delete(`/merchant/campaigns/${id}`),
  
  // Get campaign analytics
  getCampaignAnalytics: (id) => api.get(`/merchant/campaigns/${id}/analytics`),
  
  // Update campaign status
  updateCampaignStatus: (id, status) => api.patch(`/merchant/campaigns/${id}/status`, { status })
}

export default api 