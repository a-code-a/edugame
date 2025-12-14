import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Minigame } from '../../types';
import GameChat, { ChatMessage, AttachedFile } from './GameChat';
import { refineMinigameCode } from '../../Services/geminiService';
import DatabaseService from '../../Services/DatabaseService';
import { GRADES, SUBJECTS, SUBJECT_DISPLAY_OPTIONS } from '../../constants';

import { useGame } from '../../Context/GameContext';
import { useAuth } from '../../Context/AuthContext';

const SUBJECT_LABELS = SUBJECT_DISPLAY_OPTIONS;

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const GameViewer: React.FC = () => {
    const { activeGame, closeViewer, updateGame, updateGameDetails, saveGame, playGame } = useGame();
    const { user } = useAuth();

    if (!activeGame) return null;

    const [isShowing, setIsShowing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentGame, setCurrentGame] = useState<Minigame>(activeGame);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'system', text: 'Dies ist ein neues Spiel! Sag mir, was du ändern oder hinzufügen möchtest.' }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showEditPanel, setShowEditPanel] = useState(false);

    const databaseService = DatabaseService.getInstance();

    // Playlist logic
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);

    const playlistMenuRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (playlistMenuRef.current && !playlistMenuRef.current.contains(event.target as Node)) {
                setShowPlaylistMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPlaylists = async () => {
        setLoadingPlaylists(true);
        const data = await databaseService.getPlaylists();
        setPlaylists(data);
        setLoadingPlaylists(false);
    };

    const handlePlaylistClick = () => {
        if (!showPlaylistMenu) {
            fetchPlaylists();
        }
        setShowPlaylistMenu(!showPlaylistMenu);
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        await databaseService.addGameToPlaylist(playlistId, currentGame.id);
        setShowPlaylistMenu(false);
        // Optional: Show success feedback
    };

    const [isForking, setIsForking] = useState(false);

    useEffect(() => {
        setIsShowing(true);
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeViewer();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [closeViewer]);

    useEffect(() => {
        setCurrentGame(activeGame);
        // Focus iframe when game loads/changes
        setTimeout(() => iframeRef.current?.focus(), 100);
    }, [activeGame]);

    const handleSendMessage = useCallback(async (message: string, files: AttachedFile[]) => {
        // Optimistic UI update: Show user message (files are not shown in chat bubble yet, sticking to text logic for now or we could add file indicators)
        const fileNames = files.map(f => `[Datei: ${f.name}]`).join(', ');
        const displayMessage = message + (fileNames ? `\n${fileNames}` : '');

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: displayMessage }];
        setMessages(newMessages);
        setIsGenerating(true);

        try {
            // Pass files to service using the correct FilePart structure
            const fileParts = files.map(f => ({ mimeType: f.mimeType, data: f.data }));
            const newHtmlContent = await refineMinigameCode(message, currentGame.htmlContent, fileParts);

            const updatedGame = { ...currentGame, htmlContent: newHtmlContent };
            setCurrentGame(updatedGame);
            updateGame(activeGame.id, newHtmlContent);

            setMessages([...newMessages, { sender: 'ai', text: "Ich habe das Spiel mit deinen Änderungen aktualisiert. Schau es dir an!" }]);
            // Re-focus iframe after update
            setTimeout(() => iframeRef.current?.focus(), 100);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setMessages([...newMessages, { sender: 'system', text: `Entschuldigung, ich konnte das Spiel nicht aktualisieren. ${errorMessage}` }]);
        } finally {
            setIsGenerating(false);
        }
    }, [messages, currentGame, updateGame, activeGame.id]);

    const isOwner = user && activeGame.userId === user.uid;
    // Allow editing if it's an AI generated game AND the user is the owner
    // OR if it's a newly generated game (starts with gen-) which implies ownership in the current session context usually, 
    // but better to rely on isOwner if possible. 
    // For "gen-" IDs, they might not have a userId set yet if not saved, so we fallback to assuming ownership for unsaved games in non-public context.
    // However, looking at VibeCoder, it doesn't set userId until save.
    // So: If id starts with 'gen-', it's local and editable. 
    // If it has a real ID, check ownership.
    // Allow editing if:
    // 1. The user is the owner (creator or remixer)
    // 2. It is a strictly LOCAL, UNSAVED game (e.g. just generated in Vibe Coder)
    //    We check this by id starting with 'gen-' AND NOT having a userId attached yet.
    const canEdit = isOwner || (activeGame.id.startsWith('gen-') && !activeGame.userId);

    // Logic for "Save" vs "Update" is handled by the button label logic later, 
    // but `canEdit` controls the visibility of the whole edit UI (chat, details panel).
    // BUT we want to allow saving/updating changes to owned games.
    // Let's refine:

    // We need a way to distinguishing "Saving a totally new game" vs "Saving changes to an existing game".
    // transform `canBeSaved` button to `Save/Update` button.

    const handleDetailChange = (field: 'grade' | 'subject' | 'title', value: string | number) => {
        const updates = { [field]: field === 'grade' ? Number(value) : value };
        updateGameDetails(activeGame.id, updates);
        setCurrentGame(prev => ({ ...prev, ...updates }));
    };

    const handleSaveToDatabase = useCallback(async () => {
        setIsSaving(true);
        setSaveError(null);
        setSaveStatus('idle');

        try {
            const gameToSave = {
                ...currentGame,
                creatorName: user?.displayName || user?.email || 'Anonymous'
            };

            // If it's an existing game (not gen-), using saveGame might create a duplicate if not careful, 
            // but DatabaseService.saveGame uses POST /games which does findOneAndUpdate with upsert based on ID.
            // So it acts as an Upsert. Safe to use.
            const result = await databaseService.saveGame(gameToSave);

            if (result.success && result.game) {
                console.log('Game saved to database:', result.game.id);
                setSaveStatus('success');
                if (saveGame) {
                    saveGame(result.game);
                }
                setShowEditPanel(false);
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                const errorMessage = result.error || 'Failed to save game';
                setSaveError(errorMessage);
                setSaveStatus('error');
                console.error('Save failed:', errorMessage);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            setSaveError(errorMessage);
            setSaveStatus('error');
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    }, [currentGame, saveGame, databaseService, user]);

    const handleFork = async () => {
        setIsForking(true);
        setSaveError(null);
        try {
            // Pass user's name for the creator field of the new copy
            const creatorName = user?.displayName || user?.email || 'Anonymous';
            const result = await databaseService.forkGame(activeGame.id, creatorName);

            if (result.success && result.game && saveGame) {
                // Add the new game to the local context
                saveGame(result.game);
                // Switch to the new game
                playGame(result.game);
            } else {
                setSaveError(result.error || "Fehler beim Kopieren.");
            }
        } catch (err) {
            console.error(err);
            setSaveError("Fehler beim Kopieren.");
        } finally {
            setIsForking(false);
        }
    };

    const subjectInfo = SUBJECT_LABELS[currentGame.subject] || { label: currentGame.subject, icon: '📚', color: 'bg-slate-100 text-slate-700' };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isFullscreen ? 'p-0' : 'p-4'} ${isShowing ? 'opacity-100' : 'opacity-0'}`}
            aria-modal="true"
            role="dialog"
        >
            {!isFullscreen && <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={closeViewer}></div>}

            <div className={`relative flex flex-col bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-[95vw] h-[95vh] rounded-2xl'} ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Helmet>
                    <title>{currentGame.title} - EduGame</title>
                    <meta name="description" content={currentGame.description} />
                </Helmet>
                {/* Header - hidden in fullscreen */}
                {!isFullscreen && (
                    <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl flex-shrink-0">
                        {/* Title and badges */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{currentGame.title}</h2>

                                {/* Read-only badges */}
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
                                        </svg>
                                        Klasse {currentGame.grade}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${subjectInfo.color}`}>
                                        <span>{subjectInfo.icon}</span>
                                        {subjectInfo.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {/* Add to Playlist Button - only for logged in users */}
                            {user && (
                                <div className="relative" ref={playlistMenuRef}>
                                    <button
                                        onClick={handlePlaylistClick}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${showPlaylistMenu ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        title="Zur Playlist hinzufügen"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                        </svg>
                                        <span className="hidden sm:inline">Speichern</span>
                                    </button>

                                    {showPlaylistMenu && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                                            {loadingPlaylists ? (
                                                <div className="px-4 py-3 text-sm text-slate-400 text-center">Laden...</div>
                                            ) : playlists.length > 0 ? (
                                                <>
                                                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50">Playlist wählen</div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {playlists.map(p => (
                                                            <button
                                                                key={p._id}
                                                                onClick={() => handleAddToPlaylist(p._id)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-50">
                                                                    <path d="M3.75 3a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75H4c.603 0 1.17.2 1.622.544.453.344.628.601.628 1.206 0 .5-.213.914-.54 1.214-.298.275-.66.45-1.008.577A7.906 7.906 0 013.75 8a.75.75 0 000 1.5c.312 0 .62.016.923.045.34.034.698-.109.917-.384.22-.275.525-.461.763-.607.238-.146.477-.258.972-.258.5 0 .914.213 1.214.54.275.298.45.66.577 1.008.127.35.18.707.18 1.077v.24c0 .37-.052.727-.18 1.077-.126.348-.302.71-.577 1.008-.3.327-.714.54-1.214.54-.495 0-.734-.112-.972-.258-.238-.146-.543-.332-.763-.607a.75.75 0 00-1.157.868c.28.468.643.83 1.066 1.085.467.28.985.42 1.536.42 1.085 0 2.015-.55 2.607-1.343.593-.793.774-1.728.774-2.56 0-.832-.18-1.767-.774-2.56-.592-.793-1.522-1.343-2.607-1.343-.43 0-.825.086-1.185.234.08-.275.145-.553.188-.84.456-.226.96-.344 1.497-.344 1.085 0 2.015-.55 2.607-1.343.593-.793.774-1.728.774-2.56 0-.832-.18-1.767-.774-2.56-.592-.793-1.522-1.343-2.607-1.343-.551 0-1.069.14-1.536.42-.423.254-.786.617-1.066 1.085a.75.75 0 101.284.77c.184-.307.414-.523.633-.654.22-.132.535-.221.685-.221.056 0 .106.012.146.024a.75.75 0 00.95-.928C9.8 3.23 9.42 3 9 3H3.75z" />
                                                                    <path d="M12.75 3a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75h.25c.603 0 1.17.2 1.622.544.453.344.628.601.628 1.206 0 .5-.213.914-.54 1.214-.298.275-.66.45-1.008.577A7.906 7.906 0 0112.75 8a.75.75 0 000 1.5c.312 0 .62.016.923.045.34.034.698-.109.917-.384.22-.275.525-.461.763-.607.238-.146.477-.258.972-.258.5 0 .914.213 1.214.54.275.298.45.66.577 1.008.127.35.18.707.18 1.077v.24c0 .37-.052.727-.18 1.077-.126.348-.302.71-.577 1.008-.3.327-.714.54-1.214.54-.495 0-.734-.112-.972-.258-.238-.146-.543-.332-.763-.607a.75.75 0 00-1.157.868c.28.468.643.83 1.066 1.085.467.28.985.42 1.536.42 1.085 0 2.015-.55 2.607-1.343.593-.793.774-1.728.774-2.56 0-.832-.18-1.767-.774-2.56-.592-.793-1.522-1.343-2.607-1.343-.43 0-.825.086-1.185.234.08-.275.145-.553.188-.84.456-.226.96-.344 1.497-.344 1.085 0 2.015-.55 2.607-1.343.593-.793.774-1.728.774-2.56 0-.832-.18-1.767-.774-2.56-.592-.793-1.522-1.343-2.607-1.343-.551 0-1.069.14-1.536.42-.423.254-.786.617-1.066 1.085a.75.75 0 101.284.77c.184-.307.414-.523.633-.654.22-.132.535-.221.685-.221.056 0 .106.012.146.024a.75.75 0 00.95-.928c.185-.436.25-1.01.18-1.464" />
                                                                </svg>
                                                                {p.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-slate-500 text-center">Keine Playlists gefunden</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fork/Remix button for non-owners */}
                            {!isOwner && user && (
                                <button
                                    onClick={handleFork}
                                    disabled={isForking}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
                                    title="Spiel in meine Projekte kopieren, um es zu bearbeiten"
                                >
                                    {isForking ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    )}
                                    <span className="hidden sm:inline">Remix</span>
                                </button>
                            )}

                            {/* Edit button for Owners (or AI generated new games) */}
                            {canEdit && (
                                <button
                                    onClick={() => setShowEditPanel(!showEditPanel)}
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${showEditPanel
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    title="Details bearbeiten"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="hidden sm:inline">Details</span>
                                </button>
                            )}

                            {/* Save button (Only show if owner) */}
                            {canEdit && (
                                <button
                                    onClick={handleSaveToDatabase}
                                    disabled={isSaving || saveStatus === 'success'}
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100 ${saveStatus === 'success'
                                        ? 'bg-green-600 shadow-green-400/40'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-400/40'
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="hidden sm:inline">Speichern...</span>
                                        </>
                                    ) : saveStatus === 'success' ? (
                                        <>
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="hidden sm:inline">Gespeichert!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            <span className="hidden sm:inline">{activeGame.isSavedToDB ? 'Aktualisieren' : 'Speichern'}</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Saved indicator for non-AI games - wait, we just made them all editable if owned. 
                                So this indicator is maybe less useful or should be adapted. 
                                It was: "Saved indicator for non-AI games" (implied read only).
                                Now checks `activeGame.isSavedToDB && !canBeSaved`.
                                `canBeSaved` was logic for new games.
                                Let's simplify: if it's saved and NOT editable (i.e. public game of another user), show "Saved" or just nothing?
                                If it's another user's game, we don't need to say "Saved".
                                So we can remove this block or only show it if something... 
                                Actually, let's keep it simple: If you can edit it, you see the save button.
                                If you can't edit it, you see the Fork button.
                                We might want to remove this "Saved" badge as it's redundant/confusing in the new flow.
                             */}


                            {/* Fullscreen button */}
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                aria-label={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
                                title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
                            >
                                {isFullscreen ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                    </svg>
                                )}
                            </button>

                            {/* Close button */}
                            <button
                                onClick={closeViewer}
                                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                aria-label="Schließen"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Panel (collapsible) */}
                {!isFullscreen && showEditPanel && canEdit && ( // Checked canEdit
                    <div className="flex-shrink-0 px-4 py-3 bg-slate-50 border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Name:</label>
                                <input
                                    type="text"
                                    value={currentGame.title}
                                    onChange={(e) => handleDetailChange('title', e.target.value)}
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    placeholder="Spielname eingeben..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Klasse:</label>
                                <select
                                    value={currentGame.grade}
                                    onChange={(e) => handleDetailChange('grade', e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                >
                                    {GRADES.map((grade) => (
                                        <option key={grade} value={grade}>Klasse {grade}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Fach:</label>
                                <select
                                    value={currentGame.subject}
                                    onChange={(e) => handleDetailChange('subject', e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                >
                                    {SUBJECTS.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {SUBJECT_LABELS[subject]?.label || subject}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-xs text-slate-500 w-full mt-1">
                                Diese Angaben helfen beim Kategorisieren und Finden deines Spiels.
                            </p>
                        </div>
                    </div>
                )}

                {/* Save error message */}
                {!isFullscreen && saveError && (
                    <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-b border-red-100">
                        <p className="text-sm text-red-600">{saveError}</p>
                    </div>
                )}

                {/* Main content */}
                <div className={`flex-grow flex flex-row overflow-hidden ${isFullscreen ? '' : 'rounded-b-2xl'}`}>
                    <div className="flex-grow bg-white overflow-y-auto relative">
                        <iframe
                            ref={iframeRef}
                            key={currentGame.htmlContent}
                            srcDoc={currentGame.htmlContent}
                            title={activeGame.title}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-forms"
                        />
                        {/* Floating exit fullscreen button */}
                        {isFullscreen && (
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="absolute top-4 right-4 p-3 rounded-xl bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                                title="Vollbild beenden (ESC)"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {/* Chat Only if can edit */}
                    {!isFullscreen && canEdit && (
                        <GameChat
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isGenerating={isGenerating}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameViewer;