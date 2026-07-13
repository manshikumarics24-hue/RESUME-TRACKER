const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      default: '',
    },
    rawText: {
      type: String,
      required: true,
    },
    skills: [
      {
        name: { type: String, required: true },
        score: { type: Number, required: true },
      },
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
    status: {
      type: String,
      enum: ['Pending', 'Selected', 'Not Selected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
