const axios = require('axios');

async function testLogin() {
  try {
    console.log('Attempting to login...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'testadmin',
      password: 'Test@123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    console.error('Full error:', error);
  }
}

testLogin(); 