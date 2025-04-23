const bcryptjs = require('bcryptjs');
const { User, Merchant, Store } = require('../models');
const { merchant: testMerchant } = require('../config/test-accounts');
require('dotenv').config();

async function createTestMerchant() {
  try {
    // Find or create the user
    let user = await User.findOne({ where: { username: testMerchant.username } });
    
    if (!user) {
      const hashedPassword = await bcryptjs.hash(process.env.TEST_MERCHANT_PASSWORD || 'Merchant@123456', 10);
      user = await User.create({
        username: testMerchant.username,
        password: hashedPassword,
        email: testMerchant.email,
        role: testMerchant.role,
        status: 'active'
      });
      console.log('Created test merchant user:', user.toJSON());
    } else {
      console.log('Test merchant user already exists:', user.toJSON());
    }

    // Find or create the merchant profile
    let merchant = await Merchant.findOne({ where: { userId: user.id } });
    
    if (!merchant) {
      merchant = await Merchant.create({
        userId: user.id,
        businessName: '測試商家',
        email: testMerchant.email,
        contactPerson: 'Test Contact',
        phone: '0912345678',
        status: 'active'
      });
      console.log('Created test merchant:', merchant.toJSON());
    } else {
      console.log('Test merchant profile already exists:', merchant.toJSON());
    }

    // Find or create the store
    let store = await Store.findOne({ where: { merchantId: merchant.id } });
    
    if (!store) {
      store = await Store.create({
        merchantId: merchant.id,
        name: '測試商店',
        address: '台北市測試區測試路123號',
        phone: '0912345678',
        status: 'active'
      });
      console.log('Created test store:', store.toJSON());
    } else {
      console.log('Test store already exists:', store.toJSON());
    }

  } catch (error) {
    console.error('Error creating test merchant:', error);
  } finally {
    process.exit();
  }
}

createTestMerchant();