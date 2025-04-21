const express = require('express');
const router = express.Router();
const { Checkin, User, Store, Campaign, Merchant } = require('../../models');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { Op } = require('sequelize');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all checkins with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, storeId, campaignId, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) {
      where.userId = userId;
    }
    if (storeId) {
      where.storeId = storeId;
    }
    if (campaignId) {
      where.campaignId = campaignId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate && endDate) {
      where.checkinTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Checkin.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Merchant,
              as: 'merchant',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        },
        {
          model: Campaign,
          as: 'campaign',
          attributes: ['id', 'name', 'type']
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [['checkinTime', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      checkins: rows
    });
  } catch (error) {
    console.error('Error fetching checkins:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new checkin
router.post('/', async (req, res) => {
  try {
    const { userId, storeId, campaignId, pointsEarned, location } = req.body;

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if campaign exists if provided
    if (campaignId) {
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
    }

    const checkin = await Checkin.create({
      userId,
      storeId,
      campaignId,
      pointsEarned: pointsEarned || 0,
      location,
      status: 'valid'
    });

    // Fetch complete data
    const completeData = await Checkin.findOne({
      where: { id: checkin.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Merchant,
              as: 'merchant',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        },
        {
          model: Campaign,
          as: 'campaign',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    res.status(201).json(completeData);
  } catch (error) {
    console.error('Error creating checkin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update checkin
router.put('/:id', async (req, res) => {
  try {
    const { status, pointsEarned } = req.body;
    const checkin = await Checkin.findByPk(req.params.id);

    if (!checkin) {
      return res.status(404).json({ message: 'Checkin not found' });
    }

    await checkin.update({
      status,
      pointsEarned
    });

    // Fetch updated data
    const updatedCheckin = await Checkin.findOne({
      where: { id: checkin.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Merchant,
              as: 'merchant',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        },
        {
          model: Campaign,
          as: 'campaign',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    res.json(updatedCheckin);
  } catch (error) {
    console.error('Error updating checkin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single checkin
router.get('/:id', async (req, res) => {
  try {
    const checkin = await Checkin.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Merchant,
              as: 'merchant',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        },
        {
          model: Campaign,
          as: 'campaign',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    if (!checkin) {
      return res.status(404).json({ message: 'Checkin not found' });
    }

    res.json(checkin);
  } catch (error) {
    console.error('Error fetching checkin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete checkin
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const checkin = await Checkin.findByPk(req.params.id);

    if (!checkin) {
      return res.status(404).json({ message: 'Checkin not found' });
    }

    await checkin.destroy();
    res.json({ message: 'Checkin deleted successfully' });
  } catch (error) {
    console.error('Error deleting checkin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 