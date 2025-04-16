// utils/helpers.js
const generateOrderNumber = () => {
    const prefix = 'ORD';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp.substring(timestamp.length - 6)}-${random}`;
  };
  
  const calculateProductionCost = (products, rawMaterials) => {
    let totalCost = 0;
    
    products.forEach(product => {
      const productCost = product.rawMaterials.reduce((cost, material) => {
        const rawMaterial = rawMaterials.find(rm => rm.id === material.id);
        return cost + (rawMaterial ? rawMaterial.cost * material.quantity : 0);
      }, 0);
      
      totalCost += productCost * product.quantity;
    });
    
    return totalCost;
  };
  
  module.exports = {
    generateOrderNumber,
    calculateProductionCost
  };
  