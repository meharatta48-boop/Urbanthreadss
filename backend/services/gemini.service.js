import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Calls Gemini model using the official SDK.
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

  // Initialize the SDK
  const genAI = new GoogleGenerativeAI(finalApiKey);

  const modelOptions = { model: "gemini-1.5-flash" };
  if (systemInstruction) {
    modelOptions.systemInstruction = systemInstruction;
  }

  // Get the generative model
  const model = genAI.getGenerativeModel(modelOptions);

  // Generate content
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new Error("Gemini API did not return any content.");
  }

  return text;
};
