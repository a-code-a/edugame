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
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Minigame Library</h2>
                    <p className="text-slate-500 mt-1">
                        Durchsuche deine neuesten Spiele oder starte mit einer Vorlage. Alle Änderungen erscheinen hier sofort.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <FilterControls
                        selectedGrade={selectedGrade}
                        setSelectedGrade={setSelectedGrade}
                        selectedSubject={selectedSubject}
                        setSelectedSubject={setSelectedSubject}
                    />
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:shadow-sm"
                        onClick={() => {
                            setSelectedGrade('All');
                            setSelectedSubject('All');
                            setSearchTerm('');
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6m-2 4h6m-6 4h10m4-8h2m-2 4h2m-2 4h2" />
                        </svg>
                        Zurücksetzen
                    </button>
                </div>
            </div>

            <div className="bg-white/90 rounded-[30px] border border-white shadow-[0_35px_90px_-60px_rgba(70,60,125,0.7)] p-8">
                <MinigameGrid games={filteredGames} onPlay={handlePlayGame} onDelete={handleDeleteGame} />
            </div>
        </section>
    );
};

export default LibrarySection;
