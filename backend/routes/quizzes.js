const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { nanoid } = require('nanoid');

router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, timeLimit, questions, branches, branch, image } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }

    let resolvedBranches = ['All'];
    if (Array.isArray(branches) && branches.length > 0) {
      resolvedBranches = branches;
    } else if (Array.isArray(branch) && branch.length > 0) {
      resolvedBranches = branch;
    } else if (typeof branch === 'string' && branch.trim()) {
      resolvedBranches = [branch.trim()];
    }

    const newQuiz = new Quiz({
      title,
      description,
      timeLimit,
      code: nanoid(6).toUpperCase(),
      createdBy: req.user.id,
      creatorEmail: req.user.email,
      branches: resolvedBranches,
      image: image || '/defaultlive.jpg',
      isPublished: true,
    });

    await newQuiz.save();

    const savedQuestions = await Promise.all(
      questions.map((q) => {
        const newQuestion = new Question({
          quizId: newQuiz._id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          image: q.image || null,
        });
        return newQuestion.save();
      })
    );

    newQuiz.questions = savedQuestions.map((q) => q._id);
    await newQuiz.save();

    const fullQuiz = await Quiz.findById(newQuiz._id).populate('questions');

    res.status(201).json({ message: 'Quiz created successfully', quiz: fullQuiz });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all live quizzes (for students)
router.get('/live', auth, async (req, res) => {
  try {
    const studentBranch = req.user.branch;

    if (!studentBranch) {
      return res.status(400).json({ message: 'Student branch not specified' });
    }

    const quizzes = await Quiz.find({
  $or: [
    { branches: { $in: [studentBranch, 'All'] } },
    { branches: { $size: 0 } },
  ],
  isPublished: true,
})
.populate('questions') // ✅ add this
.sort({ createdAt: -1 });

const formatted = quizzes.map((quiz) => ({
  _id: quiz._id,
  code: quiz.code,
  name: quiz.title,
  description: quiz.description,
  timeLimit: quiz.timeLimit,
  image: quiz.image || '/defaultlive.jpg',
  questions: quiz.questions,
}));

res.json(formatted);

  } catch (err) {
    console.error('Error fetching live quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all quizzes created by current user
router.get('/my-quizzes', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error('Error fetching user quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz details by ID (for editing)
router.get('/:quizId', auth, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.user.id });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or access denied' });
    }

    const questions = await Question.find({ quizId: quiz._id });
    res.json({ ...quiz._doc, questions });
  } catch (err) {
    console.error('Error fetching quiz details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
