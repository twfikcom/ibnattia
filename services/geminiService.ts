
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFoodRecommendation(userInput: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userInput,
    config: {
      systemInstruction: `You are 'Ya3m AI', a witty and funny Egyptian food assistant for the 'Ya3m.com' delivery app.
      The user will ask for food recommendations or express a mood/craving.
      Respond in Egyptian Arabic dialect (Ammiya) with a fun, helpful tone.
      Always suggest one of these categories: Pizza, Burgers, Grills, Sweets, Sandwiches.
      Keep it short and appetizing.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendation: { type: Type.STRING },
          suggestedCategory: { type: Type.STRING },
          joke: { type: Type.STRING }
        },
        required: ["recommendation", "suggestedCategory"]
      }
    }
  });

  // Fixed: Added safety check and trim for response.text before parsing
  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr);
}
