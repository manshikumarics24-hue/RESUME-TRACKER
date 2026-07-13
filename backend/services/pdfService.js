const path = require('path');
const PDFDocument = require('pdfkit');

const extractTextFromPDF = async (buffer) => {
  try {
    // pdfjs-dist is ESM-only - use dynamic import
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Point to the bundled worker file using its absolute file:// URL
    const workerPath = path.resolve(
      __dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath}`;

    const standardFontPath = path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts');
    const cMapPath = path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'cmaps');

    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array, 
      useSystemFonts: true,
      standardFontDataUrl: `file://${standardFontPath}/`,
      cMapUrl: `file://${cMapPath}/`,
      cMapPacked: true
    });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document');
  }
};

const generateAnalysisPDF = (analysisData, candidateName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4',
        bufferPages: true,
        info: { Title: 'CareerTrack AI Report', Author: 'CareerTrack AI' }
      });

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Header with Color Bar ---
      const brandColor = '#2563eb';
      const statusColor = analysisData.status === 'Selected' ? '#059669' : '#dc2626';

      // Draw brand header
      doc.rect(0, 0, doc.page.width, 100).fill(brandColor);
      doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('CAREERTRACK AI', 40, 35);
      doc.fontSize(10).font('Helvetica').text('INTELLIGENT RECRUITMENT ANALYSIS', 40, 65);

      // --- Candidate & Status Section ---
      doc.moveDown(4);
      doc.fillColor('#000000').fontSize(22).font('Helvetica-Bold').text(candidateName.toUpperCase());
      doc.moveDown(0.5);
      
      const currentY = doc.y;
      doc.rect(40, currentY, 515, 50).fill('#f8fafc'); // Full width background
      
      doc.fillColor('#334155').fontSize(11).font('Helvetica-Bold').text('SELECTION STATUS', 55, currentY + 18);
      doc.fillColor(statusColor).fontSize(14).font('Helvetica-Bold').text(analysisData.status.toUpperCase(), 180, currentY + 16);

      doc.fillColor('#334155').fontSize(11).font('Helvetica-Bold').text('MATCH SCORE', 340, currentY + 18);
      doc.fillColor(brandColor).fontSize(14).font('Helvetica-Bold').text(`${analysisData.matchScore}%`, 450, currentY + 16);

      doc.moveDown(4);

      // --- Suitable Positions ---
      doc.fillColor(brandColor).fontSize(16).font('Helvetica-Bold').text('Target Roles & Positions');
      doc.rect(40, doc.y + 2, 515, 1.5).fill(brandColor);
      doc.moveDown(1);
      
      doc.fillColor('#1e293b').fontSize(11).font('Helvetica').text(analysisData.suitableJobs.join('  •  '));
      doc.moveDown(2);

      // --- Skills to Work On ---
      doc.fillColor('#d97706').fontSize(16).font('Helvetica-Bold').text('Recommended Growth Areas');
      doc.rect(40, doc.y + 2, 515, 1.5).fill('#d97706');
      doc.moveDown(1);

      doc.fillColor('#1e293b').fontSize(11).font('Helvetica');
      if (analysisData.skillsToWorkOn && analysisData.skillsToWorkOn.length > 0) {
        analysisData.skillsToWorkOn.forEach(skill => {
          doc.text(`• ${skill}`);
        });
      } else {
        doc.text('No critical gaps identified for this role.');
      }
      doc.moveDown(2);

      // --- Feedback Text ---
      doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Recruiter Summary');
      doc.rect(40, doc.y + 2, 515, 1.5).fill('#0f172a');
      doc.moveDown(1);
      
      doc.fillColor('#475569').fontSize(11).font('Helvetica').text(analysisData.feedbackText, { align: 'justify', lineGap: 3 });
      doc.moveDown(2);

      // --- Technical Skills Breakdown ---
      if (doc.y > 600) doc.addPage(); // Prevent header-only page at bottom

      doc.fillColor(brandColor).fontSize(16).font('Helvetica-Bold').text('Technical Skill Assessment');
      doc.rect(40, doc.y + 2, 515, 1.5).fill(brandColor);
      doc.moveDown(1.5);

      if (analysisData.skills && analysisData.skills.length > 0) {
        analysisData.skills.forEach((s) => {
          // Check for page break
          if (doc.y > 750) doc.addPage();
          
          const y = doc.y;
          doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text(s.name, 50, y);
          
          // Progress bar
          const barWidth = 200;
          doc.rect(200, y - 2, barWidth, 8).fill('#e2e8f0');
          doc.rect(200, y - 2, (s.score / 100) * barWidth, 8).fill(brandColor);
          
          doc.fillColor('#1e293b').fontSize(10).text(`${s.score}%`, 415, y);
          doc.moveDown(1.2);
        });
      }

      // --- Footer ---
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94a3b8').fontSize(8)
           .text(`CareerTrack AI Recruitment Report - Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 30, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  extractTextFromPDF,
  generateAnalysisPDF
};
