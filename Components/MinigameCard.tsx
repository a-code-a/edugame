import React from 'react';
import { Minigame } from '../types';

// Fix: Define MinigameCardProps interface for component props
interface MinigameCardProps {
  game: Minigame;
  onPlay: (game: Minigame) => void;
}

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.713-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);


const MinigameCard: React.FC<MinigameCardProps> = ({ game, onPlay }) => {
  const isAiGenerated = game.id.startsWith('gen-');

  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col group">
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-4">{game.title}</h3>
            <div className="flex-shrink-0 flex items-center gap-2">
                <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Grade {game.grade}
                </span>
                <span className="inline-block bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {game.subject}
                </span>
            </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">{game.description}</p>
        
        {isAiGenerated && (
            <div className="text-xs text-purple-500 dark:text-purple-400 mb-4 font-medium flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M9.594.812a.5.5 0 0 1 .812 0l1.25 2.532 2.796.406a.5.5 0 0 1 .277.853l-2.023 1.972.478 2.784a.5.5 0 0 1-.726.527L8 8.732l-2.498 1.313a.5.5 0 0 1-.726-.527l.478-2.784-2.023-1.972a.5.5 0 0 1 .277-.853l2.796-.406L5.594.812a.5.5 0 0 1 .812 0L8 3.344l1.594-2.532ZM6.406 15.188a.5.5 0 0 1 .812 0L8 12.656l.781 2.532a.5.5 0 0 1 .812 0l.443.894a.5.5 0 0 1-.363.633l-1.42.355a.5.5 0 0 1-.496 0l-1.42-.355a.5.5 0 0 1-.363-.633l.443-.894Z" /></svg>
                <span>AI Generated</span>
            </div>
        )}

        <button
          onClick={() => onPlay(game)}
          className="w-full mt-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2 group-hover:bg-blue-600"
        >
          <PlayIcon className="w-5 h-5" />
          Play Game
        </button>
      </div>
    </div>
  );
};

export default MinigameCard;