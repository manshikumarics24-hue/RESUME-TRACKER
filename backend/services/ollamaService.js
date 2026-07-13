

const callOllama = async (prompt, systemOverride = null) => {
  try {
    const payload = {
      model: 'my-resume-ai',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1
      }
    };
    
    // If we need to override the system prompt (for generic skill extraction)
    if (systemOverride) {
      payload.system = systemOverride;
    }

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (e) {
    console.error('Ollama fetch error:', e.message);
    throw e;
  }
};

const extractJSON = (text) => {
    let extracted = text;
    const startIdx = extracted.indexOf('{');
    const endIdx = extracted.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      extracted = extracted.substring(startIdx, endIdx + 1);
    }

    // Strip any accidental markdown code fences
    extracted = extracted.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(extracted);
}

const analyzeUnifiedProfile = async (resumeText, jdText) => {
  const prompt = `JOB ROLE / INTEREST: ${jdText}\n\nRESUME TEXT:\n${resumeText}`;

  try {
    // We let Ollama use the Modelfile's built-in system prompt!
    let text = await callOllama(prompt);
    
    let rawData;
    try {
        rawData = extractJSON(text);
    } catch (parseErr) {
        console.error('JSON parsing failed from Ollama output:', text);
        throw new Error('Failed to parse JSON from AI response');
    }

    // Map the new fine-tuned JSON format to the old format expected by the frontend
    return {
      matchScore: rawData.match_score || 0,
      status: rawData.selection_status === 'rejected' ? 'Not Selected' : 'Selected',
      suitableJobs: rawData.job_interest ? [rawData.job_interest] : ["Matching Role"],
      skillsToWorkOn: rawData.skills_to_improve || [],
      feedbackText: rawData.summary || "No summary provided.",
      skills: (rawData.strong_skills || []).map(skillName => ({ name: skillName, score: 80 }))
    };

  } catch (error) {
    console.error('Error in AI analysis:', error.message);
    throw new Error('Failed to process unified analysis with local AI');
  }
};

const extractCandidateSkills = async (resumeText) => {
  const prompt = `Resume:\n${resumeText}`;
  const systemOverride = `Extract technical skills from this resume text. Return ONLY a valid JSON array of objects: [{"name": "Skill Name", "score": 90}]. Score is 0-100 based on proficiency evident in the text. No markdown or extra text.`;
  
  try {
    let text = await callOllama(prompt, systemOverride);
    
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }
    
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error extracting Candidate skills:', error.message);
    return [];
  }
};

const extractJDSkills = async (jdText) => {
  const prompt = `Job Description:\n${jdText}`;
  const systemOverride = `Extract an array of required skills from this job description. Return ONLY a valid JSON array of objects: [{"name": "Skill Name", "weight": 5}] where weight is 1-10 based on importance. No markdown or extra text.`;

  try {
    let text = await callOllama(prompt, systemOverride);
    
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }

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
