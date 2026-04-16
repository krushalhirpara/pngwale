const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Image = require('../models/Image');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const multer = require('multer');
const { extractImagesFromZip } = require('../utils/zipHandler');
const path = require('path');
const fs = require('fs');

// Configure Absolute Uploads Directory
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ================= ADMIN LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { token } = req.body;

    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Token'
      });
    }

    const jwtToken = jwt.sign(
      { id: 'admin', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: jwtToken
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= CATEGORIES =================
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/categories', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    
    const category = new Category({ name, slug });
    await category.save();

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= ADVANCED UPLOAD =================
router.post('/upload', auth, upload.array('files'), async (req, res) => {
  const log = (msg) => fs.appendFileSync('debug.log', `[${new Date().toISOString()}] ${msg}\n`);
  log('UPLOAD: Request started');
  try {
    const { categoryId, tags } = req.body;
    const files = req.files;

    log(`UPLOAD: Fields - categoryId: ${categoryId}, tags: ${tags}, files: ${files?.length}`);

    if (!files || files.length === 0) {
      log('UPLOAD: Error - No files');
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      log(`UPLOAD: Error - Invalid categoryId: ${categoryId}`);
      return res.status(400).json({ success: false, message: 'Valid Category ID is required' });
    }

    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) {
      log(`UPLOAD: Error - Category not found in DB: ${categoryId}`);
      return res.status(404).json({ success: false, message: 'Category not found in database' });
    }

    const uploadedImages = [];

    const processAndSaveImage = async (imgBuffer, originalname, mimetype, filenameOnDisk = null) => {
      log(`UPLOAD: Processing image item: ${originalname}`);
      let title = path.parse(originalname).name || 'untitled';
      let slugBase = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      if (!slugBase) slugBase = 'image-' + Date.now();
      
      let slug = slugBase;
      let counter = 1;
      while (await Image.findOne({ slug })) {
        slug = `${slugBase}-${counter}`;
        counter++;
      }

      let savedUrl = '';
      if (filenameOnDisk) {
        savedUrl = `/uploads/${filenameOnDisk}`;
      } else {
        const finalFilename = `${Date.now()}-${Math.round(Math.random() * 1E6)}-${originalname.replace(/\s+/g, '_')}`;
        const finalPath = path.join(UPLOADS_DIR, finalFilename);
        fs.writeFileSync(finalPath, imgBuffer);
        savedUrl = `/uploads/${finalFilename}`;
      }

      const newImage = new Image({
        title,
        slug,
        imageUrl: savedUrl,
        category: categoryId,
        tags: (typeof tags === 'string') ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });

      await newImage.save();
      log(`UPLOAD: Saved image document: ${newImage._id}`);
      return newImage;
    };

    for (const file of files) {
      log(`UPLOAD: Processing Multer file: ${file.originalname}`);
      const isZip = file.mimetype === 'application/zip' || 
                    file.mimetype === 'application/x-zip-compressed' || 
                    file.originalname.toLowerCase().endsWith('.zip');

      if (isZip) {
        log('UPLOAD: Detected ZIP archive');
        const zipFileBuffer = fs.readFileSync(file.path);
        const extracted = extractImagesFromZip(zipFileBuffer);
        log(`UPLOAD: ZIP extracted ${extracted.length} items`);
        
        for (const img of extracted) {
          const imgDoc = await processAndSaveImage(img.buffer, img.originalname, img.mimetype);
          uploadedImages.push(imgDoc);
        }
        fs.unlinkSync(file.path);
      } else {
        log('UPLOAD: Detected regular image');
        const imgDoc = await processAndSaveImage(null, file.originalname, file.mimetype, file.filename);
        uploadedImages.push(imgDoc);
      }
    }

    log(`UPLOAD: Success. Total processed: ${uploadedImages.length}`);
    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      data: uploadedImages
    });

  } catch (err) {
    log(`CRITICAL UPLOAD ERROR: ${err.message}\nStack: ${err.stack}`);
    res.status(500).json({ 
      success: false, 
      message: 'Server failed to process upload', 
      error: err.message,
      stack: err.stack 
    });
  }
});

// ================= GET ADMIN IMAGES =================
router.get('/images', auth, async (req, res) => {
  try {
    const images = await Image.find().populate('category').sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
