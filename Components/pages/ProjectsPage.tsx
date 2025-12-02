import React from 'react';
import LibrarySection from '../minigames/LibrarySection';
import { useGame } from '../../Context/GameContext';

const ProjectsPage: React.FC = () => {
    const { filteredGames, playGame, searchTerm, setSearchTerm } = useGame();
    // Mock data for rankings/most used
    const mostUsedGames = filteredGames.slice(0, 3); // Just taking first 3 as mock "most used"

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

            {/* Rankings / Most Used Section */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Beliebteste Spiele
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mostUsedGames.map((game, index) => (
                        <div key={game.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => playGame(game)}>
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 flex items-center justify-center font-bold text-xl">
                                #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">{game.title}</h3>
                                <p className="text-xs text-slate-500 truncate">{game.subject} · Klasse {game.grade}</p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-purple-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    {mostUsedGames.length === 0 && (
                        <p className="text-slate-500 text-sm col-span-3">Noch keine Spiele verfügbar.</p>
                    )}
                </div>
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
