import React, { useState } from 'react';
import { generateMinigameCode } from '../services/geminiService';
import { Minigame } from '../types';

interface VibeCoderProps {
  onGameCreated: (game: Minigame) => void;
}

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.62-3.385m-1.622 3.385a15.998 15.998 0 01-3.388 1.621m-5.043-.025a15.998 15.998 0 005.043.025z" />
    </svg>
);


const VibeCoder: React.FC<VibeCoderProps> = ({ onGameCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your game.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const htmlContent = await generateMinigameCode(prompt);
      const newGame: Minigame = {
        id: `gen-${Date.now()}`,
        title: prompt.length > 25 ? prompt.substring(0, 22) + '...' : prompt,
        description: 'An AI-generated minigame.',
        grade: 1, // Default grade, can be improved later
        subject: 'Art', // Default subject
        htmlContent,
      };
      onGameCreated(newGame);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vibe Coder ✨</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">Describe a simple game, and our AI will create it for you!</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A simple clicker game where a cookie appears in random spots."
        className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg h-28 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
      >
        {isLoading ? (
          <>
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
            Generating...
          </>
        ) : (
          <>
            <WandIcon className="w-5 h-5" />
            Create Minigame
          </>
        )}
      </button>
    </div>
  );
};

export default VibeCoder;