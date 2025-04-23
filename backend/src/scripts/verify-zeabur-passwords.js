const bcryptjs = require('bcryptjs');
require('dotenv').config();

async function verifyZeaburPasswords() {
  try {
    console.log('Verifying Zeabur database passwords...\n');

    const users = [
      {
        username: 'testadmin',
        id: 2,
        passwordHash: '$2a$10$3tPp3vPoNQJ4hO58Nj8khOWWSBGAkqomGlxKZcCGA9iA39TH0V8HK',
        email: 'admin@test.com',
        expectedPassword: 'Admin@123456'
      },
      {
        username: 'testmerchant',
        id: 3,
        passwordHash: '$2a$10$x3g/AVAnNmzdQ4MbJT7NceMvm1.3llkoa7FPnYzRO6dvcvS7Hl5jC',
        email: 'merchant@test.com',
        expectedPassword: 'Merchant@123456'
      },
      {
        username: 'testmerchant2',
        id: 5,
        passwordHash: '$2a$10$4rU1XcLZCjFckg0OWqXy9uWHVeOT1UbltxqSdbdm.I3lZJ2QGs6TK',
        email: 'merchant2@test.com',
        expectedPassword: 'Merchant@123456'
      },
      {
        username: 'testmerchant3',
        id: 7,
        passwordHash: '$2a$10$jy7F/6YJuWtzUqttXwSg/uwIXJpc/3wsvOnTU5WgDP1J8EBclLAra',
        email: 'merchant3@test.com',
        expectedPassword: 'Merchant@123456'
      }
    ];

    for (const user of users) {
      console.log(`\nVerifying ${user.username} (ID: ${user.id}):`);
      console.log('- Email:', user.email);
      console.log('- Stored password hash:', user.passwordHash);
      console.log('- Expected password:', user.expectedPassword);

      // Test with expected password
      const expectedValid = await bcryptjs.compare(user.expectedPassword, user.passwordHash);
      console.log('- Expected password valid:', expectedValid);

      // Test with environment variables
      const envPassword = process.env[`TEST_${user.username.toUpperCase()}_PASSWORD`];
      if (envPassword) {
        const envValid = await bcryptjs.compare(envPassword, user.passwordHash);
        console.log('- Environment password valid:', envValid);
      }

      // Test with other possible passwords
      const testPasswords = [
        'Admin@123456',
        'Merchant@123456',
        'Test@123',
        'testadmin123',
        'testmerchant123'
      ];

      console.log('\nTesting other passwords:');
      for (const password of testPasswords) {
        const valid = await bcryptjs.compare(password, user.passwordHash);
        if (valid) {
          console.log(`- Password "${password}" is valid`);
        }
      }

      // Generate a new hash for comparison
      const newHash = await bcryptjs.hash(user.expectedPassword, 10);
      console.log('\nNew hash for expected password:', newHash);
      console.log('New hash matches stored hash:', newHash === user.passwordHash);
    }

  } catch (error) {
    console.error('Error verifying passwords:', error);
  }
}

verifyZeaburPasswords(); 