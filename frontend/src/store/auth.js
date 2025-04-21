import { defineStore } from 'pinia'
import axios from 'axios'
import api from '../services/api'

// 初始化 axios 默認請求頭
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    rememberMe: localStorage.getItem('rememberMe') === 'true'
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(username, password, rememberMe = false) {
      try {
        console.log('Attempting login with:', { username, rememberMe })
        const response = await api.post('/auth/login', { 
          username, 
          password,
          rememberMe 
        })
        
        console.log('Login response:', response.data)
        const { token, user } = response.data
        
        if (!token) {
          throw new Error('No token received from server')
        }
        
        this.token = token
        this.user = user
        this.rememberMe = rememberMe
        
        // 確保 token 被正確存儲
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('rememberMe', rememberMe)
        
        // 設置 axios 默認請求頭
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        console.log('Login successful, token stored:', {
          storedToken: localStorage.getItem('token'),
          storeToken: this.token
        })
        
        return true
      } catch (error) {
        console.error('Login error:', error)
        this.logout()
        throw error
      }
    },
    
    logout() {
      console.log('Logging out, clearing state and storage')
      this.token = null
      this.user = null
      this.rememberMe = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('rememberMe')
      
      delete axios.defaults.headers.common['Authorization']
    },
    
    async checkAuth() {
      if (!this.token) {
        console.log('No token found in store')
        return false
      }
      
      try {
        console.log('Checking auth with token:', this.token)
        const response = await api.get('/auth/me')
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        return true
      } catch (error) {
        console.error('Auth check failed:', error)
        // 如果是 401 或 403 錯誤，清除 token 並登出
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.logout()
        }
        return false
      }
    },
    
    async resetPassword(oldPassword, newPassword) {
      try {
        await api.post('/auth/reset-password', {
          username: this.user.username,
          oldPassword,
          newPassword
        })
        return true
      } catch (error) {
        throw error
      }
    }
  }
}) 