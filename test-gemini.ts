import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
  });
  try {
    const response = await chat.sendMessage({ message: "Hello" });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();