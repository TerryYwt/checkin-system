const axios = require('axios');
require('dotenv').config();

const PROD_API_URL = 'https://checkin-system-api.zeabur.app/api';

async function testLogin() {
  const accounts = [
    {
      username: 'testadmin',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin'
    },
    {
      username: 'testmerchant',
      password: process.env.TEST_MERCHANT_PASSWORD || 'Merchant@123456',
      role: 'merchant'
    }
  ];

  console.log('Testing login in production environment...\n');

  for (const account of accounts) {
    try {
      console.log(`Testing ${account.role} login (${account.username})...`);
      
      const response = await axios.post(`${PROD_API_URL}/auth/login`, {
        username: account.username,
        password: account.password
      });

      console.log('Login successful!');
      console.log('Response:', {
        token: response.data.token ? 'Token received' : 'No token',
        user: {
          id: response.data.user?.id,
          username: response.data.user?.username,
          role: response.data.user?.role,
          status: response.data.user?.status
        }
      });
      console.log('\n----------------------------------------\n');
    } catch (error) {
      console.error(`Login failed for ${account.username}:`);
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      console.log('\n----------------------------------------\n');
    }
  }
}

testLogin(); 