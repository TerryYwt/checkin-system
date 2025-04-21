import axios from 'axios'
import { objectToCamelCase, objectToSnakeCase } from '../utils/case-converter'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token and convert case
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Convert request data from camelCase to snake_case
  if (config.data) {
    config.data = objectToSnakeCase(config.data)
  }
  
  // Convert params from camelCase to snake_case
  if (config.params) {
    config.params = objectToSnakeCase(config.params)
  }
  
  return config
})

// Add response interceptor to convert snake_case to camelCase
api.interceptors.response.use(response => {
  // Convert response data from snake_case to camelCase
  if (response.data) {
    response.data = objectToCamelCase(response.data)
  }
  return response
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