// controllers/productController.js (continued)
const { db, storage } = require('../config/firebase');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, rawMaterials } = req.body;
    
    // Validate raw materials
    if (rawMaterials && rawMaterials.length > 0) {
      for (const material of rawMaterials) {
        const materialDoc = await db.collection('rawMaterials').doc(material.id).get();
        if (!materialDoc.exists) {
          return res.status(404).json({ error: `Raw material with ID ${material.id} not found` });
        }
      }
    }
    
    const productData = {
      name,
      description,
      price,
      category,
      stock,
      rawMaterials: rawMaterials || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const productRef = await db.collection('products').add(productData);
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      productId: productRef.id,
      productData: { ...productData, id: productRef.id }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({
      id: productDoc.id,
      ...productDoc.data()
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category, stock, rawMaterials } = req.body;
    
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (rawMaterials) updateData.rawMaterials = rawMaterials;
    
    await db.collection('products').doc(productId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product is used in any orders
    const ordersSnapshot = await db.collection('orders')
      .where('products', 'array-contains', { productId: productId })
      .get();
    
    if (!ordersSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete product. It is used in existing orders.' 
      });
    }
    
    await db.collection('products').doc(productId).delete();
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};
