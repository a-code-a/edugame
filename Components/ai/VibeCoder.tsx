import React, { useState, useRef } from 'react';
import { generateMinigameCode, generateGameDescription, generateGameTitle, FilePart } from '../../Services/geminiService';
import DatabaseService from '../../Services/DatabaseService';
import { Minigame } from '../../types';
import { useSettings } from '../../Context/SettingsContext';

interface VibeCoderProps {
  onGameCreated: (game: Minigame) => void;
  onGameSaved?: (game: Minigame) => void;
}

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.62-3.385m-1.622 3.385a15.998 15.998 0 01-3.388 1.621m-5.043-.025a15.998 15.998 0 005.043.025z" />
  </svg>
);

const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface AttachedFile extends FilePart {
  name: string;
  id: string;
}

const VibeCoder: React.FC<VibeCoderProps> = ({ onGameCreated, onGameSaved }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedGame, setLastCreatedGame] = useState<Minigame | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettings();
  const databaseService = DatabaseService.getInstance();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFiles(Array.from(event.target.files));
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const newAttachedFiles: AttachedFile[] = [];

    for (const file of files) {
      // Basic validation
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError(`File type ${file.type} not supported. Please upload images or PDFs.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`File ${file.name} is too large. Max size is 10MB.`);
        continue;
      }

      try {
        const base64Data = await readFileAsBase64(file);
        newAttachedFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          mimeType: file.type,
          data: base64Data
        });
      } catch (err) {
        console.error("Error reading file:", err);
        setError(`Failed to read file ${file.name}`);
      }
    }

    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && attachedFiles.length === 0) {
      setError('Please enter a description or upload a file for your game.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Generate game code, description, and title in parallel
      const [htmlContent, aiDescription, aiTitle] = await Promise.all([
        generateMinigameCode(prompt, settings, attachedFiles),
        generateGameDescription(prompt || "Game based on uploaded files"),
        generateGameTitle(prompt || "New Game")
      ]);

      const newGame: Minigame = {
        id: `gen-${Date.now()}`,
        title: aiTitle,
        description: aiDescription,
        grade: 1,
        subject: 'Art',
        htmlContent,
      };
      onGameCreated(newGame);
      setLastCreatedGame(newGame);
      setPrompt('');
      setAttachedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!lastCreatedGame) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await databaseService.saveGame(lastCreatedGame);

      if (result.success && result.game) {
        setError(null);
        if (onGameSaved) {
          onGameSaved(result.game);
        }
        setLastCreatedGame(null);
      } else {
        const errorMessage = result.error || 'Failed to save game';
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-white/90 border transition-colors duration-200 shadow-xl shadow-slate-300/30 ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-slate-200/60'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="relative p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md">
            <WandIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Vibe Coder</h3>
            <p className="text-xs text-slate-500">Beschreibe dein Lernspiel · KI erledigt den Rest</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Idee formulieren
            </label>
            <div className="relative">
              <textarea
                data-role="vibe-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="z. B. Ein Quiz mit drei Schwierigkeitsstufen, das Bruchteile auf einem Zahlenstrahl visualisiert."
                className="w-full h-32 resize-none rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200/50 transition pr-10"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Upload image or PDF"
                  disabled={isLoading}
                >
                  <PaperclipIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {attachedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-700 border border-slate-200">
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Wird erstellt…
            </>
          ) : (
            <>
              <WandIcon className="h-4 w-4" />
              Minigame erzeugen
            </>
          )}
        </button>

        {lastCreatedGame && (
          <div className="pt-4 border-t border-slate-200/50 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Erfolgreich erstellt!</p>
                <p className="text-xs text-slate-500">Speichere es in der Datenbank</p>
              </div>
            </div>

            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                  </svg>
                  In Datenbank speichern
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeCoder;