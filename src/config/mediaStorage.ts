import { S3Client, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';
import streamifier from 'streamifier';
import config from './environment';

// ==================== CONFIGURATION ====================

// 1. AWS S3 Configuration
const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

const BUCKET_NAME = config.aws.s3BucketName;
const BUCKET_REGION = config.aws.region;

// 2. Cloudinary Configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// 3. Image Processing Configuration
const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 800 },
  original: null
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// ==================== TYPES ====================

export interface MediaFile {
  Key: string;
  Size: number;
  LastModified: Date;
  ETag?: string;
  url?: string;
}

// ==================== MULTER CONFIGURATION ====================

// Use MemoryStorage to handle both S3 and Cloudinary and enable image processing
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // If specific file type requested in body, use it, otherwise detect
    // Note: req.body might not be populated before file in multipart/form-data order, 
    // but usually checking mimetype is enough.
    
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type: ' + file.mimetype) as any, false);
    }
  },
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique filename
 */
export const generateUniqueFilename = (originalName: string, prefix?: string) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, '-');
  
  return `${prefix ? prefix + '/' : ''}${timestamp}-${randomString}-${baseName}.${extension}`;
};

/**
 * Upload a file buffer to the configured provider (S3 or Cloudinary)
 */
export const uploadFileToProvider = async (
  buffer: Buffer, 
  key: string, 
  mimetype: string,
  folder: string = 'uploads'
): Promise<{ url: string; key: string; provider: string }> => {
  const provider = config.upload.provider;
  const fullKey = key.includes('/') ? key : `${folder}/${key}`;

  if (provider === 'cloudinary') {
    return new Promise((resolve, reject) => {
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: key.split('/').pop()?.split('.')[0], // filename without extension
          resource_type: 'auto',
          overwrite: true
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          
          resolve({
            url: result.secure_url,
            key: result.public_id, // Cloudinary public_id
            provider: 'cloudinary'
          });
        }
      );
      
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  } else {
    // S3 Upload
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET_NAME,
        Key: fullKey,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read'
      }
    });

    const result = await upload.done();
    return {
      url: (result as any).Location || `${config.aws.s3BaseUrl}/${fullKey}`,
      key: fullKey,
      provider: 's3'
    };
  }
};

/**
 * Delete a file from the configured provider
 */
export const deleteFromProvider = async (key: string) => {
  const provider = config.upload.provider;

  if (provider === 'cloudinary') {
    try {
      // Assuming key is public_id
      const result = await cloudinary.uploader.destroy(key);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      return false;
    }
  } else {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });
      await s3.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting from S3:', error);
      return false;
    }
  }
};

/**
 * Get signed URL for private files
 */
export const getSignedUrl = async (key: string, expiresIn: number = 3600) => {
  const provider = config.upload.provider;

  if (provider === 'cloudinary') {
    
    return cloudinary.url(key, { 
      secure: true,
      sign_url: true,
      type: 'authenticated', // Requires 'authenticated' type images
      expires_at: Math.floor(Date.now() / 1000) + expiresIn
    });
  } else {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    return getS3SignedUrl(s3, command, { expiresIn });
  }
};

// ==================== IMAGE PROCESSING ====================

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

export const uploadProcessedImages = async (
  images: { [key: string]: Buffer },
  baseKey: string,
  folder: string = 'processed'
) => {
  const uploadPromises = Object.entries(images).map(async ([size, buffer]) => {
    // Clean filename for S3/Cloudinary compatibility
    const cleanBaseKey = baseKey.replace(/\.[^/.]+$/, ""); // Remove extension
    const key = `${cleanBaseKey}-${size}.jpg`;
    
    const result = await uploadFileToProvider(buffer, key, 'image/jpeg', folder);
    
    return { 
      size, 
      url: result.url, 
      key: result.key 
    };
  });
  
  return Promise.all(uploadPromises);
};

// ==================== EXPORTED MIDDLEWARES ====================

// Alias functions to match old s3.ts interface
export const uploadSingle = (fieldName: string, folder?: string) => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName: string, maxCount: number = 5, folder?: string) => {
  return upload.array(fieldName, maxCount);
};

export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return upload.fields(fields);
};

// List files (Provider specific)
export const listFiles = async (prefix: string): Promise<MediaFile[]> => {
  const provider = config.upload.provider;
  
  if (provider === 'cloudinary') {
    // List resources from Cloudinary
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: prefix, // Cloudinary uses folder as prefix
        max_results: 100
      });
      
      return result.resources.map((res: any) => ({
        Key: res.public_id,
        Size: res.bytes,
        LastModified: new Date(res.created_at),
        ETag: res.etag,
        url: res.secure_url
      }));
    } catch (error) {
      console.error('Cloudinary list error:', error);
      return [];
    }
  } else {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    });
    
    const result = await s3.send(command);
    
    // Normalize S3 result to MediaFile
    return (result.Contents || []).map(item => ({
      Key: item.Key || '',
      Size: item.Size || 0,
      LastModified: item.LastModified || new Date(),
      ETag: item.ETag,
      url: `${config.aws.s3BaseUrl}/${item.Key}`
    }));
  }
};

export { 
  s3, 
  BUCKET_NAME, 
  BUCKET_REGION, 
  IMAGE_SIZES, 
  // Export alias for compatibility
  deleteFromProvider as deleteFromS3,
  getSignedUrl as getSignedUrlForS3
};
