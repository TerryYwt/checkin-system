const express = require('express');
const router = express.Router();
const { authenticateToken, requireMerchant } = require('../../middleware/auth');
const bcrypt = require('bcryptjs');

// 所有路由都需要認證和商戶權限
router.use(authenticateToken);
router.use(requireMerchant);

// 獲取商戶設置
router.get('/', async (req, res) => {
  try {
    // TODO: 從數據庫獲取商戶設置
    res.json({
      storeName: 'My Store',
      contactPerson: 'John Doe',
      phone: '1234567890',
      email: 'store@example.com',
      address: '123 Main St',
      checkinNotification: true,
      campaignNotification: true,
      systemNotification: true
    });
  } catch (error) {
    console.error('Error fetching merchant settings:', error);
    res.status(500).json({ error: '獲取設置失敗' });
  }
});

// 更新基本設置
router.post('/basic', async (req, res) => {
  try {
    const { storeName, contactPerson, phone, email, address } = req.body;
    // TODO: 更新數據庫中的基本設置
    res.json({ message: '基本設置更新成功' });
  } catch (error) {
    console.error('Error updating basic settings:', error);
    res.status(500).json({ error: '更新基本設置失敗' });
  }
});

// 更新密碼
router.post('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // 驗證當前密碼
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '當前密碼不正確' });
    }

    // 更新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // TODO: 更新數據庫中的密碼
    res.json({ message: '密碼更新成功' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: '更新密碼失敗' });
  }
});

// 更新通知設置
router.post('/notifications', async (req, res) => {
  try {
    const { checkinNotification, campaignNotification, systemNotification } = req.body;
    // TODO: 更新數據庫中的通知設置
    res.json({ message: '通知設置更新成功' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: '更新通知設置失敗' });
  }
});

module.exports = router; 