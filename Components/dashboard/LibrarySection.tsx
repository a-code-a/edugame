import React from 'react';
import { Minigame } from '../../types';
import MinigameGrid from '../minigames/MinigameGrid';

interface LibrarySectionProps {
    filteredGames: Minigame[];
    handlePlayGame: (game: Minigame) => void;
    handleDeleteGame: (gameId: string) => void;
    selectedGrade: string;
    setSelectedGrade: (grade: string) => void;
    selectedSubject: string;
    setSelectedSubject: (subject: string) => void;
    setSearchTerm: (term: string) => void;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({
    filteredGames,
    handlePlayGame,
    handleDeleteGame,
    selectedGrade,
    setSelectedGrade,
    selectedSubject,
    setSelectedSubject,
    setSearchTerm,
}) => {
    return (
        <section className="space-y-6">
            <div className="rounded-[24px] bg-white/90 border border-slate-200/60 shadow-xl shadow-slate-300/30 p-6">
                <MinigameGrid games={filteredGames} onPlay={handlePlayGame} onDelete={handleDeleteGame} />
            </div>
        </section>
    );
};

export default LibrarySection;
