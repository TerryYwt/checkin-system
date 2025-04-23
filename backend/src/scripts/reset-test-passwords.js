const { User } = require('../models');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function resetTestPasswords() {
  try {
    // Reset admin password
    const admin = await User.findOne({ where: { username: 'testadmin' } });
    if (admin) {
      const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'testadmin123';
      const hashedAdminPassword = await bcryptjs.hash(adminPassword, 10);
      await admin.update({ password: hashedAdminPassword });
      console.log('Admin password reset successfully');
    } else {
      console.log('Admin user not found');
    }

    // Reset merchant password
    const merchant = await User.findOne({ where: { username: 'testmerchant' } });
    if (merchant) {
      const merchantPassword = process.env.TEST_MERCHANT_PASSWORD || 'testmerchant123';
      const hashedMerchantPassword = await bcryptjs.hash(merchantPassword, 10);
      await merchant.update({ password: hashedMerchantPassword });
      console.log('Merchant password reset successfully');
    } else {
      console.log('Merchant user not found');
    }

    console.log('\nAll test passwords have been reset');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    process.exit();
  }
}

resetTestPasswords(); 