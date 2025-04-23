const { User } = require('../models');
require('dotenv').config();

async function deleteTestUsers() {
  try {
    console.log('Deleting test users...');
    
    // Delete admin user
    const adminDeleted = await User.destroy({
      where: { username: 'testadmin' }
    });
    console.log('Admin user deleted:', adminDeleted > 0);
    
    // Delete merchant user
    const merchantDeleted = await User.destroy({
      where: { username: 'testmerchant' }
    });
    console.log('Merchant user deleted:', merchantDeleted > 0);
    
    console.log('Test users deleted successfully');
  } catch (error) {
    console.error('Error deleting test users:', error);
  }
}

deleteTestUsers(); 