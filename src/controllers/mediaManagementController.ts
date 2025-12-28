import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFromS3,
  getSignedUrl,
  listFiles,
  generateUniqueFilename,
  uploadFileToProvider,
  MediaFile
} from '../config/mediaStorage';

const DEFAULT_FOLDER = 'portfolio-media';

// @desc    Upload single image
// @route   POST /api/admin/media/images
// @access  Private (Admin)
export const uploadSingleImage = asyncHandler(async (req: Request, res: Response) => {
  const upload = uploadSingle('image');

  // Wrap multer middleware in promise
  await new Promise<void>((resolve, reject) => {
    upload(req, res, (err: any) => {
      if (err) reject(new AppError(`Upload failed: ${err.message}`, 400));
      else resolve();
    });
  });

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const file = req.file;
  const folder = req.body.folder || DEFAULT_FOLDER;

  // Generate key for the file
  // Note: If image, we use 'img' prefix (or based on folder)
  const baseKey = generateUniqueFilename(file.originalname);

  try {
    // 1. Upload Original File
    const originalUpload = await uploadFileToProvider(
      file.buffer,
      baseKey,
      file.mimetype,
      folder
    );

    let processedData = undefined;
    // Image processing removed as per user request to only upload original file

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

// @desc    Upload multiple images
// @route   POST /api/admin/media/images/batch
// @access  Private (Admin)
export const uploadMultipleImages = asyncHandler(async (req: Request, res: Response) => {
  const upload = uploadMultiple('images');

  await new Promise<void>((resolve, reject) => {
    upload(req, res, (err: any) => {
      if (err) reject(new AppError(`Upload failed: ${err.message}`, 400));
      else resolve();
    });
  });

  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const folder = req.body.folder || DEFAULT_FOLDER;
  const uploadPromises = files.map(async (file) => {
    const baseKey = generateUniqueFilename(file.originalname);
    try {
      const originalUpload = await uploadFileToProvider(
        file.buffer,
        baseKey,
        file.mimetype,
        folder
      );

      let processedData = undefined;

      return {
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
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        error: 'Upload failed',
        originalname: file.originalname
      };
    }
  });

  const uploadResults = await Promise.all(uploadPromises);

  res.json({
    success: true,
    message: `${uploadResults.filter(r => !r.error).length} files uploaded successfully`,
    data: uploadResults
  });
});

// @desc    Upload mixed files (images, documents, etc.)
// @route   POST /api/admin/media/files
// @access  Private (Admin)
export const uploadMixedFiles = asyncHandler(async (req: Request, res: Response) => {
  const fields = [
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 3 },
    { name: 'videos', maxCount: 2 },
    { name: 'files', maxCount: 10 },
    { name: 'file', maxCount: 10 }
  ];

  const upload = uploadFields(fields);

  await new Promise<void>((resolve, reject) => {
    upload(req, res, (err: any) => {
      if (err) reject(new AppError(`Upload failed: ${err.message}`, 400));
      else resolve();
    });
  });

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const results: any = {};
  const folder = req.body.folder || DEFAULT_FOLDER;

  // Process each file type concurrently
  for (const [fieldName, fileArray] of Object.entries(files)) {
    const fieldPromises = fileArray.map(async (file) => {
      const baseKey = generateUniqueFilename(file.originalname);

      try {
        const originalUpload = await uploadFileToProvider(
          file.buffer,
          baseKey,
          file.mimetype,
          folder
        );

        let processedData = undefined;

        return {
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
        };
      } catch (error) {
        console.error('File upload failed:', error);
        return {
          error: 'Upload failed',
          originalname: file.originalname
        };
      }
    });

    results[fieldName] = await Promise.all(fieldPromises);
  }

  res.json({
    success: true,
    message: 'Files uploaded successfully',
    data: results
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

  let baseFolder = (folder as string) || DEFAULT_FOLDER;
  if (baseFolder.endsWith('/')) baseFolder = baseFolder.slice(0, -1);

  const searchPrefix = prefix
    ? `${baseFolder}/${prefix}`
    : baseFolder;

  const files: MediaFile[] = await listFiles(searchPrefix as string);

  res.json({
    success: true,
    data: files.map(file => {
      // Derive mimetype from extension for frontend utility
      const extension = file.Key.split('.').pop()?.toLowerCase();
      let type = 'unknown';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) type = 'image';
      else if (['pdf', 'doc', 'docx'].includes(extension || '')) type = 'document';
      else if (['mp4', 'webm', 'mov'].includes(extension || '')) type = 'video';

      return {
        key: file.Key,
        url: file.url, // Cloud URL
        size: file.Size,
        lastModified: file.LastModified,
        etag: file.ETag,
        type,
        extension
      };
    })
  });
});

// @desc    Get upload statistics
// @route   GET /api/admin/media/statistics
// @access  Private (Admin)
export const getMediaStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { folder } = req.query;

  const searchFolder = (folder as string) || DEFAULT_FOLDER;
  const files: MediaFile[] = await listFiles(searchFolder);

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
