import React from 'react';
import { Minigame } from '../../types';

interface SpotlightCardProps {
    game: Minigame;
    onPlay: (game: Minigame) => void;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ game, onPlay }) => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-1">
            <div className="relative rounded-[22px] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
                    {/* Left: Content */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/30 mb-4">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-amber-400 text-sm font-semibold">Spotlight</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                            {game.title}
                        </h2>

                        {/* Description */}
                        <p className="text-slate-300 text-base sm:text-lg mb-6 line-clamp-2 max-w-xl">
                            {game.description}
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                            <div className="flex items-center gap-2 text-slate-300">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="font-semibold">{game.playCount || 0}</span>
                                <span className="text-slate-400 text-sm">gespielt</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-300">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                    </svg>
                                </div>
                                <span className="font-semibold">{game.likes || 0}</span>
                                <span className="text-slate-400 text-sm">Likes</span>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-slate-300">
                                <span className="text-sm">Klasse {game.grade}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-sm">{game.subject}</span>
                            </div>
                        </div>

                        {/* Creator */}
                        {game.creatorName && (
                            <p className="text-slate-400 text-sm mb-6">
                                Erstellt von <span className="text-slate-300 font-medium">{game.creatorName}</span>
                            </p>
                        )}

                        {/* Play button */}
                        <button
                            onClick={() => onPlay(game)}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.713-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                            Jetzt spielen
                        </button>
                    </div>

                    {/* Right: Visual placeholder/preview */}
                    <div className="hidden lg:flex flex-shrink-0 w-80 h-56 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-white/40 text-sm">Vorschau</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpotlightCard;
