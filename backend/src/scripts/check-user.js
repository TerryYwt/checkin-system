require('dotenv').config();
const { sequelize } = require('../config/sequelize');
const { User } = require('../models');
const bcryptjs = require('bcryptjs');

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    const user = await User.findOne({
      where: { username: 'testadmin' },
      attributes: { include: ['password'] }
    });

    if (!user) {
      console.log('Test user not found');
      return;
    }

    console.log('Test user found:', {
      username: user.username,
      role: user.role,
      status: user.status
    });

    // Verify password
    const isValid = await bcryptjs.compare('Test@123', user.password);
    console.log('Password verification:', isValid ? 'Valid' : 'Invalid');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser(); 