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

    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array, useSystemFonts: true });
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
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Title
      doc.fontSize(24).fillColor('#3b82f6').text('CareerTrack AI Analysis Report', { align: 'center' });
      doc.moveDown();
      
      // Candidate Info
      doc.fontSize(14).fillColor('#000').text(`Candidate:`, { continued: true }).fillColor('#555').text(` ${candidateName}`);
      doc.fontSize(14).fillColor('#000').text(`Match Score:`, { continued: true }).fillColor(analysisData.matchScore > 70 ? 'green' : 'red').text(` ${analysisData.matchScore}%`);
      doc.moveDown(2);

      // Suitable Jobs
      doc.fontSize(16).fillColor('#3b82f6').text('Suitable Positions');
      doc.fontSize(12).fillColor('#333').text(analysisData.suitableJobs.join(', '));
      doc.moveDown();

      // Areas for improvement
      doc.fontSize(16).fillColor('#f59e0b').text('Skills to Work On');
      doc.fontSize(12).fillColor('#333');
      analysisData.skillsToWorkOn.forEach(skill => doc.text(`• ${skill}`));
      doc.moveDown();

      // Detailed Feedback Text
      doc.fontSize(16).fillColor('#10b981').text('Detailed AI Feedback');
      doc.fontSize(11).fillColor('#444').text(analysisData.feedbackText, { align: 'justify' });
      doc.moveDown(2);

      // Raw JSON attach
      doc.fontSize(16).fillColor('#8b5cf6').text('Raw JSON Data');
      doc.fontSize(9).fillColor('#666').text(JSON.stringify(analysisData, null, 2));

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
