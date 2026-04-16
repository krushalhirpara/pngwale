const jwt = require('jsonwebtoken');
const fs = require('fs');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      fs.appendFileSync('debug.log', `[${new Date().toISOString()}] AUTH: No token provided\n`);
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      fs.appendFileSync('debug.log', `[${new Date().toISOString()}] AUTH: Verification failed\n`);
      return res.status(401).json({ success: false, message: 'Token verification failed, authorization denied' });
    }

    req.user = verified.id;
    next();
  } catch (err) {
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] AUTH ERROR: ${err.message}\n`);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = auth;
