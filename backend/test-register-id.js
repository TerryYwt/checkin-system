const axios = require('axios');
const { expect } = require('chai');

// Test cases for Register ID format validation
const formatTestCases = [
  { id: 'a1234567', valid: true, description: 'Valid format' },
  { id: 'A1234567', valid: false, description: 'Invalid: uppercase letter' },
  { id: 'a123456', valid: false, description: 'Invalid: 6 digits' },
  { id: 'a12345678', valid: false, description: 'Invalid: 8 digits' },
  { id: 'a123!567', valid: false, description: 'Invalid: special character' },
  { id: '', valid: false, description: 'Invalid: empty string' },
  { id: '1a234567', valid: false, description: 'Invalid: number first' }
];

// Test Register ID format validation
async function testFormatValidation() {
  console.log('\nTesting Register ID format validation:');
  for (const testCase of formatTestCases) {
    try {
      const response = await axios.post('http://localhost:3000/api/verify-qrcode', {
        registerId: testCase.id
      });
      
      if (!testCase.valid) {
        console.error(`❌ ${testCase.description}: Expected failure but got success`);
      } else {
        console.log(`✅ ${testCase.description}: Passed`);
      }
    } catch (error) {
      if (testCase.valid) {
        console.error(`❌ ${testCase.description}: Expected success but got failure`);
      } else {
        console.log(`✅ ${testCase.description}: Passed`);
      }
    }
  }
}

// Test Register ID usage
async function testUsageValidation() {
  console.log('\nTesting Register ID usage:');
  
  // Get a valid coupon
  const validCoupons = await axios.get('http://localhost:3000/api/valid-coupons');
  const testCoupon = validCoupons.data[0];
  
  // Test using valid coupon
  try {
    const response = await axios.post('http://localhost:3000/api/verify-qrcode', {
      registerId: testCoupon
    });
    console.log('✅ Using valid coupon: Passed');
  } catch (error) {
    console.error('❌ Using valid coupon: Failed');
  }
  
  // Test using same coupon again
  try {
    await axios.post('http://localhost:3000/api/verify-qrcode', {
      registerId: testCoupon
    });
    console.error('❌ Using used coupon: Expected failure but got success');
  } catch (error) {
    console.log('✅ Using used coupon: Passed');
  }
  
  // Test using invalid coupon
  try {
    await axios.post('http://localhost:3000/api/verify-qrcode', {
      registerId: 'x9999999'
    });
    console.error('❌ Using invalid coupon: Expected failure but got success');
  } catch (error) {
    console.log('✅ Using invalid coupon: Passed');
  }
}

// Run all tests
async function runTests() {
  try {
    await testFormatValidation();
    await testUsageValidation();
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests(); 