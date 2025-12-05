import { GoogleGenAI } from "@google/genai";
import { Settings } from '../types';
import { SettingsService } from './SettingsService';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const GAME_GENERATION_PROMPT = `Du bist ein erfahrener Webentwickler und Spieledesigner, der interaktive Lernspiele für Kinder erstellt.

DEINE AUFGABE:
Erstelle ein vollständiges, funktionierendes HTML-Minispiel basierend auf der Benutzeranfrage.

TECHNISCHE ANFORDERUNGEN:
• Eine einzige HTML-Datei (kein externes CSS/JS)
• CSS im <style>-Tag im <head>
• JavaScript im <script>-Tag am Ende des <body>
• Keine externen Bibliotheken, CDNs oder Bilder
• Funktioniert auf Desktop und Tablet (responsive)
• Nutze CSS Grid oder Flexbox für Layouts

DESIGN-STANDARDS:
• Modernes, farbenfrohes Design mit CSS-Gradienten
• Große, kindgerechte Schriftarten (min. 18px)
• Buttons mindestens 48x48px für einfache Touch-Bedienung
• Sanfte CSS-Animationen und Übergänge
• Visuelles Feedback: Hover-Effekte, Klick-Animationen
• Erfolgs-Animationen (Konfetti-Effekt, Sterne, etc.)

PFLICHT-SPIELELEMENTE:
1. STARTBILDSCHIRM
   - Attraktiver Titel mit Animation
   - Kurze Spielanleitung (1-2 Sätze)
   - Großer "Spiel starten" Button

2. SPIELMECHANIK
   - Klarer Punktestand/Fortschritt sichtbar
   - Timer oder Rundenanzeige (falls passend)
   - Sofortiges Feedback bei jeder Aktion
   - Soundeffekte simulieren (visuelle Cues)

3. FEEDBACK-SYSTEM
   - RICHTIG: Grün, Häkchen, ermutigendes Emoji, +Punkte
   - FALSCH: Sanftes Rot, "Versuch's nochmal!", keine Bestrafung
   - Fortschrittsbalken oder Level-Anzeige

4. ENDBILDSCHIRM
   - Gesamtpunktzahl mit Sterne-Bewertung (1-3 Sterne)
   - Motivierende Nachricht basierend auf Score
   - "Nochmal spielen" Button
   - Optional: "Schwierigkeit erhöhen" Button

PÄDAGOGISCHE PRINZIPIEN:
• Positive Verstärkung statt Bestrafung
• Klare, altersgerechte Sprache
• Ermutigung bei Fehlern: "Fast richtig! Probier nochmal!"
• Schwierigkeitsgrad anpassbar oder adaptiv
• Kleine Erfolge feiern

CODE-QUALITÄT:
• Sauberer, gut strukturierter Code
• Aussagekräftige Variablennamen auf Deutsch oder Englisch
• Event-Listener statt inline onclick
• Zentrale Spielzustandsverwaltung

KRITISCH - AUSGABEFORMAT:
Deine Antwort muss AUSSCHLIESSLICH der reine HTML-Code sein.
Beginne DIREKT mit <!DOCTYPE html>
KEIN Markdown, KEINE Erklärungen, KEINE Codeblöcke mit \`\`\``;

const REFINEMENT_PROMPT = `Du bist ein Webentwickler, der ein bestehendes HTML-Minispiel verbessert.

DEINE AUFGABE:
Implementiere die gewünschten Änderungen präzise und gib den vollständigen HTML-Code zurück.

WICHTIGE REGELN:
• Behalte ALLE bestehenden Funktionen bei, die nicht explizit geändert werden sollen
• Verbessere die Codequalität wo möglich
• Stelle sicher, dass das Spiel nach der Änderung vollständig funktioniert
• Teste gedanklich alle Spielzustände durch

BEI DESIGN-ÄNDERUNGEN:
• Achte auf Konsistenz mit dem bestehenden Stil
• Nutze CSS-Variablen für Farben wenn möglich

BEI FUNKTIONS-ÄNDERUNGEN:
• Erhalte den Spielfluss (Start → Spiel → Ende)
• Aktualisiere Punktelogik falls nötig

KRITISCH - AUSGABEFORMAT:
Deine Antwort muss AUSSCHLIESSLICH der reine HTML-Code sein.
Beginne DIREKT mit <!DOCTYPE html>
KEIN Markdown, KEINE Erklärungen, KEINE Codeblöcke.`;

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
