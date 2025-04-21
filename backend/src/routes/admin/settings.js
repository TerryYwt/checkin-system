const express = require('express');
const router = express.Router();
const { Setting, User, Store, Merchant } = require('../../models');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { Op } = require('sequelize');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all settings with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, key, type, storeId, merchantId, updatedBy } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (key) {
      where.key = { [Op.like]: `%${key}%` };
    }
    if (type) {
      where.type = type;
    }
    if (storeId) {
      where.storeId = storeId;
    }
    if (merchantId) {
      where.merchantId = merchantId;
    }
    if (updatedBy) {
      where.updatedBy = updatedBy;
    }

    const { count, rows } = await Setting.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'updater',
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
      ],
      offset,
      limit: parseInt(limit),
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      settings: rows
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new setting
router.post('/', async (req, res) => {
  try {
    const { key, value, type, description, storeId, merchantId } = req.body;

    // Validate required fields
    if (!key || !value || !type) {
      return res.status(400).json({ message: 'Key, value, and type are required' });
    }

    // Validate type
    const validTypes = ['string', 'number', 'boolean', 'json', 'array'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be one of: ' + validTypes.join(', ') });
    }

    // Check if store exists if provided
    if (storeId) {
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
    }

    // Check if merchant exists if provided
    if (merchantId) {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found' });
      }
    }

    const setting = await Setting.create({
      key,
      value,
      type,
      description,
      storeId,
      merchantId,
      updatedBy: req.user.id
    });

    // Fetch complete data
    const completeData = await Setting.findOne({
      where: { id: setting.id },
      include: [
        {
          model: User,
          as: 'updater',
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
    });

    res.status(201).json(completeData);
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update setting
router.put('/:id', async (req, res) => {
  try {
    const { value, type, description, storeId, merchantId } = req.body;
    const setting = await Setting.findByPk(req.params.id);

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    // Validate type if provided
    if (type) {
      const validTypes = ['string', 'number', 'boolean', 'json', 'array'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Must be one of: ' + validTypes.join(', ') });
      }
    }

    // Check if store exists if provided
    if (storeId) {
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
    }

    // Check if merchant exists if provided
    if (merchantId) {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found' });
      }
    }

    await setting.update({
      value,
      type,
      description,
      storeId,
      merchantId,
      updatedBy: req.user.id
    });

    // Fetch updated data
    const updatedSetting = await Setting.findOne({
      where: { id: setting.id },
      include: [
        {
          model: User,
          as: 'updater',
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
    });

    res.json(updatedSetting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete setting
router.delete('/:id', async (req, res) => {
  try {
    const setting = await Setting.findByPk(req.params.id);

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await setting.destroy();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single setting
router.get('/:id', async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'updater',
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
    });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 