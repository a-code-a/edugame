import { GoogleGenAI } from "@google/genai";


const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY, apiVersion: "v1beta" });

const GAME_GENERATION_PROMPT = `Erstelle ein HTML-Lernspiel.

TECHNISCH:
- Eine HTML-Datei (CSS in <style>, JS in <script>)
- Keine externen Ressourcen
- Responsive

SPIEL:
- Startbildschirm mit Anleitung
- Punktestand und Feedback
- Endbildschirm mit "Nochmal spielen"

AUSGABE: Nur HTML-Code, beginne mit <!DOCTYPE html>`;

const REFINEMENT_PROMPT = `Verbessere das HTML-Spiel gemäß der Anfrage.

REGELN:
- Einzeldatei-Struktur beibehalten

AUSGABE: Nur HTML-Code, beginne mit <!DOCTYPE html>`;

const MODEL_NAME = 'gemini-3-pro-preview';

export type GenerationMode = 'fast' | 'thinking';

const THINKING_LEVEL_MAP: Record<GenerationMode, "low" | "high"> = {
    fast: 'low',
    thinking: 'high',
};

export interface FilePart {
    mimeType: string;
    data: string; // base64 encoded string
}

/**
 * Uploads a file to the Gemini Files API.
 */
async function uploadFileToGemini(filePart: FilePart): Promise<{ uri: string, name: string }> {
    try {
        const byteCharacters = atob(filePart.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: filePart.mimeType });
        const numBytes = blob.size;
        const displayName = "Attached File";

        // Step 1: Initiate upload
        const initRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': numBytes.toString(),
                'X-Goog-Upload-Header-Content-Type': filePart.mimeType,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: { displayName } })
        });

        if (!initRes.ok) throw new Error(`Failed to initiate upload: ${initRes.statusText}`);

        const uploadUrlHeader = initRes.headers.get('x-goog-upload-url');
        const uploadUrlFinal = uploadUrlHeader || await initRes.text();

        // Step 2: Upload actual bytes
        const uploadRes = await fetch(uploadUrlFinal, {
            method: 'POST',
            headers: {
                'Content-Length': numBytes.toString(),
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize'
            },
            body: blob
        });

        if (!uploadRes.ok) throw new Error(`Failed to upload file content: ${uploadRes.statusText}`);

        const fileInfo = await uploadRes.json();
        const fileUri = fileInfo.file.uri;
        const fileName = fileInfo.file.name;

        // Step 3: Wait for file to be ACTIVE
        let state = fileInfo.file.state;
        while (state === 'PROCESSING') {
            await new Promise(r => setTimeout(r, 1000));
            const checkRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${API_KEY}`);
            const checkData = await checkRes.json();
            state = checkData.state;
            if (state === 'FAILED') throw new Error("File processing failed");
        }

        return { uri: fileUri, name: fileName };

    } catch (error) {
        console.error("Error uploading file to Gemini:", error);
        throw error;
    }
}

async function deleteGeminiFile(name: string) {
    try {
        await fetch(`https://generativelanguage.googleapis.com/v1beta/${name}?key=${API_KEY}`, {
            method: 'DELETE'
        });
    } catch (e) {
        console.warn("Failed to delete temp Gemini file:", name, e);
    }
}

export async function generateMinigameCode(prompt: string, files?: FilePart[], mode: GenerationMode = 'fast'): Promise<string> {
    const uploadedFiles: string[] = [];
    try {
        let systemInstruction = GAME_GENERATION_PROMPT;
        const fullPrompt = `${systemInstruction}

---
BENUTZERANFRAGE:
${prompt}
---

Erstelle jetzt das Spiel. Beginne direkt mit <!DOCTYPE html>`;

        const parts: any[] = [{ text: fullPrompt }];

        if (files && files.length > 0) {
            for (const file of files) {
                const isImage = file.mimeType.startsWith("image/");
                if (!isImage && (file.mimeType.includes("pdf") || file.mimeType.includes("application"))) {
                    try {
                        const { uri, name } = await uploadFileToGemini(file);
                        uploadedFiles.push(name);
                        parts.push({
                            fileData: {
                                mimeType: file.mimeType,
                                fileUri: uri
                            }
                        });
                        continue;
                    } catch (e) {
                        console.error("Fallback to inline due to upload error:", e);
                    }
                }

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
                    mediaResolution: {
                        level: mediaResolution
                    }
                });
            }
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ parts: parts }],
            config: {
                thinkingConfig: {
                    thinkingLevel: THINKING_LEVEL_MAP[mode]
                } as any
            }
        });

        let html = response.text;
        html = cleanHtmlResponse(html);
        return html;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Fehler beim Erzeugen des Minispiels. Bitte versuche es erneut.");
    } finally {
        for (const name of uploadedFiles) {
            await deleteGeminiFile(name);
        }
    }
}

export async function refineMinigameCode(prompt: string, existingHtml: string, files?: FilePart[], mode: GenerationMode = 'fast'): Promise<string> {
    const uploadedFiles: string[] = [];
    try {
        let refinementInstruction = REFINEMENT_PROMPT;
        const fullPrompt = `${refinementInstruction}

---
AKTUELLER SPIELCODE:
${existingHtml}
---

GEWÜNSCHTE ÄNDERUNG:
${prompt}
---

Gib jetzt den vollständigen aktualisierten HTML-Code zurück. Beginne direkt mit <!DOCTYPE html>`;

        const parts: any[] = [{ text: fullPrompt }];

        if (files && files.length > 0) {
            for (const file of files) {
                const isImage = file.mimeType.startsWith("image/");
                if (!isImage && (file.mimeType.includes("pdf") || file.mimeType.includes("application"))) {
                    try {
                        const { uri, name } = await uploadFileToGemini(file);
                        uploadedFiles.push(name);
                        parts.push({
                            fileData: {
                                mimeType: file.mimeType,
                                fileUri: uri
                            }
                        });
                        continue;
                    } catch (e) {
                        console.error("Fallback to inline due to upload error:", e);
                    }
                }

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
                    mediaResolution: {
                        level: mediaResolution
                    }
                });
            }
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ parts: parts }],
            config: {
                thinkingConfig: {
                    thinkingLevel: THINKING_LEVEL_MAP[mode]
                } as any
            }
        });

        let html = response.text;
        html = cleanHtmlResponse(html);
        return html;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Fehler beim Verfeinern des Minispiels. Bitte versuche es erneut.");
    } finally {
        for (const name of uploadedFiles) {
            await deleteGeminiFile(name);
        }
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
            model: MODEL_NAME,
            contents: descriptionPrompt,
            config: {
                thinkingConfig: {
                    thinkingLevel: "low"
                } as any
            }
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
            model: MODEL_NAME,
            contents: titlePrompt,
            config: {
                thinkingConfig: {
                    thinkingLevel: "low"
                } as any
            }
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
            model: MODEL_NAME,
            contents: ideaPrompt,
            config: {
                thinkingConfig: {
                    thinkingLevel: "high"
                } as any
            }
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
