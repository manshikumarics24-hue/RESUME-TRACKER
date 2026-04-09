const dotenv = require('dotenv');
dotenv.config();

// Use v1beta — confirmed via ListModels that this key supports Gemini 2.0 models
const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash'];
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in .env');

  for (const model of MODELS) {
    const response = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      })
    });

    if (response.status === 429) {
      console.log(`Model ${model} rate limited, trying next...`);
      continue;
    }
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    console.log(`✅ Used model: ${model}`);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  throw new Error('All Gemini models are currently rate limited. Please wait a minute and try again.');
};

const analyzeUnifiedProfile = async (resumeText, jdText) => {
  const prompt = `You are an expert technical recruiter and career coach.
Analyze the provided candidate's resume against the Job Description.

Return ONLY a valid JSON object in this exact format. 
IMPORTANT: Keep the "feedbackText" concise (max 2 paragraphs) to ensure the JSON does not get truncated.
Do NOT use Markdown format, backticks, or any text outside the JSON:
{
  "matchScore": 85,
  "suitableJobs": ["Title 1", "Title 2"],
  "skillsToWorkOn": ["Skill 1", "Skill 2"],
  "feedbackText": "A concise summary of why they matched, strengths, and gaps.",
  "skills": [
    { "name": "Skill Name", "score": 90 }
  ]
}

Resume Text:
${resumeText}

Job Description:
${jdText}`;

  try {
    let text = await callGemini(prompt);
    // Strip any accidental markdown code fences
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Safe parse: try directly first, then try to recover truncated JSON
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.warn('JSON parsing failed, attempting recovery...', parseErr.message);
      // Try to auto-close truncated JSON by finding the last complete field
      // We look for different possible truncation points
      let recoveryText = text;
      const lastPropertyEnd = recoveryText.lastIndexOf('"}');
      const lastArrayEnd = recoveryText.lastIndexOf(']}');
      
      const lastValidEnd = Math.max(lastPropertyEnd, lastArrayEnd);
      
      if (lastValidEnd !== -1) {
        recoveryText = recoveryText.substring(0, lastValidEnd + 2) + '}';
        try {
          return JSON.parse(recoveryText);
        } catch (e) {
          console.error('Recovery failed:', e.message);
        }
      }
      throw parseErr;
    }
  } catch (error) {
    console.error('Error in Gemini analysis:', error.message);
    throw new Error('Failed to process unified analysis with Google Gemini');
  }
};

const extractCandidateSkills = async (resumeText) => {
  return []; // Preserved for legacy routes
};

const extractJDSkills = async (jdText) => {
  const prompt = `Extract an array of required skills from this job description. Return JSON format strictly as an array of objects: [{"name": "Skill Name", "weight": 5}] where weight is 1-10 based on importance. No markdown or backticks. Job Description:\n${jdText}`;
  try {
    let text = await callGemini(prompt);
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error extracting JD skills:', error.message);
    return [];
  }
};

module.exports = {
  analyzeUnifiedProfile,
  extractCandidateSkills,
  extractJDSkills
};
