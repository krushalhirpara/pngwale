require('dotenv').config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// 1. TOP-LEVEL LOGGING (Before any other middleware)
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url} (Type: ${req.header('Content-Type')})\n`;
  fs.appendFileSync('debug.log', logMsg);
  next();
});

// Create uploads directory if not exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api', require('./routes.js'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Catch-all route to serve React's index.html
app.get('/*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pngwale';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Connected to MongoDB\n`);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] MongoDB Error: ${err.message}\n`);
    process.exit(1);
  });

// Global Error Handling
app.use((err, req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] GLOBAL ERROR: ${err.message}\nStack: ${err.stack}\n`;
  fs.appendFileSync('debug.log', logMsg);
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message, stack: err.stack });
});
