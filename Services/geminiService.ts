import { GoogleGenAI } from "@google/genai";
import { Settings } from '../types';
import { SettingsService } from './SettingsService';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
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

export async function generateMinigameCode(prompt: string, customSettings?: Settings): Promise<string> {
    try {
        let systemInstruction = baseSystemInstruction;

        // Use custom prompt if enabled and valid
        if (customSettings?.useCustomPrompts && customSettings.mainPrompt) {
            const validation = SettingsService.validatePrompt(customSettings.mainPrompt);
            if (validation.isValid) {
                systemInstruction = customSettings.mainPrompt;
            }
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `${systemInstruction}\n\nUser request: ${prompt}`,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate minigame. Please try again.");
    }
}

export async function refineMinigameCode(prompt: string, existingHtml: string, customSettings?: Settings): Promise<string> {
    let refinementInstruction = `You are a web developer tasked with modifying an existing HTML minigame.
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

    // Use custom refinement prompt if enabled and valid
    if (customSettings?.useCustomPrompts && customSettings.refinementPrompt) {
        const validation = SettingsService.validatePrompt(customSettings.refinementPrompt);
        if (validation.isValid) {
            refinementInstruction = customSettings.refinementPrompt + `

Here is the existing code:
\`\`\`html
${existingHtml}
\`\`\``;
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `${refinementInstruction}\n\nUser request: ${prompt}`,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to refine minigame. Please try again.");
    }
}
