import React from 'react';
import { Minigame } from '../../types';
import DatabaseService from '../../Services/DatabaseService';
import { useAuth } from '../../Context/AuthContext';

interface MinigameCardProps {
  game: Minigame;
  onPlay: (game: Minigame) => void;
  onDelete?: (gameId: string) => void;
  forceShowDelete?: boolean;
  deleteTooltip?: string;
  deleteIcon?: React.ReactNode;
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
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    Math: {
      bg: 'bg-sky-100 text-sky-700',
      text: 'text-sky-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5v14" />
        </svg>
      ),
    },
    'Language Arts': {
      bg: 'bg-rose-100 text-rose-700',
      text: 'text-rose-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h13M8 8h13M8 12h13M8 16h9M3 4h.01M3 8h.01M3 12h.01M3 16h.01" />
        </svg>
      ),
    },
    Science: {
      bg: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v5.17a4 4 0 00.8 2.4l2.2 2.933a1 1 0 001.5 0l2.2-2.933a4 4 0 00.8-2.4V6.75m-7.5 0h7.5" />
        </svg>
      ),
    },
    'Social Studies': {
      bg: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    Art: {
      bg: 'bg-purple-100 text-purple-700',
      text: 'text-purple-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.62-3.385m-1.622 3.385a15.998 15.998 0 01-3.388 1.621m-5.043-.025a15.998 15.998 0 005.043.025z" />
        </svg>
      ),
    },
  };

  const variant = palette[subject] ?? {
    bg: 'bg-slate-100 text-slate-700',
    text: 'text-slate-700',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    ),
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg ${variant.bg} px-2.5 py-1.5 text-xs font-medium`}>
      <span className="flex items-center justify-center">
        {variant.icon}
      </span>
      {subject}
    </div>
  );
};

const MinigameCard: React.FC<MinigameCardProps> = ({ game, onPlay, onDelete, forceShowDelete, deleteTooltip, deleteIcon }) => {
  const { user } = useAuth();
  const isAiGenerated = game.id.startsWith('gen-');
  const isSavedToDB = game.isSavedToDB;
  const isOwner = user && game.userId === user.uid;

  const [localGame, setLocalGame] = React.useState(game);

  // Check if current user has liked/disliked
  const userHasLiked = user && localGame.likedBy?.includes(user.uid);
  const userHasDisliked = user && localGame.dislikedBy?.includes(user.uid);

  // Update local state when prop changes
  React.useEffect(() => {
    setLocalGame(game);
  }, [game]);

  const handleDelete = () => {
    if (onDelete && (forceShowDelete || isAiGenerated || isOwner)) {
      onDelete(game.id);
    }
  };

  const handlePlay = async () => {
    onPlay(game);
    // Increment play count in background
    if (isSavedToDB) {
      try {
        const { success, game: updatedGame } = await DatabaseService.getInstance().incrementPlayCount(game.id);
        if (success && updatedGame) {
          setLocalGame(updatedGame);
        }
      } catch (error) {
        console.error('Failed to increment play count', error);
      }
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSavedToDB || !user) return;

    // Optimistic update
    const wasLiked = localGame.likedBy?.includes(user.uid);
    setLocalGame(prev => ({
      ...prev,
      likes: (prev.likes || 0) + (wasLiked ? -1 : 1),
      likedBy: wasLiked
        ? prev.likedBy?.filter(id => id !== user.uid)
        : [...(prev.likedBy || []), user.uid],
      // Remove dislike if adding like
      ...(prev.dislikedBy?.includes(user.uid) && !wasLiked ? {
        dislikes: (prev.dislikes || 0) - 1,
        dislikedBy: prev.dislikedBy?.filter(id => id !== user.uid)
      } : {})
    }));

    try {
      const { success, game: updatedGame } = await DatabaseService.getInstance().toggleLike(game.id);
      if (success && updatedGame) {
        setLocalGame(updatedGame);
      }
    } catch (error) {
      console.error('Failed to like game', error);
      setLocalGame(game); // Revert on failure
    }
  };

  const handleDislike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSavedToDB || !user) return;

    // Optimistic update
    const wasDisliked = localGame.dislikedBy?.includes(user.uid);
    setLocalGame(prev => ({
      ...prev,
      dislikes: (prev.dislikes || 0) + (wasDisliked ? -1 : 1),
      dislikedBy: wasDisliked
        ? prev.dislikedBy?.filter(id => id !== user.uid)
        : [...(prev.dislikedBy || []), user.uid],
      // Remove like if adding dislike
      ...(prev.likedBy?.includes(user.uid) && !wasDisliked ? {
        likes: (prev.likes || 0) - 1,
        likedBy: prev.likedBy?.filter(id => id !== user.uid)
      } : {})
    }));

    try {
      const { success, game: updatedGame } = await DatabaseService.getInstance().toggleDislike(game.id);
      if (success && updatedGame) {
        setLocalGame(updatedGame);
      }
    } catch (error) {
      console.error('Failed to dislike game', error);
      setLocalGame(game); // Revert on failure
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSavedToDB || !isOwner) return;

    const newStatus = !localGame.isPublic;

    // Optimistic update
    setLocalGame(prev => ({ ...prev, isPublic: newStatus }));

    try {
      const { success, game: updatedGame } = await DatabaseService.getInstance().togglePublicStatus(game.id, newStatus);
      if (success && updatedGame) {
        setLocalGame(updatedGame);
      }
    } catch (error) {
      console.error('Failed to share game', error);
      // Revert on failure
      setLocalGame(prev => ({ ...prev, isPublic: !newStatus }));
    }
  };



  return (
    <article className="group relative overflow-hidden rounded-[20px] border border-slate-200/60 bg-white shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="relative p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* ... existing header content ... */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 text-indigo-700 px-2 py-1 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
                </svg>
                Klasse {localGame.grade}
              </span>
              <SubjectBadge subject={localGame.subject} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mb-1">{localGame.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-2">{localGame.description}</p>
            {localGame.creatorName && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
                <span>{localGame.creatorName}</span>
              </div>
            )}
          </div>
          {(forceShowDelete || isAiGenerated || isOwner) && onDelete && (
            <button
              onClick={handleDelete}
              className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title={deleteTooltip || "Spiel löschen"}
              aria-label={deleteTooltip || "Spiel löschen"}
            >
              {deleteIcon || (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {/* ... badges ... */}
            {isAiGenerated && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 text-purple-600 px-2.5 py-1 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
                </svg>
                AI Generiert
              </div>
            )}

            {isSavedToDB && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 text-green-600 px-2.5 py-1 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Gespeichert
              </div>
            )}

            {localGame.isPublic && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Öffentlich
              </div>
            )}
          </div>

          {isSavedToDB && (
            <div className="flex items-center gap-2 text-xs text-slate-500 relative">
              <span className="flex items-center gap-1" title="Gespielt">
                <PlayIcon className="h-3 w-3" />
                {localGame.playCount || 0}
              </span>
              <button
                onClick={handleLike}
                disabled={!user}
                className={`flex items-center gap-1 transition-colors ${userHasLiked ? 'text-indigo-600' : 'hover:text-indigo-600'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={user ? (userHasLiked ? 'Like entfernen' : 'Gefällt mir') : 'Anmelden zum Liken'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-3.5 w-3.5 ${userHasLiked ? 'text-indigo-600' : ''}`}>
                  <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.738L9.78 5.19a2 2 0 011.22 0l.5.11z" />
                </svg>
                <span className={userHasLiked ? 'font-semibold' : ''}>{localGame.likes || 0}</span>
              </button>
              <button
                onClick={handleDislike}
                disabled={!user}
                className={`flex items-center gap-1 transition-colors ${userHasDisliked ? 'text-red-600' : 'hover:text-red-600'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={user ? (userHasDisliked ? 'Dislike entfernen' : 'Gefällt mir nicht') : 'Anmelden zum Disliken'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-3.5 w-3.5 ${userHasDisliked ? 'text-red-600' : ''}`}>
                  <path d="M18.905 12.75a1.25 1.25 0 01-2.5 0v-7.5a1.25 1.25 0 112.5 0v7.5zM8.905 17v1.3c0 .268-.14.526-.395.607A2 2 0 015.905 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.243 0-2.261-1.01-2.146-2.247.193-2.125.663-4.175 1.341-5.974C2.752 3.677 3.833 3 5.005 3h3.192a3 3 0 011.341.317l2.734 1.366A3 3 0 0013.613 5h1.292v7h-.963c-.685 0-1.258.483-1.612 1.068a4.011 4.011 0 01-2.166 1.738l-.257.09a2 2 0 01-1.22 0l-.5-.11z" />
                </svg>
                <span className={userHasDisliked ? 'font-semibold' : ''}>{localGame.dislikes || 0}</span>
              </button>

            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* ... existing buttons ... */}
          <button
            onClick={handlePlay}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <PlayIcon className="h-4 w-4" />
            Spiel starten
          </button>

          {isOwner && isSavedToDB && (
            <button
              onClick={handleShare}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold shadow-md transition-all duration-200 ${localGame.isPublic
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              title={localGame.isPublic ? "Veröffentlichung aufheben" : "Veröffentlichen"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MinigameCard;