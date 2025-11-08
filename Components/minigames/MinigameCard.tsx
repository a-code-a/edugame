import React from 'react';
import { Minigame } from '../../types';

interface MinigameCardProps {
  game: Minigame;
  onPlay: (game: Minigame) => void;
  onDelete?: (gameId: string) => void;
}

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.713-2.779-.217-2.779-1.643V5.653z"
      clipRule="evenodd"
    />
  </svg>
);

const SubjectBadge: React.FC<{ subject: string }> = ({ subject }) => {
  const palette: Record<
    string,
    { bg: string; text: string; accent: string; icon: React.ReactNode }
  > = {
    Math: {
      bg: 'from-sky-100 to-sky-200 text-sky-700',
      text: 'text-sky-700',
      accent: 'bg-sky-500/20 text-sky-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5v14" />
        </svg>
      ),
    },
    'Language Arts': {
      bg: 'from-pink-100 to-rose-200 text-rose-700',
      text: 'text-rose-700',
      accent: 'bg-rose-500/20 text-rose-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h13M8 8h13M8 12h13M8 16h9M3 4h.01M3 8h.01M3 12h.01M3 16h.01" />
        </svg>
      ),
    },
    Science: {
      bg: 'from-green-100 to-emerald-200 text-emerald-700',
      text: 'text-emerald-700',
      accent: 'bg-emerald-500/20 text-emerald-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v5.17a4 4 0 00.8 2.4l2.2 2.933a1 1 0 001.5 0l2.2-2.933a4 4 0 00.8-2.4V6.75m-7.5 0h7.5" />
        </svg>
      ),
    },
    'Social Studies': {
      bg: 'from-amber-100 to-orange-200 text-amber-700',
      text: 'text-amber-700',
      accent: 'bg-amber-500/20 text-amber-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a4 4 0 110 8 4 4 0 010-8zM4 18a6 6 0 0112 0v1H4v-1z" />
        </svg>
      ),
    },
    Art: {
      bg: 'from-purple-100 to-indigo-200 text-indigo-700',
      text: 'text-indigo-700',
      accent: 'bg-purple-500/20 text-purple-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 18.75l-1.5 1.5m0 0l-1.5-1.5m1.5 1.5V15m9.75 0H7.5a3 3 0 01-3-3V7.5a3 3 0 013-3h6.75a3 3 0 013 3v10.5a3 3 0 01-3 3z" />
        </svg>
      ),
    },
  };

  const variant = palette[subject] ?? {
    bg: 'from-slate-100 to-slate-200 text-slate-700',
    text: 'text-slate-700',
    accent: 'bg-slate-400/20 text-slate-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    ),
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${variant.bg} px-3 py-1.5 text-xs font-semibold ${variant.text}`}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-slate-600">
        {variant.icon}
      </span>
      {subject}
      <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${variant.accent}`}>
        Fach
      </span>
    </div>
  );
};

const MinigameCard: React.FC<MinigameCardProps> = ({ game, onPlay, onDelete }) => {
  const isAiGenerated = game.id.startsWith('gen-');
  const isSavedToDB = game.isSavedToDB;

  // Debug logging to verify AI-generated game detection
  console.log(`MinigameCard: ${game.title} (ID: ${game.id}) - isAiGenerated: ${isAiGenerated}, onDelete provided: ${!!onDelete}`);

  const handleDelete = () => {
    if (onDelete && isAiGenerated) {
      console.log(`Deleting game: ${game.id} - ${game.title}`);
      onDelete(game.id);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-white via-[#f7f8ff] to-white shadow-lg shadow-slate-200/50 transition transform hover:-translate-y-1 hover:shadow-2xl">
      <div className="absolute -top-20 -right-12 h-40 w-40 rounded-full bg-gradient-to-br from-purple-400/30 to-sky-300/20 blur-2xl transition duration-500 group-hover:scale-125" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.7),rgba(255,255,255,0)_55%)] pointer-events-none" />
      <div className="relative z-10 flex h-full flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-600 px-3 py-1 text-xs font-semibold">
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-indigo-600">
                Klasse {game.grade}
              </span>
              Lernlevel
            </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{game.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <SubjectBadge subject={game.subject} />
            {isAiGenerated && onDelete && (
              <button
                onClick={handleDelete}
                className="ml-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                title="Spiel löschen"
                aria-label="Spiel löschen"
              >
                <span className="text-lg">🗑️</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed">{game.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          {isAiGenerated && (
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-600 px-3 py-1 text-xs font-semibold shadow-inner shadow-purple-200/40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path d="M9.594.812a.5.5 0 0 1 .812 0l1.25 2.532 2.796.406a.5.5 0 0 1 .277.853l-2.023 1.972.478 2.784a.5.5 0 0 1-.726.527L8 8.732l-2.498 1.313a.5.5 0 0 1-.726-.527l.478-2.784-2.023-1.972a.5.5 0 0 1 .277-.853l2.796-.406L5.594.812a.5.5 0 0 1 .812 0L8 3.344l1.594-2.532ZM6.406 15.188a.5.5 0 0 1 .812 0L8 12.656l.781 2.532a.5.5 0 0 1 .812 0l.443.894a.5.5 0 0 1-.363.633l-1.42.355a.5.5 0 0 1-.496 0l-1.42-.355a.5.5 0 0 1-.363-.633l.443-.894Z" />
              </svg>
              EduGame AI
            </div>
          )}
          
          {isSavedToDB && (
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-600 px-3 py-1 text-xs font-semibold shadow-inner shadow-green-200/40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
              Database
            </div>
          )}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => onPlay(game)}
            className="w-full inline-flex items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/40 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <PlayIcon className="h-5 w-5" />
            Spiel starten
          </button>
        </div>
      </div>
    </article>
  );
};

export default MinigameCard;