const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');

console.log('✅ adminRoutes.js is loaded');
router.get('/total-users', async (req, res) => {
  console.log('📩 /api/admin/total-users route was called');

  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error fetching total users:', err);
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});
router.get('/total-quizzes', async (req, res) => {
  try {
    const count = await Quiz.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error fetching total quizzes:', err);
    res.status(500).json({ error: 'Failed to fetch quiz count' });
  }
});

// ✅ GET /api/admin/users?role=Admin|Student
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role && ['Admin', 'Student'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter, 'fName lName email role');

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(), // map _id to id for frontend use
      name: `${user.fName || ''} ${user.lName || ''}`.trim() || 'Unnamed',
      email: user.email,
      role: user.role,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error('Error fetching user list:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
