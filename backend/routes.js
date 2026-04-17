const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
  res.json({ message: "API is working 🚀" });
});
const jwt = require('jsonwebtoken');
const cloudinary = require('./config/cloudinary');
const Image = require('./models/Image');
const Category = require('./models/Category');
const auth = require('./middleware/auth');
const multer = require('multer');

// ================= CONFIG =================
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

// ================= MULTER =================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================= UNIQUE SLUG =================
const generateUniqueSlug = async (title) => {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let uniqueSlug = slug;
  let counter = 1;

  while (await Image.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: { email: ADMIN_EMAIL }
    });

  } catch (err) {
    console.log("Login Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= UPLOAD =================
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image not received"
      });
    }

    const { title, category, tags } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title & Category required"
      });
    }

    // convert buffer to base64
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "pngwale"
    });

    // 🔥 unique slug
    const slug = await generateUniqueSlug(title);

    const newImage = new Image({
      title,
      slug,
      imageUrl: result.secure_url,
      category,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    });

    await newImage.save();

    res.json({
      success: true,
      message: "Upload success",
      data: newImage
    });

  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ================= GET CATEGORIES =================
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= GET IMAGES =================
router.get('/images', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const categorySlug = req.query.category;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }

    const images = await Image.find(query)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments(query);

    res.json({
      success: true,
      data: images,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= GET SINGLE IMAGE =================
router.get('/image/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    let image;

    // Check if itemId is a valid MongoDB ObjectId
    if (itemId.match(/^[0-9a-fA-F]{24}$/)) {
      image = await Image.findById(itemId).populate('category');
    } else {
      image = await Image.findOne({ slug: itemId }).populate('category');
    }

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Get related images (same category)
    const related = await Image.find({
      category: image.category?._id,
      _id: { $ne: image._id }
    }).limit(8);

    res.json({
      success: true,
      data: image,
      related
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= DELETE =================
router.delete('/image/:id', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    await Image.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;