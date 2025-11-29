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
Do not use any external libraries or assets.

CRITICAL: Your response must be ONLY the raw HTML code. 
DO NOT wrap your response in markdown code fences.
DO NOT start with \`\`\`html
DO NOT use any markdown formatting whatsoever.
Start your response directly with <!DOCTYPE html> and nothing else before it.`;

export interface FilePart {
    mimeType: string;
    data: string; // base64 encoded string
}

export async function generateMinigameCode(prompt: string, customSettings?: Settings, files?: FilePart[]): Promise<string> {
    try {
        let systemInstruction = baseSystemInstruction;

        // Use custom prompt if enabled and valid
        if (customSettings?.useCustomPrompts && customSettings.mainPrompt) {
            const validation = SettingsService.validatePrompt(customSettings.mainPrompt);
            if (validation.isValid) {
                systemInstruction = customSettings.mainPrompt;
            }
        }

        const parts: any[] = [{ text: `${systemInstruction}\n\nUser request: ${prompt}` }];

        if (files && files.length > 0) {
            files.forEach(file => {
                let mediaResolution = "media_resolution_low";
                if (file.mimeType.startsWith("image/")) {
                    mediaResolution = "media_resolution_high";
                } else if (file.mimeType === "application/pdf") {
                    mediaResolution = "media_resolution_medium";
                }

                parts.push({
                    inlineData: {
                        mimeType: file.mimeType,
                        data: file.data
                    },
                    // Note: mediaResolution might need to be passed differently depending on the exact SDK version/structure
                    // For now, we'll try to include it if the API supports it in this structure, 
                    // or rely on defaults if it's a separate config. 
                    // Based on the user provided docs: 
                    // "You can set the resolution now for each individual Media part... mediaResolution: { level: ... }"
                    mediaResolution: {
                        level: mediaResolution
                    }
                });
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
                {
                    parts: parts
                }
            ]
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

CRITICAL: Your response must be ONLY the raw HTML code.
DO NOT wrap your response in markdown code fences.
DO NOT start with \`\`\`html
DO NOT use any markdown formatting whatsoever.
Start your response directly with <!DOCTYPE html> and nothing else before it.

Here is the existing code:
\`\`\`html
${existingHtml}
\`\`\`
`;

    // Use custom refinement prompt if enabled and valid
    if (customSettings?.useCustomPrompts && customSettings.refinementPrompt) {
        const validation = SettingsService.validatePrompt(customSettings.refinementPrompt);
        if (validation.isValid) {
            refinementInstruction = `${customSettings.refinementPrompt}

Here is the existing code:
\`\`\`html  
${existingHtml}
\`\`\``;
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `${refinementInstruction}\\n\\nUser request: ${prompt}`,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to refine minigame. Please try again.");
    }
}

export async function generateGameDescription(prompt: string): Promise<string> {
    try {
        const descriptionPrompt = `You are a creative educational content writer. Based on the following game concept, write a concise, engaging description (2-3 sentences maximum) that explains what the game does and what educational concepts it teaches.

Game concept: ${prompt}

Write only the description, nothing else. Make it educational, exciting, and suitable for students maximum 20 Words.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: descriptionPrompt,
        });

        // Extract only text parts to avoid thought signature warnings
        const textParts = response.candidates?.[0]?.content?.parts?.filter(part => 'text' in part) || [];
        const text = textParts.map(part => part.text).join('').trim();
        return text || response.text.trim();
    } catch (error) {
        console.error("Gemini API error generating description:", error);
        // Return a fallback description if AI generation fails
        return "An AI-generated educational minigame designed to make learning fun and interactive.";
    }
}

export async function generateGameTitle(prompt: string): Promise<string> {
    try {
        const titlePrompt = `You are a creative content writer. Based on the following game concept, create a short, catchy title (maximum 5 words) that captures the essence of the game.

Game concept: ${prompt}

Write only the title, nothing else. Make it exciting, clear, and suitable for students. Do not use quotes or special formatting.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: titlePrompt,
        });

        // Extract only text parts to avoid thought signature warnings
        const textParts = response.candidates?.[0]?.content?.parts?.filter(part => 'text' in part) || [];
        const text = textParts.map(part => part.text).join('').trim();
        return text || response.text.trim();
    } catch (error) {
        console.error("Gemini API error generating title:", error);
        // Return a fallback title if AI generation fails
        return prompt.length > 25 ? `${prompt.substring(0, 22)}...` : prompt;
    }
}
