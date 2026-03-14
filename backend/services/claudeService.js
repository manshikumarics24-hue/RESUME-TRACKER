const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parses JD and extracts weighted skills
 */
const extractJDSkills = async (jdText) => {
  const prompt = `You are an expert at extracting requirements from Job Descriptions.
Analyze the following job description and extract all the required technical and soft skills.
Assign a weight to each skill: 1.0 if it's listed under "Requirements" or clearly mandatory, 
and 0.5 if it's listed under "Nice to have" or optional.

Return ONLY a valid JSON object in this exact format, with no other text:
{
  "requiredSkills": [
    {
      "name": "Skill Name",
      "weight": 1.0
    }
  ]
}

Job Description:
${jdText}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const jsonText = response.content[0].text;
    
    // Parse the JSON (safeguard against markdown blocking)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not find JSON in Claude response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.requiredSkills;

  } catch (error) {
    console.error('Error extracting JD skills with Claude:', error);
    throw new Error('Failed to process Job Description with AI');
  }
};

/**
 * Parses candidate resume and scores skills
 */
const extractCandidateSkills = async (resumeText) => {
  const prompt = `You are an expert technical recruiter analyzing a resume.
Extract all technical and relevant soft skills. Score each skill from 0 to 100 based on how confidently and frequently the skill appears, and the context (e.g. "Built scalable APIs using Express" -> Express score 80).
Context matters immensely. Infer underlying technologies if contextually obvious.

Return ONLY a valid JSON object in this exact format, with no other text:
{
  "skills": [
    {
      "name": "Skill Name",
      "score": 85
    }
  ]
}

Resume Text:
${resumeText}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const jsonText = response.content[0].text;
    
    // Parse the JSON (safeguard against markdown blocking)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not find JSON in Claude response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.skills;

  } catch (error) {
    console.error('Error extracting candidate skills with Claude:', error);
    throw new Error('Failed to process Resume with AI');
  }
};

module.exports = {
  extractJDSkills,
  extractCandidateSkills,
};
