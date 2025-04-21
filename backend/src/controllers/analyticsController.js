const { User, Merchant, Store, Checkin } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get all counts in a single query
    const [userCount, merchantCount, storeCount, checkinCount] = await Promise.all([
      User.count(),
      Merchant.count(),
      Store.count(),
      Checkin.count()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalMerchants: merchantCount,
        totalStores: storeCount,
        totalCheckins: checkinCount
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting dashboard statistics'
    });
  }
};

exports.getTrendData = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const endDate = new Date();
    let startDate = new Date();

    // Calculate start date based on time range
    switch (timeRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const checkins = await Checkin.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']]
    });

    res.json({
      success: true,
      data: checkins
    });
  } catch (error) {
    console.error('Error getting trend data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting trend data'
    });
  }
};

exports.getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMerchants,
      totalStores,
      totalCheckins,
      activeCampaigns,
      recentCheckins
    ] = await Promise.all([
      User.count(),
      Merchant.count(),
      Store.count(),
      Checkin.count(),
      // Add Campaign model count when available
      Promise.resolve(0),
      Checkin.findAll({
        include: [
          {
            model: User,
            as: 'checkinUser',
            attributes: ['id', 'username']
          },
          {
            model: Store,
            as: 'checkinStore',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMerchants,
        totalStores,
        totalCheckins,
        activeCampaigns,
        recentCheckins
      }
    });
  } catch (error) {
    console.error('Error getting overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting overview data'
    });
  }
};

exports.getStoreRankings = async (req, res) => {
  try {
    const { type = 'checkins' } = req.query;
    
    const rankings = await Store.findAll({
      attributes: [
        'id',
        'name',
        [fn('COUNT', col('checkins.id')), 'count']
      ],
      include: [{
        model: Checkin,
        as: 'checkins',
        attributes: [],
        required: true
      }],
      group: ['Store.id', 'Store.name'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
      subQuery: false
    });

    // Format the response to match the frontend expectations
    const formattedRankings = rankings.map((store, index) => ({
      rank: index + 1,
      storeName: store.name,
      value: store.getDataValue('count')
    }));

    res.json(formattedRankings);
  } catch (error) {
    console.error('Error getting store rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting store rankings'
    });
  }
};

exports.getDistributionData = async (req, res) => {
  try {
    const [storeDistribution, merchantDistribution] = await Promise.all([
      Store.findAll({
        attributes: [
          'id',
          'name',
          [fn('COUNT', col('checkins.id')), 'checkinCount']
        ],
        include: [{
          model: Checkin,
          as: 'checkins',
          attributes: []
        }],
        group: ['Store.id', 'Store.name'],
        order: [[literal('checkinCount'), 'DESC']]
      }),
      Merchant.findAll({
        attributes: [
          'id',
          'business_name',
          [fn('COUNT', col('stores.checkins.id')), 'checkinCount']
        ],
        include: [{
          model: Store,
          as: 'stores',
          attributes: [],
          include: [{
            model: Checkin,
            as: 'checkins',
            attributes: []
          }]
        }],
        group: ['Merchant.id', 'Merchant.business_name'],
        order: [[literal('checkinCount'), 'DESC']]
      })
    ]);

    // Format the response to match the frontend expectations
    const formattedData = {
      stores: storeDistribution.map(store => ({
        name: store.name,
        value: store.getDataValue('checkinCount')
      })),
      merchants: merchantDistribution.map(merchant => ({
        name: merchant.business_name,
        value: merchant.getDataValue('checkinCount')
      }))
    };

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error getting distribution data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting distribution data'
    });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await Checkin.findAll({
      include: [
        {
          model: User,
          as: 'checkinUser',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Store,
          as: 'checkinStore',
          attributes: ['id', 'name'],
          include: [{
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'business_name']
          }]
        }
      ],
      order: [['checkinTime', 'DESC']],
      limit: 10
    });

    // Format the response to match the frontend expectations
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      time: activity.checkinTime,
      type: 'checkin',
      content: `${activity.checkinUser.username} 在 ${activity.checkinStore.name} 簽到`
    }));

    res.json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recent activities'
    });
  }
}; 