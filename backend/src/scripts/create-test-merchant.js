const { User, Merchant, Store } = require('../models');
const bcryptjs = require('bcryptjs');
const testAccounts = require('../config/test-accounts');

async function createTestMerchant() {
  try {
    // Create user account
    const hashedPassword = await bcryptjs.hash('testpassword', 10);
    const user = await User.create({
      username: 'testmerchant3',
      email: 'merchant3@test.com',
      password: hashedPassword,
      role: 'merchant',
      status: 'active'
    });

    console.log('User created:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Create merchant account
    const merchant = await Merchant.create({
      userId: user.id,
      businessName: '測試商家',
      businessType: '零售',
      contactPerson: '測試聯絡人',
      phone: '0912345678',
      email: 'merchant3@test.com',
      address: '測試地址',
      status: 'active'
    });

    console.log('Merchant created:', {
      id: merchant.id,
      businessName: merchant.businessName,
      businessType: merchant.businessType,
      status: merchant.status
    });

    // Create test store
    const store = await Store.create({
      merchantId: merchant.id,
      name: '測試商店',
      address: '測試商店地址',
      phone: '0222222222',
      description: '這是一個測試商店',
      status: 'active'
    });

    console.log('Store created:', {
      id: store.id,
      name: store.name,
      address: store.address,
      status: store.status
    });

    console.log('\nTest merchant account created successfully!');
    console.log('Login credentials:');
    console.log('Username: testmerchant3');
    console.log('Password: testpassword');
    console.log('Email: merchant3@test.com');

  } catch (error) {
    console.error('Error creating test merchant:', error);
  } finally {
    process.exit();
  }
}

createTestMerchant(); 