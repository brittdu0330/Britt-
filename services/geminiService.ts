
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, InputData } from "../types";

export const generateCoverLetter = async (
  inputs: InputData,
  config: GenerationConfig
): Promise<string> => {
  // Safely access process.env
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure 'API_KEY' is set in your environment variables (e.g., in Vercel settings).");
  }

  const ai = new GoogleGenAI({ apiKey });
  
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

    if (!response.text) {
      throw new Error("The AI returned an empty response. This may happen if the content was filtered or the model is overloaded.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    const errorMessage = error?.message || "Unknown error";
    
    if (errorMessage.includes("429")) {
      throw new Error("API Quota exceeded. The free tier of Gemini has limits; please try again in a minute.");
    }
    
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      throw new Error("Model not found. This might be a regional restriction for the 'gemini-3-flash-preview' model.");
    }

    throw new Error(`AI Service Error: ${errorMessage}`);
  }
};
