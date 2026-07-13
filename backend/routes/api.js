const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage (we just pass buffer to parse)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const jdController = require('../controllers/jdController');
const resumeController = require('../controllers/resumeController');

// --- JD Routes (protected — admin only) ---
router.post('/jd', protect, jdController.createJD);
router.get('/jd', protect, jdController.getJDs);
router.get('/jd/:id', protect, jdController.getJDById);

// --- Resume Routes ---
// Public route — candidates/anyone uploads their resume
router.post('/resume/analyze', upload.single('resumePdf'), resumeController.unifiedAnalyze);

// Admin only — score against stored JD
router.post('/resume', protect, upload.single('resumePdf'), resumeController.uploadResume);

// --- Candidate Routes ---
// Public — candidate searches for their own profile (by name/email)
router.get('/candidates/search', resumeController.searchCandidates);

// Admin only — get all candidates
router.get('/candidates', protect, resumeController.getAllCandidates);

// Admin only — get candidates by JD
router.get('/candidates/jd/:jdId', protect, resumeController.getCandidatesByJD);

// Admin only — update candidate status
router.patch('/candidates/:id/status', protect, resumeController.updateCandidateStatus);

// Admin only — delete candidate
router.delete('/candidates/:id', protect, resumeController.deleteCandidate);

module.exports = router;
