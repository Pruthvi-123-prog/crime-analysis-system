const mongoose = require('mongoose');

const initializeDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/crime-analysis');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = initializeDB;