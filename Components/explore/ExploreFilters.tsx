import React from 'react';
import { SUBJECTS } from '../../constants';

interface ExploreFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    subject: string;
    onSubjectChange: (value: string) => void;
    grade: string;
    onGradeChange: (value: string) => void;
    sort: string;
    onSortChange: (value: string) => void;
    totalGames: number;
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Neueste' },
    { value: 'mostLiked', label: 'Beliebteste' },
    { value: 'mostPlayed', label: 'Meistgespielt' },
    { value: 'trending', label: 'Trending' },
];

const GRADE_OPTIONS = [
    { value: 'All', label: 'Alle Klassen' },
    ...Array.from({ length: 13 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Klasse ${i + 1}`,
    })),
];

const SUBJECT_OPTIONS = [
    { value: 'All', label: 'Alle', icon: '📚' },
    { value: 'Math', label: 'Mathe', icon: '🔢' },
    { value: 'Language Arts', label: 'Sprache', icon: '📖' },
    { value: 'Science', label: 'Wissenschaft', icon: '🔬' },
    { value: 'Social Studies', label: 'Gesellschaft', icon: '🌍' },
    { value: 'Art', label: 'Kunst', icon: '🎨' },
];

const ExploreFilters: React.FC<ExploreFiltersProps> = ({
    search,
    onSearchChange,
    subject,
    onSubjectChange,
    grade,
    onGradeChange,
    sort,
    onSortChange,
    totalGames,
}) => {
    return (
        <div className="space-y-5">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Spiele durchsuchen..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-slate-700 placeholder:text-slate-400"
                />
                {search && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Subject Pills */}
            <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onSubjectChange(option.value)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${subject === option.value
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                    >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>

            {/* Dropdowns Row */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Grade Dropdown */}
                <div className="relative">
                    <select
                        value={grade}
                        onChange={(e) => onGradeChange(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer hover:border-slate-300 transition-all"
                    >
                        {GRADE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer hover:border-slate-300 transition-all"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Results count */}
                <div className="ml-auto text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">{totalGames}</span> Spiele gefunden
                </div>
            </div>
        </div>
    );
};

export default ExploreFilters;
