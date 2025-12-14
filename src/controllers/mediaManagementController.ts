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
  uploadFileToProvider,
  IMAGE_SIZES,
  MediaFile
} from '../config/mediaStorage';

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
    
    const file = req.file;
    const folder = req.body.folder || 'images';
    
    // Generate key for the file
    // Note: If image, we use 'img' prefix (or based on folder)
    const baseKey = generateUniqueFilename(file.originalname, file.mimetype.startsWith('image/') ? 'img' : folder);
    
    try {
      // 1. Upload Original File
      const originalUpload = await uploadFileToProvider(
        file.buffer, 
        baseKey, 
        file.mimetype,
        folder
      );
      
      let processedData = undefined;

      // 2. Process image if it's an image type
      if (file.mimetype.startsWith('image/')) {
        try {
          const processedImages = await processImage(file.buffer, IMAGE_SIZES);
          
          const uploadedImages = await uploadProcessedImages(
            processedImages,
            baseKey,
            folder
          );
          
          processedData = uploadedImages;
        } catch (processError) {
          console.error('Image processing failed:', processError);
          // Continue without processed images
        }
      }
      
      res.json({
        success: true,
        message: processedData ? 'Image uploaded and processed successfully' : 'File uploaded successfully',
        data: {
          original: {
            url: originalUpload.url,
            key: originalUpload.key,
            size: file.size,
            provider: originalUpload.provider
          },
          processed: processedData,
          metadata: {
            originalname: file.originalname,
            mimetype: file.mimetype,
            encoding: file.encoding
          }
        }
      });
    } catch (uploadError: any) {
      throw new AppError(`Upload to provider failed: ${uploadError.message}`, 500);
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
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }
    
    const folder = req.body.folder || 'images';
    const uploadResults = [];
    
    for (const file of files) {
      const baseKey = generateUniqueFilename(file.originalname, file.mimetype.startsWith('image/') ? 'img' : folder);
      
      try {
        // Upload Original
        const originalUpload = await uploadFileToProvider(
          file.buffer,
          baseKey,
          file.mimetype,
          folder
        );
        
        let processedData = undefined;

        if (file.mimetype.startsWith('image/')) {
          try {
            const processedImages = await processImage(file.buffer, IMAGE_SIZES);
            
            const uploadedImages = await uploadProcessedImages(
              processedImages,
              baseKey,
              folder
            );
            
            processedData = uploadedImages;
          } catch (processError) {
             console.error('Image processing failed for file:', file.originalname, processError);
          }
        }
        
        uploadResults.push({
          original: {
            url: originalUpload.url,
            key: originalUpload.key,
            size: file.size,
            provider: originalUpload.provider
          },
          processed: processedData,
          metadata: {
            originalname: file.originalname,
            mimetype: file.mimetype
          }
        });
      } catch (error) {
        console.error('File upload failed:', error);
        // Continue with other files or add error entry
        uploadResults.push({
          error: 'Upload failed',
          originalname: file.originalname
        });
      }
    }
    
    res.json({
      success: true,
      message: `${uploadResults.filter(r => !r.error).length} files uploaded successfully`,
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
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const results: any = {};
    const folder = req.body.folder || 'mixed';
    
    // Process each file type
    for (const [fieldName, fileArray] of Object.entries(files)) {
      results[fieldName] = [];
      
      for (const file of fileArray) {
        const baseKey = generateUniqueFilename(file.originalname, fieldName === 'images' ? 'img' : folder);
        
        try {
          const originalUpload = await uploadFileToProvider(
            file.buffer,
            baseKey,
            file.mimetype,
            folder
          );
          
          let processedData = undefined;

          if (fieldName === 'images' && file.mimetype.startsWith('image/')) {
            try {
              const processedImages = await processImage(file.buffer, IMAGE_SIZES);
              
              const uploadedImages = await uploadProcessedImages(
                processedImages,
                baseKey,
                folder
              );
              
              processedData = uploadedImages;
            } catch (processError) {
               console.error('Image processing failed:', processError);
            }
          }
          
          results[fieldName].push({
            original: {
              url: originalUpload.url,
              key: originalUpload.key,
              size: file.size,
              provider: originalUpload.provider
            },
            processed: processedData,
            metadata: {
              originalname: file.originalname,
              mimetype: file.mimetype
            }
          });
        } catch (error) {
          console.error('File upload failed:', error);
          results[fieldName].push({
             error: 'Upload failed',
             originalname: file.originalname
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

// @desc    Delete file from S3/Cloudinary
// @route   DELETE /api/admin/media/files/:key
// @access  Private (Admin)
export const deleteMediaFile = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  
  if (!key) {
    throw new AppError('File key is required', 400);
  }
  
  const deleted = await deleteFromS3(key); // deleteFromS3 is alias for deleteFromProvider
  
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
  const files: MediaFile[] = await listFiles(searchPrefix as string);
  
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
  
  const files: MediaFile[] = await listFiles(folder as string || '');
  
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + (file.Size || 0), 0),
    byType: {} as { [key: string]: number },
    byFolder: {} as { [key: string]: number },
    recentUploads: files
      .sort((a, b) => (b.LastModified.getTime() || 0) - (a.LastModified.getTime() || 0))
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
