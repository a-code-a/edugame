import React, { useEffect, useState, useCallback } from 'react';
import { Minigame } from '../../types';
import DatabaseService from '../../Services/DatabaseService';
import MinigameGrid from '../minigames/MinigameGrid';
import SpotlightCard from '../explore/SpotlightCard';
import ExploreFilters from '../explore/ExploreFilters';
import { useGame } from '../../Context/GameContext';

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function ExplorePage() {
    const [games, setGames] = useState<Minigame[]>([]);
    const [spotlightGame, setSpotlightGame] = useState<Minigame | null>(null);
    const [loading, setLoading] = useState(true);
    const [spotlightLoading, setSpotlightLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGames, setTotalGames] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [subject, setSubject] = useState('All');
    const [grade, setGrade] = useState('All');
    const [sort, setSort] = useState('newest');

    const debouncedSearch = useDebounce(search, 300);

    const { playGame } = useGame();

    // Load spotlight game
    useEffect(() => {
        const loadSpotlight = async () => {
            setSpotlightLoading(true);
            const game = await DatabaseService.getInstance().getSpotlightGame();
            setSpotlightGame(game);
            setSpotlightLoading(false);
        };
        loadSpotlight();
    }, []);

    // Load games when filters or page changes
    useEffect(() => {
        loadGames();
    }, [page, debouncedSearch, subject, grade, sort]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, subject, grade, sort]);

    const loadGames = async () => {
        setLoading(true);
        const { games: publicGames, totalPages: total, totalGames: count } =
            await DatabaseService.getInstance().getPublicGames(page, 12, {
                sort: sort as any,
                subject,
                grade,
                search: debouncedSearch,
            });
        setGames(publicGames);
        setTotalPages(total);
        setTotalGames(count);
        setLoading(false);
    };

    const handlePlayGame = (game: Minigame) => {
        playGame(game);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto space-y-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Entdecken
                    </h1>
                    <p className="text-lg text-slate-600">
                        Stöbere durch Spiele, die von anderen Lehrkräften erstellt wurden.
                        Finde Inspiration oder nutze sie direkt im Unterricht.
                    </p>
                </div>

                {/* Spotlight Section */}
                {spotlightLoading ? (
                    <div className="animate-pulse rounded-3xl bg-gradient-to-r from-indigo-200 to-purple-200 h-72" />
                ) : spotlightGame ? (
                    <SpotlightCard game={spotlightGame} onPlay={handlePlayGame} />
                ) : null}

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <ExploreFilters
                        search={search}
                        onSearchChange={setSearch}
                        subject={subject}
                        onSubjectChange={setSubject}
                        grade={grade}
                        onGradeChange={setGrade}
                        sort={sort}
                        onSortChange={setSort}
                        totalGames={totalGames}
                    />
                </div>

                {/* Games Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800">
                            {debouncedSearch ? (
                                <>Suchergebnisse für "<span className="text-indigo-600">{debouncedSearch}</span>"</>
                            ) : subject !== 'All' ? (
                                <>{SUBJECT_LABELS[subject] || subject} Spiele</>
                            ) : (
                                'Alle Spiele'
                            )}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse rounded-[20px] bg-slate-100 h-64" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <MinigameGrid
                                games={games}
                                onPlay={handlePlayGame}
                                emptyMessage={
                                    debouncedSearch
                                        ? `Keine Spiele für "${debouncedSearch}" gefunden.`
                                        : "Keine öffentlichen Spiele gefunden."
                                }
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-10">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 7) {
                                                pageNum = i + 1;
                                            } else if (page <= 4) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 3) {
                                                pageNum = totalPages - 6 + i;
                                            } else {
                                                pageNum = page - 3 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === pageNum
                                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    <span className="ml-4 text-sm text-slate-500">
                                        Seite <span className="font-semibold text-slate-700">{page}</span> von <span className="font-semibold text-slate-700">{totalPages}</span>
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Empty state encouragement */}
                {!loading && games.length === 0 && !debouncedSearch && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">Noch keine Spiele verfügbar</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Sei der Erste! Erstelle ein Spiel und teile es mit der Community.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Subject label mapping
const SUBJECT_LABELS: Record<string, string> = {
    'Math': 'Mathe',
    'Language Arts': 'Sprache',
    'Science': 'Wissenschaft',
    'Social Studies': 'Gesellschaft',
    'Art': 'Kunst',
};
