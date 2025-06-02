import { getStorage } from '@/config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadProfileImage = async (
  gymId: string,
  userId: string,
  file: Express.Multer.File
): Promise<{ url: string; path: string }> => {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket();

    // Create a unique filename to prevent collisions
    const filename = `images/gyms/${gymId}/member-profile-images/${userId}/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(filename);

    // Set appropriate caching headers for better performance
    const metadata = {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    };

    // Create a write stream and upload the file
    const blobStream = fileUpload.createWriteStream({
      metadata,
    });

    // Return a promise that resolves with both the public URL and file path
    return new Promise((resolve, reject) => {
      blobStream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();

          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

          // Return both URL and path
          resolve({
            url: publicUrl,
            path: filename,
          });
        } catch (error) {
          console.error('Error making file public:', error);
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error('Failed to upload profile image');
  }
};

export const uploadGymLogo = async (
  gymId: string,
  file: Express.Multer.File
): Promise<{ url: string; path: string }> => {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket();

    // Create filename for gym logo
    const filename = `images/gyms/${gymId}/logo-${uuidv4()}.${file.originalname.split('.').pop()}`;
    const fileUpload = bucket.file(filename);

    // Set appropriate caching headers for better performance
    const metadata = {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    };

    // Create a write stream and upload the file
    const blobStream = fileUpload.createWriteStream({
      metadata,
    });

    // Return a promise that resolves with both the public URL and file path
    return new Promise((resolve, reject) => {
      blobStream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();

          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

          // Return both URL and path
          resolve({
            url: publicUrl,
            path: filename,
          });
        } catch (error) {
          console.error('Error making file public:', error);
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw new Error('Failed to upload gym logo');
  }
};

export const deleteProfileImage = async (
  profileImage: { url?: string; path?: string } | null
): Promise<void> => {
  try {
    // If profileImage is null or doesn't have a path, nothing to delete
    if (!profileImage || !profileImage.path) {
      console.log('No profile image path to delete');
      return;
    }

    const storage = await getStorage();
    const bucket = storage.bucket();
    const filePath = profileImage.path;

    console.log('Attempting to delete file with path:', filePath);

    // Delete the file using the stored path directly
    await bucket.file(filePath).delete();
    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    throw new Error('Failed to delete profile image');
  }
};

export const deleteGymLogo = async (
  logoImage: { url?: string; path?: string } | null
): Promise<void> => {
  try {
    // If logoImage is null or doesn't have a path, nothing to delete
    if (!logoImage || !logoImage.path) {
      console.log('No gym logo path to delete');
      return;
    }

    const storage = await getStorage();
    const bucket = storage.bucket();
    const filePath = logoImage.path;

    console.log('Attempting to delete file with path:', filePath);

    // Delete the file using the stored path directly
    await bucket.file(filePath).delete();
    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    throw new Error('Failed to delete gym logo');
  }
};
