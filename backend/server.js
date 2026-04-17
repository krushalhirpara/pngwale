require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log("🚀 DEPLOY STARTED");

const app = express();

// ================= LOGGING =================
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  try {
    fs.appendFileSync('debug.log', logMsg);
  } catch (err) {
    console.log("Log write failed");
  }
  next();
});

// ================= UPLOAD DIR =================
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use('/api', require('./routes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ✅ ROOT TEST ROUTE (IMPORTANT)
app.get('/', (req, res) => {
  res.send("✅ Server is working");
});

// ================= ENV CHECK =================
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

if (!PORT) {
  console.error("❌ PORT not defined");
  process.exit(1);
}

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined");
  process.exit(1);
}

// ================= DB CONNECT =================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Mongo Error:", err);
    process.exit(1);
  });

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: err.message,
  });
});