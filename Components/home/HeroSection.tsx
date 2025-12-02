import React from 'react';
import SparkleIcon from '../icons/SparkleIcon';
import { SubjectIcons } from '../icons/SubjectIcons';
import { HERO_FILTERS, SUBJECT_SHORTCUTS } from '../../constants';
import { useGame } from '../../Context/GameContext';

interface HeroSectionProps {
    activeHeroFilter: string;
    setActiveHeroFilter: (filter: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    activeHeroFilter,
    setActiveHeroFilter,
}) => {
    const { searchTerm, setSearchTerm, selectedSubject, setSelectedSubject } = useGame();
    return (
        <section className="relative rounded-[36px] bg-gradient-to-br from-[#cddfff] via-white to-[#f8d3ff] border border-white/60 shadow-[0_25px_70px_-35px_rgba(132,97,255,0.55)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),rgba(255,255,255,0)_55%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.9),rgba(255,255,255,0)_45%)]" />
            <div className="relative px-6 sm:px-10 lg:px-14 py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
                <div className="max-w-2xl space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-purple-700 shadow-inner shadow-purple-200">
                        <SparkleIcon className="h-4 w-4 text-purple-500" />
                        EduGame Studio
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900">
                        Lernen neu erleben
                    </h1>
                    <p className="text-lg text-slate-600">
                        Erstelle interaktive Lernspiele mit der Leichtigkeit von Canva. Nutze KI, um Ideen zu generieren, Designs zu verfeinern und Lernpfade anzupassen.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        {HERO_FILTERS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveHeroFilter(item.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeHeroFilter === item.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-400/40'
                                    : 'bg-white/70 text-slate-600 hover:bg-white hover:shadow'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <form
                    className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl p-4 flex items-center gap-4"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <SparkleIcon className="h-6 w-6" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Millionen von Lernspielen durchsuchen"
                        className="flex-1 bg-transparent text-base text-slate-700 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                        aria-label="Search minigames"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z" />
                        </svg>
                    </button>
                </form>
            </div>
            <div className="relative border-t border-white/60 px-6 sm:px-10 lg:px-14 py-6 overflow-x-auto">
                <div className="flex items-center gap-4 min-w-max">
                    {SUBJECT_SHORTCUTS.map((shortcut) => (
                        <button
                            key={shortcut.id}
                            type="button"
                            onClick={() => setSelectedSubject(shortcut.value)}
                            className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ${selectedSubject === shortcut.value
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-400/50'
                                : `bg-gradient-to-r ${shortcut.gradient} text-slate-700 hover:shadow-md`
                                }`}
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-slate-600">
                                {SubjectIcons[shortcut.value] ?? SubjectIcons.All}
                            </span>
                            {shortcut.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
