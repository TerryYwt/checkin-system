const express = require('express');
const router = express.Router();
const { Checkin, Store, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Get checkins list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const checkins = await Checkin.findAll({
      include: [
        {
          model: Store,
          attributes: ['id', 'name']
        },
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(checkins);
  } catch (error) {
    console.error('Error fetching checkins:', error);
    res.status(500).json({ error: 'Failed to fetch checkins' });
  }
});

// Get checkin by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const checkin = await Checkin.findByPk(req.params.id, {
      include: [
        {
          model: Store,
          attributes: ['id', 'name']
        },
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!checkin) {
      return res.status(404).json({ error: 'Checkin not found' });
    }
    
    res.json(checkin);
  } catch (error) {
    console.error('Error fetching checkin:', error);
    res.status(500).json({ error: 'Failed to fetch checkin' });
  }
});

// Create new checkin
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { storeId, qrCodeId } = req.body;
    const userId = req.user.id;
    
    const checkin = await Checkin.create({
      userId,
      storeId,
      qrCodeId,
      checkinTime: new Date()
    });
    
    res.status(201).json(checkin);
  } catch (error) {
    console.error('Error creating checkin:', error);
    res.status(500).json({ error: 'Failed to create checkin' });
  }
});

module.exports = router; 