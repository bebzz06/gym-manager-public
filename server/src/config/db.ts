import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.database.uri, {
      dbName: config.database.dbName,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
