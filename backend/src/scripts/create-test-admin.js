const bcryptjs = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { admin: testAdmin } = require('../config/test-accounts');

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    const hashedPassword = await bcryptjs.hash(process.env.TEST_ADMIN_PASSWORD, 10);

    const user = await prisma.user.create({
      data: {
        username: testAdmin.username,
        password: hashedPassword,
        email: testAdmin.email,
        role: testAdmin.role
      }
    });

    console.log('Created test admin user:', user);

  } catch (error) {
    console.error('Error creating test admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin(); 