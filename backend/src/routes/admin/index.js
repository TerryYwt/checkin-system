const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');

// Import route modules
const userRoutes = require('./users');
const storeRoutes = require('./stores');
const campaignRoutes = require('./campaigns');
const settingsRoutes = require('./settings');

// Apply admin middleware to all routes
router.use(requireAdmin);

// Mount routes
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/settings', settingsRoutes);

module.exports = router; 