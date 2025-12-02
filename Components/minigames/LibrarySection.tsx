import React from 'react';
import { useGame } from '../../Context/GameContext';
import MinigameGrid from './MinigameGrid';

const LibrarySection: React.FC = () => {
    const { filteredGames, playGame, deleteGame } = useGame();
    return (
        <section className="space-y-6">
            <div className="rounded-[24px] bg-white/90 border border-slate-200/60 shadow-xl shadow-slate-300/30 p-6">
                <MinigameGrid games={filteredGames} onPlay={playGame} onDelete={deleteGame} />
            </div>
        </section>
    );
};

export default LibrarySection;
