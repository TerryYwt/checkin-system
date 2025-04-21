const express = require('express');
const router = express.Router();
const { User, Merchant, Store } = require('../../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { sendWelcomeEmail } = require('../../services/email');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all merchants with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      role: 'merchant'
    };

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { '$merchant.businessName$': { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Merchant,
          as: 'merchant',
          include: [
            {
              model: Store,
              as: 'stores'
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
      merchants: rows
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new merchant
router.post('/', async (req, res) => {
  try {
    const { username, password, email, businessName, contactPerson, phone } = req.body;

    // Create user with merchant role
    const user = await User.create({
      username,
      password,
      email,
      role: 'merchant'
    });

    // Create merchant profile
    const merchant = await Merchant.create({
      userId: user.id,
      businessName,
      contactPerson,
      phone
    });

    // Fetch the complete merchant data with associations
    const completeData = await User.findOne({
      where: { id: user.id },
      include: [
        {
          model: Merchant,
          as: 'merchant'
        }
      ]
    });

    res.status(201).json(completeData);
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get merchant by ID
router.get('/:id', async (req, res) => {
  try {
    const merchant = await User.findOne({
      where: {
        id: req.params.id,
        role: 'merchant'
      },
      include: [
        {
          model: Merchant,
          as: 'merchant',
          include: [
            {
              model: Store,
              as: 'stores'
            }
          ]
        }
      ]
    });

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    res.json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update merchant
router.put('/:id', async (req, res) => {
  try {
    const { username, email, password, businessName, contactPerson, phone, status } = req.body;
    const userId = req.params.id;

    // Update user data
    const updateData = { username, email, status };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.update(updateData, {
      where: {
        id: userId,
        role: 'merchant'
      }
    });

    // Update merchant data
    await Merchant.update(
      {
        businessName,
        contactPerson,
        phone
      },
      {
        where: { userId }
      }
    );

    // Fetch updated data
    const updatedMerchant = await User.findOne({
      where: {
        id: userId,
        role: 'merchant'
      },
      include: [
        {
          model: Merchant,
          as: 'merchant',
          include: [
            {
              model: Store,
              as: 'stores'
            }
          ]
        }
      ]
    });

    if (!updatedMerchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    res.json(updatedMerchant);
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete merchant
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: {
        id: userId,
        role: 'merchant'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Delete the user (this will cascade delete the merchant and stores)
    await user.destroy();

    res.json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 