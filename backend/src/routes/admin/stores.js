const express = require('express');
const router = express.Router();
const { Store, Merchant, User } = require('../../models');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { Op } = require('sequelize');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all stores with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, merchantId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    const { count, rows } = await Store.findAndCountAll({
      where,
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
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      stores: rows
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new store
router.post('/', async (req, res) => {
  try {
    const { merchantId, name, address, phone } = req.body;

    // Check if merchant exists
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    const store = await Store.create({
      merchantId,
      name,
      address,
      phone
    });

    // Fetch the complete store data with associations
    const completeData = await Store.findOne({
      where: { id: store.id },
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
    });

    res.status(201).json(completeData);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { id: req.params.id },
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
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update store
router.put('/:id', async (req, res) => {
  try {
    const { name, address, phone, status } = req.body;
    const storeId = req.params.id;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await store.update({
      name,
      address,
      phone,
      status
    });

    // Fetch updated data
    const updatedStore = await Store.findOne({
      where: { id: storeId },
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
    });

    res.json(updatedStore);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete store
router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await store.destroy();
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 