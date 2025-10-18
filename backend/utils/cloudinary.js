const cloudinary = require('cloudinary').v2;

// Load configuration from environment
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUD_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUD_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET; // for unsigned uploads

// Configure Cloudinary (signed uploads when API secret is present)
if (CLOUD_NAME && (CLOUD_SECRET || CLOUD_KEY)) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUD_SECRET
  });
} else {
  console.warn('[Cloudinary] Missing configuration. Provide CLOUDINARY_CLOUD_NAME and either API_SECRET (for signed) or UPLOAD_PRESET (for unsigned).');
}

/**
 * Upload file to Cloudinary
 * - Uses signed upload when API secret is configured
 * - Falls back to unsigned upload when UPLOAD_PRESET is provided (no API secret required)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Public ID for the file
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (fileBuffer, folder = 'resumes', publicId = null) => {
  try {
    const uploadOptions = {
      folder,
      resource_type: folder === 'employee-id-cards' ? 'image' : 'raw'
    };

    // Set allowed formats based on folder type
    if (folder === 'employee-id-cards') {
      uploadOptions.allowed_formats = ['jpg', 'jpeg'];
      uploadOptions.transformation = [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];
    } else {
      // For resumes and other documents, treat as raw assets
      uploadOptions.allowed_formats = ['pdf', 'doc', 'docx'];
      // No image transformations for raw uploads
    }

    if (publicId) uploadOptions.public_id = publicId;

    // If no API secret but an unsigned preset is provided, use unsigned uploads
    if (!CLOUD_SECRET && CLOUD_PRESET) {
      uploadOptions.upload_preset = CLOUD_PRESET;
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete file from Cloudinary
 * Requires signed configuration (API secret).
 * If not available, this will fail gracefully.
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: true, result };
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get file info from Cloudinary
 */
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return { success: true, info: result };
  } catch (error) {
    console.error('Cloudinary get info error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary, getFileInfo };
