const mongoose = require('mongoose');
const logger = require('../utils/logger');

let mongoServer; // For in-memory fallback

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const MAX_RETRIES = 3;
  let retries = 0;

  // Try persistent MongoDB first
  if (mongoUri && mongoUri !== 'mongodb://127.0.0.1:27017/ampedge_db_unused') {
    while (retries < MAX_RETRIES) {
      try {
        const conn = await mongoose.connect(mongoUri, {
          maxPoolSize: 50,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
          logger.error('MongoDB connection error', { error: err.message });
        });
        mongoose.connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected. Attempting reconnect...');
        });
        mongoose.connection.on('reconnected', () => {
          logger.info('MongoDB reconnected successfully');
        });

        return;
      } catch (error) {
        retries++;
        logger.warn(`MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${error.message}`);
        if (retries < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 2000 * retries)); // Exponential backoff
        }
      }
    }
    logger.warn('All MongoDB connection attempts failed. Falling back to in-memory database.');
  }

  // Fallback: In-memory MongoDB (for development/demo)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, { maxPoolSize: 10 });
    logger.info(`MongoDB In-Memory Connected (data will not persist across restarts)`);
    logger.info(`In-Memory Database URI: ${uri}`);
  } catch (error) {
    logger.error(`Could not start any MongoDB instance: ${error.message}`);
    logger.error('Server will continue running but database features will be unavailable.');
  }
};

// Graceful disconnect
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error('Error during MongoDB disconnect', { error: error.message });
  }
};

module.exports = { connectDB, disconnectDB };
