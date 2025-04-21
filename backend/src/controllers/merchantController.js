const { User, Store, Checkin } = require('../models');

exports.handleCheckin = async (req, res) => {
  try {
    const { trialId, method } = req.body;
    const merchantId = req.user.merchant.id;

    // 查找用戶
    const user = await User.findOne({
      where: {
        trialId: trialId,
        status: 'active'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 檢查用戶是否已經在今天簽到
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckin = await Checkin.findOne({
      where: {
        userId: user.id,
        merchantId: merchantId,
        checkinTime: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    if (existingCheckin) {
      return res.status(400).json({
        success: false,
        message: '用戶今天已經簽到過了'
      });
    }

    // 創建簽到記錄
    const checkin = await Checkin.create({
      userId: user.id,
      merchantId: merchantId,
      checkinTime: new Date(),
      method: method,
      status: 'success'
    });

    res.json({
      success: true,
      message: '簽到成功',
      user: {
        username: user.username,
        id: user.id
      },
      checkin: {
        id: checkin.id,
        time: checkin.checkinTime
      }
    });

  } catch (error) {
    console.error('Error handling merchant checkin:', error);
    res.status(500).json({
      success: false,
      message: '簽到處理失敗'
    });
  }
}; 