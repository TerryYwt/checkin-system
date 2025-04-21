const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { authenticateToken, authenticateRefreshToken, checkRole } = require('../middleware/auth')
const authController = require('../controllers/authController')

// 註冊
router.post('/register', authController.register)

// 登錄
router.post('/login', authController.login)

// 獲取當前用戶信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(404).json({ error: '用戶不存在' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: '獲取用戶資料失敗' })
  }
})

// Admin 專用路由
router.get('/admin/users', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'refreshToken'] }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: '獲取用戶列表失敗', error: error.message })
  }
})

// 刷新 token
router.post('/refresh', authenticateRefreshToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    if (!user || user.refreshToken !== req.body.refreshToken) {
      return res.status(403).json({ message: '無效的 refresh token' })
    }
    
    // 生成新的 access token
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )
    
    res.json({ token: accessToken })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({ message: '刷新 token 失敗' })
  }
})

// 登出
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (user) {
      await user.update({ refreshToken: null })
    }
    res.json({ message: '登出成功' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: '登出失敗' })
  }
})

// 重置密碼
router.post('/reset-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body
    
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(404).json({ message: '用戶不存在' })
    }
    
    const validPassword = await bcrypt.compare(oldPassword, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: '舊密碼錯誤' })
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await user.update({ password: hashedPassword })
    
    res.json({ message: '密碼重置成功' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: '密碼重置失敗' })
  }
})

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)

    if (!user) {
      return res.status(404).json({ error: '用戶不存在' })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: '當前密碼不正確' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: '密碼修改成功' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: '密碼修改失敗' })
  }
})

module.exports = router 