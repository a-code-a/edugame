import React, { useEffect, useState, useCallback } from 'react';
import { Minigame } from '../../types';
import GameChat, { ChatMessage } from './GameChat';
import { refineMinigameCode } from '../../Services/openRouterService';
import { GRADES, SUBJECTS } from '../../constants';
import { useSettings } from '../../Context/SettingsContext';


interface GameViewerProps {
  game: Minigame;
  onClose: () => void;
  onGameUpdate: (gameId: string, newHtmlContent: string) => void;
  onGameDetailsUpdate: (gameId: string, updates: Partial<Omit<Minigame, 'id'>>) => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const GameViewer: React.FC<GameViewerProps> = ({ game, onClose, onGameUpdate, onGameDetailsUpdate }) => {
    const [isShowing, setIsShowing] = useState(false);
    const [currentGame, setCurrentGame] = useState<Minigame>(game);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'system', text: 'This is a new game! Tell me what you want to change or add.' }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const { settings } = useSettings();

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