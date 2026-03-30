const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Start in-memory MongoDB instance (no external MongoDB needed)
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    const uri = mongoServer.getUri();

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB In-Memory Connected: ${conn.connection.host}`);
    console.log(`Database URI: ${uri}`);
  } catch (error) {
    console.error(`[ERROR] Could not start in-memory MongoDB: ${error.message}`);
    console.error('[WARN] Server will continue running but database features will be unavailable.');
  }
};

module.exports = connectDB;
