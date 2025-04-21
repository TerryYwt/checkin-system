const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// 生成 JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

const authController = {
  // 註冊新用戶
  register: async (req, res) => {
    try {
      const { username, password, role, storeName, storeAddress, contactPerson, phone, email } = req.body
  
      // 檢查用戶名是否已存在
      const existingUser = await User.findOne({ where: { username } })
      if (existingUser) {
        return res.status(400).json({ message: '用戶名已存在' })
      }
  
      // 創建新用戶
      const user = await User.create({
        username,
        password,
        role,
        storeName,
        storeAddress,
        contactPerson,
        phone,
        email
      })
  
      // 生成 token
      const token = generateToken(user)
  
      res.status(201).json({
        message: '註冊成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          storeName: user.storeName
        }
      })
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: '驗證錯誤',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        })
      }
      res.status(500).json({ message: '註冊失敗', error: error.message })
    }
  },

  // 用戶登入
  login: async (req, res) => {
    try {
      const { username, password } = req.body
      console.log('Login attempt:', { username })
  
      // 查找用戶
      const user = await User.findOne({
        where: { username },
        attributes: { include: ['password'] }
      })
      console.log('User found:', user ? 'Yes' : 'No')
      
      if (!user) {
        return res.status(401).json({ message: '用戶名或密碼錯誤' })
      }
  
      // 檢查用戶是否被禁用
      if (user.status !== 'active') {
        console.log('User status:', user.status)
        return res.status(403).json({ message: '帳號已被禁用' })
      }
  
      // 驗證密碼
      console.log('Comparing password...')
      const isValidPassword = await bcrypt.compare(password, user.password)
      console.log('Password valid:', isValidPassword)
      
      if (!isValidPassword) {
        return res.status(401).json({ message: '用戶名或密碼錯誤' })
      }
  
      // 更新最後登入時間
      await user.update({ last_login: new Date() })
  
      // 生成 token
      const token = generateToken(user)
  
      const userData = user.toJSON()
      delete userData.password
  
      res.json({
        message: '登入成功',
        token,
        user: userData
      })
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: '登入失敗', error: error.message })
    }
  },

  // 獲取當前用戶信息
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
      })
      if (!user) {
        return res.status(404).json({ message: '用戶不存在' })
      }
      res.json(user)
    } catch (error) {
      res.status(500).json({ message: '獲取用戶信息失敗', error: error.message })
    }
  }
}

module.exports = authController 