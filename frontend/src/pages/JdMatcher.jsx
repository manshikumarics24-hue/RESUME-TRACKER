import React, { useState } from 'react';
import { Target, Search, UploadCloud, FileText, Zap, UserCircle, Bot, RefreshCw } from 'lucide-react';
import './JdMatcher.css';

export default function JdMatcher() {
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [email, setEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! Upload your resume and paste a Job Description. I'll instantly analyze your profile against the job and give you feedback!" }
  ]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!resumeFile || !jdText.trim()) return;
    
    setIsAnalyzing(true);
    setChatMessages(prev => [...prev, { role: 'user', text: `Please analyze my resume (${resumeFile.name}) against the provided JD.` }]);

    const formData = new FormData();
    formData.append('resumePdf', resumeFile);
    formData.append('jdText', jdText);
    if (email) formData.append('email', email);
    if (candidateName) formData.append('candidateName', candidateName);
    if (phone) formData.append('phone', phone);

    const API_BASE = 'http://127.0.0.1:5001';
    try {
      const response = await fetch(`${API_BASE}/api/resume/analyze`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        const aiResponse = data.data;
        const matchedJobs = aiResponse.suitableJobs ? aiResponse.suitableJobs.join(', ') : '';
        const missingSkills = aiResponse.skillsToWorkOn ? aiResponse.skillsToWorkOn.join('\n- ') : '';
        
        const msg = `Based on the analysis:\n\n✅ Suitable roles for you: ${matchedJobs}\n\n⚠️ Skills you need to work on:\n- ${missingSkills}\n\n📝 Detailed Feedback:\n${aiResponse.feedbackText || 'No feedback provided'}\n\nOverall Match Score: ${aiResponse.matchScore || 'N/A'}%`;
        setChatMessages(prev => [...prev, { role: 'ai', text: msg }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: `Error: ${data.error || 'Server failed to return an analysis.'}` }]);
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'ai', text: `Network Error (${error.message}). Make sure your Backend is running on port 5001 and check the backend terminal for crashes.` }]);
    }
    
    setIsAnalyzing(false);
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="heading-lg">Unified Job Matcher</h1>
          <p className="text-muted">Upload your resume and paste a Job Description for instant AI-driven profile analysis.</p>
        </div>
      </header>

      <div className="matcher-unified-container fade-in" style={{ animationDelay: '0.2s' }}>
        
        {/* Left Side: Inputs */}
        <div className="matcher-main">
          
          <div className="matcher-inputs-glass glass-panel" style={{ padding: '2rem' }}>
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <UploadCloud size={20} className="text-blue" /> 1. Upload Resume
            </h3>
            
            <div className="upload-zone" style={{ border: '2px dashed var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', transition: 'var(--transition)' }}>
              <input 
                type="file" 
                onChange={handleFileSelect} 
                className="file-input" 
                id="resumeUpload"
                accept=".pdf"
                style={{ display: 'none' }}
              />
              <label htmlFor="resumeUpload" style={{ cursor: 'pointer', display: 'block' }}>
                {resumeFile ? (
                  <div className="fade-in">
                    <FileText size={48} className="text-blue" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))' }} />
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{resumeFile.name}</h4>
                    <p className="text-muted">Click to swap file</p>
                  </div>
                ) : (
                  <div className="fade-in">
                    <UploadCloud size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>Click to browse Resume</h4>
                    <p className="text-muted">PDF format recommended</p>
                  </div>
                )}
              </label>
            </div>

            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2.5rem 0 1rem' }}>
              <UserCircle size={20} className="text-purple" /> 2. Candidate Context
            </h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Candidate Name" value={candidateName} onChange={e => setCandidateName(e.target.value)} className="textarea-unified glass-panel" style={{ minHeight: '50px', padding: '1rem', flex: 1, minWidth: '160px' }} />
              <input type="email" placeholder="Email (for PDF Report)" value={email} onChange={e => setEmail(e.target.value)} className="textarea-unified glass-panel" style={{ minHeight: '50px', padding: '1rem', flex: 1, minWidth: '160px' }} />
              <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="textarea-unified glass-panel" style={{ minHeight: '50px', padding: '1rem', flex: 1, minWidth: '140px' }} />
            </div>

            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2.5rem 0 1rem' }}>
              <Target size={20} className="text-blue" /> 3. Job Description
            </h3>

            <textarea 
              className="textarea-unified glass-panel" 
              placeholder="Paste the Job Description text here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              style={{ minHeight: '200px', width: '100%', padding: '1.5rem', fontSize: '0.95rem' }}
            ></textarea>

            <button 
              className={`primary-btn ${(!resumeFile || !jdText.trim() || isAnalyzing) ? 'disabled' : ''}`}
              style={{ marginTop: '2.5rem', width: '100%', padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center' }}
              onClick={startAnalysis}
              disabled={!resumeFile || !jdText.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <><RefreshCw size={20} className="spin" /> AI is calculating match...</>
              ) : (
                <><Zap size={20} /> Run Unified Match Analysis</>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: AI Assistant Chat */}
        <div className="ai-sidebar glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="ai-chat-header">
            <Bot size={24} className="text-blue" />
            <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>AI RECRUITMENT ASSISTANT</span>
          </div>
          <div className="ai-chat-body" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'} fade-in`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {msg.role === 'ai' ? <Bot size={14} className="text-blue" /> : <UserCircle size={14} className="text-purple" />}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>{msg.role === 'ai' ? 'CareerTrack AI' : 'Owner'}</span>
                </div>
                <div style={{ 
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>{msg.text}</div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="ai-bubble fade-in">
                <div className="loader spin" style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
