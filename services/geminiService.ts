
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;
let apiKeyPromise: Promise<string | null> | null = null;

const getApiKey = async (): Promise<string | null> => {
  if (apiKeyPromise) return apiKeyPromise;
  apiKeyPromise = fetch('/api/config')
    .then(res => res.json())
    .then(data => data.apiKey || null)
    .catch(err => {
      console.error("Failed to fetch API key:", err);
      return null;
    });
  return apiKeyPromise;
};

export const initializeGemini = async () => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error("API Key is missing");
    return;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, 
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure your environment is configured.");
  }

  if (!chatSession) {
    await initializeGemini();
    if (!chatSession) {
        throw new Error("Gemini AI not initialized correctly.");
    }
  }

  try {
    const response = await chatSession.sendMessage({
      message: message,
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }
    return text;
  } catch (error: any) {
    console.error("Error sending message to Gemini:", error);
    if (error.message?.includes('Network error')) {
      // Potentially retry or re-initialize on network failures
      chatSession = null; 
      throw new Error("Network connection lost. Please try sending your message again.");
    }
    throw error;
  }
};
