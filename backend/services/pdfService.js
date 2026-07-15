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
        margin: 50,
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

      // Colors matching the UI theme
      const brandColor = '#00d2c8';
      const textColor = '#334155';
      const headingColor = '#0f172a';
      const statusColor = analysisData.status === 'Selected' ? '#10b981' : analysisData.status === 'Not Selected' ? '#ef4444' : '#f59e0b';

      // --- Header ---
      doc.rect(0, 0, doc.page.width, 110).fill('#0f172a');
      doc.fillColor(brandColor).fontSize(28).font('Helvetica-Bold').text('CAREERTRACK AI', 50, 35);
      doc.fillColor('#94a3b8').fontSize(11).font('Helvetica').text('Intelligent Candidate Analysis Report', 50, 70);

      doc.y = 140; // Move down below header

      // --- Candidate Name ---
      doc.fillColor(headingColor).fontSize(24).font('Helvetica-Bold').text(candidateName || 'Candidate Profile');
      doc.moveDown(0.8);

      // --- Summary Box ---
      const boxY = doc.y;
      doc.rect(50, boxY, 495, 60).fill('#f8fafc');
      doc.lineWidth(1).strokeColor('#e2e8f0').rect(50, boxY, 495, 60).stroke();

      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('SELECTION STATUS', 70, boxY + 16);
      doc.fillColor(statusColor).fontSize(16).font('Helvetica-Bold').text((analysisData.status || 'Pending').toUpperCase(), 70, boxY + 30);

      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('MATCH SCORE', 350, boxY + 16);
      doc.fillColor(brandColor).fontSize(16).font('Helvetica-Bold').text(`${analysisData.matchPercentage || analysisData.matchScore || 0}%`, 350, boxY + 30);

      doc.y = boxY + 90;

      // --- Suitable Roles ---
      doc.fillColor(headingColor).fontSize(14).font('Helvetica-Bold').text('TARGET ROLES & POSITIONS');
      doc.moveDown(0.5);
      doc.fillColor(brandColor).fontSize(11).font('Helvetica-Bold').text((analysisData.suitableJobs || []).join('   •   '));
      doc.moveDown(2);

      // --- Recruiter Summary ---
      doc.fillColor(headingColor).fontSize(14).font('Helvetica-Bold').text('AI RECRUITER SUMMARY');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(11).font('Helvetica').text(analysisData.feedbackText || 'No feedback provided.', {
        align: 'justify',
        lineGap: 4
      });
      doc.moveDown(2);

      // --- Growth Areas ---
      if (analysisData.skillsToWorkOn && analysisData.skillsToWorkOn.length > 0) {
        // Prevent orphaned header
        if (doc.page.height - doc.y < 100) doc.addPage();

        doc.fillColor(headingColor).fontSize(14).font('Helvetica-Bold').text('RECOMMENDED GROWTH AREAS');
        doc.moveDown(0.5);
        doc.fillColor(textColor).fontSize(11).font('Helvetica');
        analysisData.skillsToWorkOn.forEach(skill => {
          doc.text(`•  ${skill}`, { lineGap: 2 });
        });
        doc.moveDown(2);
      }

      // --- Technical Skills Assessment ---
      if (analysisData.skills && analysisData.skills.length > 0) {
        // Prevent orphaned header
        if (doc.page.height - doc.y < 150) doc.addPage();

        doc.fillColor(headingColor).fontSize(14).font('Helvetica-Bold').text('TECHNICAL SKILL ASSESSMENT');
        doc.moveDown(1);

        analysisData.skills.forEach((s) => {
          // Manual pagination for skill bars
          if (doc.page.height - doc.y < 50) {
            doc.addPage();
            doc.moveDown(1);
          }
          
          const y = doc.y;
          doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text(s.name, 50, y + 2);
          
          // Progress bar
          const barWidth = 250;
          const startX = 230;
          
          doc.rect(startX, y, barWidth, 12).fill('#f1f5f9');
          doc.rect(startX, y, (s.score / 100) * barWidth, 12).fill(brandColor);
          
          doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text(`${s.score}%`, startX + barWidth + 15, y + 2);
          doc.moveDown(1.5);
        });
      }

      // --- Footer ---
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#f8fafc');
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
           .text(`CareerTrack AI Recruitment Report  —  Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 25, { align: 'center' });
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
