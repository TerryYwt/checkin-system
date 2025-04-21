const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const merchantRoutes = require('./routes/merchants');
const storeRoutes = require('./routes/stores');
const qrCodeRoutes = require('./routes/qrCodes');
const checkinRoutes = require('./routes/checkins');
const adminUserRoutes = require('./routes/admin/users');
const adminMerchantRoutes = require('./routes/admin/merchants');
const adminStoreRoutes = require('./routes/admin/stores');
const adminAnalyticsRoutes = require('./routes/admin/analytics');
const adminSettingsRoutes = require('./routes/admin/settings');
const adminQRCodeRoutes = require('./routes/admin/qrCodes');
const adminCampaignRoutes = require('./routes/admin/campaigns');
const analyticsRoutes = require('./routes/analytics');
const mainRoutes = require('./routes');

const sequelize = require('./config/sequelize');
const { User } = require('./models');

// Load environment variables
dotenv.config();

// Initialize database and create test user
const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful.');
    
    // Only sync in development, and only if FORCE_SYNC env var is set
    if (process.env.NODE_ENV === 'development' && process.env.FORCE_SYNC === 'true') {
      await sequelize.sync();
      console.log('Database synchronized in development mode');
      
      // Create test user only in development
      try {
        const adminUser = await User.findOne({ where: { username: 'testadmin' } });
        
        if (!adminUser) {
          await User.create({
            username: 'testadmin',
            password: 'Test@123',
            role: 'admin',
            email: 'admin@test.com',
            status: 'active'
          });
          console.log('Test admin user created');
        } else {
          console.log('Test admin user already exists');
        }
      } catch (userError) {
        console.error('Error during user operations:', userError);
        // Don't throw here, just log the error
        console.log('Continuing server startup despite user creation error');
      }
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Base routes
app.use('/api', mainRoutes);

// Admin routes
const adminRouter = express.Router();
adminRouter.use('/users', adminUserRoutes);
adminRouter.use('/merchants', adminMerchantRoutes);
adminRouter.use('/stores', adminStoreRoutes);
adminRouter.use('/analytics', analyticsRoutes);
adminRouter.use('/settings', adminSettingsRoutes);
adminRouter.use('/qrcodes', adminQRCodeRoutes);
adminRouter.use('/campaigns', adminCampaignRoutes);

// Mount admin router
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error' });
});

// Initialize database and start server
const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.ZEABUR_DB_HOST || process.env.DB_HOST || 'localhost'}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
});

module.exports = app; 