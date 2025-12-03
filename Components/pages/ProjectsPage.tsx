import React from 'react';
import LibrarySection from '../minigames/LibrarySection';
import FilterControls from '../minigames/FilterControls';
import { useGame } from '../../Context/GameContext';

const ProjectsPage: React.FC = () => {
    const {
        filteredGames,
        playGame,
        searchTerm,
        setSearchTerm,
        selectedGrade,
        setSelectedGrade,
        selectedSubject,
        setSelectedSubject,
        sortOption,
        setSortOption
    } = useGame();


    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto space-y-12">

            {/* Search and Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Projekte</h1>
                    <p className="text-slate-600 mt-2">Verwalte und entdecke deine Lernspiele.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Projekte durchsuchen..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Filter Controls */}
            <section>
                <FilterControls
                    selectedGrade={selectedGrade}
                    setSelectedGrade={setSelectedGrade}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                />
            </section>

            {/* Main Library Section */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Alle Spiele</h2>
                <LibrarySection />
            </section>
        </div>
    );
};

export default ProjectsPage;
