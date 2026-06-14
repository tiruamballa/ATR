const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log(`Connecting to database at ${process.env.MONGODB_URI}...`);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000 // Timeout early to trigger fallback
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    try {
      await mongoose.connection.db.collection('phases').dropIndex('monthIndex_1');
      console.log('Successfully dropped stale index monthIndex_1');
    } catch (err) {
      // Ignore if it doesn't exist
    }
  } catch (error) {
    console.warn(`MongoDB Connection failed: ${error.message}`);
    
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('Attempting to spin up programmatic MongoMemoryServer fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoMS = await MongoMemoryServer.create();
        const memoryUri = mongoMS.getUri();
        
        process.env.MONGODB_URI = memoryUri; // Override environment URI
        console.log(`Starting in-memory database at ${memoryUri}...`);
        
        const conn = await mongoose.connect(memoryUri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        try {
          await mongoose.connection.db.collection('phases').dropIndex('monthIndex_1');
        } catch (err) {}
      } catch (memError) {
        console.error(`In-Memory MongoDB start failed: ${memError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

