require('dotenv').config();
const sequelize = require('../config/sequelize');
const { User } = require('../models');
const bcryptjs = require('bcryptjs');

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    const user = await User.findOne({
      where: { username: 'testmerchant2' },
      attributes: { include: ['password'] }
    });

    if (!user) {
      console.log('Test merchant not found');
      return;
    }

    console.log('Test merchant found:', {
      username: user.username,
      role: user.role,
      status: user.status,
      password: user.password // Show the hashed password
    });

    // Verify password
    const testPassword = 'Test@123456';
    const isValid = await bcryptjs.compare(testPassword, user.password);
    console.log('Password verification:', isValid ? 'Valid' : 'Invalid');
    console.log('Test password used:', testPassword);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser(); 