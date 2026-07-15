import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Shield, Loader2, ArrowLeft } from 'lucide-react';
import './AdminLogin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
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
      console.error('Login error:', err);
      setError('Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div className="login-glow-orb orb-1" />
      <div className="login-glow-orb orb-2" />

      <div className="glass-panel" style={{ display: 'flex', maxWidth: '850px', width: '90%', padding: 0, overflow: 'hidden', zIndex: 1, position: 'relative' }}>
        {/* Left Side AI Graphics Panel */}
        <div style={{ flex: 1, background: 'url(/admin_ai.png) center / cover', minHeight: '500px' }} className="admin-ai-panel">
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(0, 210, 200, 0.2), rgba(139, 92, 246, 0.2))', backdropFilter: 'sepia(10%)' }} />
        </div>
        
        {/* Right Side Form Panel */}
        <div style={{ flex: 1, padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="login-header">
            <div className="login-icon" style={{ margin: '0 auto 1rem' }}>
              <Shield size={32} />
            </div>
            <h1 className="heading-md" style={{ marginBottom: '0.25rem' }}>Admin Portal</h1>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Secure access to the neural network</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                  autoComplete="current-password"
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

            {error && (
              <div className="login-error">
                <span>⚠️ {error}</span>
              </div>
            )}

            <button type="submit" className="primary-btn login-submit-btn" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? <><Loader2 size={18} className="spin" /> Authenticating...</> : 'Initialize Session'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
