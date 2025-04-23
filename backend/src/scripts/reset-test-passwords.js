const { User } = require('../models');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function resetTestPasswords() {
  try {
    const SALT_ROUNDS = 10;
    console.log('Using salt rounds:', SALT_ROUNDS);

    // Reset admin password
    const admin = await User.findOne({ where: { username: 'testadmin' } });
    if (admin) {
      const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'Admin@123456';
      console.log('\nResetting admin password:');
      console.log('- Username:', admin.username);
      console.log('- Current password hash:', admin.password);
      console.log('- New password:', adminPassword);
      
      const hashedAdminPassword = await bcryptjs.hash(adminPassword, SALT_ROUNDS);
      console.log('- New password hash:', hashedAdminPassword);
      
      await admin.update({ password: hashedAdminPassword });
      console.log('Admin password reset successfully');

      // Verify the password
      const adminPasswordValid = await bcryptjs.compare(adminPassword, hashedAdminPassword);
      console.log('Admin password verification:', adminPasswordValid);
    } else {
      console.log('Admin user not found');
    }

    // Reset merchant password
    const merchant = await User.findOne({ where: { username: 'testmerchant' } });
    if (merchant) {
      const merchantPassword = process.env.TEST_MERCHANT_PASSWORD || 'Merchant@123456';
      console.log('\nResetting merchant password:');
      console.log('- Username:', merchant.username);
      console.log('- Current password hash:', merchant.password);
      console.log('- New password:', merchantPassword);
      
      const hashedMerchantPassword = await bcryptjs.hash(merchantPassword, SALT_ROUNDS);
      console.log('- New password hash:', hashedMerchantPassword);
      
      await merchant.update({ password: hashedMerchantPassword });
      console.log('Merchant password reset successfully');

      // Verify the password
      const merchantPasswordValid = await bcryptjs.compare(merchantPassword, hashedMerchantPassword);
      console.log('Merchant password verification:', merchantPasswordValid);
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