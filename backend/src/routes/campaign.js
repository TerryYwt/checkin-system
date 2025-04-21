const express = require('express')
const router = express.Router()
const campaignController = require('../controllers/campaignController')
const { authenticateToken, requireMerchant } = require('../middleware/auth')

// Get all campaigns for a merchant
router.get('/merchant/:merchant_id', authenticateToken, requireMerchant, campaignController.getMerchantCampaigns)

// Get campaign details
router.get('/:id', authenticateToken, campaignController.getCampaignDetails)

// Create new campaign
router.post('/', authenticateToken, requireMerchant, campaignController.createCampaign)

// Update campaign
router.put('/:id', authenticateToken, requireMerchant, campaignController.updateCampaign)

// Delete campaign
router.delete('/:id', authenticateToken, requireMerchant, campaignController.deleteCampaign)

// Get campaign analytics
router.get('/:id/analytics', authenticateToken, requireMerchant, campaignController.getCampaignAnalytics)

// Update campaign status
router.patch('/:id/status', authenticateToken, requireMerchant, campaignController.updateCampaignStatus)

module.exports = router 