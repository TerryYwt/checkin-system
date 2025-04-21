const express = require('express');
const router = express.Router();
const { Checkin, Store, User, Merchant } = require('../../models');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// Get overall analytics
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalMerchants = await Merchant.count();
    const totalStores = await Store.count();
    const totalCheckins = await Checkin.count();
    
    res.json({
      totalUsers,
      totalMerchants,
      totalStores,
      totalCheckins
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ error: 'Failed to fetch overview analytics' });
  }
});

// Get checkin statistics
router.get('/checkins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.checkin_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const checkinsByStore = await Checkin.findAll({
      where: whereClause,
      include: [{
        model: Store,
        attributes: ['id', 'name']
      }],
      group: ['Store.id'],
      attributes: [
        'Store.id',
        'Store.name',
        [sequelize.fn('COUNT', sequelize.col('Checkin.id')), 'checkinCount']
      ]
    });
    
    const checkinsByDate = await Checkin.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('checkin_time')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('checkin_time'))],
      order: [[sequelize.fn('DATE', sequelize.col('checkin_time')), 'ASC']]
    });
    
    res.json({
      byStore: checkinsByStore,
      byDate: checkinsByDate
    });
  } catch (error) {
    console.error('Error fetching checkin statistics:', error);
    res.status(500).json({ error: 'Failed to fetch checkin statistics' });
  }
});

// Get user growth statistics
router.get('/user-growth', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const userGrowth = await User.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });
    
    res.json(userGrowth);
  } catch (error) {
    console.error('Error fetching user growth statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user growth statistics' });
  }
});

// Get store performance rankings
router.get('/store-rankings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period } = req.query;
    const whereClause = {};
    
    if (period) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      whereClause.checkin_time = {
        [Op.gte]: startDate
      };
    }
    
    const storeRankings = await Checkin.findAll({
      where: whereClause,
      include: [{
        model: Store,
        attributes: ['id', 'name']
      }],
      group: ['Store.id'],
      attributes: [
        'Store.id',
        'Store.name',
        [sequelize.fn('COUNT', sequelize.col('Checkin.id')), 'checkinCount']
      ],
      order: [[sequelize.fn('COUNT', sequelize.col('Checkin.id')), 'DESC']],
      limit: 10
    });
    
    res.json(storeRankings);
  } catch (error) {
    console.error('Error fetching store rankings:', error);
    res.status(500).json({ error: 'Failed to fetch store rankings' });
  }
});

module.exports = router; 