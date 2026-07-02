const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/task_tracker';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  } finally {
    console.log("MONGO_URI:", process.env.MONGO_URI);
  }
};

module.exports = connectDB;
