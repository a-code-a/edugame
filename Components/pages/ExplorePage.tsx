import React, { useEffect, useState } from 'react';
import { Minigame } from '../../types';
import DatabaseService from '../../Services/DatabaseService';
import MinigameGrid from '../minigames/MinigameGrid';
import { useGame } from '../../Context/GameContext';

export default function ExplorePage() {
    const [games, setGames] = useState<Minigame[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { playGame } = useGame();

    useEffect(() => {
        loadGames();
    }, [page]);

    const loadGames = async () => {
        setLoading(true);
        const { games: publicGames, totalPages: total } = await DatabaseService.getInstance().getPublicGames(page);
        setGames(publicGames);
        setTotalPages(total);
        setLoading(false);
    };

    const handlePlayGame = (game: Minigame) => {
        playGame(game);
    };

    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Entdecken</h2>
                <p className="text-slate-500">Stöbere durch Spiele, die von anderen Lehrkräften erstellt wurden.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    <MinigameGrid
                        games={games}
                        onPlay={handlePlayGame}
                        emptyMessage="Keine öffentlichen Spiele gefunden."
                    />

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
                            >
                                Zurück
                            </button>
                            <span className="px-4 py-2 text-slate-600">
                                Seite {page} von {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
                            >
                                Weiter
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
