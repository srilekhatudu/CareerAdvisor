import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: "test" });
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are a helpful assistant.",
      },
    });
    console.log("Chat created successfully:", !!chat);
  } catch (e) {
    console.error("Error creating chat:", e);
  }
}
test();
