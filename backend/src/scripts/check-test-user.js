require('dotenv').config();
const { User } = require('../models');

async function checkTestUser() {
  try {
    const testUser = await User.findOne({
      where: { username: 'testadmin' }
    });

    if (testUser) {
      console.log('Test user exists:', {
        id: testUser.id,
        username: testUser.username,
        role: testUser.role,
        status: testUser.status
      });
    } else {
      console.log('Test user does not exist');
    }
  } catch (error) {
    console.error('Error checking test user:', error);
  }
}

checkTestUser(); 