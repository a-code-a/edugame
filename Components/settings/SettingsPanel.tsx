import React, { useState, useEffect } from 'react';
import { Settings } from '../../types';
import { SettingsService } from '../../Services/SettingsService';
import PromptEditor from '@/Components/ai/PromptEditor';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handlePromptChange = (field: keyof Settings, value: string) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };

  const handleUseCustomPromptsChange = (value: boolean) => {
    const newSettings = { ...localSettings, useCustomPrompts: value };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };

  const handleResetMainPrompt = () => {
    const defaultSettings = SettingsService.getDefaultSettings();
    handlePromptChange('mainPrompt', defaultSettings.mainPrompt);
  };

  const handleResetRefinementPrompt = () => {
    const defaultSettings = SettingsService.getDefaultSettings();
    handlePromptChange('refinementPrompt', defaultSettings.refinementPrompt);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        handleCancel();
      }
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-start"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Settings Panel */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Settings
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Use Custom Prompts Toggle */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Custom Prompts
              </h3>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useCustomPrompts"
                  checked={localSettings.useCustomPrompts}
                  onChange={(e) => handleUseCustomPromptsChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="useCustomPrompts" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Use custom AI prompts
                </label>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enable this to use your own custom prompts for game generation and refinement.
              </p>
            </div>

            {/* Prompt Editors */}
            {localSettings.useCustomPrompts && (
              <div className="space-y-8">
                <PromptEditor
                  title="Main System Prompt"
                  prompt={localSettings.mainPrompt}
                  onPromptChange={(value) => handlePromptChange('mainPrompt', value)}
                  onReset={handleResetMainPrompt}
                  placeholder="Enter your custom main system prompt..."
                />

                <PromptEditor
                  title="Refinement Prompt"
                  prompt={localSettings.refinementPrompt}
                  onPromptChange={(value) => handlePromptChange('refinementPrompt', value)}
                  onReset={handleResetRefinementPrompt}
                  placeholder="Enter your custom refinement prompt..."
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;