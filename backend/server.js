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

// ❌ REMOVE dist static (Railway ma build nathi)
// app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api', require('./routes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
  res.send("Server is working ✅");
});

// MongoDB connect
const PORT = process.env.PORT; // ✅ IMPORTANT
const MONGO_URI = process.env.MONGO_URI;

if (!PORT) {
  console.error("PORT not defined");
  process.exit(1);
}

if (!MONGO_URI) {
  console.error("MONGO_URI not defined");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
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