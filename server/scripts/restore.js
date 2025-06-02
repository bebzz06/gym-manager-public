import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import fs from 'fs';
import admin from 'firebase-admin';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV = process.env.NODE_ENV || 'development';

// Load environment-specific .env file
dotenv.config({ path: path.join(__dirname, `../.env.${ENV}`) });

// Environment-specific configuration
const tempRestoreDir = '../temp-restore';
const firebaseStoragePath = `db/backups/${ENV}`;
const config = {
  development: {
    tempDir: tempRestoreDir,
    storagePath: firebaseStoragePath,
  },
  staging: {
    tempDir: tempRestoreDir,
    storagePath: firebaseStoragePath,
  },
  production: {
    tempDir: tempRestoreDir,
    storagePath: firebaseStoragePath,
  },
};

const envConfig = config[ENV];

const initializeFirebase = async () => {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    return admin;
  } catch (e) {
    console.error('Failed to initialize Firebase:', e);
    process.exit(1);
  }
};

async function getLatestBackup(bucket) {
  const [files] = await bucket.getFiles({
    prefix: envConfig.storagePath,
  });

  if (files.length === 0) {
    throw new Error(`No backups found in ${envConfig.storagePath}`);
  }

  return files.sort((a, b) => {
    const timestampA = a.metadata.metadata?.timestamp || a.name;
    const timestampB = b.metadata.metadata?.timestamp || b.name;
    return timestampB.localeCompare(timestampA);
  })[0];
}

async function restore() {
  console.log(`Starting database restore in ${ENV} environment...`);

  // Verify environment variables
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri || !dbName) {
    console.error('Error: Missing required environment variables');
    console.error('MONGODB_URI or DB_NAME is not defined in .env file');
    process.exit(1);
  }

  // Create temp directory for restore
  const tempDir = path.join(__dirname, envConfig.tempDir);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Initialize Firebase
    const admin = await initializeFirebase();
    const bucket = admin.storage().bucket();

    // Get latest backup
    console.log('Fetching latest backup from Firebase Storage...');
    const latestBackup = await getLatestBackup(bucket);
    const backupFileName = path.basename(latestBackup.name);
    const localZipPath = path.join(tempDir, backupFileName);

    // Download the backup
    await latestBackup.download({
      destination: localZipPath,
    });
    console.log(`Downloaded backup to ${localZipPath}`);

    // Unzip the backup
    const unzipCommand = `cd "${tempDir}" && unzip -o "${backupFileName}"`;
    console.log('Extracting backup...');
    await execAsync(unzipCommand);

    // Get the extracted directory name
    const extractedDir = backupFileName.replace('.zip', '');
    const restorePath = path.join(tempDir, extractedDir, dbName);

    // Perform restore
    const restoreCommand = `mongorestore --uri="${uri}" --nsInclude="${dbName}.*" "${restorePath}" --drop`;
    console.log('Running restore command...');
    const { stdout, stderr } = await execAsync(restoreCommand);

    if (stderr) {
      console.error('Restore stderr:', stderr);
    }
    if (stdout) {
      console.log('Restore stdout:', stdout);
    }

    // Clean up
    fs.rmSync(path.join(tempDir, extractedDir), { recursive: true, force: true });
    fs.unlinkSync(localZipPath);

    console.log('Restore completed successfully');
  } catch (error) {
    console.error('Restore failed:', error);
    process.exit(1);
  }
}

// Run if called directly
const isRunningDirectly = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunningDirectly) {
  restore().catch(console.error);
}

export { restore };
