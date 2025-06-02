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
const backupDir = '../temp-backups';
const firebaseStoragePath = `db/backups/${ENV}`;
const keepBackups = 3;
const config = {
  development: {
    backupDir,
    storagePath: firebaseStoragePath,
    keepBackups,
  },
  staging: {
    backupDir,
    storagePath: firebaseStoragePath,
    keepBackups,
  },
  production: {
    backupDir,
    storagePath: firebaseStoragePath,
    keepBackups,
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

async function createBackup() {
  console.log(`Starting database backup in ${ENV} environment...`);

  // Verify environment variables
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri || !dbName) {
    console.error('Error: Missing required environment variables');
    console.error('MONGODB_URI or DB_NAME is not defined in .env file');
    process.exit(1);
  }

  // Create temp directory for backup
  const tempBackupDir = path.join(__dirname, envConfig.backupDir);
  if (!fs.existsSync(tempBackupDir)) {
    fs.mkdirSync(tempBackupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(tempBackupDir, `backup-${timestamp}`);

  try {
    // Initialize Firebase
    const admin = await initializeFirebase();
    const bucket = admin.storage().bucket();

    // Create backup
    const command = `mongodump --uri="${uri}" --db=${dbName} --out="${backupPath}"`;
    console.log('Running backup command...');
    await execAsync(command);

    // Create a zip file of the backup
    const zipCommand = `cd "${tempBackupDir}" && zip -r "backup-${timestamp}.zip" "backup-${timestamp}"`;
    await execAsync(zipCommand);

    // Upload to Firebase Storage
    const zipPath = path.join(tempBackupDir, `backup-${timestamp}.zip`);
    const destination = `${envConfig.storagePath}/backup-${timestamp}.zip`;

    console.log('Uploading to Firebase Storage...');
    await bucket.upload(zipPath, {
      destination,
      metadata: {
        contentType: 'application/zip',
        metadata: {
          environment: ENV,
          timestamp: timestamp,
          database: dbName,
        },
      },
    });

    // List existing backups and delete old ones
    const [files] = await bucket.getFiles({
      prefix: envConfig.storagePath,
    });

    if (files.length > envConfig.keepBackups) {
      const sortedFiles = files
        .map(file => ({
          file,
          timestamp: file.metadata.metadata?.timestamp || file.name,
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      // Delete older files
      for (const { file } of sortedFiles.slice(envConfig.keepBackups)) {
        await file.delete();
        console.log(`Deleted old backup: ${file.name}`);
      }
    }

    // Clean up local temp files
    fs.rmSync(backupPath, { recursive: true, force: true });
    fs.unlinkSync(zipPath);

    console.log(`Backup completed successfully and uploaded to: ${destination}`);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
const isRunningDirectly = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunningDirectly) {
  createBackup().catch(console.error);
}

export { createBackup };
