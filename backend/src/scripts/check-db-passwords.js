const { User } = require('../models');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function checkPasswords() {
  try {
    console.log('Checking stored passwords in database...\n');

    // Check admin user
    const admin = await User.findOne({
      where: { username: 'testadmin' },
      attributes: { include: ['password'] }
    });

    if (admin) {
      console.log('Admin user found:');
      console.log('- Username:', admin.username);
      console.log('- Role:', admin.role);
      console.log('- Status:', admin.status);
      console.log('- Stored password hash:', admin.password);
      
      // Test with both possible passwords
      const adminPassword1 = process.env.TEST_ADMIN_PASSWORD || 'Admin@123456';
      const adminPassword2 = 'Test@123';  // Default password from server initialization
      
      const valid1 = await bcryptjs.compare(adminPassword1, admin.password);
      const valid2 = await bcryptjs.compare(adminPassword2, admin.password);
      
      console.log('\nPassword verification:');
      console.log(`- Password "${adminPassword1}" valid:`, valid1);
      console.log(`- Password "${adminPassword2}" valid:`, valid2);
    } else {
      console.log('Admin user not found');
    }

    console.log('\n----------------------------------------\n');

    // Check merchant user
    const merchant = await User.findOne({
      where: { username: 'testmerchant' },
      attributes: { include: ['password'] }
    });

    if (merchant) {
      console.log('Merchant user found:');
      console.log('- Username:', merchant.username);
      console.log('- Role:', merchant.role);
      console.log('- Status:', merchant.status);
      console.log('- Stored password hash:', merchant.password);
      
      // Test with both possible passwords
      const merchantPassword1 = process.env.TEST_MERCHANT_PASSWORD || 'Merchant@123456';
      const merchantPassword2 = 'Test@123';  // Default password from server initialization
      
      const valid1 = await bcryptjs.compare(merchantPassword1, merchant.password);
      const valid2 = await bcryptjs.compare(merchantPassword2, merchant.password);
      
      console.log('\nPassword verification:');
      console.log(`- Password "${merchantPassword1}" valid:`, valid1);
      console.log(`- Password "${merchantPassword2}" valid:`, valid2);
    } else {
      console.log('Merchant user not found');
    }

  } catch (error) {
    console.error('Error checking passwords:', error);
  }
}

checkPasswords(); 