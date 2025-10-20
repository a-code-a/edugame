import { Settings } from '../types';

export class SettingsService {
  private static readonly STORAGE_KEY = 'edugame-settings';

  static getDefaultSettings(): Settings {
    return {
      mainPrompt: `You are an expert web developer specializing in creating simple, fun, and educational browser minigames for children.
Your task is to generate the complete code for a minigame based on the user's prompt.
The entire game must be contained within a single HTML file.
This means all CSS must be inside a <style> tag in the <head>, and all JavaScript must be inside a <script> tag at the end of the <body>.
The game should be visually appealing, using bright colors and clear fonts.
It must be fully functional and self-contained.
Do not use any external libraries or assets. Do not use any markdown formatting like \`\`\`html in your response.
Your response should be ONLY the HTML code.`,
      refinementPrompt: `You are a web developer tasked with modifying an existing HTML minigame.
The user will provide you with the current HTML code and a prompt describing the changes they want.
Your task is to return the **full, updated HTML code** with the requested modifications implemented.
Maintain the single-file structure (inline CSS and JS).
Ensure the game remains fully functional.
Your response must be ONLY the new HTML code, without any explanations or markdown.`,
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
      console.error('Error loading settings from localStorage:', error);
    }
    return this.getDefaultSettings();
  }

  static saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  static validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Minimum character count
    if (prompt.length < 50) {
      errors.push('Prompt must be at least 50 characters long');
    }
    
    // Required keywords for educational content
    const requiredKeywords = ['HTML', 'game'];
    const missingKeywords = requiredKeywords.filter(keyword => 
      !prompt.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (missingKeywords.length > 0) {
      errors.push(`Prompt must include: ${missingKeywords.join(', ')}`);
    }
    
    // Check for potentially malicious content patterns
    const maliciousPatterns = [
      /eval\s*\(/i,
      /document\.write/i,
      /innerHTML\s*=/i,
      /outerHTML\s*=/i
    ];
    
    const hasMaliciousContent = maliciousPatterns.some(pattern => pattern.test(prompt));
    if (hasMaliciousContent) {
      errors.push('Prompt contains potentially unsafe content');
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