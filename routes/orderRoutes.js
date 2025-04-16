// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, isAdmin, orderController.getAllOrders);
router.get('/customer/:customerId', authenticate, orderController.getCustomerOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);
router.put('/:id/payment', authenticate, isAdmin, orderController.updatePaymentStatus);

module.exports = router;