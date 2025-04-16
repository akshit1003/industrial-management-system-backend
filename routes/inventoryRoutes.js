// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/raw-materials', authenticate, isAdmin, inventoryController.addRawMaterial);
router.get('/raw-materials', authenticate, inventoryController.getAllRawMaterials);
router.put('/raw-materials/:id', authenticate, isAdmin, inventoryController.updateRawMaterialQuantity);
router.get('/low-stock', authenticate, isAdmin, inventoryController.checkLowStock);

module.exports = router;
