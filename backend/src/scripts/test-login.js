const axios = require('axios');
require('dotenv').config();

async function testLogin() {
  const baseURL = 'http://localhost:3000/api';
  
  // Test accounts to verify
  const accounts = [
    {
      username: 'testadmin',
      password: process.env.TEST_ADMIN_PASSWORD || 'testadmin123',
      role: 'admin'
    },
    {
      username: 'testmerchant',
      password: process.env.TEST_MERCHANT_PASSWORD || 'testmerchant123',
      role: 'merchant'
    }
  ];

  console.log('Environment variables:');
  console.log('TEST_ADMIN_PASSWORD:', process.env.TEST_ADMIN_PASSWORD);
  console.log('TEST_MERCHANT_PASSWORD:', process.env.TEST_MERCHANT_PASSWORD);

  for (const account of accounts) {
    try {
      console.log(`\nTesting login for ${account.role} account (${account.username})...`);
      console.log('Using password:', account.password);
      
      const response = await axios.post(`${baseURL}/auth/login`, {
        username: account.username,
        password: account.password
      });

      console.log('Login successful!');
      console.log('Response:', {
        userId: response.data.user.id,
        username: response.data.user.username,
        role: response.data.user.role,
        token: response.data.token ? '**present**' : '**missing**'
      });
    } catch (error) {
      console.error('Login failed!');
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
  }
}

testLogin().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 