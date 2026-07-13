import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import './AdminLogin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminLogin() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    secretCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              secretCode: formData.secretCode,
            };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.');
        return;
      }

      // Save login
      login(json.token, json.admin);
      navigate('/admin');
    } catch (err) {
      setError('Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-glow-orb orb-1" />
      <div className="login-glow-orb orb-2" />

      <div className="login-card glass-panel">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon">
            <Shield size={32} />
          </div>
          <h1 className="heading-md" style={{ marginBottom: '0.25rem' }}>
            {mode === 'login' ? 'Admin Portal' : 'Admin Registration'}
          </h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            {mode === 'login'
              ? 'Sign in to access the recruitment dashboard'
              : 'Create admin account with your secret code'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="secretCode">Secret Registration Code</label>
              <div className="input-wrapper">
                <Shield size={16} className="input-icon" />
                <input
                  id="secretCode"
                  name="secretCode"
                  type="password"
                  placeholder="Enter the secret code"
                  value={formData.secretCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <span className="field-hint">Contact the system owner for this code.</span>
            </div>
          )}

          {error && (
            <div className="login-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <button type="submit" className="primary-btn login-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Admin Account'
            )}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? (
            <span>
              Need to create admin account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }}>
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }}>
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
