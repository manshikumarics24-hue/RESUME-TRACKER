const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Register a new admin (requires secret code)
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, secretCode } = req.body;

    // Validate required fields
    if (!name || !email || !password || !secretCode) {
      return res.status(400).json({ error: 'All fields are required: name, email, password, secretCode' });
    }

    // Check secret code
    const validCode = process.env.ADMIN_REGISTRATION_CODE;
    if (!validCode || secretCode !== validCode) {
      return res.status(403).json({ error: 'Invalid registration code. Contact the system owner.' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ error: 'An admin with this email already exists.' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Create admin (password hashed in model pre-save hook)
    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email, name: newAdmin.name, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully!',
      token,
      admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * Login as admin
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Get current admin profile (protected route)
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
