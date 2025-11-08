import { Settings } from '../types';
import { SettingsService } from './SettingsService';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

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
      } else {
      }
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "EduGame Creator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "x-ai/grok-code-fast-1",
        "messages": [
          {
            "role": "system",
            "content": systemInstruction
          },
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
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
      } else {
      }
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "EduGame Creator",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "x-ai/grok-code-fast-1",
            "messages": [
              {
                "role": "system",
                "content": refinementInstruction
              },
              {
                "role": "user",
                "content": prompt
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw new Error("Failed to refine minigame. Please try again.");
    }
}