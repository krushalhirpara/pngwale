require('dotenv').config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
console.log("DEPLOY TEST");

const app = express();

// Logging middleware
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  fs.appendFileSync('debug.log', logMsg);
  next();
});

// Upload folder create
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, '../dist')));

// app.get('/*path', (req, res) => {
//   res.sendFile(path.join(__dirname, '../dist/index.html'));
// });

// Routes
app.use('/api', require('./routes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// React fallback
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// MongoDB connect
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    // ✅ ONLY ONE listen here
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo Error:", err);
    process.exit(1);
  });

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: err.message,
  });
});