import React, { useState } from 'react';
import { generateMinigameCode } from '../../Services/geminiService';
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

const quickPrompts = [
  'Create a memory game to learn the planets.',
  'Design a spelling challenge for grade 2 students.',
  'Build a fractions quiz with visual aids.',
  'Generate a typing speed mini challenge.',
];

const VibeCoder: React.FC<VibeCoderProps> = ({ onGameCreated, onGameSaved }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedGame, setLastCreatedGame] = useState<Minigame | null>(null);
  const { settings } = useSettings();
  const databaseService = DatabaseService.getInstance();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your game.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const htmlContent = await generateMinigameCode(prompt, settings);
      const newGame: Minigame = {
        id: `gen-${Date.now()}`,
        title: prompt.length > 25 ? `${prompt.substring(0, 22)}...` : prompt,
        description: 'An AI-generated minigame.',
        grade: 1,
        subject: 'Art',
        htmlContent,
      };
      onGameCreated(newGame);
      setLastCreatedGame(newGame);
      setPrompt('');
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
    <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white/95 via-[#eef3ff] to-white shadow-xl shadow-indigo-200/40">
      <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-gradient-to-br from-purple-400/40 to-indigo-400/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-8 h-64 w-64 rounded-full bg-gradient-to-tr from-sky-200/40 to-purple-300/40 blur-3xl" />
      <div className="relative z-10 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-300/40">
            <WandIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Vibe Coder</h3>
            <p className="text-sm text-slate-500">Beschreibe dein Lernspiel · KI erledigt den Rest</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 border border-white/80 px-4 py-3 flex items-center gap-4 shadow-inner">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 font-semibold">
            1
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Idee formulieren</p>
            <p className="text-xs text-slate-400">Fächer, Lernziele, Interaktionen angeben</p>
          </div>
        </div>

        <textarea
          data-role="vibe-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="z. B. Ein Quiz mit drei Schwierigkeitsstufen, das Bruchteile auf einem Zahlenstrahl visualisiert."
          className="w-full h-36 resize-none rounded-2xl border border-white/80 bg-white/90 p-4 text-slate-800 shadow-inner focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
          disabled={isLoading}
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Schnelle Ideen</p>
          <div className="flex flex-wrap gap-3">
            {quickPrompts.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-purple-100 bg-white px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-400/50 transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Wird erstellt…
            </>
          ) : (
            <>
              <WandIcon className="h-5 w-5" />
              Minigame erzeugen
            </>
          )}
        </button>

        {lastCreatedGame && (
          <div className="mt-6 pt-6 border-t border-slate-200/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Game Created Successfully!</p>
                <p className="text-xs text-slate-500">Save it to your database to access it later</p>
              </div>
            </div>

            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-green-500 to-emerald-500 py-3 text-base font-semibold text-white shadow-lg shadow-green-400/50 transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving to Database...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M17.5 3.5A2.5 2.5 0 0 0 15 6v1.5a.5.5 0 0 1-1 0V6a3.5 3.5 0 1 1 7 0v3.5a5.5 5.5 0 0 1-4.5 5.397V20a.5.5 0 0 1-1 0v-5.103A5.5 5.5 0 0 1 11 9.5V6A5 5 0 0 0 6 6v9a6.5 6.5 0 0 0 5.5 6.397V20a.5.5 0 0 1-1 0v-1.603A7.5 7.5 0 0 1 5 15V6a7 7 0 0 1 14 0v3.5a2.5 2.5 0 0 0 2.5-2.5V6a2.5 2.5 0 0 0-2.5-2.5h-1a.5.5 0 0 1 0-1h1A3.5 3.5 0 0 1 23 6v3.5A3.5 3.5 0 0 1 19.5 13H19a.5.5 0 0 1 0-1h.5A2.5 2.5 0 0 0 22 9.5V6a2.5 2.5 0 0 0-2.5-2.5h-1a.5.5 0 0 1 0-1h1ZM8.5 6A3.5 3.5 0 0 1 12 9.5v5A4.5 4.5 0 0 1 7.5 19h-1a.5.5 0 0 1 0-1h1A3.5 3.5 0 0 0 11 14.5v-5A2.5 2.5 0 0 0 8.5 7h-1a.5.5 0 0 1 0-1h1Z" clipRule="evenodd" />
                  </svg>
                  Save to Database
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