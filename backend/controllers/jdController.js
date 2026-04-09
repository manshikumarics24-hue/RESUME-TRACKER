const JobDescription = require('../models/JobDescription');
const { extractJDSkills } = require('../services/claudeService');

/**
 * Upload a new job description, let Claude parse it into skills, and save to DB
 */
exports.createJD = async (req, res) => {
  try {
    const { title, rawText } = req.body;
    
    if (!title || !rawText) {
       return res.status(400).json({ error: 'Title and rawText are required' });
    }

    // Call service to get skills via Claude API
    const extractedSkills = await extractJDSkills(rawText);

    // Save strictly to DB
    const newJD = new JobDescription({
      title,
      rawText,
      requiredSkills: extractedSkills
    });

    await newJD.save();

    res.status(201).json({ 
      success: true, 
      message: 'Job Description saved and parsed successfully.', 
      data: newJD 
    });

  } catch (error) {
    console.error('Error creating JD:', error);
    res.status(500).json({ error: 'Internal server error while creating JD' });
  }
};

/**
 * Get all Job Descriptions
 */
exports.getJDs = async (req, res) => {
  try {
    const jds = await JobDescription.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jds });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get single Job Description
 */
exports.getJDById = async (req, res) => {
  try {
    const jd = await JobDescription.findById(req.params.id);
    if (!jd) {
      return res.status(404).json({ error: 'Job Description not found' });
    }
    res.status(200).json({ success: true, data: jd });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
