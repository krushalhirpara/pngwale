const AdmZip = require('adm-zip');
const path = require('path');

/**
 * Extracts images from a ZIP buffer and returns them as a list of buffers with metadata.
 * @param {Buffer} zipBuffer - The ZIP file buffer.
 * @returns {Array} List of { buffer, originalname, mimetype }
 */
const extractImagesFromZip = (zipBuffer) => {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();
  const extractedImages = [];

  const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

  zipEntries.forEach((entry) => {
    if (entry.isDirectory) return;

    const ext = path.extname(entry.entryName).toLowerCase();
    if (validExtensions.includes(ext)) {
      const buffer = entry.getData();
      const filename = path.basename(entry.entryName);
      
      // Basic mimetype mapping
      let mimetype = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') mimetype = 'image/jpeg';
      else if (ext === '.webp') mimetype = 'image/webp';

      extractedImages.push({
        buffer,
        originalname: filename,
        mimetype
      });
    }
  });

  return extractedImages;
};

module.exports = { extractImagesFromZip };
