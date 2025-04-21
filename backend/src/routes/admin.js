const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Merchant details routes
router.get('/merchants/:id', middleware.authenticateToken, adminController.getMerchantById);
router.put('/merchants/:id', middleware.authenticateToken, adminController.updateMerchant);
router.patch('/merchants/:id/status', middleware.authenticateToken, adminController.updateMerchantStatus);
router.get('/merchants/:id/stats', middleware.authenticateToken, adminController.getMerchantStats);
router.get('/merchants/:id/activities', middleware.authenticateToken, adminController.getMerchantActivities);

module.exports = router; 