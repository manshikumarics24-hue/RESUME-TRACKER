const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS — allow localhost in dev, deployed frontend in prod
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Set this in Render dashboard
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'CareerTrack AI Backend is running 🚀', status: 'OK' });
});

// Health Check (for Render, uptime monitors)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test Email endpoint
app.get('/api/test-email', async (req, res) => {
  const { sendTestEmail } = require('./services/emailService');
  const toEmail = req.query.to || process.env.EMAIL_USER;
  const result = await sendTestEmail(toEmail);
  res.json(result);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER || 'Not configured'}`);
  console.log(`🤖 AI: Groq (${process.env.GROQ_API_KEY ? 'configured' : 'API KEY MISSING'})`);
});
