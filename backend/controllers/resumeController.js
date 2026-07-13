const Candidate = require('../models/Candidate');
const JobDescription = require('../models/JobDescription');
const { extractTextFromPDF, generateAnalysisPDF } = require('../services/pdfService');
const { extractCandidateSkills, analyzeUnifiedProfile } = require('../services/ollamaService');
const { sendAnalysisEmail } = require('../services/emailService');

/**
 * Upload and process a candidate's resume (PDF)
 */
exports.uploadResume = async (req, res) => {
  try {
    const { file } = req;
    const { email, candidateName, jobDescriptionId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Resume PDF missing' });
    }

    if (!jobDescriptionId) {
      return res.status(400).json({ error: 'JobDescriptionId is required to score the candidate' });
    }

    const jd = await JobDescription.findById(jobDescriptionId);
    if (!jd) return res.status(404).json({ error: 'Job description not found' });

    // Step 1: Extract Text
    const rawText = await extractTextFromPDF(file.buffer);

    // Step 2: Use Claude to extract skills
    const candidateSkills = await extractCandidateSkills(rawText);

    // Step 3: Run the Scoring Engine
    const matchPercentage = calculateMatchScore(candidateSkills, jd.requiredSkills);

    // Step 4: Save to DB
    const newCandidate = new Candidate({
      name: candidateName || 'Unknown Candidate',
      email: email || 'No email provided',
      rawText,
      skills: candidateSkills,
      jobDescriptionId,
      matchPercentage
    });

    await newCandidate.save();

    res.status(201).json({
      success: true,
      message: 'Resume parsed and scored successfully',
      data: newCandidate
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
};

/**
 * Scoring engine matching candidate skills vs JD requirements
 */
const calculateMatchScore = (candidateSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  
  let totalWeight = 0;
  let achievedScore = 0;

  requiredSkills.forEach(reqSkill => {
    totalWeight += reqSkill.weight;
    
    // Find matching candidate skill (simple lowercasing - Claude is pretty good at mapping names consistently)
    const match = candidateSkills.find(s => s.name.toLowerCase() === reqSkill.name.toLowerCase() 
                                    || reqSkill.name.toLowerCase().includes(s.name.toLowerCase()) 
                                    || s.name.toLowerCase().includes(reqSkill.name.toLowerCase()));

    if (match) {
      // Canditate skill score is typically 0-100. Let's normalize it to a multiplier up to 1.0 depending on confidence/score
      const skillMultiplier = match.score / 100; // e.g., 80 score -> 0.8
      
      // Calculate achieved score for this requirement based on JD weight
      achievedScore += (reqSkill.weight * skillMultiplier);
    } 
    // If no match found, dropping sharply is implicit as they score 0 for this parameter's weight
  });

  const finalPercentage = (achievedScore / totalWeight) * 100;
  // Cap it at 100 max
  return Math.min(Math.round(finalPercentage), 100);
};

/**
 * Fetch candidates by Job Description, ordered by Match %
 */
exports.getCandidatesByJD = async (req, res) => {
  try {
    const { jdId } = req.params;
    
    // DB sorted fetch
    const candidates = await Candidate.find({ jobDescriptionId: jdId })
                                      .sort({ matchPercentage: -1 });

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    console.error('Error getting candidates:', error);
    res.status(500).json({ error: 'Server error retrieving candidates' });
  }
};

/**
 * Perform Unified Analysis and Email PDF
 */
exports.unifiedAnalyze = async (req, res) => {
  try {
    const { file } = req;
    const { email, candidateName, jdText } = req.body;

    if (!file) return res.status(400).json({ error: 'Resume PDF missing' });
    if (!jdText) return res.status(400).json({ error: 'Job Description text is required' });

    // Step 1: Extract Text from Resume PDF
    const resumeText = await extractTextFromPDF(file.buffer);

    // Step 2: Use Claude for unified analysis combining resume + JD
    const analysisData = await analyzeUnifiedProfile(resumeText, jdText);

    // Step 3: Generate the visual PDF Report containing the output
    const pdfBuffer = await generateAnalysisPDF(analysisData, candidateName || 'Candidate');

    // Step 4: Save candidate to DB for pipeline tracking
    const newCandidate = new Candidate({
      name: candidateName || 'Unknown',
      email: email || '',
      rawText: resumeText,
      skills: analysisData.skills || [],
      matchPercentage: analysisData.matchScore || 0,
      status: analysisData.status || 'Pending',
      feedbackText: analysisData.feedbackText || '',
      suitableJobs: analysisData.suitableJobs || [],
      skillsToWorkOn: analysisData.skillsToWorkOn || []
    });
    await newCandidate.save();

    // Step 5: Email the PDF 
    if (email) {
      await sendAnalysisEmail(email, pdfBuffer, candidateName || 'Candidate', analysisData.status);
    }

    res.status(200).json({
      success: true,
      data: analysisData,
      message: email ? 'Analysis complete. Email sent with PDF.' : 'Analysis complete.'
    });
  } catch(error) {
    console.error('Unified analysis error:', error);
    res.status(500).json({ error: 'Internal Server Error during unified analysis' });
  }
};

// GET /api/candidates — list all candidates sorted by match score
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ matchPercentage: -1 });
    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving candidates' });
  }
};

// DELETE /api/candidates/:id — remove a candidate by ID
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Candidate.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Candidate not found' });
    res.status(200).json({ success: true, message: 'Candidate removed successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Server error deleting candidate' });
  }
};
