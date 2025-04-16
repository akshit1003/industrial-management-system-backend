// controllers/reportController.js
const { db } = require('../config/firebase');

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db.collection('orders')
      .where('status', '==', 'delivered')
      .where('paymentStatus', '==', 'paid');
    
    if (startDate && endDate) {
      query = query.where('createdAt', '>=', startDate)
                   .where('createdAt', '<=', endDate);
    }
    
    const ordersSnapshot = await query.get();
    
    let totalSales = 0;
    let totalOrders = 0;
    const productSales = {};
    
    ordersSnapshot.forEach(doc => {
      const orderData = doc.data();
      totalSales += orderData.totalAmount;
      totalOrders++;
      
      orderData.products.forEach(product => {
        if (productSales[product.productId]) {
          productSales[product.productId].quantity += product.quantity;
          productSales[product.productId].total += product.total;
        } else {
          productSales[product.productId] = {
            name: product.name,
            quantity: product.quantity,
            total: product.total
          };
        }
      });
    });
    
    res.status(200).json({
      totalSales,
      totalOrders,
      productSales: Object.values(productSales)
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const rawMaterialsSnapshot = await db.collection('rawMaterials').get();
    
    const productInventory = [];
    const rawMaterialInventory = [];
    
    productsSnapshot.forEach(doc => {
      const productData = doc.data();
      productInventory.push({
        id: doc.id,
        name: productData.name,
        stock: productData.stock,
        reorderLevel: productData.reorderLevel || 0
      });
    });
    
    rawMaterialsSnapshot.forEach(doc => {
      const rawMaterialData = doc.data();
      rawMaterialInventory.push({
        id: doc.id,
        name: rawMaterialData.name,
        quantity: rawMaterialData.quantity,
        unit: rawMaterialData.unit,
        reorderLevel: rawMaterialData.reorderLevel
      });
    });
    
    res.status(200).json({
      productInventory,
      rawMaterialInventory
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ error: error.message });
  }
};
