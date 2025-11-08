import React from 'react';
import { Minigame } from '../../types';
import MinigameCard from './MinigameCard';

interface MinigameGridProps {
  games: Minigame[];
  onPlay: (game: Minigame) => void;
  onDelete?: (gameId: string) => void;
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] border border-dashed border-slate-300 bg-white/70 px-10 py-16 text-center shadow-inner">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 shadow">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-slate-800">Keine Spiele gefunden</h3>
      <p className="mt-2 text-sm text-slate-500">
        Passe deine Filter an oder lasse die KI ein neues Minigame erzeugen.
      </p>
    </div>
    <button
      type="button"
      className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/40 hover:shadow-xl"
    >
      Ideen mit Vibe Coder starten
    </button>
  </div>
);

const MinigameGrid: React.FC<MinigameGridProps> = ({ games, onPlay, onDelete }) => {
  if (games.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {games.map((game) => (
        <MinigameCard key={game.id} game={game} onPlay={onPlay} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default MinigameGrid;
