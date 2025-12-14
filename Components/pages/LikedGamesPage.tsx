import React, { useEffect, useState } from 'react';
import { Minigame } from '../../types';
import DatabaseService from '../../Services/DatabaseService';
import MinigameGrid from '../minigames/MinigameGrid';
import { useGame } from '../../Context/GameContext';

const LikedGamesPage: React.FC = () => {
    const [games, setGames] = useState<Minigame[]>([]);
    const [loading, setLoading] = useState(true);
    const { playGame } = useGame();

    useEffect(() => {
        const loadLikedGames = async () => {
            setLoading(true);
            const likedGames = await DatabaseService.getInstance().getLikedGames();
            setGames(likedGames);
            setLoading(false);
        };

        loadLikedGames();
    }, []);

    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto min-h-screen">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Spiele, die ich mag</h1>
            <p className="text-slate-600 mb-8">Spiele, die du mit "Gefällt mir" markiert hast.</p>

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
                    emptyMessage="Du hast noch keine Spiele mit 'Gefällt mir' markiert."
                />
            )}
        </div>
    );
};

export default LikedGamesPage;
