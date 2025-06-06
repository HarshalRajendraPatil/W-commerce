const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Folder to upload to in Cloudinary
 * @returns {Promise} Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = '') => {
  try {
    // Upload the file
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: folder ? `wcommerce/${folder}` : 'wcommerce',
      use_filename: true,
      unique_filename: true
    });
    
    // Remove the temp file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error removing temp file:', err);
    });
    
    return result;
  } catch (error) {
    // Remove the temp file on error
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error removing temp file:', err);
    });
    
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

/**
 * Remove a file from Cloudinary
 * @param {string} publicId - Public ID of the file to remove
 * @param {string} folder - Folder in Cloudinary
 * @returns {Promise} Cloudinary deletion result
 */
const removeFromCloudinary = async (publicId, folder = '') => {
  try {
    const fullPublicId = folder ? `wcommerce/${folder}/${publicId}` : `wcommerce/${publicId}`;
    return await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    throw new Error(`Error removing from Cloudinary: ${error.message}`);
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of files to upload
 * @param {string} folder - Folder to upload to in Cloudinary
 * @returns {Promise} Array of Cloudinary upload results
 */
const uploadMultipleToCloudinary = async (files, folder = '') => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file.tempFilePath, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Error uploading multiple files to Cloudinary: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  removeFromCloudinary,
  uploadMultipleToCloudinary,
  cloudinary
};