const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const merchantRoutes = require('./routes/merchants');
const storeRoutes = require('./routes/stores');
const qrCodeRoutes = require('./routes/qrCodes');
const checkinRoutes = require('./routes/checkins');
const campaignRoutes = require('./routes/campaign');
const adminUserRoutes = require('./routes/admin/users');
const adminMerchantRoutes = require('./routes/admin/merchants');
const adminStoreRoutes = require('./routes/admin/stores');
const adminAnalyticsRoutes = require('./routes/admin/analytics');
const adminSettingsRoutes = require('./routes/admin/settings');
const adminQRCodeRoutes = require('./routes/admin/qrCodes');
const adminCampaignRoutes = require('./routes/admin/campaigns');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Base routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/campaigns', campaignRoutes);

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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error' });
});

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection successful');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database sync successful');
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

module.exports = app; 