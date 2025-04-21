const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../../services/email');

// 所有路由都需要認證和管理員權限
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      users: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: '獲取用戶列表失敗' });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: '獲取用戶資料失敗' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    
    // Only allow updating certain fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.status = status || user.status;
    
    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: '更新用戶資料失敗' });
  }
});

// Delete user (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    
    await user.update({ status: 'inactive' });
    res.json({ message: '用戶已禁用' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: '刪除用戶失敗' });
  }
});

// 創建新用戶
router.post('/', async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      status: 'active'
    });
    const responseData = user.toJSON();
    delete responseData.password;
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: '創建用戶失敗', error: error.message });
  }
});

// Reset user password (admin only)
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: '密碼重設成功' });
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ error: '重設密碼失敗' });
  }
});

module.exports = router; 