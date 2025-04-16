// controllers/customerController.js
const { db } = require('../config/firebase');

exports.getAllCustomers = async (req, res) => {
  try {
    const customersSnapshot = await db.collection('users')
      .where('role', '==', 'customer')
      .get();
    
    const customers = [];
    customersSnapshot.forEach(doc => {
      const customer = doc.data();
      delete customer.password;
      customers.push(customer);
    });
    
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const customerDoc = await db.collection('users').doc(customerId).get();
    
    if (!customerDoc.exists) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customerData = customerDoc.data();
    delete customerData.password;
    
    res.status(200).json(customerData);
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { name, email, phone, address } = req.body;
    
    const customerDoc = await db.collection('users').doc(customerId).get();
    
    if (!customerDoc.exists) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    
    await db.collection('users').doc(customerId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const customerDoc = await db.collection('users').doc(customerId).get();
    
    if (!customerDoc.exists) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if customer has any orders
    const ordersSnapshot = await db.collection('orders')
      .where('customerId', '==', customerId)
      .get();
    
    if (!ordersSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing orders' 
      });
    }
    
    await db.collection('users').doc(customerId).delete();
    
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
};
