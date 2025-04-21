const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const userRoutes = require('./users');
const merchantSettingsRoutes = require('./merchant/settings');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/users', authenticateToken, userRoutes);
router.use('/admin', authenticateToken, adminRoutes);
router.use('/merchant/settings', merchantSettingsRoutes);

module.exports = router; 