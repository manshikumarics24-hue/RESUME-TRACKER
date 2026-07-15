const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Analyze a resume against a job description (unified profile analysis)
 */
const analyzeUnifiedProfile = async (resumeText, jdText, candidateName) => {
  try {
    const systemPrompt = `You are a highly critical, meticulous, and expert AI technical recruiter. Analyze the candidate's resume strictly against the provided job description.
CRITICAL INSTRUCTION: The candidate's name is "${candidateName || 'The Candidate'}". You MUST refer to them ONLY by this exact name in your summary, completely ignoring any other name printed inside the resume text itself.
DO NOT give generic scores. Be highly precise and meticulous. If they lack required skills, score them heavily down (e.g., 20-50%). If they are a perfect match, score them high (e.g., 85-100%).

Return ONLY a valid JSON object with this exact structure:
{
  "match_score": <number 0-100, be highly precise and critical based on actual matching skills>,
  "selection_status": "<selected|rejected> (reject if score < 70)",
  "job_interest": "<best matching job title>",
  "strong_skills": ["skill1", "skill2"],
  "skills_to_improve": ["skill1", "skill2"],
  "summary": "<Detailed, 3-paragraph highly analytical professional feedback. Use the exact candidate name provided. Explain precisely why the score was given, citing specific missing technologies or strong alignments.>"
}
No markdown, no extra text. Only JSON.`;

    const userPrompt = `JOB ROLE / INTEREST: ${jdText}\n\nRESUME TEXT:\n${resumeText}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 1024,
    });

    let text = chatCompletion.choices[0]?.message?.content || '{}';

    // Strip markdown fences if any
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Extract JSON
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }

    const rawData = JSON.parse(text);

    return {
      matchScore: rawData.match_score || 0,
      status: rawData.selection_status === 'rejected' ? 'Not Selected' : 'Selected',
      suitableJobs: rawData.job_interest ? [rawData.job_interest] : ['Matching Role'],
      skillsToWorkOn: rawData.skills_to_improve || [],
      feedbackText: rawData.summary || 'No summary provided.',
      skills: (rawData.strong_skills || []).map(skillName => ({ name: skillName, score: 80 })),
    };
  } catch (error) {
    console.error('Error in Groq AI analysis:', error.message);
    throw new Error('Failed to process unified analysis with Groq AI');
  }
};

/**
 * Extract technical skills from a resume text
 */
const extractCandidateSkills = async (resumeText) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Extract technical skills from this resume text. Return ONLY a valid JSON array of objects: [{"name": "Skill Name", "score": 90}]. Score is 0-100 based on proficiency evident in the text. No markdown or extra text.`,
        },
        { role: 'user', content: `Resume:\n${resumeText}` },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 512,
    });

    let text = chatCompletion.choices[0]?.message?.content || '[]';
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error extracting candidate skills via Groq:', error.message);
    return [];
  }
};

/**
 * Extract required skills from a job description
 */
const extractJDSkills = async (jdText) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Extract an array of required skills from this job description. Return ONLY a valid JSON array of objects: [{"name": "Skill Name", "weight": 5}] where weight is 1-10 based on importance. No markdown or extra text.`,
        },
        { role: 'user', content: `Job Description:\n${jdText}` },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 512,
    });

    let text = chatCompletion.choices[0]?.message?.content || '[]';
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error extracting JD skills via Groq:', error.message);
    return [];
  }
};

module.exports = {
  analyzeUnifiedProfile,
  extractCandidateSkills,
  extractJDSkills,
};
