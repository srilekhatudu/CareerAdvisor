import { loadEnv } from 'vite';
const env = loadEnv('development', '.', '');
console.log("Keys:", Object.keys(env).filter(k => k.includes('GEMINI')));
