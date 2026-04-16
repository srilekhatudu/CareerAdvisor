export default function handler(
  request: any,
  response: any,
) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return response.status(500).json({ error: 'GEMINI_API_KEY is not configured in environment variables' });
  }

  response.status(200).json({
    apiKey: apiKey,
    allEnv: Object.keys(process.env).filter(k => k.includes('GEMINI'))
  });
}
