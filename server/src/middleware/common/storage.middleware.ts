import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create upload middleware with validation
export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Middleware to optimize images
export const optimizeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next();
    }

    // Resize and optimize the image using WebP format
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 }) // Convert to WebP format
      .toBuffer();

    // Update the file mimetype to reflect WebP format
    req.file.mimetype = 'image/webp';

    // Replace the original buffer with the optimized one
    req.file.buffer = optimizedBuffer;

    next();
  } catch (error) {
    next(new Error('Error optimizing image'));
  }
};

// Handle multer errors
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};
