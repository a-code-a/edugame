import { GoogleGenAI } from "@google/genai";
import { Settings } from '../types';
import { SettingsService } from './SettingsService';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const GAME_GENERATION_PROMPT = `Erstelle ein HTML-Lernspiel für Kinder.

TECHNISCH:
- Eine HTML-Datei (CSS in <style>, JS in <script>)
- Keine externen Ressourcen
- Responsive, Touch-freundlich

SPIEL:
- Startbildschirm mit Anleitung
- Punktestand und Feedback
- Endbildschirm mit "Nochmal spielen"

AUSGABE: Nur HTML-Code, beginne mit <!DOCTYPE html>`;

const REFINEMENT_PROMPT = `Verbessere das HTML-Spiel gemäß der Anfrage.

REGELN:
- Erhalte bestehende Funktionen
- Einzeldatei-Struktur beibehalten

AUSGABE: Nur HTML-Code, beginne mit <!DOCTYPE html>`;

export interface FilePart {
    mimeType: string;
    data: string; // base64 encoded string
}

export async function generateMinigameCode(prompt: string, customSettings?: Settings, files?: FilePart[]): Promise<string> {
    try {
        // Use custom prompt if enabled and valid, otherwise use enhanced default
        let systemInstruction = GAME_GENERATION_PROMPT;

        if (customSettings?.useCustomPrompts && customSettings.mainPrompt) {
            const validation = SettingsService.validatePrompt(customSettings.mainPrompt);
            if (validation.isValid) {
                systemInstruction = customSettings.mainPrompt;
            }
        }

        const fullPrompt = `${systemInstruction}

---
BENUTZERANFRAGE:
${prompt}
---

Erstelle jetzt das Spiel. Beginne direkt mit <!DOCTYPE html>`;

        const parts: any[] = [{ text: fullPrompt }];

        if (files && files.length > 0) {
            files.forEach(file => {
                let mediaResolution = "media_resolution_low";

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
                    mediaResolution = "media_resolution_medium";
                }

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
            model: "gemini-2.5-flash",
            contents: [{ parts: parts }]
        });

        let html = response.text;

        // Clean up any markdown formatting that might have slipped through
        html = cleanHtmlResponse(html);

        return html;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Fehler beim Erzeugen des Minispiels. Bitte versuche es erneut.");
    }
}

export async function refineMinigameCode(prompt: string, existingHtml: string, customSettings?: Settings): Promise<string> {
    try {
        let refinementInstruction = REFINEMENT_PROMPT;

        if (customSettings?.useCustomPrompts && customSettings.refinementPrompt) {
            const validation = SettingsService.validatePrompt(customSettings.refinementPrompt);
            if (validation.isValid) {
                refinementInstruction = customSettings.refinementPrompt;
            }
        }

        // Send existing HTML as plain text, not in markdown blocks
        const fullPrompt = `${refinementInstruction}

---
AKTUELLER SPIELCODE:
${existingHtml}
---

GEWÜNSCHTE ÄNDERUNG:
${prompt}
---

Gib jetzt den vollständigen aktualisierten HTML-Code zurück. Beginne direkt mit <!DOCTYPE html>`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });

        let html = response.text;

        // Clean up any markdown formatting
        html = cleanHtmlResponse(html);

        return html;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Fehler beim Verfeinern des Minispiels. Bitte versuche es erneut.");
    }
}

export async function generateGameDescription(prompt: string): Promise<string> {
    try {
        const descriptionPrompt = `Schreibe eine kurze, ansprechende Beschreibung (maximal 15 Wörter) für dieses Lernspiel:

"${prompt}"

Regeln:
- Erkläre kurz was Spieler tun und lernen
- Nutze aktive, einladende Sprache
- Für Schüler geeignet
- NUR die Beschreibung, nichts anderes`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: descriptionPrompt,
        });

        const textParts = response.candidates?.[0]?.content?.parts?.filter(part => 'text' in part) || [];
        const text = textParts.map(part => part.text).join('').trim();
        return text || response.text.trim();
    } catch (error) {
        console.error("Gemini API error generating description:", error);
        return "Ein KI-generiertes Lernspiel, das Lernen unterhaltsam und interaktiv macht.";
    }
}

export async function generateGameTitle(prompt: string): Promise<string> {
    try {
        const titlePrompt = `Erstelle einen kurzen, einprägsamen Spieltitel (2-4 Wörter) für:

"${prompt}"

Regeln:
- Kreativ und kindgerecht
- Kein Doppelpunkt, keine Anführungszeichen
- NUR der Titel, nichts anderes`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: titlePrompt,
        });

        const textParts = response.candidates?.[0]?.content?.parts?.filter(part => 'text' in part) || [];
        let text = textParts.map(part => part.text).join('').trim();

        // Clean up common issues
        text = text.replace(/^["']|["']$/g, ''); // Remove quotes
        text = text.replace(/\*\*/g, ''); // Remove bold markers

        return text || response.text.trim();
    } catch (error) {
        console.error("Gemini API error generating title:", error);
        return prompt.length > 25 ? `${prompt.substring(0, 22)}...` : prompt;
    }
}

export interface GameIdea {
    title: string;
    description: string;
    prompt: string;
}

const SUBJECT_NAMES: Record<string, string> = {
    'Math': 'Mathematik',
    'Language Arts': 'Sprache/Deutsch',
    'Science': 'Naturwissenschaften',
    'Social Studies': 'Gesellschaftslehre/Geschichte',
    'Art': 'Kunst',
};

export async function generateGameIdeas(subject: string, grade: number, keywords?: string): Promise<GameIdea[]> {
    try {
        const subjectName = SUBJECT_NAMES[subject] || subject;
        const keywordPart = keywords ? `\nOptionale Themen/Stichwörter: ${keywords}` : '';

        const ideaPrompt = `Du bist ein kreativer Spieleentwickler für Lernspiele.

AUFGABE: Generiere 3 VÖLLIG UNTERSCHIEDLICHE und KREATIVE Spielideen für:
- Fach: ${subjectName}
- Klassenstufe: ${grade}${keywordPart}

WICHTIG:
- Sei maximal kreativ! Keine Einschränkungen auf bestimmte Spieltypen.
- Jedes Spiel soll einzigartig und überraschend sein.
- Mische verschiedene Spielmechaniken: Quiz, Simulation, Puzzle, Adventure, Strategie, Arcade, etc.
- Denke an ungewöhnliche Kombinationen und innovative Konzepte.
- Spiele sollen pädagogisch wertvoll UND unterhaltsam sein.

AUSGABEFORMAT (JSON-Array, sonst nichts):
[
  {
    "title": "Kurzer, einprägsamer Titel",
    "description": "1-2 Sätze, was das Spiel besonders macht",
    "prompt": "Detaillierter Prompt für die Spielerstellung (mind. 50 Wörter)"
  }
]

Antworte NUR mit dem JSON-Array, kein Markdown, keine Erklärungen.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ideaPrompt,
        });

        let text = response.text.trim();

        // Clean up potential markdown formatting
        text = text.replace(/^```json\s*/i, '');
        text = text.replace(/^```\s*/i, '');
        text = text.replace(/\s*```$/i, '');
        text = text.trim();

        const ideas: GameIdea[] = JSON.parse(text);
        return ideas;
    } catch (error) {
        console.error("Gemini API error generating game ideas:", error);
        throw new Error("Fehler beim Generieren der Spielideen. Bitte versuche es erneut.");
    }
}

/**
 * Cleans up HTML response by removing any markdown formatting
 */
function cleanHtmlResponse(html: string): string {
    // Remove markdown code blocks
    html = html.replace(/^```html\s*/i, '');
    html = html.replace(/^```\s*/i, '');
    html = html.replace(/\s*```$/i, '');

    // Trim whitespace
    html = html.trim();

    // Ensure it starts with DOCTYPE
    if (!html.toLowerCase().startsWith('<!doctype')) {
        const doctypeIndex = html.toLowerCase().indexOf('<!doctype');
        if (doctypeIndex > 0) {
            html = html.substring(doctypeIndex);
        }
    }

    return html;
}

