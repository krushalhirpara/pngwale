require('dotenv').config();
const mongoose = require('mongoose');
const Image = require('../models/Image');
const Category = require('../models/Category');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for migration...');

    const db = mongoose.connection.db;
    const imagesCollection = db.collection('images');

    // 1. Get all images and find unique string categories (bypass Mongoose casting)
    const images = await imagesCollection.find({}).toArray();
    const categoryStrings = [...new Set(images.map(img => img.category).filter(c => typeof c === 'string'))];
    
    // Check for images with no category
    const imagesWithNoCategory = images.filter(img => !img.category || img.category === '');
    if (imagesWithNoCategory.length > 0) {
      if (!categoryStrings.includes('Uncategorized')) {
        categoryStrings.push('Uncategorized');
      }
    }

    console.log(`Found ${categoryStrings.length} unique string categories:`, categoryStrings);
    console.log(`Found ${imagesWithNoCategory.length} images with no category.`);

    for (const catName of categoryStrings) {
      // 2. Create Category document if it doesn't exist
      const slug = catName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      let category = await Category.findOne({ slug });
      
      if (!category) {
        category = new Category({ name: catName, slug });
        await category.save();
        console.log(`Created new Category: ${catName}`);
      }

      // 3. Update all images with this string category or no category to use the new ObjectId
      if (catName === 'Uncategorized') {
        const result = await imagesCollection.updateMany(
          { $or: [{ category: catName }, { category: { $exists: false } }, { category: null }, { category: '' }] },
          { $set: { category: category._id } }
        );
        console.log(`Updated ${result.modifiedCount} images to Uncategorized.`);
      } else {
        const result = await imagesCollection.updateMany(
          { category: catName },
          { $set: { category: category._id } }
        );
        console.log(`Updated ${result.modifiedCount} images for category: ${catName}`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
