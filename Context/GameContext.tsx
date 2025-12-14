import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Minigame } from '../types';
import { INITIAL_MINIGAMES } from '../constants';
import DatabaseService from '../Services/DatabaseService';
import { useAuth } from './AuthContext';

interface GameContextType {
    minigames: Minigame[];
    filteredGames: Minigame[];
    activeGame: Minigame | null;
    selectedGrade: string;
    selectedSubject: string;
    searchTerm: string;
    sortOption: 'newest' | 'likes' | 'plays';
    setSelectedGrade: (grade: string) => void;
    setSelectedSubject: (subject: string) => void;
    setSearchTerm: (term: string) => void;
    setSortOption: (option: 'newest' | 'likes' | 'plays') => void;
    playGame: (game: Minigame) => void;
    closeViewer: () => void;
    createGame: (newGame: Minigame) => void;
    updateGame: (gameId: string, newHtmlContent: string) => void;
    updateGameDetails: (gameId: string, updates: Partial<Omit<Minigame, 'id'>>) => void;
    saveGame: (savedGame: Minigame) => void;
    deleteGame: (gameId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [minigames, setMinigames] = useState<Minigame[]>(INITIAL_MINIGAMES);
    const [selectedGrade, setSelectedGrade] = useState<string>('All');
    const [selectedSubject, setSelectedSubject] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'newest' | 'likes' | 'plays'>('newest');
    const [activeGame, setActiveGame] = useState<Minigame | null>(null);
    const databaseService = DatabaseService.getInstance();

    const filteredGames = useMemo(() => {
        return minigames
            .filter((game) => {
                const gradeMatch = selectedGrade === 'All' || game.grade === parseInt(selectedGrade, 10);
                const subjectMatch = selectedSubject === 'All' || game.subject === selectedSubject;
                const searchMatch =
                    searchTerm.trim().length === 0 ||
                    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    game.description.toLowerCase().includes(searchTerm.toLowerCase());
                return gradeMatch && subjectMatch && searchMatch;
            })
            .sort((a, b) => {
                // First prioritize generated games if needed, or keep existing logic
                // The original logic was: (a.id.startsWith('gen-') && !b.id.startsWith('gen-') ? -1 : 1)
                // We can keep that as a secondary sort or replace it.
                // Let's implement the requested sorting:

                if (sortOption === 'likes') {
                    return (b.likes || 0) - (a.likes || 0);
                }
                if (sortOption === 'plays') {
                    return (b.playCount || 0) - (a.playCount || 0);
                }
                // Default to newest (based on createdAt or id if createdAt is missing)
                // Assuming newer games have later dates.
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
    }, [minigames, selectedGrade, selectedSubject, searchTerm, sortOption]);

    const playGame = (game: Minigame) => {
        setActiveGame(game);
    };

    const closeViewer = () => {
        setActiveGame(null);
    };

    const createGame = (newGame: Minigame) => {
        setMinigames((prevGames) => [newGame, ...prevGames]);
        setActiveGame(newGame);
    };

    const updateGame = (gameId: string, newHtmlContent: string) => {
        setMinigames((prevGames) =>
            prevGames.map((game) => (game.id === gameId ? { ...game, htmlContent: newHtmlContent } : game)),
        );
        setActiveGame((prevGame) => (prevGame ? { ...prevGame, htmlContent: newHtmlContent } : null));
    };

    const updateGameDetails = (gameId: string, updates: Partial<Omit<Minigame, 'id'>>) => {
        setMinigames((prevGames) =>
            prevGames.map((game) => (game.id === gameId ? { ...game, ...updates } : game)),
        );
        setActiveGame((prevGame) =>
            prevGame && prevGame.id === gameId ? { ...prevGame, ...updates } : prevGame,
        );
    };

    const saveGame = (savedGame: Minigame) => {
        setMinigames((prevGames) => {
            const exists = prevGames.some((game) => game.id === savedGame.id);
            if (exists) {
                return prevGames.map((game) =>
                    game.id === savedGame.id ? { ...game, ...savedGame, isSavedToDB: true } : game
                );
            }
            return [{ ...savedGame, isSavedToDB: true }, ...prevGames];
        });
        setActiveGame((prevGame) =>
            prevGame && prevGame.id === savedGame.id ? { ...prevGame, ...savedGame, isSavedToDB: true } : prevGame
        );
    };

    const deleteGame = async (gameId: string) => {
        const gameToDelete = minigames.find(game => game.id === gameId);

        if (!gameToDelete) {
            return;
        }

        if (gameToDelete.isSavedToDB || (gameToDelete as any)._id) {
            try {
                const result = await databaseService.deleteGame(gameId);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to delete game from database');
                }
            } catch (error) {
                console.error('Error deleting game:', error);
                alert(`Failed to delete game: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return;
            }
        }

        setMinigames((prevGames) => {
            return prevGames.filter(game => game.id !== gameId);
        });
    };

    const { user } = useAuth();

    useEffect(() => {
        const loadSavedGames = async () => {
            if (!user) {
                setMinigames(INITIAL_MINIGAMES);
                return;
            }

            // Ensure database service has correct user ID before fetching
            databaseService.setUserId(user.uid);

            try {
                const savedGames = await databaseService.getSavedGames();
                setMinigames((prevGames) => {
                    const existingGameIds = new Set(prevGames.map(game => game.id));

                    const newGamesFromDB = savedGames.filter(dbGame => {
                        const hasExistingId = existingGameIds.has(dbGame.id);
                        return !hasExistingId;
                    }).map(game => ({ ...game, isSavedToDB: true }));

                    const updatedExistingGames = prevGames.map(game => ({
                        ...game,
                        isSavedToDB: savedGames.some(dbGame => dbGame.id === game.id)
                    }));

                    return [...updatedExistingGames, ...newGamesFromDB];
                });
            } catch (error) {
                // Error loading saved games
            }
        };

        loadSavedGames();
    }, [user]);

    return (
        <GameContext.Provider
            value={{
                minigames,
                filteredGames,
                activeGame,
                selectedGrade,
                selectedSubject,
                searchTerm,
                sortOption,
                setSelectedGrade,
                setSelectedSubject,
                setSearchTerm,
                setSortOption,
                playGame,
                closeViewer,
                createGame,
                updateGame,
                updateGameDetails,
                saveGame,
                deleteGame,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
