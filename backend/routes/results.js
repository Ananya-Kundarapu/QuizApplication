const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');

router.post('/:quizId/submit', auth, async (req, res) => {
  const { answers, duration } = req.body; 
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const existingResult = await Result.findOne({ userId: req.user.id, quizId: quiz._id });
    if (existingResult) return res.status(403).json({ message: 'You have already submitted this quiz' });

    let score = 0;
    const evaluatedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question.correctAnswer === answer.selectedOption;
      if (isCorrect) score++;
      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    });

    const result = new Result({
      userId: req.user.id,
      quizId: quiz._id,
      answers: evaluatedAnswers,
      score,
      duration,
    });

    await result.save();

    // Save quiz attempt info in User document
    const user = await User.findById(req.user.id);
    user.quizAttempts.push({
      quizId: quiz._id,
      score,
      total: quiz.questions.length,
      submittedAt: new Date()
    });
    await user.save();

    res.json({ message: 'Quiz submitted', result: { score, total: quiz.questions.length } });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:quizId/result', auth, async (req, res) => {
  try {
    const result = await Result.findOne({ userId: req.user.id, quizId: req.params.quizId })
      .populate('quizId')
      .populate('answers.questionId');
    if (!result) return res.status(404).json({ message: 'Result not found' });

    res.json(result);
  } catch (error) {
    console.error('Result retrieval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:quizId/analytics', auth, async (req, res) => {
  try {
    const results = await Result.find({ quizId: req.params.quizId });
    const totalSubmissions = results.length;
    const averageScore = totalSubmissions ? results.reduce((sum, r) => sum + r.score, 0) / totalSubmissions : 0;
    const averageDuration = totalSubmissions ? results.reduce((sum, r) => sum + r.duration, 0) / totalSubmissions : 0;

    res.json({ totalSubmissions, averageScore, averageDuration });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
