const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch'); // Need to use fetch or http

async function testUpload() {
  try {
    const form = new FormData();
    // we need a dummy pdf
    fs.writeFileSync('dummy.pdf', 'dummy content');
    form.append('resumePdf', fs.createReadStream('dummy.pdf'));
    form.append('jdText', 'Test Job Description looking for Node.js developer');
    
    console.log('Sending request...');
    const response = await fetch('http://localhost:5001/api/resume/analyze', {
      method: 'POST',
      body: form
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testUpload();
