const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const { nanoid } = require('nanoid');

router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, timeLimit, questions, branches, creatorEmail } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    const quiz = new Quiz({
      title,
      description,
      timeLimit,
      code: nanoid(6).toUpperCase(),
      createdBy: req.user.id,
      creatorEmail: creatorEmail || req.user.email,
      branches: branches && branches.length ? branches : ['All'], 
      isPublished: true,
    });

    await quiz.save();

    const questionPromises = questions.map((q) => {
      const question = new Question({
        quizId: quiz._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        image: q.image || null,
      });
      return question.save();
    });

    await Promise.all(questionPromises);

    res.status(201).json({ message: 'Quiz created and published successfully', quiz });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/branch-quizzes/:branch', async (req, res) => {
  try {
    const branch = req.params.branch;
    const quizzes = await Quiz.find({
      branches: { $in: [branch, 'All'] }, 
      isPublished: true,
    }).populate('questions');
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-quizzes', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quizId: quiz._id });
    res.json({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      branches: quiz.branches, 
      creatorEmail: quiz.creatorEmail,
      questions: questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        image: q.image,
      })),
    });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, timeLimit, questions, branches, creatorEmail } = req.body;
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to edit this quiz' });
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.timeLimit = timeLimit || quiz.timeLimit;
    quiz.branches = branches && branches.length ? branches : ['All']; 
    quiz.creatorEmail = creatorEmail || quiz.creatorEmail;

    await quiz.save();

    await Question.deleteMany({ quizId: quiz._id });

    const questionPromises = questions.map((q) => {
      const question = new Question({
        quizId: quiz._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        image: q.image || null,
      });
      return question.save();
    });

    await Promise.all(questionPromises);

    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to unpublish this quiz' });
    }
    quiz.isPublished = false;
    await quiz.save();
    res.json({ message: 'Quiz unpublished successfully', quiz });
  } catch (err) {
    console.error('Error unpublishing quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to publish this quiz' });
    }
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();
    res.json({ message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`, quiz });
  } catch (err) {
    console.error('Error toggling publish status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;