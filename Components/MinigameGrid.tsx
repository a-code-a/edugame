import React from 'react';
import { Minigame } from '../types';
import MinigameCard from './MinigameCard';

interface MinigameGridProps {
  games: Minigame[];
  onPlay: (game: Minigame) => void;
}

const MinigameGrid: React.FC<MinigameGridProps> = ({ games, onPlay }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">No games found</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing the filters or create a new game with Vibe Coder!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {games.map((game) => (
        <MinigameCard key={game.id} game={game} onPlay={onPlay} />
      ))}
    </div>
  );
};

export default MinigameGrid;
