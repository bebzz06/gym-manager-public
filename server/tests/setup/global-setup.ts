import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.test' });

async function globalSetup() {
  try {
    console.log('🔧 Setting up test environment with Atlas...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.test');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in .env.test');
    }

    // Get the test database name
    const testDbName = process.env.TEST_DB_NAME || process.env.DB_NAME || 'gym_manager_test';

    // Validate database name length for Atlas
    if (testDbName.length > 38) {
      throw new Error(
        `Database name "${testDbName}" is ${testDbName.length} characters long. Atlas maximum is 38 characters.`
      );
    }

    console.log(`📡 Using test database: ${testDbName} (${testDbName.length} chars)`);

    // Update MongoDB URI to use the specific test database
    let mongoUri = process.env.MONGODB_URI;

    // Replace database name in URI if it exists, or append it
    if (mongoUri.includes('mongodb+srv://')) {
      // Atlas connection string
      const [baseUri, params] = mongoUri.split('?');
      const uriParts = baseUri.split('/');

      if (uriParts.length > 3) {
        // Replace existing database name
        uriParts[3] = testDbName;
      } else {
        // Add database name
        uriParts.push(testDbName);
      }

      mongoUri = uriParts.join('/') + (params ? `?${params}` : '');
    } else {
      // Standard connection string
      mongoUri = mongoUri.replace(/\/([^?]+)/, `/${testDbName}`);
    }

    // Update environment variable for tests
    process.env.MONGODB_URI = mongoUri;

    console.log('📡 Testing Atlas connection...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Atlas connection successful');
    await mongoose.disconnect();

    console.log('🚀 Test environment setup complete');
  } catch (error) {
    console.error('❌ Setup error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

export default globalSetup;
