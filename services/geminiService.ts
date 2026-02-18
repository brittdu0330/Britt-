
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, InputData } from "../types";

export const generateCoverLetter = async (
  inputs: InputData,
  config: GenerationConfig
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    You are an expert career consultant and professional writer.
    Generate a high-quality, professional cover letter for the following applicant:

    APPLICANT DETAILS:
    - Name: ${inputs.name || 'N/A'}
    - Recent Position: ${inputs.recentPosition || 'N/A'}
    - Personal Background/Resume Context: ${inputs.background}

    TARGET ROLE DETAILS:
    - Company or Recipient (Hiring Manager/Recruiter): ${inputs.companyName || 'N/A'}
    - Position Applying For: ${inputs.targetPosition || 'N/A'}
    - Full Job Description (JD): ${inputs.jobDescription}

    CONSTRAINTS:
    - Desired Length: Approximately ${config.length} words.
    - Desired Tone/Style: ${config.style}.
    - Structure: 
        1. Salutation: Address the letter specifically to "${inputs.companyName}" if it sounds like a person, otherwise "Hiring Manager at ${inputs.companyName}".
        2. Opening: Clear statement of interest in the ${inputs.targetPosition} role.
        3. Middle: Mapping specific background skills (from ${inputs.recentPosition} and background context) to the JD requirements.
        4. Closing: Professional call to action and expression of enthusiasm.
    
    Output ONLY the cover letter text. Use a professional standard business letter format. If Applicant Name is provided, sign off with it at the bottom. Use natural paragraphs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Sorry, I couldn't generate the cover letter. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to connect to the AI service. Please check your network or try again later.");
  }
};
