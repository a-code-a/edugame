import React from 'react';
import { Minigame } from '../../types';
import FilterControls from '../minigames/FilterControls';
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
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Minigame Library</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Durchsuche deine neuesten Spiele oder starte mit einer Vorlage
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    onClick={() => {
                        setSelectedGrade('All');
                        setSelectedSubject('All');
                        setSearchTerm('');
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Zurücksetzen
                </button>
            </div>

            <div className="rounded-[24px] bg-white/90 border border-slate-200/60 shadow-xl shadow-slate-300/30 p-6">
                <FilterControls
                    selectedGrade={selectedGrade}
                    setSelectedGrade={setSelectedGrade}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                />
            </div>

            <div className="rounded-[24px] bg-white/90 border border-slate-200/60 shadow-xl shadow-slate-300/30 p-6">
                <MinigameGrid games={filteredGames} onPlay={handlePlayGame} onDelete={handleDeleteGame} />
            </div>
        </section>
    );
};

export default LibrarySection;
