const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ==============================
// Setup multer for profile pic uploads
// ==============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// ==============================
// Register Route
// ==============================
router.post('/register', async (req, res) => {
  const {
    fName,
    lName,
    email,
    password,
    phone,
    country,
    role,
    profilePic,
    branch,
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedBranch = branch?.toUpperCase();

    user = new User({
      fName,
      lName,
      email,
      password: hashedPassword,
      phone,
      country,
      role: role || 'Student',
      profilePic: profilePic || '/profile.png',
      branch: normalizedBranch,
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        branch: normalizedBranch,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      user: formatUser(user),
      token,
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// Login Route
// ==============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found. Please sign up.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        branch: user.branch?.toUpperCase(),
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      user: formatUser(user),
      token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// Validate Token - Get /me
// ==============================
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
});

// ==============================
// Profile Picture Upload
// ==============================
router.post('/upload-profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { profilePic: url });

    res.json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Profile picture upload failed' });
  }
});

// ==============================
// Logout (JWT based apps usually do this client-side)
// ==============================
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' }); // token just expires on client
});

// ==============================
// Check if Email Exists
// ==============================
router.post('/check', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    console.error('Check Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// Helper
// ==============================
function formatUser(user) {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    fName: user.fName,
    lName: user.lName,
    phone: user.phone,
    country: user.country,
    profilePic: user.profilePic,
    branch: user.branch,
  };
}

module.exports = router;
