import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import DatabaseService from '../../Services/DatabaseService';
import { Playlist } from '../../types';

const PlaylistsPage: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

    const loadPlaylists = async () => {
        setLoading(true);
        const data = await DatabaseService.getInstance().getPlaylists();
        setPlaylists(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPlaylists();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistTitle.trim()) return;

        await DatabaseService.getInstance().createPlaylist(newPlaylistTitle);
        setNewPlaylistTitle('');
        setShowCreateModal(false);
        loadPlaylists();
    };

    const deletePlaylist = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        if (confirm('Playlist wirklich löschen?')) {
            await DatabaseService.getInstance().deletePlaylist(id);
            loadPlaylists();
        }
    };

    return (
        <div className="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Playlists</h1>
                    <p className="text-slate-600">Erstelle und verwalte deine Spielesammlungen.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                    Neue Playlist
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Laden...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {playlists.map(playlist => (
                        <NavLink to={`/playlists/${playlist._id}`} key={playlist._id} className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                            {/* Placeholder Thumbnail Area - could find first game image later */}
                            <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg text-slate-900 mb-1">{playlist.title}</h3>
                                <div className="flex justify-between items-center text-sm text-slate-500">
                                    <span>{playlist.gameCount || 0} Spiele</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{playlist.isPublic ? 'Öffentlich' : 'Privat'}</span>
                                </div>
                                <button
                                    onClick={(e) => deletePlaylist(playlist._id, e)}
                                    className="mt-4 text-xs text-red-500 hover:text-red-700 hover:underline"
                                >
                                    Löschen
                                </button>
                            </div>
                        </NavLink>
                    ))}

                    {playlists.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            Noch keine Playlists erstellt.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Neue Playlist erstellen</h3>
                        <form onSubmit={handleCreate}>
                            <input
                                type="text"
                                value={newPlaylistTitle}
                                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                                placeholder="Titel der Playlist"
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newPlaylistTitle.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    Erstellen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistsPage;
