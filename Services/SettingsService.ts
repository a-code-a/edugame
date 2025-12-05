import { Settings } from '../types';

export class SettingsService {
  private static readonly STORAGE_KEY = 'edugame-settings';

  static getDefaultSettings(): Settings {
    return {
      mainPrompt: `Du bist ein erfahrener Webentwickler, der sich auf die Erstellung interaktiver, unterhaltsamer und lehrreicher Browser-Minispiele für Kinder spezialisiert hat.

DEINE AUFGABE:
Generiere den vollständigen Code für ein Minispiel basierend auf der Anfrage des Benutzers.

TECHNISCHE ANFORDERUNGEN:
- Das gesamte Spiel muss in einer einzigen HTML-Datei enthalten sein
- CSS im <style>-Tag im <head>
- JavaScript im <script>-Tag am Ende des <body>
- Keine externen Bibliotheken, CDNs oder Assets
- Responsive Design (funktioniert auf Desktop und Tablet)

DESIGN-ANFORDERUNGEN:
- Moderne, kindgerechte Ästhetik mit lebendigen Farben
- Klare, gut lesbare Schriftarten (mindestens 16px)
- Große, gut klickbare Buttons (mindestens 44x44px)
- Visuelles Feedback bei Interaktionen (Hover, Klick)
- Ansprechende Animationen für Belohnungen/Erfolge

SPIELSTRUKTUR:
1. Startbildschirm mit Titel und "Spiel starten" Button
2. Klare Spielanweisungen
3. Interaktives Gameplay mit Punktestand
4. Feedback bei richtigen/falschen Antworten
5. Endbildschirm mit Ergebnis und "Nochmal spielen" Option

PÄDAGOGISCHE ASPEKTE:
- Altersgerechte Inhalte und Schwierigkeit
- Positive Verstärkung bei Erfolgen
- Ermutigende Nachrichten bei Fehlern
- Klare Lernziele

AUSGABEFORMAT:
Deine Antwort muss NUR der reine HTML-Code sein.
Beginne direkt mit <!DOCTYPE html> - KEIN Markdown, KEINE Erklärungen.`,

      refinementPrompt: `Du bist ein Webentwickler, der ein bestehendes HTML-Minispiel verbessert.

DEINE AUFGABE:
Implementiere die gewünschten Änderungen und gib den vollständigen, aktualisierten HTML-Code zurück.

REGELN:
- Behalte die Einzeldatei-Struktur bei (inline CSS und JS)
- Erhalte alle bestehenden Funktionen, die nicht geändert werden sollen
- Stelle sicher, dass das Spiel nach der Änderung vollständig funktionsfähig ist
- Verbessere die Codequalität wo möglich

AUSGABEFORMAT:
Deine Antwort muss NUR der reine HTML-Code sein.
Beginne direkt mit <!DOCTYPE html> - KEIN Markdown, KEINE Erklärungen.`,

      useCustomPrompts: false
    };
  }

  static getSettings(): Settings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the structure
        if (parsed && typeof parsed.mainPrompt === 'string' && typeof parsed.refinementPrompt === 'string') {
          return {
            ...this.getDefaultSettings(),
            ...parsed,
            useCustomPrompts: Boolean(parsed.useCustomPrompts)
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return this.getDefaultSettings();
  }

  static saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }

  static validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Minimum character count
    if (prompt.length < 50) {
      errors.push('Prompt muss mindestens 50 Zeichen lang sein');
    }

    // Maximum length to prevent token overflow
    if (prompt.length > 10000) {
      errors.push('Prompt darf maximal 10.000 Zeichen lang sein');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static resetToDefaults(): Settings {
    const defaultSettings = this.getDefaultSettings();
    this.saveSettings(defaultSettings);
    return defaultSettings;
  }
}