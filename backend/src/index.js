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

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Checkin System API is running',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

// Base routes
app.use('/api', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/checkins', checkinRoutes);

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
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    db_connected: sequelize.authenticate().then(() => true).catch(() => false)
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error' });
});

// Initialize database and start server
const PORT = process.env.PORT || 3000;

let server;

// Add this function to check database configuration
function logDatabaseConfig() {
  console.log('Database Configuration:');
  console.log(`DB_HOST: ${process.env.DB_HOST || process.env.ZEABUR_DB_HOST || 'localhost'}`);
  console.log(`DB_PORT: ${process.env.DB_PORT || process.env.ZEABUR_DB_PORT || '3306'}`);
  console.log(`DB_NAME: ${process.env.DB_NAME || process.env.ZEABUR_DB_NAME || 'checkin_system'}`);
  console.log(`DB_USER: ${process.env.DB_USER || process.env.ZEABUR_DB_USER || 'root'}`);
  console.log(`DB_PASS: ${process.env.DB_PASS ? '[PROVIDED]' : '[NOT PROVIDED]'}`);
}

initializeDatabase().then(() => {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.ZEABUR_DB_HOST || process.env.DB_HOST || 'localhost'}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  function gracefulShutdown() {
    console.log('Received shutdown signal, closing connections...');
    
    // Close the HTTP server
    server.close(() => {
      console.log('HTTP server closed');
      
      // Close database connection
      sequelize.close().then(() => {
        console.log('Database connections closed');
        console.log('Shutdown complete');
        process.exit(0);
      }).catch(err => {
        console.error('Error closing database connections:', err);
        process.exit(1);
      });
    });
    
    // If server doesn't close in 10 seconds, force shutdown
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
}).catch(error => {
  console.error('Failed to start server:', error);
  
  // Log the database configuration for debugging
  logDatabaseConfig();
  
  // Start the server anyway to serve a maintenance page or API error response
  if (process.env.START_WITHOUT_DB === 'true') {
    console.log('Starting server without database connection...');
    
    // Replace all database-dependent routes with error handlers
    app.use('/api', (req, res) => {
      res.status(503).json({
        error: 'Database Unavailable',
        message: 'The database is currently unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      });
    });
    
    // Start the server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in maintenance mode on port ${PORT}`);
    });
  } else {
    process.exit(1);
  }
});

module.exports = app; 