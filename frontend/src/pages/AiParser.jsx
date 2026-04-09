import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle, RefreshCw } from 'lucide-react';
import './AiParser.css';

export default function AiParser() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    const fileData = newFiles.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      status: 'Ready',
      id: Math.random().toString(36).substr(2, 9)
    }));
    setFiles([...files, ...fileData]);
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const startAnalysis = () => {
    setIsParsing(true);
    // Simulate parsing delay
    setTimeout(() => {
      setFiles(files.map(f => ({ ...f, status: 'Parsed Successfully' })));
      setIsParsing(false);
    }, 2500);
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1 className="heading-lg">AI Resume Parser</h1>
          <p className="text-muted">Batch upload candidate resumes for automated skill extraction.</p>
        </div>
      </header>

      <div className="parser-grid">
        <div className="upload-section">
          <div 
            className={`drop-zone glass-panel ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileSelect} 
              className="file-input" 
              id="fileInput"
              accept=".pdf,.doc,.docx"
            />
            <label htmlFor="fileInput" className="drop-label">
              <UploadCloud size={56} className="upload-icon" />
              <h3>Drag & Drop Resumes Here</h3>
              <p className="text-muted" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Works with PDF, DOCX (up to 10MB)</p>
              <div className="browse-btn">Browse Files</div>
            </label>
          </div>
        </div>

        <div className="files-section glass-panel">
          <div className="section-header">
            <h3 className="heading-md">Uploaded Queue ({files.length})</h3>
            <button 
              className={`primary-btn process-btn ${files.length === 0 || isParsing ? 'disabled' : ''}`}
              onClick={startAnalysis}
              disabled={files.length === 0 || isParsing}
            >
              {isParsing ? (
                <><RefreshCw size={18} className="spin" /> Parsing Resumes...</>
              ) : (
                'Extract Data using AI'
              )}
            </button>
          </div>

          <div className="files-list">
            {files.length === 0 ? (
              <div className="empty-state">
                <File size={48} className="text-muted" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p className="text-muted">No resumes queued for parsing.</p>
              </div>
            ) : (
              files.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon-wrapper">
                      <File size={20} className="file-icon" />
                    </div>
                    <div className="file-details">
                      <p className="file-name">{file.name}</p>
                      <p className={`file-meta ${file.status === 'Parsed Successfully' ? 'success' : ''}`}>
                        {file.size} • {file.status}
                      </p>
                    </div>
                  </div>
                  <div className="file-actions">
                    {file.status === 'Parsed Successfully' ? (
                      <CheckCircle size={20} className="status-icon success" />
                    ) : (
                      <button className="icon-btn" onClick={() => removeFile(file.id)}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
