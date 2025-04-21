const express = require('express');
const router = express.Router();
const { QRCode, Store } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get QR codes list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const qrCodes = await QRCode.findAll({
      include: [{
        model: Store,
        attributes: ['id', 'name']
      }]
    });
    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
});

// Get QR code by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findByPk(req.params.id, {
      include: [{
        model: Store,
        attributes: ['id', 'name']
      }]
    });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Create new QR code
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { storeId, type, description } = req.body;
    
    const qrCode = await QRCode.create({
      storeId,
      type,
      description,
      status: 'active'
    });
    
    res.status(201).json(qrCode);
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: 'Failed to create QR code' });
  }
});

// Update QR code
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { type, description, status } = req.body;
    const qrCode = await QRCode.findByPk(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    qrCode.type = type || qrCode.type;
    qrCode.description = description || qrCode.description;
    qrCode.status = status || qrCode.status;
    
    await qrCode.save();
    
    res.json(qrCode);
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ error: 'Failed to update QR code' });
  }
});

// Delete QR code
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findByPk(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    await qrCode.destroy();
    
    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Failed to delete QR code' });
  }
});

module.exports = router; 