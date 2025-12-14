import mongoose from 'mongoose';
import config from './environment';
import { logger } from '../utils/logger';

const connectToDatabase = async () => {
  try {
    const mongoUri = config.database.mongoUri;
    
    const options: mongoose.ConnectOptions = {
      autoIndex: config.server.nodeEnv !== 'production', // Build indexes in dev, skip in prod
      maxPoolSize: config.database.maxPoolSize,
      serverSelectionTimeoutMS: config.database.connectionTimeout,
      socketTimeoutMS: 45000,
    };

    if (!mongoUri) {
        throw new Error('MongoDB URI is not defined in configuration');
    }

    await mongoose.connect(mongoUri, options);
    
    logger.info(`Successfully connected to MongoDB at ${mongoUri.split('@')[1] || 'localhost'}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectToDatabase;
