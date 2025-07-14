const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number },
    isCorrect: { type: Boolean }
  }],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  duration: { type: Number, required: true } // In seconds
});

module.exports = mongoose.model('Result', resultSchema);
