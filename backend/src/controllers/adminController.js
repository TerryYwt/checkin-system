const db = require('../models');

// Get merchant by ID
exports.getMerchantById = async (req, res) => {
  try {
    const merchantId = req.params.id;
    
    const merchant = await db.Merchant.findByPk(merchantId, {
      include: [
        {
          model: db.Store,
          as: 'stores'
        }
      ]
    });
    
    if (!merchant) {
      return res.status(404).json({ message: '商戶不存在' });
    }
    
    res.json(merchant);
  } catch (error) {
    console.error('Error fetching merchant by ID:', error);
    res.status(500).json({ message: '獲取商戶詳情失敗', error: error.message });
  }
};

// Update merchant
exports.updateMerchant = async (req, res) => {
  try {
    const merchantId = req.params.id;
    const { username, storeName, contactPerson, phone, email, storeAddress, status } = req.body;
    
    const merchant = await db.Merchant.findByPk(merchantId);
    
    if (!merchant) {
      return res.status(404).json({ message: '商戶不存在' });
    }
    
    // 更新商戶資料
    await merchant.update({
      username,
      storeName,
      contactPerson,
      phone,
      email,
      storeAddress,
      status
    });
    
    res.json({ success: true, merchant });
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ message: '更新商戶失敗', error: error.message });
  }
};

// Update merchant status
exports.updateMerchantStatus = async (req, res) => {
  try {
    const merchantId = req.params.id;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: '無效的狀態值' });
    }
    
    const merchant = await db.Merchant.findByPk(merchantId);
    
    if (!merchant) {
      return res.status(404).json({ message: '商戶不存在' });
    }
    
    await merchant.update({ status });
    
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error updating merchant status:', error);
    res.status(500).json({ message: '更新商戶狀態失敗', error: error.message });
  }
};

// Get merchant stats
exports.getMerchantStats = async (req, res) => {
  try {
    const merchantId = req.params.id;
    
    // 獲取簽到統計
    const checkinCount = await db.Checkin.count({
      include: [{
        model: db.Store,
        as: 'store',
        where: { merchant_id: merchantId }
      }]
    });
    
    // 獲取活動統計
    const campaignCount = await db.Campaign.count({
      where: { merchant_id: merchantId }
    });
    
    // 獲取QR碼統計
    const qrcodeCount = await db.QRCode.count({
      include: [{
        model: db.Store,
        as: 'store',
        where: { merchant_id: merchantId }
      }]
    });
    
    // 返回統計數據
    res.json({
      checkinCount,
      campaignCount,
      qrcodeCount
    });
  } catch (error) {
    console.error('Error fetching merchant stats:', error);
    res.status(500).json({ message: '獲取商戶統計數據失敗', error: error.message });
  }
};

// Get merchant activities
exports.getMerchantActivities = async (req, res) => {
  try {
    const merchantId = req.params.id;
    const limit = parseInt(req.query.limit) || 5;
    
    // 查詢最近的登入活動
    const loginActivities = await db.Activity.findAll({
      where: {
        user_id: merchantId,
        type: 'login'
      },
      limit: 2,
      order: [['created_at', 'DESC']]
    });
    
    // 查詢最近的簽到活動
    const checkinActivities = await db.Checkin.findAll({
      include: [{
        model: db.Store,
        as: 'store',
        where: { merchant_id: merchantId }
      }],
      limit: 3,
      order: [['created_at', 'DESC']]
    }).then(checkins => checkins.map(checkin => ({
      id: `checkin-${checkin.id}`,
      type: 'checkin',
      description: `客戶簽到 - 店鋪: ${checkin.store.name}`,
      createdAt: checkin.created_at
    })));
    
    // 將不同類型的活動合併並按時間排序
    const allActivities = [
      ...loginActivities.map(activity => ({
        id: `activity-${activity.id}`,
        type: activity.type,
        description: '商戶登入系統',
        createdAt: activity.created_at
      })),
      ...checkinActivities
    ];
    
    // 排序並限制數量
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    
    res.json(sortedActivities);
  } catch (error) {
    console.error('Error fetching merchant activities:', error);
    res.status(500).json({ message: '獲取商戶活動記錄失敗', error: error.message });
  }
}; 