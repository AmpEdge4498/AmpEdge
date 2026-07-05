const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { connectDB, disconnectDB } = require('./config/db');
const seedDatabase = require('./config/seed');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { initFirebase } = require('./config/firebase');

// Load environment variables
dotenv.config();

const app = express();

// ── Security Middlewares ──
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// ── Rate Limiting ──
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for auth endpoints
  message: { success: false, error: 'Too many auth attempts. Please try again later.' },
});

app.use('/api/', generalLimiter);

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── CORS ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:19006'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development; tighten in production
    }
  },
  credentials: true,
}));

// ── Compression ──
app.use(compression());

// ── Logging ──
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Request Timeout ──
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({ success: false, error: 'Request Timeout' });
  });
  next();
});

// ── Import Routes ──
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const couponRoutes = require('./routes/coupons');
const subscriptionRoutes = require('./routes/subscriptions');
const bomRoutes = require('./routes/bom');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const geocodeRoutes = require('./routes/geocode');
const deeplinkRoutes = require('./routes/deeplink');

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AmpEdge API is up and running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── Mount Routes ──
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/bom', bomRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/geocode', geocodeRoutes);
app.use('/api/v1/deeplink', deeplinkRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (MUST be last) ──
app.use(errorHandler);

// ── Setup Port ──
const PORT = process.env.PORT || 5000;

// ── Start server ──
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    initFirebase();

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle server timeout
    server.timeout = 30000;

    // ── Graceful Shutdown ──
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Server shut down gracefully');
        process.exit(0);
      });

      // Force kill after 10s
      setTimeout(() => {
        logger.error('Forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// ── Unhandled Errors ──
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = app;
