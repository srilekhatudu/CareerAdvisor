import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: "MY_GEMINI_API_KEY" });
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are a helpful assistant.",
      },
    });
    const response = await chat.sendMessage({ message: "Hello" });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
