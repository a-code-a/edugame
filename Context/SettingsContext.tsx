import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings, SettingsContextType } from '../types';
import { SettingsService } from '../Services/SettingsService';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(SettingsService.getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage on mount
    const loadedSettings = SettingsService.getSettings();
    setSettings(loadedSettings);
    setIsLoading(false);
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    SettingsService.saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = SettingsService.resetToDefaults();
    setSettings(defaultSettings);
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetToDefaults,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};