const express = require('express');
const router = express.Router();
const { QRCode, Store, User, Merchant } = require('../../models');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { Op } = require('sequelize');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all QR codes with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, store_id, type, status, created_by } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (store_id) {
      where.store_id = store_id;
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (created_by) {
      where.created_by = created_by;
    }

    const { count, rows } = await QRCode.findAndCountAll({
      where,
      include: [
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
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ],
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page),
      qrcodes: rows
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new QR code
router.post('/', async (req, res) => {
  try {
    const { store_id, type, content, description, expires_at } = req.body;

    // Check if store exists
    const store = await Store.findByPk(store_id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const qrcode = await QRCode.create({
      store_id,
      type,
      content,
      description,
      expires_at,
      created_by: req.user.id,
      status: 'active',
      usage_count: 0
    });

    // Fetch complete data
    const completeData = await QRCode.findOne({
      where: { id: qrcode.id },
      include: [
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
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.status(201).json(completeData);
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update QR code
router.put('/:id', async (req, res) => {
  try {
    const { type, content, description, expires_at, status } = req.body;
    const qrcode = await QRCode.findByPk(req.params.id);

    if (!qrcode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    await qrcode.update({
      type,
      content,
      description,
      expires_at,
      status
    });

    // Fetch updated data
    const updatedQRCode = await QRCode.findOne({
      where: { id: qrcode.id },
      include: [
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
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.json(updatedQRCode);
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete QR code
router.delete('/:id', async (req, res) => {
  try {
    const qrcode = await QRCode.findByPk(req.params.id);

    if (!qrcode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    await qrcode.destroy();
    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single QR code
router.get('/:id', async (req, res) => {
  try {
    const qrcode = await QRCode.findOne({
      where: { id: req.params.id },
      include: [
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
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!qrcode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.json(qrcode);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 