import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateGuidelines(text: string): Promise<string> {
  const prompt = `You are an expert content strategist and AI prompt engineer.
I will provide you with a set of brand guidelines, content rules, or a general brand document.
Your task is to extract the key, essential information and rewrite it into a "robot-friendly", crystal clear, and crisp "content writer" guideline document.

Make it easy for an AI agent or a human writer to quickly grasp the rules.
Focus heavily on:
- Core Brand Identity & Voice
- Dos and Don'ts (very important, make these prominent)
- Formatting and stylistic rules
- Clear, concise, and actionable language

Remove any fluff, marketing speak, or unnecessary background information. The output must be purely instructional and highly structured.

Output the result in clean Markdown format.

Here are the original guidelines:
---
${text}
---
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text || "";
}
