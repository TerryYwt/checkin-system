import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import MerchantManagement from '@/views/admin/MerchantManagement.vue'
import StoreManagement from '@/views/admin/StoreManagement.vue'
import QRCodeManagement from '@/views/admin/QRCodeManagement.vue'
import CampaignManagement from '@/views/admin/CampaignManagement.vue'
import Analytics from '@/views/admin/Analytics.vue'
import Settings from '@/views/admin/Settings.vue'
import MerchantLayout from '@/layouts/MerchantLayout.vue'
import MerchantDashboard from '@/views/MerchantDashboard.vue'
import CampaignList from '@/views/merchant/CampaignList.vue'
import CampaignForm from '@/views/merchant/CampaignForm.vue'
import CampaignDetails from '@/views/merchant/CampaignDetails.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: Dashboard
      },
      {
        path: 'users',
        name: 'user-management',
        component: UserManagement
      },
      {
        path: 'merchants',
        name: 'merchant-management',
        component: MerchantManagement
      },
      {
        path: 'stores',
        name: 'store-management',
        component: StoreManagement
      },
      {
        path: 'qrcodes',
        name: 'qrcode-management',
        component: QRCodeManagement
      },
      {
        path: 'campaigns',
        name: 'campaign-management',
        component: CampaignManagement
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: Analytics
      },
      {
        path: 'settings',
        name: 'settings',
        component: Settings
      },
      {
        path: 'merchants/:id',
        name: 'admin-merchant-detail',
        component: () => import('../views/admin/MerchantDetail.vue')
      }
    ]
  },
  // 商戶路由
  {
    path: '/merchant',
    component: MerchantLayout,
    meta: { requiresAuth: true, role: 'merchant' },
    children: [
      {
        path: '',
        name: 'MerchantHome',
        redirect: '/merchant/dashboard'
      },
      {
        path: 'dashboard',
        name: 'merchant-dashboard',
        component: MerchantDashboard
      },
      {
        path: 'checkins',
        name: 'MerchantCheckins',
        component: () => import('../views/MerchantReports.vue')
      },
      {
        path: 'scanner',
        name: 'MerchantScanner',
        component: () => import('../views/MerchantScanner.vue')
      },
      {
        path: 'settings',
        name: 'MerchantSettings',
        component: () => import('../views/MerchantSettings.vue')
      },
      {
        path: 'campaigns',
        name: 'merchant-campaigns',
        component: CampaignList
      },
      {
        path: 'campaigns/new',
        name: 'merchant-campaign-new',
        component: CampaignForm
      },
      {
        path: 'campaigns/:id',
        name: 'merchant-campaign-details',
        component: CampaignDetails
      },
      {
        path: 'campaigns/:id/edit',
        name: 'merchant-campaign-edit',
        component: CampaignForm,
        props: route => ({ 
          campaignId: route.params.id,
          isEdit: true 
        })
      }
    ]
  },
  // 普通用戶路由
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('../views/CheckIn.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('../views/Records.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/qrcode',
    name: 'QRCode',
    component: () => import('../views/QRCode.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')
  
  console.log('Navigation guard:', {
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    hasToken: !!token,
    userRole: authStore.user?.role
  })

  // 不需要認證的路由
  if (!to.meta.requiresAuth) {
    if (token) {
      // 已登錄用戶訪問登錄頁，重定向到首頁
      if (to.path === '/login') {
        // 根據用戶角色選擇重定向
        if (authStore.user?.role === 'admin') {
          next('/admin')
        } else if (authStore.user?.role === 'merchant') {
          next('/merchant/dashboard')
        } else {
          next('/')
        }
        return
      }
    }
    next()
    return
  }

  // 需要認證但沒有 token
  if (!token) {
    next('/login')
    return
  }

  try {
    // 檢查認證狀態
    if (!authStore.user) {
      await authStore.checkAuth()
    }

    // 檢查角色權限
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      console.log('Role mismatch:', {
        required: to.meta.role,
        current: authStore.user?.role
      })
      
      // 重定向到對應角色的首頁
      if (authStore.user?.role === 'admin') {
        next('/admin')
      } else if (authStore.user?.role === 'merchant') {
        next('/merchant/dashboard')
      } else {
        next('/')
      }
      return
    }

    // 檢查商家特定權限
    if (to.meta.requiresMerchant && authStore.user?.role !== 'merchant') {
      console.log('Merchant role required but user is:', authStore.user?.role)
      if (authStore.user?.role === 'admin') {
        next('/admin')
      } else {
        next('/')
      }
      return
    }

    // 重定向根路徑到合適的首頁
    if (to.path === '/') {
      if (authStore.user?.role === 'admin') {
        next('/admin')
      } else if (authStore.user?.role === 'merchant') {
        next('/merchant/dashboard')
      } else {
        next()
      }
      return
    }

    next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    next('/login')
  }
})

export default router 