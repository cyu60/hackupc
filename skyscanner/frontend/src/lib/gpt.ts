import { GoogleGenAI } from "@google/genai";
import { Member } from "@/context/TeamContext";

const GEMINI_API_KEY = "AIzaSyCZbmWrfgXrne1vOtFQe9pFhZrjyf9N8-I";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const fetchSuggestedCities = async (members: Member[]): Promise<string[]> => {
  const prompt = `
    You are a helpful travel assistant.

    Based on the following travelers, suggest 5 unique cities they should visit together. 
    Factor in their cities, budgets, and preferences.

    ${members.map(
      (m) => `- ${m.name} from ${m.city}, budget €${m.budget}, likes ${m.tags.join(", ")}`
    ).join("\n")}

    Return only a valid JSON array (e.g., ["city1", "city2", ...]) with 5 different destination cities, in English, that best match the group's preferences. 
    Do not include explanations or formatting — only return the array.
  `.trim();

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-001", // or "gemini-pro"
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("🌍 Gemini raw response:", text);

    const cleaned = text?.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Error from Gemini SDK:", err);
    return [];
  }
};