// controllers/inventoryController.js
const { db } = require('../config/firebase');

exports.addRawMaterial = async (req, res) => {
  try {
    const { name, description, unit, quantity, reorderLevel } = req.body;
    
    const rawMaterialData = {
      name,
      description,
      unit,
      quantity,
      reorderLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const rawMaterialRef = await db.collection('rawMaterials').add(rawMaterialData);
    
    res.status(201).json({ 
      message: 'Raw material added successfully', 
      rawMaterialId: rawMaterialRef.id,
      rawMaterialData: { ...rawMaterialData, id: rawMaterialRef.id }
    });
  } catch (error) {
    console.error('Error adding raw material:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRawMaterials = async (req, res) => {
  try {
    const rawMaterialsSnapshot = await db.collection('rawMaterials').get();
    
    const rawMaterials = [];
    rawMaterialsSnapshot.forEach(doc => {
      rawMaterials.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(rawMaterials);
  } catch (error) {
    console.error('Error getting raw materials:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateRawMaterialQuantity = async (req, res) => {
  try {
    const rawMaterialId = req.params.id;
    const { quantity, operation } = req.body;
    
    const rawMaterialDoc = await db.collection('rawMaterials').doc(rawMaterialId).get();
    
    if (!rawMaterialDoc.exists) {
      return res.status(404).json({ error: 'Raw material not found' });
    }
    
    const currentQuantity = rawMaterialDoc.data().quantity;
    let newQuantity;
    
    if (operation === 'add') {
      newQuantity = currentQuantity + quantity;
    } else if (operation === 'subtract') {
      newQuantity = currentQuantity - quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ error: 'Insufficient quantity' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid operation. Use "add" or "subtract".' });
    }
    
    await db.collection('rawMaterials').doc(rawMaterialId).update({
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({ 
      message: 'Raw material quantity updated successfully',
      newQuantity
    });
  } catch (error) {
    console.error('Error updating raw material quantity:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.checkLowStock = async (req, res) => {
  try {
    const rawMaterialsSnapshot = await db.collection('rawMaterials')
      .where('quantity', '<=', db.FieldPath.documentId('reorderLevel'))
      .get();
    
    const lowStockItems = [];
    rawMaterialsSnapshot.forEach(doc => {
      lowStockItems.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(lowStockItems);
  } catch (error) {
    console.error('Error checking low stock:', error);
    res.status(500).json({ error: error.message });
  }
};
