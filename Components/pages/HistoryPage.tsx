import React, { useEffect, useState } from 'react';
import { Minigame } from '../../types';
import DatabaseService from '../../Services/DatabaseService';
import MinigameGrid from '../minigames/MinigameGrid';
import { useGame } from '../../Context/GameContext';

const HistoryPage: React.FC = () => {
    const [games, setGames] = useState<Minigame[]>([]);
    const [loading, setLoading] = useState(true);
    const { playGame } = useGame();

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            const historyGames = await DatabaseService.getInstance().getHistory();
            setGames(historyGames);
            setLoading(false);
        };

        loadHistory();
    }, []);

    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto min-h-screen">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Verlauf</h1>
            <p className="text-slate-600 mb-8">Deine kürzlich gespielten Spiele.</p>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse rounded-[20px] bg-slate-100 h-64" />
                    ))}
                </div>
            ) : (
                <MinigameGrid
                    games={games}
                    onPlay={playGame}
                    emptyMessage="Du hast noch keine Spiele gespielt."
                />
            )}
        </div>
    );
};

export default HistoryPage;
