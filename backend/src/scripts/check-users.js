const { User } = require('../models');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('Checking test admin user...');
    const admin = await User.findOne({ 
      where: { username: 'testadmin' },
      attributes: { include: ['password'] }
    });
    
    if (admin) {
      console.log('Admin user found:', {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        status: admin.status
      });
      
      const adminPasswordValid = await bcryptjs.compare(
        process.env.TEST_ADMIN_PASSWORD || 'Admin@123456',
        admin.password
      );
      console.log('Admin password valid:', adminPasswordValid);
    } else {
      console.log('Admin user not found');
    }

    console.log('\nChecking test merchant user...');
    const merchant = await User.findOne({ 
      where: { username: 'testmerchant' },
      attributes: { include: ['password'] }
    });
    
    if (merchant) {
      console.log('Merchant user found:', {
        id: merchant.id,
        username: merchant.username,
        email: merchant.email,
        role: merchant.role,
        status: merchant.status
      });
      
      const merchantPasswordValid = await bcryptjs.compare(
        process.env.TEST_MERCHANT_PASSWORD || 'Merchant@123456',
        merchant.password
      );
      console.log('Merchant password valid:', merchantPasswordValid);
    } else {
      console.log('Merchant user not found');
    }

  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers(); 