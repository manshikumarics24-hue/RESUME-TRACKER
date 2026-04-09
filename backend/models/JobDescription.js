const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  rawText: {
    type: String,
    required: true,
  },
  requiredSkills: [
    {
      name: { type: String, required: true },
      weight: { type: Number, required: true }, // e.g., 1.0 for required, 0.5 for nice-to-have
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
