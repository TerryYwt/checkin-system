const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getTrendData,
  getDistributionData,
  getRecentActivities,
  getOverview,
  getStoreRankings
} = require('../controllers/analyticsController');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Trend data
router.get('/trend', getTrendData);

// Distribution data
router.get('/distribution', getDistributionData);

// Recent activities
router.get('/recent-activities', getRecentActivities);

// Overview data
router.get('/overview', getOverview);

// Store rankings
router.get('/store-rankings', getStoreRankings);

module.exports = router; 