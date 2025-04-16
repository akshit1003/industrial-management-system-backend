// routes/productionRoutes.js
const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/', authenticate, isAdmin, productionController.getProductionJobs);
router.put('/:id/status', authenticate, isAdmin, productionController.updateProductionStatus);

module.exports = router;
