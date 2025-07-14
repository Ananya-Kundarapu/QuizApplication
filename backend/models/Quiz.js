const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timeLimit: { type: Number, required: true },
  branches: [{ type: String, required: true }], // Used for branch filtering
  image: { type: String }, // Optional image URL or base64
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ fix: ObjectId
  creatorEmail: { type: String }, // ✅ add: for display use only
  isPublished: { type: Boolean, default: false },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);
