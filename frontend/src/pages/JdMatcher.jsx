import React, { useState } from 'react';
import { Target, Search, UploadCloud, FileText, Zap, UserCircle, Bot } from 'lucide-react';
import './JdMatcher.css';

export default function JdMatcher() {
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [email, setEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
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

    try {
      const response = await fetch('http://localhost:5001/api/resume/analyze', {
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
      setChatMessages(prev => [...prev, { role: 'ai', text: "Network error. Make sure your local Backend server is running on port 5001." }]);
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

      <div className="matcher-unified-container">
        
        {/* Left Side: Inputs */}
        <div className="matcher-main">
          
          <div className="matcher-inputs-glass">
            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <UploadCloud size={20} className="text-blue" /> 1. Upload Resume
            </h3>
            
            <div className="upload-zone">
              <input 
                type="file" 
                onChange={handleFileSelect} 
                className="file-input" 
                id="resumeUpload"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              <label htmlFor="resumeUpload" style={{ cursor: 'pointer', display: 'block' }}>
                {resumeFile ? (
                  <div>
                    <FileText size={40} className="text-success" style={{ margin: '0 auto 1rem' }} />
                    <h4 style={{ color: '#fff' }}>{resumeFile.name}</h4>
                    <p className="text-muted">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={40} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                    <h4 style={{ color: '#fff' }}>Click to browse or Drag & Drop</h4>
                    <p className="text-muted">PDF, DOCX formats supported</p>
                  </div>
                )}
              </label>
            </div>

            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1rem' }}>
              <UserCircle size={20} className="text-success" /> 2. Details (Required for Email Report)
            </h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Candidate Name" value={candidateName} onChange={e => setCandidateName(e.target.value)} className="textarea-unified" style={{ minHeight: '50px', padding: '0.75rem', flex: 1 }} />
              <input type="email" placeholder="Email to receive PDF" value={email} onChange={e => setEmail(e.target.value)} className="textarea-unified" style={{ minHeight: '50px', padding: '0.75rem', flex: 1 }} />
            </div>

            <h3 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1rem' }}>
              <Target size={20} className="text-purple" /> 3. Job Description
            </h3>

            <textarea 
              className="textarea-unified" 
              placeholder="Paste the Job Description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            ></textarea>

            <button 
              className={`primary-btn ${(!resumeFile || !jdText.trim() || isAnalyzing) ? 'disabled' : ''}`}
              style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center' }}
              onClick={startAnalysis}
              disabled={!resumeFile || !jdText.trim() || isAnalyzing}
            >
              {isAnalyzing ? "AI is analyzing..." : <><Zap size={18} /> Analyze Profile & Match Jobs</>}
            </button>
          </div>
        </div>

        {/* Right Side: AI Assistant Chat */}
        <div className="ai-sidebar">
          <div className="ai-chat-header">
            <Bot size={24} className="text-blue" />
            <span>AI Career Assistant</span>
          </div>
          <div className="ai-chat-body">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                  {msg.role === 'ai' ? <Bot size={16} /> : <UserCircle size={16} />}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{msg.role === 'ai' ? 'Assistant' : 'You'}</span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="ai-bubble">
                <div className="loader spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
