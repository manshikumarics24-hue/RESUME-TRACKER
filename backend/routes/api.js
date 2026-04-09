const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for memory storage (we just pass buffer to parse)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const jdController = require('../controllers/jdController');
const resumeController = require('../controllers/resumeController');

// --- JD Routes ---
// POST /api/jd - Upload a Job Description text and extract skills
router.post('/jd', jdController.createJD);

// GET /api/jd - List all JDs
router.get('/jd', jdController.getJDs);

// GET /api/jd/:id - Get a specific JD
router.get('/jd/:id', jdController.getJDById);


// --- Resume Routes ---
// POST /api/resume - Upload PDF resume, extract skills, and score against JD
router.post('/resume', upload.single('resumePdf'), resumeController.uploadResume);

// POST /api/resume/analyze - Unified analysis with JD text & email reporting
router.post('/resume/analyze', upload.single('resumePdf'), resumeController.unifiedAnalyze);

// GET /api/candidates/:jdId - Get all candidates scored for a specific JD
router.get('/candidates/:jdId', resumeController.getCandidatesByJD);

// GET /api/candidates - Get ALL candidates sorted by score
router.get('/candidates', resumeController.getAllCandidates);

module.exports = router;
