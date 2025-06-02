import mongoose from 'mongoose';

async function globalTeardown() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI found, skipping cleanup');
      return;
    }

    console.log('🧹 Cleaning up test database...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // Drop the test database to clean up
    const dbName = process.env.TEST_DB_NAME || process.env.DB_NAME;
    if (dbName && dbName.includes('test')) {
      console.log(`🗑️  Dropping test database: ${dbName}`);
      await mongoose.connection.db?.dropDatabase();
      console.log(`✅ Cleaned up test database: ${dbName}`);
    } else {
      console.log('⚠️ Skipping database drop - not a test database');
    }

    await mongoose.disconnect();
    console.log('🏁 Test cleanup complete');
  } catch (error) {
    console.error('⚠️ Cleanup error:', error);
    // Don't fail the tests if cleanup fails
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
}

export default globalTeardown;
