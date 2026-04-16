require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Image = require('../models/Image');
const Category = require('../models/Category');

const ASSETS_PATH = path.join(__dirname, '../../src/assets');
const UPLOADS_PATH = path.join(__dirname, '../uploads');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_PATH)) {
      fs.mkdirSync(UPLOADS_PATH, { recursive: true });
    }

    // 2. Get all folders in src/assets
    const folders = fs.readdirSync(ASSETS_PATH).filter(f => {
      const fullPath = path.join(ASSETS_PATH, f);
      return fs.statSync(fullPath).isDirectory();
    });

    console.log(`Found categories to seed: ${folders.join(', ')}`);

    for (const folderName of folders) {
      // Create/Update Category
      const slug = folderName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      let category = await Category.findOne({ slug });
      
      if (!category) {
        category = new Category({ name: folderName, slug });
        await category.save();
        console.log(`[Category] Created: ${folderName}`);
      }

      // Ensure category subfolder in uploads exists
      const categoryUploadPath = path.join(UPLOADS_PATH, folderName);
      if (!fs.existsSync(categoryUploadPath)) {
        fs.mkdirSync(categoryUploadPath, { recursive: true });
      }

      // 3. Process images in this folder
      const files = fs.readdirSync(path.join(ASSETS_PATH, folderName)).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
      });

      console.log(`  Processing ${files.length} images for ${folderName}...`);

      for (const file of files) {
        const sourcePath = path.join(ASSETS_PATH, folderName, file);
        const destinationPath = path.join(categoryUploadPath, file);

        // Copy file to uploads (if not already there)
        if (!fs.existsSync(destinationPath)) {
          fs.copyFileSync(sourcePath, destinationPath);
        }

        // Check if image already exists in DB
        const imageUrl = `/uploads/${folderName}/${file}`;
        let image = await Image.findOne({ imageUrl });

        if (!image) {
          const title = path.parse(file).name.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          
          // Generate unique slug
          const slugBase = path.parse(file).name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
          let imageSlug = slugBase;
          let counter = 1;
          while (await Image.findOne({ slug: imageSlug })) {
            imageSlug = `${slugBase}-${counter}`;
            counter++;
          }

          image = new Image({
            title,
            slug: imageSlug,
            imageUrl,
            category: category._id,
            tags: [folderName.toLowerCase(), 'png', 'transparent']
          });
          await image.save();
        }
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
