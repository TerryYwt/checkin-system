const express = require('express');
const router = express.Router();
const { Store } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Get store list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { isActive: true }
    });
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get store by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

module.exports = router; 