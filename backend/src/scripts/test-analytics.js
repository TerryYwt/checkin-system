require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:3000/api/admin/analytics';
const JWT_SECRET = process.env.JWT_SECRET;

// Create a test admin token with the correct user ID
const token = jwt.sign(
  { id: 2, username: 'testadmin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const headers = {
  Authorization: `Bearer ${token}`
};

async function testAnalytics() {
  try {
    console.log('Testing Analytics API...\n');

    // Test Dashboard Stats
    console.log('1. Testing Dashboard Stats:');
    const statsResponse = await axios.get(`${API_URL}/dashboard`, { headers });
    console.log('Response:', statsResponse.data);
    console.log('Status:', statsResponse.status);
    console.log('-------------------\n');

    // Test Trend Data
    console.log('2. Testing Trend Data:');
    const trendResponse = await axios.get(`${API_URL}/trend?timeRange=week`, { headers });
    console.log('Response:', trendResponse.data);
    console.log('Status:', trendResponse.status);
    console.log('-------------------\n');

    // Test Distribution Data
    console.log('3. Testing Distribution Data:');
    const distributionResponse = await axios.get(`${API_URL}/distribution`, { headers });
    console.log('Response:', distributionResponse.data);
    console.log('Status:', distributionResponse.status);
    console.log('-------------------\n');

    // Test Recent Activities
    console.log('4. Testing Recent Activities:');
    const activitiesResponse = await axios.get(`${API_URL}/recent-activities`, { headers });
    console.log('Response:', activitiesResponse.data);
    console.log('Status:', activitiesResponse.status);
    console.log('-------------------\n');

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error testing analytics API:', error.response ? error.response.data : error.message);
  }
}

testAnalytics(); 