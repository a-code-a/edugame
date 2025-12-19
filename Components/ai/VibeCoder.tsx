import React, { useState, useRef } from 'react';
import { generateMinigameCode, generateGameDescription, generateGameTitle, generateGameIdeas, GameIdea, FilePart, GenerationMode } from '../../Services/geminiService';
import DatabaseService from '../../Services/DatabaseService';
import { Minigame } from '../../types';

import { GRADES, SUBJECTS, SUBJECT_DISPLAY_OPTIONS } from '../../constants';

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

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
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
  const databaseService = DatabaseService.getInstance();

  // Inspiration panel state
  const [showInspiration, setShowInspiration] = useState(false);
  const [inspirationSubject, setInspirationSubject] = useState(SUBJECTS[0]);
  const [inspirationGrade, setInspirationGrade] = useState(5);
  const [inspirationKeywords, setInspirationKeywords] = useState('');
  const [ideas, setIdeas] = useState<GameIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // Generation mode state
  const [generationMode, setGenerationMode] = useState<GenerationMode>('fast');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFiles(Array.from(event.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const newAttachedFiles: AttachedFile[] = [];

    for (const file of files) {
      const unsupportedTypes = [
        'application/x-msdownload',
        'application/x-executable',
        'application/x-mach-binary',
        'application/octet-stream'
      ];

      if (unsupportedTypes.includes(file.type) || file.name.match(/\.(exe|dll|so|dylib|app)$/i)) {
        setError(`Dateityp ${file.type || 'unbekannt'} wird aus Sicherheitsgründen nicht unterstützt.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`Datei ${file.name} ist zu groß. Maximale Größe ist 10MB.`);
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
        setError(`Fehler beim Lesen der Datei ${file.name}`);
      }
    }

    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Fehler beim Lesen der Datei'));
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
      setError('Bitte gib eine Beschreibung ein oder lade eine Datei für dein Spiel hoch.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [htmlContent, aiDescription, aiTitle] = await Promise.all([
        generateMinigameCode(prompt, attachedFiles, generationMode),
        generateGameDescription(prompt || "Spiel basierend auf hochgeladenen Dateien"),
        generateGameTitle(prompt || "Neues Spiel")
      ]);

      const newGame: Minigame = {
        id: `gen-${Date.now()}`,
        title: aiTitle,
        description: aiDescription,
        grade: 0,
        subject: '',
        htmlContent,
      };
      onGameCreated(newGame);
      setLastCreatedGame(newGame);
      setPrompt('');
      setAttachedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!lastCreatedGame) return;

    // Validation
    if (!lastCreatedGame.grade || lastCreatedGame.grade === 0) {
      setError("Bitte wähle eine Klasse aus.");
      return;
    }
    if (!lastCreatedGame.subject) {
      setError("Bitte wähle ein Fach aus.");
      return;
    }

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
      const errorMessage = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Inspiration handlers
  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setError(null);
    setIdeas([]);

    try {
      const generatedIdeas = await generateGameIdeas(inspirationSubject, inspirationGrade, inspirationKeywords || undefined);
      setIdeas(generatedIdeas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren der Ideen.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleUseIdea = (idea: GameIdea) => {
    setPrompt(idea.prompt);
    setShowInspiration(false);
    setIdeas([]);
  };

  const handleUpdateDetails = (updates: Partial<Minigame>) => {
    if (lastCreatedGame) {
      const updated = { ...lastCreatedGame, ...updates };
      setLastCreatedGame(updated);
      onGameCreated(updated); // Also update parent preview
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Idee formulieren
              </label>
              <button
                onClick={() => setShowInspiration(!showInspiration)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showInspiration
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                  }`}
              >
                <SparklesIcon className="h-4 w-4" />
                Inspiration
                <ChevronDownIcon className={`h-3 w-3 transition-transform ${showInspiration ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Inspiration Panel */}
            {showInspiration && (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <select
                    value={inspirationSubject}
                    onChange={(e) => setInspirationSubject(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{SUBJECT_DISPLAY_OPTIONS[s]?.label || s}</option>
                    ))}
                  </select>
                  <select
                    value={inspirationGrade}
                    onChange={(e) => setInspirationGrade(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>Klasse {g}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={inspirationKeywords}
                    onChange={(e) => setInspirationKeywords(e.target.value)}
                    placeholder="Stichwörter..."
                    className="px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <button
                  onClick={handleGenerateIdeas}
                  disabled={isGeneratingIdeas}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGeneratingIdeas ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Ideen generieren...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      3 Spielideen generieren
                    </>
                  )}
                </button>

                {/* Generated Ideas */}
                {ideas.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {ideas.map((idea, index) => (
                      <div
                        key={index}
                        onClick={() => handleUseIdea(idea)}
                        className="p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-amber-700 transition-colors">
                              {idea.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{idea.description}</p>
                          </div>
                          <span className="text-xs text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Übernehmen →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                  accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.hwp,.hwpx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Dateien hochladen"
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

        {/* Generation Mode Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500">Generierungsmodus</span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setGenerationMode('fast')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${generationMode === 'fast'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
              </svg>
              Schnell
            </button>
            <button
              onClick={() => setGenerationMode('thinking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${generationMode === 'thinking'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10 2a8 8 0 00-7.984 7.457.77.77 0 01-.227.514A4.25 4.25 0 104.25 18h11.5a4.25 4.25 0 002.461-7.687.77.77 0 01-.227-.172A8 8 0 0010 2z" />
              </svg>
              Denken
            </button>
          </div>
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
                <p className="text-xs text-slate-500">Bitte lege Klasse und Fach fest, um zu speichern.</p>
              </div>
            </div>

            {/* Selection Fields for Saving */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={lastCreatedGame.grade || ''}
                onChange={(e) => handleUpdateDetails({ grade: Number(e.target.value) })}
                className={`px-3 py-2 rounded-lg border ${!lastCreatedGame.grade && error ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'} bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200`}
              >
                <option value="" disabled>Klasse wählen</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>Klasse {g}</option>
                ))}
              </select>

              <select
                value={lastCreatedGame.subject || ''}
                onChange={(e) => handleUpdateDetails({ subject: e.target.value })}
                className={`px-3 py-2 rounded-lg border ${!lastCreatedGame.subject && error ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'} bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200`}
              >
                <option value="" disabled>Fach wählen</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{SUBJECT_DISPLAY_OPTIONS[s]?.label || s}</option>
                ))}
              </select>
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