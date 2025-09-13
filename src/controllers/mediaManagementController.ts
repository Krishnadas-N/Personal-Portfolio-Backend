import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processImage,
  uploadProcessedImages,
  deleteFromS3,
  getSignedUrl,
  listFiles,
  generateUniqueFilename,
  IMAGE_SIZES
} from '../config/s3';

// @desc    Upload single image
// @route   POST /api/admin/media/images
// @access  Private (Admin)
export const uploadSingleImage = asyncHandler(async (req: Request, res: Response) => {
  const upload = uploadSingle('image', req.body.folder);
  
  upload(req, res, async (err: any) => {
    if (err) {
      throw new AppError(`Upload failed: ${err.message}`, 400);
    }
    
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }
    
    const file = req.file as any;
    
    // Process image if it's an image type
    if (file.mimetype.startsWith('image/')) {
      try {
        const processedImages = await processImage(file.buffer, IMAGE_SIZES);
        const baseKey = generateUniqueFilename(file.originalname, 'img');
        
        const uploadedImages = await uploadProcessedImages(
          processedImages,
          baseKey,
          req.body.folder || 'images'
        );
        
        res.json({
          success: true,
          message: 'Image uploaded and processed successfully',
          data: {
            original: {
              url: file.location,
              key: file.key,
              size: file.size
            },
            processed: uploadedImages,
            metadata: file.metadata
          }
        });
      } catch (processError) {
        // If processing fails, still return the original upload
        res.json({
          success: true,
          message: 'Image uploaded successfully (processing failed)',
          data: {
            original: {
              url: file.location,
              key: file.key,
              size: file.size
            },
            metadata: file.metadata
          }
        });
      }
    } else {
      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: file.location,
          key: file.key,
          size: file.size,
          metadata: file.metadata
        }
      });
    }
  });
});

// @desc    Upload multiple images
// @route   POST /api/admin/media/images/batch
// @access  Private (Admin)
export const uploadMultipleImages = asyncHandler(async (req: Request, res: Response) => {
  const upload = uploadMultiple('images', parseInt(req.body.maxCount) || 5, req.body.folder);
  
  upload(req, res, async (err: any) => {
    if (err) {
      throw new AppError(`Upload failed: ${err.message}`, 400);
    }
    
    const files = req.files as any[];
    
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }
    
    const uploadResults = [];
    
    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        try {
          const processedImages = await processImage(file.buffer, IMAGE_SIZES);
          const baseKey = generateUniqueFilename(file.originalname, 'img');
          
          const uploadedImages = await uploadProcessedImages(
            processedImages,
            baseKey,
            req.body.folder || 'images'
          );
          
          uploadResults.push({
            original: {
              url: file.location,
              key: file.key,
              size: file.size
            },
            processed: uploadedImages,
            metadata: file.metadata
          });
        } catch (processError) {
          uploadResults.push({
            original: {
              url: file.location,
              key: file.key,
              size: file.size
            },
            metadata: file.metadata
          });
        }
      } else {
        uploadResults.push({
          url: file.location,
          key: file.key,
          size: file.size,
          metadata: file.metadata
        });
      }
    }
    
    res.json({
      success: true,
      message: `${files.length} files uploaded successfully`,
      data: uploadResults
    });
  });
});

// @desc    Upload mixed files (images, documents, etc.)
// @route   POST /api/admin/media/files
// @access  Private (Admin)
export const uploadMixedFiles = asyncHandler(async (req: Request, res: Response) => {
  const fields = [
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 3 },
    { name: 'videos', maxCount: 2 }
  ];
  
  const upload = uploadFields(fields);
  
  upload(req, res, async (err: any) => {
    if (err) {
      throw new AppError(`Upload failed: ${err.message}`, 400);
    }
    
    const files = req.files as any;
    const results: any = {};
    
    // Process each file type
    for (const [fieldName, fileArray] of Object.entries(files)) {
      results[fieldName] = [];
      
      for (const file of fileArray as any[]) {
        if (fieldName === 'images' && file.mimetype.startsWith('image/')) {
          try {
            const processedImages = await processImage(file.buffer, IMAGE_SIZES);
            const baseKey = generateUniqueFilename(file.originalname, 'img');
            
            const uploadedImages = await uploadProcessedImages(
              processedImages,
              baseKey,
              req.body.folder || 'mixed'
            );
            
            results[fieldName].push({
              original: {
                url: file.location,
                key: file.key,
                size: file.size
              },
              processed: uploadedImages,
              metadata: file.metadata
            });
          } catch (processError) {
            results[fieldName].push({
              original: {
                url: file.location,
                key: file.key,
                size: file.size
              },
              metadata: file.metadata
            });
          }
        } else {
          results[fieldName].push({
            url: file.location,
            key: file.key,
            size: file.size,
            metadata: file.metadata
          });
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: results
    });
  });
});

// @desc    Delete file from S3
// @route   DELETE /api/admin/media/files/:key
// @access  Private (Admin)
export const deleteMediaFile = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  
  if (!key) {
    throw new AppError('File key is required', 400);
  }
  
  const deleted = await deleteFromS3(key);
  
  if (deleted) {
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } else {
    throw new AppError('Failed to delete file', 500);
  }
});

// @desc    Get signed URL for private file
// @route   GET /api/admin/media/files/:key/signed-url
// @access  Private (Admin)
export const getSignedUrlForFile = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { expiresIn } = req.query;
  
  if (!key) {
    throw new AppError('File key is required', 400);
  }
  
  const expires = expiresIn ? parseInt(expiresIn as string) : 3600;
  const signedUrl = await getSignedUrl(key, expires);
  
  res.json({
    success: true,
    data: {
      signedUrl,
      expiresIn: expires
    }
  });
});

// @desc    List files in folder
// @route   GET /api/admin/media/files
// @access  Private (Admin)
export const listMediaFiles = asyncHandler(async (req: Request, res: Response) => {
  const { folder, prefix } = req.query;
  
  const searchPrefix = prefix || folder || '';
  const files = await listFiles(searchPrefix as string);
  
  res.json({
    success: true,
    data: files.map(file => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      etag: file.ETag
    }))
  });
});

// @desc    Get upload statistics
// @route   GET /api/admin/media/statistics
// @access  Private (Admin)
export const getMediaStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { folder } = req.query;
  
  const files = await listFiles(folder as string || '');
  
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + (file.Size || 0), 0),
    byType: {} as { [key: string]: number },
    byFolder: {} as { [key: string]: number },
    recentUploads: files
      .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
      .slice(0, 10)
      .map(file => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified
      }))
  };
  
  // Categorize files by type and folder
  files.forEach(file => {
    const key = file.Key || '';
    const extension = key.split('.').pop()?.toLowerCase() || 'unknown';
    const folderName = key.split('/')[0] || 'root';
    
    stats.byType[extension] = (stats.byType[extension] || 0) + 1;
    stats.byFolder[folderName] = (stats.byFolder[folderName] || 0) + 1;
  });
  
  res.json({
    success: true,
    data: stats
  });
});
