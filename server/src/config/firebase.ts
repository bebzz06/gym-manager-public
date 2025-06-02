import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import config from './index.js';

const initializeFirebase = async (): Promise<void> => {
  if (config.isTest) {
    console.log('Skipping Firebase initialization in test environment');
    return;
  }

  try {
    if (getApps().length === 0) {
      const isCloudRun = process.env.K_SERVICE !== undefined;

      if (isCloudRun) {
        //authenticate with ADC
        initializeApp({
          projectId: config.firebase.projectId,
          storageBucket: config.firebase.storageBucket,
        });
      } else {
        const serviceAccount: ServiceAccount = {
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey,
        };

        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: config.firebase.storageBucket,
        });
      }
    }
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

export const getStorage = async () => (await import('firebase-admin/storage')).getStorage();

export default initializeFirebase;
