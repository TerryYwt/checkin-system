const express = require('express')
const router = express.Router()
const { Campaign, Store, Merchant, User, Checkin } = require('../../models')
const { authenticateToken, requireAdmin } = require('../../middleware/auth')
const { Op } = require('sequelize')

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all campaigns with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = '', status, store_id, merchant_id } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    }
    if (type) {
      where.type = type
    }
    if (status) {
      where.status = status
    }
    if (store_id) {
      where.store_id = store_id
    }

    const include = [
      {
        model: Store,
        as: 'store',
        include: [
          {
            model: Merchant,
            as: 'merchant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
              }
            ]
          }
        ]
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email']
      }
    ]

    if (merchant_id) {
      include[0].where = { merchant_id }
    }

    const { count, rows } = await Campaign.findAndCountAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    })

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      campaigns: rows
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create new campaign
router.post('/', async (req, res) => {
  try {
    const { name, type, description, start_date, end_date, store_id, rules, rewards, target_audience } = req.body

    // Check if store exists
    const store = await Store.findByPk(store_id, {
      include: [{
        model: Merchant,
        as: 'merchant'
      }]
    })
    if (!store) {
      return res.status(404).json({ message: 'Store not found' })
    }

    const campaign = await Campaign.create({
      name,
      type,
      description,
      start_date,
      end_date,
      store_id,
      rules,
      rewards,
      target_audience,
      created_by: req.user.id,
      status: 'draft'
    })

    // Fetch complete data
    const completeData = await Campaign.findOne({
      where: { id: campaign.id },
      include: [
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Merchant,
              as: 'merchant',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    })

    res.status(201).json(completeData)
  } catch (error) {
    console.error('Error creating campaign:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const { name, type, description, start_date, end_date, store_id, rules, rewards, target_audience, status } = req.body
    const campaign = await Campaign.findByPk(req.params.id)

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    // Check if store exists if store_id is being updated
    if (store_id && store_id !== campaign.store_id) {
      const store = await Store.findByPk(store_id)
      if (!store) {
        return res.status(404).json({ message: 'Store not found' })
      }
    }

    await campaign.update({
      name,
      type,
      description,
      start_date,
      end_date,
      store_id,
      rules,
      rewards,
      target_audience,
      status
    })

    // Fetch updated data
    const updatedCampaign = await Campaign.findOne({
      where: { id: campaign.id },
      include: [
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Merchant,
              as: 'merchant',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    })

    res.json(updatedCampaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id)

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    await campaign.destroy()
    res.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Merchant,
              as: 'merchant',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Checkin,
          as: 'checkins',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ]
    })

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }

    res.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router 