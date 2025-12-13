import { Settings } from '../types';

export class SettingsService {
  private static readonly STORAGE_KEY = 'edugame-settings';

  static getDefaultSettings(): Settings {
    return {
      mainPrompt: `Erstelle ein HTML-Lernspiel.

TECHNISCH:
- Eine HTML-Datei (CSS in <style>, JS in <script>)
- Keine externen Ressourcen


AUSGABE: Nur HTML-Code, beginne mit <!DOCTYPE html>`,

      refinementPrompt: `Verbessere das HTML-Spiel gemäß der Anfrage.

REGELN:
- Einzeldatei-Struktur beibehalten

AUSGABE: Nur HTML-Code, beginne mit <!DOCTYPE html>`,

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