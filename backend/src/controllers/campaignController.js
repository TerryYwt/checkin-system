const { Campaign, Store, Merchant, User, QRCode, Checkin } = require('../models')
const { Op } = require('sequelize')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 300 }) // Cache for 5 minutes

const campaignController = {
  // 獲取活動列表
  getCampaigns: async (req, res) => {
    try {
      const cacheKey = `campaigns:${req.user.id}`
      const cachedData = cache.get(cacheKey)

      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData
        })
      }

      const campaigns = await Campaign.findAll({
        include: [{
          model: Store,
          as: 'store',
          include: [{
            model: Merchant,
            as: 'merchant',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }]
          }]
        }],
        order: [['createdAt', 'DESC']]
      })

      cache.set(cacheKey, campaigns)
      
      res.json({
        success: true,
        data: campaigns
      })
    } catch (error) {
      console.error('Error getting campaigns:', error)
      res.status(500).json({
        success: false,
        message: 'Error getting campaigns'
      })
    }
  },

  // 創建新活動
  createCampaign: async (req, res) => {
    try {
      const { merchant_id, name, description, type, start_date, end_date, rules, rewards, target_audience, budget } = req.body

      // Validate merchant exists and user has access
      const merchant = await Merchant.findByPk(merchant_id)
      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' })
      }

      // Validate dates
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ error: 'End date must be after start date' })
      }

      const campaign = await Campaign.create({
        merchant_id,
        name,
        description,
        type,
        start_date,
        end_date,
        rules,
        rewards,
        target_audience,
        budget,
        status: 'draft'
      })

      res.status(201).json(campaign)
    } catch (error) {
      console.error('Error creating campaign:', error)
      res.status(500).json({ error: 'Failed to create campaign' })
    }
  },

  // 更新活動
  updateCampaign: async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body

      const campaign = await Campaign.findByPk(id)
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' })
      }

      // Prevent updating certain fields if campaign is active
      if (campaign.status === 'active') {
        const restrictedFields = ['type', 'start_date', 'end_date']
        for (const field of restrictedFields) {
          if (field in updates) {
            return res.status(400).json({ error: `Cannot update ${field} for active campaign` })
          }
        }
      }

      await campaign.update(updates)
      res.json(campaign)
    } catch (error) {
      console.error('Error updating campaign:', error)
      res.status(500).json({ error: 'Failed to update campaign' })
    }
  },

  // 刪除活動
  deleteCampaign: async (req, res) => {
    try {
      const { id } = req.params
      const campaign = await Campaign.findByPk(id)
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' })
      }

      // Only allow deletion of draft campaigns
      if (campaign.status !== 'draft') {
        return res.status(400).json({ error: 'Can only delete draft campaigns' })
      }

      await campaign.destroy()
      res.json({ message: 'Campaign deleted successfully' })
    } catch (error) {
      console.error('Error deleting campaign:', error)
      res.status(500).json({ error: 'Failed to delete campaign' })
    }
  },

  // 獲取單個活動詳情
  getCampaign: async (req, res) => {
    try {
      const { id } = req.params
      const campaign = await Campaign.findByPk(id, {
        include: [
          {
            model: QRCode,
            as: 'qrcodes',
            attributes: ['id', 'type', 'status', 'scan_count']
          }
        ]
      })
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' })
      }

      res.json(campaign)
    } catch (error) {
      console.error('Error fetching campaign details:', error)
      res.status(500).json({ error: 'Failed to fetch campaign details' })
    }
  },

  // Get all campaigns for a merchant
  async getMerchantCampaigns(req, res) {
    try {
      const { merchant_id } = req.params
      const { status, type, page = 1, limit = 10 } = req.query

      const where = { merchant_id }
      if (status) where.status = status
      if (type) where.type = type

      const campaigns = await Campaign.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']]
      })

      res.json({
        campaigns: campaigns.rows,
        total: campaigns.count,
        page: parseInt(page),
        totalPages: Math.ceil(campaigns.count / limit)
      })
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      res.status(500).json({ error: 'Failed to fetch campaigns' })
    }
  },

  // Get campaign analytics
  async getCampaignAnalytics(req, res) {
    try {
      const { id } = req.params
      const campaign = await Campaign.findByPk(id)

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' })
      }

      // Get QR code scan statistics
      const qrCodes = await QRCode.findAll({
        where: { campaign_id: id },
        attributes: ['id', 'scan_count']
      })

      // Get check-in statistics
      const checkins = await Checkin.findAndCountAll({
        where: { campaign_id: id },
        attributes: ['id', 'created_at']
      })

      // Calculate metrics
      const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scan_count, 0)
      const totalCheckins = checkins.count
      const uniqueUsers = await Checkin.count({
        where: { campaign_id: id },
        distinct: true,
        col: 'user_id'
      })

      const analytics = {
        totalScans,
        totalCheckins,
        uniqueUsers,
        qrCodes: qrCodes.length,
        checkinsByDate: checkins.rows.reduce((acc, checkin) => {
          const date = checkin.created_at.toISOString().split('T')[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})
      }

      // Update campaign metrics
      await campaign.update({ metrics: analytics })

      res.json(analytics)
    } catch (error) {
      console.error('Error fetching campaign analytics:', error)
      res.status(500).json({ error: 'Failed to fetch campaign analytics' })
    }
  },

  // Update campaign status
  async updateCampaignStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body

      const campaign = await Campaign.findByPk(id)
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' })
      }

      // Validate status transition
      const validTransitions = {
        draft: ['active', 'cancelled'],
        active: ['paused', 'completed', 'cancelled'],
        paused: ['active', 'completed', 'cancelled'],
        completed: [],
        cancelled: []
      }

      if (!validTransitions[campaign.status].includes(status)) {
        return res.status(400).json({ error: 'Invalid status transition' })
      }

      // Additional validation for active status
      if (status === 'active') {
        if (new Date() > new Date(campaign.end_date)) {
          return res.status(400).json({ error: 'Cannot activate expired campaign' })
        }
      }

      await campaign.update({ status })
      res.json(campaign)
    } catch (error) {
      console.error('Error updating campaign status:', error)
      res.status(500).json({ error: 'Failed to update campaign status' })
    }
  }
}

module.exports = campaignController 