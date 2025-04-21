const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get users list (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: '獲取用戶資料失敗' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    
    // Only allow updating certain fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    
    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: '更新用戶資料失敗' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: '用戶名已存在' });
    }
    
    const user = await User.create({
      username,
      password,
      name,
      email,
      phone,
      role: 'user',
      isActive: true
    });
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: '創建用戶失敗' });
  }
});

module.exports = router; 