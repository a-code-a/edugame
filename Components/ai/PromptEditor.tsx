import React, { useState, useEffect } from 'react';
import { SettingsService } from '../../Services/SettingsService';

interface PromptEditorProps {
  title: string;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onReset: () => void;
  placeholder?: string;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  title,
  prompt,
  onPromptChange,
  onReset,
  placeholder
}) => {
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: []
  });

  useEffect(() => {
    const result = SettingsService.validatePrompt(prompt);
    setValidation(result);
  }, [prompt]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={onReset}
          className="text-sm px-3 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200"
        >
          Reset to Default
        </button>
      </div>
      
      <div className="relative">
        <textarea
          value={prompt}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className="w-full h-48 p-3 font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          spellCheck={false}
        />
        <div className="absolute bottom-2 right-2 text-xs text-slate-500 dark:text-slate-400">
          {prompt.length} characters
        </div>
      </div>

      {!validation.isValid && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          ))}
        </div>
      )}

      {validation.isValid && prompt.length > 0 && (
        <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Prompt is valid
        </div>
      )}
    </div>
  );
};

export default PromptEditor;