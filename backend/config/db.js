const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    if (!dbUri) {
      console.log('No MONGODB_URI found in environment. Spinning up MongoMemoryServer...');
      mongoServer = await MongoMemoryServer.create();
      dbUri = mongoServer.getUri();
      console.log(`MongoMemoryServer started at: ${dbUri}`);
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoMemoryServer stopped.');
    }
  } catch (error) {
    console.error(`Error closing database: ${error.message}`);
  }
};

module.exports = { connectDB, closeDB };
