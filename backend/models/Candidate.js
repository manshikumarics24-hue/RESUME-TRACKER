const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false, // Optional for MVP, you might want to extract this later
  },
  email: {
    type: String,
    required: false,
  },
  rawText: {
    type: String,
    required: true,
  },
  skills: [
    {
      name: { type: String, required: true },
      score: { type: Number, required: true },
    }
  ],
  jobDescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: false,
  },
  matchPercentage: {
    type: Number,
    default: 0,
  },
  feedbackText: {
    type: String,
    default: '',
  },
  suitableJobs: {
    type: [String],
    default: [],
  },
  skillsToWorkOn: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
