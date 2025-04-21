const express = require('express');
const router = express.Router();
const { Merchant, Store } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get merchants list (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const merchants = await Merchant.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Store,
        attributes: ['id', 'name', 'status']
      }]
    });
    res.json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: 'Failed to fetch merchants' });
  }
});

// Get merchant by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const merchant = await Merchant.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Store,
        attributes: ['id', 'name', 'status']
      }]
    });
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    res.json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({ error: 'Failed to fetch merchant' });
  }
});

// Create new merchant (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;
    
    // Check if username already exists
    const existingMerchant = await Merchant.findOne({ where: { username } });
    if (existingMerchant) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const merchant = await Merchant.create({
      username,
      password,
      name,
      email,
      phone,
      status: 'active'
    });
    
    const merchantResponse = merchant.toJSON();
    delete merchantResponse.password;
    
    res.status(201).json(merchantResponse);
  } catch (error) {
    console.error('Error creating merchant:', error);
    res.status(500).json({ error: 'Failed to create merchant' });
  }
});

// Update merchant (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    const merchant = await Merchant.findByPk(req.params.id);
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    merchant.name = name || merchant.name;
    merchant.email = email || merchant.email;
    merchant.phone = phone || merchant.phone;
    merchant.status = status || merchant.status;
    
    await merchant.save();
    
    const merchantResponse = merchant.toJSON();
    delete merchantResponse.password;
    
    res.json(merchantResponse);
  } catch (error) {
    console.error('Error updating merchant:', error);
    res.status(500).json({ error: 'Failed to update merchant' });
  }
});

// Reset merchant password (admin only)
router.post('/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const merchant = await Merchant.findByPk(req.params.id);
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    merchant.password = newPassword;
    await merchant.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting merchant password:', error);
    res.status(500).json({ error: 'Failed to reset merchant password' });
  }
});

module.exports = router; 