const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const seedDatabase = require('./config/seed');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());       // Parse JSON strictly
app.use(cors());               // Cross-Origin Resource Sharing
app.use(helmet());             // Security headers
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));    // HTTP request logger
}

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const couponRoutes = require('./routes/coupons');
const subscriptionRoutes = require('./routes/subscriptions');
const bomRoutes = require('./routes/bom');
const productRoutes = require('./routes/products');

// Default Health Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'AmpEdge API is up and running!', 
    environment: process.env.NODE_ENV 
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/bom', bomRoutes);
app.use('/api/v1/products', productRoutes);

// Setup Port
const PORT = process.env.PORT || 5000;

// Start server after DB connection + seed
const startServer = async () => {
  await connectDB();
  await seedDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
// Forced restart for marketplace seeding
