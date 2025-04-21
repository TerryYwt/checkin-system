const sequelize = require('../config/sequelize');

// Import model factories
const UserFactory = require('./User');
const StoreFactory = require('./Store');
const CampaignFactory = require('./Campaign');
const QRCodeFactory = require('./QRCode');
const CheckinFactory = require('./Checkin');
const SettingFactory = require('./Setting');
const MerchantFactory = require('./Merchant');

// Initialize models
const User = UserFactory(sequelize);
const Store = StoreFactory(sequelize);
const Campaign = CampaignFactory(sequelize);
const QRCode = QRCodeFactory(sequelize);
const Checkin = CheckinFactory(sequelize);
const Setting = SettingFactory(sequelize);
const Merchant = MerchantFactory(sequelize);

// Initialize associations
Object.values({
  User,
  Store,
  Campaign,
  QRCode,
  Checkin,
  Setting,
  Merchant
}).forEach((model) => {
  if (model.associate) {
    model.associate({
      User,
      Store,
      Campaign,
      QRCode,
      Checkin,
      Setting,
      Merchant
    });
  }
});

// Export models and sequelize instance
module.exports = {
  User,
  Store,
  Campaign,
  QRCode,
  Checkin,
  Setting,
  Merchant,
  sequelize
}; 