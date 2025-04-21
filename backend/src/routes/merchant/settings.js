const express = require('express');
const router = express.Router();
const { authenticateToken, requireMerchant } = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const { Setting, User, Merchant } = require('../../models');
const { v4: uuidv4 } = require('uuid');

// 所有路由都需要認證和商戶權限
router.use(authenticateToken);
router.use(requireMerchant);

// 獲取商戶設置
router.get('/', async (req, res) => {
  try {
    // Get the merchant ID from the authenticated user
    const merchantId = req.user.merchant.id;
    
    // Get merchant settings from the database
    const settings = await Setting.findAll({
      where: { merchant_id: merchantId }
    });
    
    // Convert settings to a more usable format
    const settingsObj = {};
    settings.forEach(setting => {
      let value = setting.value;
      
      // Parse value based on type
      if (setting.type === 'boolean') {
        value = value === 'true';
      } else if (setting.type === 'number') {
        value = parseFloat(value);
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error('Error parsing JSON setting:', e);
        }
      }
      
      settingsObj[setting.key] = value;
    });
    
    // Get merchant profile information
    const merchant = await Merchant.findByPk(merchantId);
    
    // If no settings exist yet, return default values
    const response = {
      storeName: settingsObj.storeName || merchant?.businessName || 'My Store',
      contactPerson: settingsObj.contactPerson || merchant?.contactPerson || '',
      phone: settingsObj.phone || merchant?.phone || '',
      email: req.user.email || '',
      address: settingsObj.address || '',
      checkinNotification: settingsObj.checkinNotification !== undefined ? settingsObj.checkinNotification : true,
      campaignNotification: settingsObj.campaignNotification !== undefined ? settingsObj.campaignNotification : true,
      systemNotification: settingsObj.systemNotification !== undefined ? settingsObj.systemNotification : true
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching merchant settings:', error);
    res.status(500).json({ error: '獲取設置失敗' });
  }
});

// 更新基本設置
router.post('/basic', async (req, res) => {
  try {
    const { storeName, contactPerson, phone, email, address } = req.body;
    const merchantId = req.user.merchant.id;
    
    // Update user email if changed
    if (email && email !== req.user.email) {
      await User.update({ email }, { where: { id: req.user.id } });
    }
    
    // Update merchant profile
    await Merchant.update(
      { 
        business_name: storeName,
        contact_person: contactPerson,
        phone
      }, 
      { where: { id: merchantId } }
    );
    
    // Update or create settings
    const settingsToUpdate = [
      { key: 'storeName', value: storeName, type: 'string' },
      { key: 'contactPerson', value: contactPerson, type: 'string' },
      { key: 'phone', value: phone, type: 'string' },
      { key: 'address', value: address, type: 'string' }
    ];
    
    for (const setting of settingsToUpdate) {
      await Setting.upsert({
        id: `merchant-${merchantId}-${setting.key}`,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        merchant_id: merchantId,
        updated_by: req.user.id
      });
    }
    
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
    await User.update(
      { password: hashedPassword },
      { where: { id: user.id } }
    );
    
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
    const merchantId = req.user.merchant.id;
    
    // Update notification settings
    const settingsToUpdate = [
      { key: 'checkinNotification', value: String(checkinNotification), type: 'boolean' },
      { key: 'campaignNotification', value: String(campaignNotification), type: 'boolean' },
      { key: 'systemNotification', value: String(systemNotification), type: 'boolean' }
    ];
    
    for (const setting of settingsToUpdate) {
      await Setting.upsert({
        id: `merchant-${merchantId}-${setting.key}`,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        merchant_id: merchantId,
        updated_by: req.user.id
      });
    }
    
    res.json({ message: '通知設置更新成功' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: '更新通知設置失敗' });
  }
});

module.exports = router; 