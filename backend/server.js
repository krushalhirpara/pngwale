require('dotenv').config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

console.log("🚀 DEPLOY STARTED");

const app = express();

// IMPORTANT: Railway compatibility
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API ROUTES (pehla aa aavse)
app.use('/api', require('./routes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ✅ FRONTEND SERVE (IMPORTANT)
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Mongo Error:", err);
  });

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
});