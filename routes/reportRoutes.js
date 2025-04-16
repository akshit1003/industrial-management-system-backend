// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/sales', authenticate, isAdmin, reportController.getSalesReport);
router.get('/inventory', authenticate, isAdmin, reportController.getInventoryReport);

module.exports = router;
