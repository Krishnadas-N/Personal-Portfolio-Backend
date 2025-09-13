import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import sharp from 'sharp';
import { Request } from 'express';

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// S3 bucket configuration
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'portfolio-assets';
const BUCKET_REGION = process.env.AWS_REGION || 'us-east-1';

// Image processing configuration
const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 800 },
  original: null
};

// File type validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Multer configuration for S3 upload
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3 as any, // Type assertion to fix S3Client compatibility
    bucket: BUCKET_NAME,
    acl: 'public-read',
    key: function (req: Request, file: Express.Multer.File, cb: Function) {
      const folder = req.body.folder || 'uploads';
      const timestamp = Date.now();
      const filename = `${folder}/${timestamp}-${file.originalname}`;
      cb(null, filename);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req: Request, file: Express.Multer.File, cb: Function) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || req.admin?.id || 'anonymous',
        uploadDate: new Date().toISOString()
      });
    }
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    const fileType = req.body.fileType || 'image';
    
    if (fileType === 'image' && ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else if (fileType === 'document' && ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Image processing function
export const processImage = async (buffer: Buffer, sizes: typeof IMAGE_SIZES) => {
  const processedImages: { [key: string]: Buffer } = {};
  
  for (const [sizeName, dimensions] of Object.entries(sizes)) {
    if (dimensions) {
      processedImages[sizeName] = await sharp(buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    } else {
      processedImages[sizeName] = await sharp(buffer)
        .jpeg({ quality: 95 })
        .toBuffer();
    }
  }
  
  return processedImages;
};

// Upload processed images to S3
export const uploadProcessedImages = async (
  images: { [key: string]: Buffer },
  baseKey: string,
  folder: string = 'processed'
) => {
  const uploadPromises = Object.entries(images).map(async ([size, buffer]) => {
    const key = `${folder}/${baseKey}-${size}.jpg`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };
    
    const result = await s3.upload(params).promise();
    return { size, url: result.Location, key };
  });
  
  return Promise.all(uploadPromises);
};

// Delete file from S3
export const deleteFromS3 = async (key: string) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };
  
  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

// Get signed URL for private files
export const getSignedUrl = async (key: string, expiresIn: number = 3600) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn
  };
  
  return s3.getSignedUrl('getObject', params);
};

// List files in S3 folder
export const listFiles = async (prefix: string) => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix
  };
  
  const result = await s3.listObjectsV2(params).promise();
  return result.Contents || [];
};

// Generate unique filename
export const generateUniqueFilename = (originalName: string, prefix?: string) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `${prefix ? prefix + '-' : ''}${timestamp}-${randomString}-${baseName}.${extension}`;
};

// Middleware for single file upload
export const uploadSingle = (fieldName: string, folder?: string) => {
  return uploadToS3.single(fieldName);
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5, folder?: string) => {
  return uploadToS3.array(fieldName, maxCount);
};

// Middleware for mixed file uploads
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return uploadToS3.fields(fields);
};

export { s3, BUCKET_NAME, BUCKET_REGION, IMAGE_SIZES };
