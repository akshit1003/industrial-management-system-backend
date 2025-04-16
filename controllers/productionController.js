// controllers/productionController.js
const { db } = require('../config/firebase');

exports.getProductionJobs = async (req, res) => {
  try {
    const productionSnapshot = await db.collection('production')
      .orderBy('createdAt', 'desc')
      .get();
    
    const productionJobs = [];
    productionSnapshot.forEach(doc => {
      productionJobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(productionJobs);
  } catch (error) {
    console.error('Error getting production jobs:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProductionStatus = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }
    
    const jobDoc = await db.collection('production').doc(jobId).get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Production job not found' });
    }
    
    await db.collection('production').doc(jobId).update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    // If status is completed, update the order status
    if (status === 'completed') {
      const orderId = jobDoc.data().orderId;
      await db.collection('orders').doc(orderId).update({
        status: 'processing',
        updatedAt: new Date().toISOString()
      });
    }
    
    res.status(200).json({ message: 'Production status updated successfully' });
  } catch (error) {
    console.error('Error updating production status:', error);
    res.status(500).json({ error: error.message });
  }
};
