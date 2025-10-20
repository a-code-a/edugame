
export interface Minigame {
  id: string;
  title: string;
  description: string;
  grade: number;
  subject: string;
  htmlContent: string;
}

export interface Settings {
  mainPrompt: string;
  refinementPrompt: string;
  useCustomPrompts: boolean;
}

export interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetToDefaults: () => void;
  isLoading: boolean;
}
