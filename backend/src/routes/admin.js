// Merchant details routes
router.get('/merchants/:id', middleware.verifyJWT, adminController.getMerchantById);
router.put('/merchants/:id', middleware.verifyJWT, adminController.updateMerchant);
router.patch('/merchants/:id/status', middleware.verifyJWT, adminController.updateMerchantStatus);
router.get('/merchants/:id/stats', middleware.verifyJWT, adminController.getMerchantStats);
router.get('/merchants/:id/activities', middleware.verifyJWT, adminController.getMerchantActivities); 