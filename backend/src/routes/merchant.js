const express = require('express');
const router = express.Router();
const { authenticateToken, requireMerchant } = require('../middleware/auth');
const { handleCheckin } = require('../controllers/merchantController');

// 所有路由都需要商家身份驗證
router.use(authenticateToken);
router.use(requireMerchant);

// 處理簽到請求
router.post('/checkin', handleCheckin);

module.exports = router; 