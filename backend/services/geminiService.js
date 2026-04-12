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
  const prompt = `You are CareerTrack AI — a specialized hiring intelligence system built exclusively for technical recruiters and career coaches. Unlike general-purpose AI tools, you are purpose-built to deeply understand job-candidate fit and translate complex resume data into clear, actionable hiring decisions.

Analyze the candidate's resume against the provided Job Description. Your goal is to give the recruiter an honest, detailed, and easy-to-understand breakdown — written in simple, plain English as if you were explaining it to a friend.

VERY IMPORTANT OUTPUT RULES:
- Return ONLY a valid JSON object. No markdown, no backticks, no extra text outside the JSON.
- The "feedbackText" field MUST be written in simple, friendly English. Structure it clearly with these 4 sections inside the text (label each section):
  ✅ Overall Verdict: One sentence on whether this candidate is a strong fit or not.
  💪 What They're Great At: 2-3 specific strengths from the resume that match this role.
  📈 Where They Need to Grow: 2-3 honest gaps or missing skills for this role.
  🎯 Our Recommendation: A clear final hiring suggestion (e.g., "Move to interview round", "Shortlist for junior role", "Not recommended for this role").
- Keep feedbackText to 4 short paragraphs (one per section above). Use plain language a hiring manager can read in 30 seconds.
- The "skills" array should capture ALL key skills from the resume with a proficiency score from 0-100 based on evidence in the resume.

Return this exact JSON format:
{
  "matchScore": 85,
  "suitableJobs": ["Best Role Title 1", "Best Role Title 2", "Best Role Title 3"],
  "skillsToWorkOn": ["Missing Skill 1", "Missing Skill 2", "Missing Skill 3"],
  "feedbackText": "✅ Overall Verdict: ... 💪 What They're Great At: ... 📈 Where They Need to Grow: ... 🎯 Our Recommendation: ...",
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
