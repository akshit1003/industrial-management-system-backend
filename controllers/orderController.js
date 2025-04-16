// controllers/orderController.js
const { db } = require('../config/firebase');

exports.createOrder = async (req, res) => {
  try {
    const { customerId, products, shippingAddress, notes } = req.body;
    
    // Validate customer exists
    const customerDoc = await db.collection('users').doc(customerId).get();
    if (!customerDoc.exists) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Validate products and calculate total
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const productDoc = await db.collection('products').doc(item.productId).get();
      
      if (!productDoc.exists) {
        return res.status(404).json({ 
          error: `Product with ID ${item.productId} not found` 
        });
      }
      
      const productData = productDoc.data();
      
      // Check if enough stock is available
      if (productData.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Not enough stock for product ${productData.name}` 
        });
      }
      
      const itemTotal = productData.price * item.quantity;
      totalAmount += itemTotal;
      
      orderProducts.push({
        productId: item.productId,
        name: productData.name,
        price: productData.price,
        quantity: item.quantity,
        total: itemTotal
      });
      
      // Update product stock
      await db.collection('products').doc(item.productId).update({
        stock: productData.stock - item.quantity
      });
    }
    
    // Create new order
    const orderData = {
      customerId,
      customerName: customerDoc.data().name,
      products: orderProducts,
      totalAmount,
      status: 'pending',
      shippingAddress,
      notes,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const orderRef = await db.collection('orders').add(orderData);
    
    // Create production job
    await db.collection('production').add({
      orderId: orderRef.id,
      customerId,
      products: orderProducts,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      message: 'Order created successfully', 
      orderId: orderRef.id,
      orderData: { ...orderData, id: orderRef.id }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    const ordersSnapshot = await db.collection('orders')
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting customer orders:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({
      id: orderDoc.id,
      ...orderDoc.data()
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await db.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { paymentStatus, paymentMethod, transactionId } = req.body;
    
    const validPaymentStatuses = ['unpaid', 'paid', 'refunded'];
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        error: 'Invalid payment status. Must be one of: ' + validPaymentStatuses.join(', ') 
      });
    }
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await db.collection('orders').doc(orderId).update({
      paymentStatus,
      paymentMethod,
      transactionId,
      paymentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: error.message });
  }
};
