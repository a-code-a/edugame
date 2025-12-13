import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatabaseService from '../../Services/DatabaseService';
import { Minigame, Playlist } from '../../types';
import MinigameGrid from '../minigames/MinigameGrid';
import { useGame } from '../../Context/GameContext';
import { useAuth } from '../../Context/AuthContext';

const PlaylistDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState<Playlist & { games: Minigame[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const { playGame } = useGame();
    const { user } = useAuth();

    const loadPlaylist = async () => {
        if (!id) return;
        setLoading(true);
        const data = await DatabaseService.getInstance().getPlaylist(id);
        if (!data) {
            navigate('/playlists'); // redirect if not found
            return;
        }
        setPlaylist(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPlaylist();
    }, [id]);

    const handleRemoveGame = async (gameId: string) => {
        if (!playlist) return;
        if (confirm("Möchtest du dieses Spiel wirklich aus der Playlist entfernen?")) {
            const success = await DatabaseService.getInstance().removeGameFromPlaylist(playlist._id, gameId);
            if (success) {
                // Update local state
                setPlaylist({
                    ...playlist,
                    games: playlist.games.filter(g => g.id !== gameId)
                });
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Laden...</div>;
    if (!playlist) return null;

    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-8 border-b border-slate-200 pb-8">
                <button onClick={() => navigate('/playlists')} className="text-sm text-slate-500 hover:text-indigo-600 mb-4 inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Zurück zu Playlists
                </button>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{playlist.title}</h1>
                {playlist.description && <p className="text-slate-600 text-lg">{playlist.description}</p>}
                <div className="mt-4 flex gap-4 text-sm text-slate-500">
                    <span>{playlist.games.length} Spiele</span>
                    <span>Erstellt: {new Date(playlist.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Show remove button if user owns the playlist */}
            <MinigameGrid
                games={playlist.games}
                onPlay={playGame}
                emptyMessage="Diese Playlist enthält noch keine Spiele."
                onDelete={user && playlist.userId === user.uid ? handleRemoveGame : undefined}
                forceShowDelete={user && playlist.userId === user.uid}
                deleteTooltip="Aus Playlist entfernen"
                deleteIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                    </svg>
                }
            />
        </div>
    );
};

export default PlaylistDetailPage;
