const mongoose = require('mongoose'); // Import mongoose for MongoDB interaction
require('dotenv').config(); // Load environment variables

const connectDB = async () => {
  try {
    const db = process.env.MONGODB_URI; // Get the MongoDB connection string from the environment variable
    await mongoose.connect(db) 
     console.log('MongoDB connected successfully');
   
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process with failure
  }
}
module.exports = connectDB; // Export the connectDB function to be used in other parts of the application 