import { GoogleGenAI } from "@google/genai";

/**
 * Calls Gemini model using the new @google/genai SDK (v2.x, stable v1 API).
 * @param {string} prompt - The main prompt to send to the model.
 * @param {string} apiKey - The Gemini API key (defaults to process.env.GEMINI_API_KEY).
 * @param {string} [systemInstruction] - Optional system instruction to guide the model.
 * @returns {Promise<string>} - The generated text response.
 */
export const callGeminiWithSDK = async (prompt, apiKey, systemInstruction = "") => {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    throw new Error("Gemini API Key is missing. Please configure GEMINI_API_KEY in server .env.");
  }

  // Initialize the new SDK
  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  const generateOptions = {
    model: "gemini-2.0-flash",
    contents: prompt,
  };

  if (systemInstruction) {
    generateOptions.config = { systemInstruction };
  }

  // Generate content using the new SDK's generateContent method
  const response = await ai.models.generateContent(generateOptions);
  const text = response.text;

  if (!text) {
    throw new Error("Gemini API did not return any content.");
  }

  return text;
};
