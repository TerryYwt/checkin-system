const { User } = require('../models');
const bcryptjs = require('bcryptjs');

async function resetPassword() {
  try {
    // Find the merchant user
    const user = await User.findOne({
      where: { username: 'testmerchant2' }
    });
    
    if (!user) {
      console.log('User testmerchant2 not found');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Set a new password
    const newPassword = 'Test@123456';
    user.password = newPassword;
    await user.save();
    
    console.log('Password reset successful');
    console.log('Login credentials:');
    console.log('Username: testmerchant2');
    console.log('Password:', newPassword);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

resetPassword(); 