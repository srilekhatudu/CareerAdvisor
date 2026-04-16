import { loadEnv } from 'vite';
process.env.GEMINI_API_KEY = "REAL_KEY";
const env = loadEnv('development', '.', '');
console.log("env.GEMINI_API_KEY:", env.GEMINI_API_KEY);
