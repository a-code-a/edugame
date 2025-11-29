import { GoogleGenAI } from "@google/genai";
import { Settings } from '../types';
import { SettingsService } from './SettingsService';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const baseSystemInstruction = `Du bist ein erfahrener Webentwickler, der sich auf die Erstellung einfacher, unterhaltsamer und lehrreicher Browser-Minispiele für Kinder spezialisiert hat.
Deine Aufgabe ist es, den vollständigen Code für ein Minispiel basierend auf der Anfrage des Benutzers zu generieren.
Das gesamte Spiel muss in einer einzigen HTML-Datei enthalten sein.
Das bedeutet, dass alle CSS in einem <style>-Tag im <head> stehen müssen und alle JavaScript in einem <script>-Tag am Ende des <body>.
Das Spiel sollte optisch ansprechend sein und helle Farben sowie klare Schriftarten verwenden.
Es muss vollständig funktionsfähig und eigenständig sein.
Verwende keine externen Bibliotheken oder Assets.

WICHTIG: Deine Antwort muss NUR der reine HTML-Code sein.
Wickle deine Antwort NICHT in Markdown-Code-Blöcke ein.
Beginne NICHT mit \`\`\`html
Verwende KEINE Markdown-Formatierung.
Beginne deine Antwort direkt mit <!DOCTYPE html> und nichts anderem davor.`;

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

                // Assign resolution based on file type
                if (file.mimeType.startsWith("image/")) {
                    mediaResolution = "media_resolution_high";
                } else if (
                    file.mimeType === "application/pdf" ||
                    file.mimeType.includes("word") ||
                    file.mimeType.includes("excel") ||
                    file.mimeType.includes("powerpoint") ||
                    file.mimeType.includes("spreadsheet") ||
                    file.mimeType.includes("presentation") ||
                    file.mimeType.includes("document")
                ) {
                    // Documents, PDFs, and office files get medium resolution for better text extraction
                    mediaResolution = "media_resolution_medium";
                }
                // Video, audio, and other files default to low resolution

                parts.push({
                    inlineData: {
                        mimeType: file.mimeType,
                        data: file.data
                    },
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
        throw new Error("Fehler beim Erzeugen des Minispiels. Bitte versuche es erneut.");
    }
}

export async function refineMinigameCode(prompt: string, existingHtml: string, customSettings?: Settings): Promise<string> {
    let refinementInstruction = `Du bist ein Webentwickler, der beauftragt ist, ein bestehendes HTML-Minispiel zu modifizieren.
Der Benutzer wird dir den aktuellen HTML-Code und eine Beschreibung der gewünschten Änderungen liefern.
Deine Aufgabe ist es, den **vollständigen, aktualisierten HTML-Code** mit den implementierten Änderungen zurückzugeben.
Behalte die Einzeldatei-Struktur bei (inline CSS und JS).
Stelle sicher, dass das Spiel vollständig funktionsfähig bleibt.

WICHTIG: Deine Antwort muss NUR der reine HTML-Code sein.
Wickle deine Antwort NICHT in Markdown-Code-Blöcke ein.
Beginne NICHT mit \`\`\`html
Verwende KEINE Markdown-Formatierung.
Beginne deine Antwort direkt mit <!DOCTYPE html> und nichts anderem davor.

Hier ist der bestehende Code:
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
        throw new Error("Fehler beim Verfeinern des Minispiels. Bitte versuche es erneut.");
    }
}

export async function generateGameDescription(prompt: string): Promise<string> {
    try {
        const descriptionPrompt = `Du bist ein kreativer Autor für Bildungsinhalte. Schreibe basierend auf folgendem Spielkonzept eine prägnante, ansprechende Beschreibung (maximal 2-3 Sätze), die erklärt, was das Spiel macht und welche pädagogischen Konzepte es vermittelt.

Spielkonzept: ${prompt}

Schreibe nur die Beschreibung, sonst nichts. Mache sie lehrreich, spannend und geeignet für Schüler. Maximal 20 Wörter.`;

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
        return "Ein KI-generiertes Lernspiel, das Lernen unterhaltsam und interaktiv macht.";
    }
}

export async function generateGameTitle(prompt: string): Promise<string> {
    try {
        const titlePrompt = `Du bist ein kreativer Autor. Erstelle basierend auf folgendem Spielkonzept einen kurzen, einprägsamen Titel (maximal 5 Wörter), der die Essenz des Spiels erfasst.

Spielkonzept: ${prompt}

Schreibe nur den Titel, sonst nichts. Mache ihn spannend, klar und geeignet für Schüler. Verwende keine Anführungszeichen oder besondere Formatierung.`;

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
