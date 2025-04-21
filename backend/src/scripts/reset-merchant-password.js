const { User } = require('../models');
const bcryptjs = require('bcryptjs');
const testAccounts = require('../config/test-accounts');

async function resetPassword() {
  try {
    // Find the merchant user
    const user = await User.findOne({
      where: { username: testAccounts.merchant.username }
    });
    
    if (!user) {
      console.log(`User ${testAccounts.merchant.username} not found`);
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Reset password using bcryptjs
    const hashedPassword = await bcryptjs.hash(process.env.TEST_MERCHANT_PASSWORD, 10);
    await user.update({ password: hashedPassword });
    
    console.log('Password reset successful');
    console.log('Login credentials:');
    console.log(`Username: ${testAccounts.merchant.username}`);
    console.log('Password: (stored in environment variables)');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

resetPassword(); 