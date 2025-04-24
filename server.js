// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const os = require('os');

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const productionRoutes = require('./routes/productionRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_ID = process.env.SERVER_ID || os.hostname();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Add server identification middleware
app.use((req, res, next) => {
  res.setHeader('X-Server-ID', SERVER_ID);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send(`Welcome to the E-commerce API (Server: ${SERVER_ID})`);
});

// Add an endpoint specifically for checking which server responded
app.get('/server-info', (req, res) => {
  res.json({
    serverId: SERVER_ID,
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: os.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server ${SERVER_ID} running on port ${PORT}`);
});

module.exports = app;