import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface CarPreset {
  name: string;
  color: string;
  colorName: string;
  wheels: number;
  wheelName: string;
  finish: "matte" | "gloss" | "metallic";
  description: string;
  accentColor: string;
}

export async function getCarSuggestions(theme: string): Promise<CarPreset[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert automotive designer.
Generate exactly 5 unique car customization presets for the theme: "${theme}".
Return ONLY a valid JSON array, no markdown, no explanation.

Each object must have:
- name: string (creative preset name)
- color: string (hex like #1A1A2E)
- colorName: string (poetic color name)
- wheels: number (0=Standard, 1=Sport, 2=Premium)
- wheelName: string
- finish: exactly one of "matte" | "gloss" | "metallic"
- description: string (one punchy sentence)
- accentColor: string (hex for rim/detail accent)

Respond with only the JSON array.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as CarPreset[];
}