import React, { useEffect, useState, useCallback } from 'react';
import { Minigame } from '../../types';
import GameChat, { ChatMessage } from './GameChat';
import { refineMinigameCode } from '../../Services/geminiService';
import DatabaseService from '../../Services/DatabaseService';
import { GRADES, SUBJECTS } from '../../constants';
import { useSettings } from '../../Context/SettingsContext';


interface GameViewerProps {
    game: Minigame;
    onClose: () => void;
    onGameUpdate: (gameId: string, newHtmlContent: string) => void;
    onGameDetailsUpdate: (gameId: string, updates: Partial<Omit<Minigame, 'id'>>) => void;
    onGameSaved?: (game: Minigame) => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const GameViewer: React.FC<GameViewerProps> = ({ game, onClose, onGameUpdate, onGameDetailsUpdate, onGameSaved }) => {
    const [isShowing, setIsShowing] = useState(false);
    const [currentGame, setCurrentGame] = useState<Minigame>(game);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'system', text: 'This is a new game! Tell me what you want to change or add.' }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const { settings } = useSettings();
    const databaseService = DatabaseService.getInstance();

    useEffect(() => {
        setIsShowing(true);
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    useEffect(() => {
        setCurrentGame(game);
    }, [game]);

    const handleSendMessage = useCallback(async (message: string) => {
        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: message }];
        setMessages(newMessages);
        setIsGenerating(true);

        try {
            const newHtmlContent = await refineMinigameCode(message, currentGame.htmlContent, settings);
            const updatedGame = { ...currentGame, htmlContent: newHtmlContent };
            setCurrentGame(updatedGame);
            onGameUpdate(game.id, newHtmlContent);
            setMessages([...newMessages, { sender: 'ai', text: "I've updated the game with your changes. Take a look!" }]);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setMessages([...newMessages, { sender: 'system', text: `Sorry, I couldn't update the game. ${errorMessage}` }]);
        } finally {
            setIsGenerating(false);
        }
    }, [messages, currentGame, onGameUpdate, game.id, settings]);

    const isAiGenerated = game.id.startsWith('gen-');

    const handleDetailChange = (field: 'grade' | 'subject', value: string | number) => {
        onGameDetailsUpdate(game.id, { [field]: value });
    };

    const handleSaveToDatabase = useCallback(async () => {
        setIsSaving(true);
        setSaveError(null);

        try {
            const result = await databaseService.saveGame(currentGame);

            if (result.success && result.game) {
                console.log('Game saved to database:', result.game.id);
                setSaveError(null);
                if (onGameSaved) {
                    onGameSaved(result.game);
                }
                alert('✅ Game saved to database successfully!');
            } else {
                const errorMessage = result.error || 'Failed to save game';
                setSaveError(errorMessage);
                console.error('Save failed:', errorMessage);
                alert(`❌ Failed to save game: ${errorMessage}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            setSaveError(errorMessage);
            console.error('Save error:', error);
            alert(`❌ Error saving game: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    }, [currentGame, onGameSaved, databaseService]);

    const canBeSaved = isAiGenerated;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isShowing ? 'opacity-100' : 'opacity-0'}`}
            aria-modal="true"
            role="dialog"
        >
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`relative w-full max-w-7xl h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-all duration-300 ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex-shrink-0 pr-4">{game.title}</h2>

                    {isAiGenerated && (
                        <div className="flex items-center gap-4 flex-shrink min-w-0">
                            <select
                                value={game.grade}
                                onChange={(e) => handleDetailChange('grade', parseInt(e.target.value, 10))}
                                className="custom-select block w-full max-w-[150px] text-sm pl-2 py-1 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                aria-label="Change grade"
                            >
                                {GRADES.map((grade) => (
                                    <option key={grade} value={grade}>{`Grade ${grade}`}</option>
                                ))}
                            </select>
                            <select
                                value={game.subject}
                                onChange={(e) => handleDetailChange('subject', e.target.value)}
                                className="custom-select block w-full max-w-[150px] text-sm pl-2 py-1 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                aria-label="Change subject"
                            >
                                {SUBJECTS.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex-grow"></div>

                    {canBeSaved && (
                        <button
                            onClick={handleSaveToDatabase}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100"
                            aria-label="Save to database"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                        <path fillRule="evenodd" d="M17.5 3.5A2.5 2.5 0 0 0 15 6v1.5a.5.5 0 0 1-1 0V6a3.5 3.5 0 1 1 7 0v3.5a5.5 5.5 0 0 1-4.5 5.397V20a.5.5 0 0 1-1 0v-5.103A5.5 5.5 0 0 1 11 9.5V6A5 5 0 0 0 6 6v9a6.5 6.5 0 0 0 5.5 6.397V20a.5.5 0 0 1-1 0v-1.603A7.5 7.5 0 0 1 5 15V6a7 7 0 0 1 14 0v3.5a2.5 2.5 0 0 0 2.5-2.5V6a2.5 2.5 0 0 0-2.5-2.5h-1a.5.5 0 0 1 0-1h1A3.5 3.5 0 0 1 23 6v3.5A3.5 3.5 0 0 1 19.5 13H19a.5.5 0 0 1 0-1h.5A2.5 2.5 0 0 0 22 9.5V6a2.5 2.5 0 0 0-2.5-2.5h-1a.5.5 0 0 1 0-1h1ZM8.5 6A3.5 3.5 0 0 1 12 9.5v5A4.5 4.5 0 0 1 7.5 19h-1a.5.5 0 0 1 0-1h1A3.5 3.5 0 0 0 11 14.5v-5A2.5 2.5 0 0 0 8.5 7h-1a.5.5 0 0 1 0-1h1Z" clipRule="evenodd" />
                                    </svg>
                                    {game.isSavedToDB ? 'Update DB' : 'Save to DB'}
                                </>
                            )}
                        </button>
                    )}

                    {game.isSavedToDB && !canBeSaved && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-600 px-3 py-1 text-xs font-semibold shadow-inner shadow-green-200/40">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                            </svg>
                            Saved to DB
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="ml-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors"
                        aria-label="Close game viewer"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow flex flex-row overflow-hidden rounded-b-2xl">
                    <div className="flex-grow bg-white overflow-hidden">
                        <iframe
                            key={currentGame.htmlContent}
                            srcDoc={currentGame.htmlContent}
                            title={currentGame.title}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-forms"
                        />
                    </div>
                    {isAiGenerated && (
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