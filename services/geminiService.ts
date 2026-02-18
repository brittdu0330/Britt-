import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, InputData } from "../types.ts";

const getSafeApiKey = (): string | null => {
  try {
    return (typeof process !== 'undefined' && process.env?.API_KEY) || 
           (window as any).process?.env?.API_KEY || 
           null;
  } catch (e) {
    return null;
  }
};

export const generateCoverLetter = async (
  inputs: InputData,
  config: GenerationConfig
): Promise<string> => {
  const apiKey = getSafeApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure 'API_KEY' is set in environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an expert career consultant. Generate a professional cover letter.
    APPLICANT: ${inputs.name}, Role: ${inputs.recentPosition}, Background: ${inputs.background}
    TARGET: Company: ${inputs.companyName}, Position: ${inputs.targetPosition}, JD: ${inputs.jobDescription}
    CONSTRAINTS: Length: ~${config.length} words, Tone: ${config.style}.
    Output ONLY the cover letter text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI.");
    }

    return response.text;
  } catch (error: any) {
    const msg = error?.message || "";
    if (msg.toLowerCase().includes("out of stock") || msg.toLowerCase().includes("overloaded")) {
      throw new Error("The AI model is currently at capacity. Please try again in a few minutes.");
    }
    if (msg.includes("429")) {
      throw new Error("API Quota exceeded. Please wait a minute.");
    }
    throw new Error(`AI Service Error: ${msg}`);
  }
};