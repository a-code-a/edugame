import React from 'react';
import HeroSection from '../dashboard/HeroSection';
import LibrarySection from '../dashboard/LibrarySection';
import TemplatesList from '../dashboard/TemplatesList';
import { Minigame } from '../../types';
import { Link } from 'react-router-dom';

interface HomePageProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    activeHeroFilter: string;
    setActiveHeroFilter: (filter: string) => void;
    selectedSubject: string;
    setSelectedSubject: (subject: string) => void;
    filteredGames: Minigame[];
    handlePlayGame: (game: Minigame) => void;
    handleDeleteGame: (gameId: string) => void;
    selectedGrade: string;
    setSelectedGrade: (grade: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
    searchTerm,
    setSearchTerm,
    activeHeroFilter,
    setActiveHeroFilter,
    selectedSubject,
    setSelectedSubject,
    filteredGames,
    handlePlayGame,
    handleDeleteGame,
    selectedGrade,
    setSelectedGrade,
}) => {
    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 space-y-12">
            <HeroSection
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeHeroFilter={activeHeroFilter}
                setActiveHeroFilter={setActiveHeroFilter}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
            />

            <div className="max-w-[1600px] mx-auto">
                {activeHeroFilter === 'library' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">Bibliothek</h2>
                        </div>
                        <LibrarySection
                            filteredGames={filteredGames}
                            handlePlayGame={handlePlayGame}
                            handleDeleteGame={handleDeleteGame}
                            selectedGrade={selectedGrade}
                            setSelectedGrade={setSelectedGrade}
                            selectedSubject={selectedSubject}
                            setSelectedSubject={setSelectedSubject}
                            setSearchTerm={setSearchTerm}
                        />
                    </div>
                )}

                {activeHeroFilter === 'templates' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">Vorlagen</h2>
                        </div>
                        <TemplatesList />
                    </div>
                )}

                {activeHeroFilter === 'ai' && (
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[30px] p-12 text-center text-white shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                            <h2 className="text-3xl font-bold">EduGame AI Studio</h2>
                            <p className="text-purple-100 text-lg">
                                Erstelle deine eigenen Lernspiele mit der Kraft der künstlichen Intelligenz.
                                Beschreibe einfach deine Idee und lass die Magie geschehen.
                            </p>
                            <Link
                                to="/studio"
                                className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Zum AI Studio
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
