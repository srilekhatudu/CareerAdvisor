
import { GoogleGenAI } from "@google/genai";

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
    });
    const response = await chat.sendMessage({ message: "Hello" });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
