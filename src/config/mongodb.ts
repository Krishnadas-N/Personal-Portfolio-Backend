import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectToDatabase;
