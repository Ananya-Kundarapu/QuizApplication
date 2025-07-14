const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// ✅ Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update current user profile
router.patch('/profile', auth, async (req, res) => {
  const { name, phone, role, profilePic } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.profilePic = profilePic || user.profilePic;
    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get quiz history of current user
router.get('/quiz-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('quizAttempts.quizId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.quizAttempts);
  } catch (error) {
    console.error('Quiz history fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all users by role (Student or Admin)
router.get('/', async (req, res) => {
  const { role } = req.query;

  if (!role || !['Student', 'Admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const users = await User.find({ role });

    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users);
  } catch (err) {
    console.error('Error fetching users by role:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ✅ Delete user by ID (protected & self-delete prevented)
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 🚫 Prevent self-deletion
    if (req.user.id === id) {
      return res.status(403).json({ message: 'You cannot delete yourself.' });
    }

    console.log('🔴 Deleting user with ID:', id);
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
