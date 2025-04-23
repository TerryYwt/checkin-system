const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { merchant: testMerchant } = require('../config/test-accounts');

const prisma = new PrismaClient();

async function createTestMerchant() {
  try {
    const hashedPassword = await bcrypt.hash(process.env.TEST_MERCHANT_PASSWORD, 10);

    const user = await prisma.user.create({
      data: {
        username: testMerchant.username,
        password: hashedPassword,
        email: testMerchant.email,
        role: testMerchant.role
      }
    });

    console.log('Created test merchant user:', user);

    const merchant = await prisma.merchant.create({
      data: {
        userId: user.id,
        businessName: '測試商家',
        email: testMerchant.email
      }
    });

    console.log('Created test merchant:', merchant);

    const store = await prisma.store.create({
      data: {
        merchantId: merchant.id,
        name: '測試商店'
      }
    });

    console.log('Created test store:', store);

  } catch (error) {
    console.error('Error creating test merchant:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestMerchant();