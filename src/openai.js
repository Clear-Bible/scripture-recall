import OpenAI from "openai";

export const openai = new OpenAI({ 
  dangerouslyAllowBrowser: true, 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});