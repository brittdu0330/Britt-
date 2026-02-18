
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, InputData } from "../types";

export const generateCoverLetter = async (
  inputs: InputData,
  config: GenerationConfig
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure 'API_KEY' is set in your environment variables.");
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
    
    // Extract more specific error info if available
    const errorMessage = error?.message || "Unknown error";
    const status = error?.status || "N/A";
    
    if (errorMessage.includes("429")) {
      throw new Error("API Quota exceeded or too many requests. Please wait a moment and try again.");
    }
    
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      throw new Error("Model not found. The 'gemini-3-flash-preview' model might not be available in your region or for your API key yet.");
    }

    throw new Error(`AI Service Error (${status}): ${errorMessage}`);
  }
};
