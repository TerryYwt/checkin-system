const jwt = require('jsonwebtoken')
const { User, Merchant } = require('../models')

// 驗證 JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '未提供認證令牌' })
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: '無效的認證令牌' })
    }

    try {
      const user = await User.findByPk(decoded.id)
      if (!user) {
        return res.status(403).json({ error: '用戶不存在' })
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: '用戶已被禁用' })
      }

      req.user = user
      next()
    } catch (error) {
      console.error('Error in authentication:', error)
      res.status(500).json({ error: '認證過程出錯' })
    }
  })
}

// 檢查用戶角色
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未認證' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '權限不足' })
    }

    next()
  }
}

// 驗證 refresh token
const authenticateRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body
  
  if (!refreshToken) {
    return res.status(401).json({ message: '未提供 refresh token' })
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'refresh token 已過期' })
    }
    return res.status(403).json({ message: '無效的 refresh token' })
  }
}

// 驗證管理員權限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理員權限' })
  }
  next()
}

// 驗證商戶權限
const requireMerchant = async (req, res, next) => {
  if (req.user.role !== 'merchant') {
    return res.status(403).json({ error: '需要商戶權限' });
  }

  try {
    const merchant = await Merchant.findOne({ where: { userId: req.user.id } });
    
    if (!merchant) {
      return res.status(403).json({ error: '找不到商戶資料' });
    }
    
    req.user.merchant = merchant;
    next();
  } catch (error) {
    console.error('Error in requireMerchant middleware:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
};

module.exports = {
  authenticateToken,
  checkRole,
  authenticateRefreshToken,
  requireAdmin,
  requireMerchant
} 