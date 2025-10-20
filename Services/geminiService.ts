import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const baseSystemInstruction = `You are an expert web developer specializing in creating simple, fun, and educational browser minigames for children.
Your task is to generate the complete code for a minigame based on the user's prompt.
The entire game must be contained within a single HTML file.
This means all CSS must be inside a <style> tag in the <head>, and all JavaScript must be inside a <script> tag at the end of the <body>.
The game should be visually appealing, using bright colors and clear fonts.
It must be fully functional and self-contained.
Do not use any external libraries or assets. Do not use any markdown formatting like \`\`\`html in your response.
Your response should be ONLY the HTML code.`;

export async function generateMinigameCode(prompt: string): Promise<string> {
  const model = 'gemini-2.5-pro';
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: baseSystemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating minigame:", error);
    throw new Error("Failed to generate minigame. Please try again.");
  }
}

export async function refineMinigameCode(prompt: string, existingHtml: string): Promise<string> {
    const model = 'gemini-2.5-pro';

    const refinementInstruction = `You are a web developer tasked with modifying an existing HTML minigame.
The user will provide you with the current HTML code and a prompt describing the changes they want.
Your task is to return the **full, updated HTML code** with the requested modifications implemented.
Maintain the single-file structure (inline CSS and JS).
Ensure the game remains fully functional.
Your response must be ONLY the new HTML code, without any explanations or markdown.

Here is the existing code:
\`\`\`html
${existingHtml}
\`\`\`
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: refinementInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error refining minigame:", error);
        throw new Error("Failed to refine minigame. Please try again.");
    }
}
