import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Minigame, Settings } from './types';
import { INITIAL_MINIGAMES } from './constants';
import { SettingsProvider, useSettings } from './Context/SettingsContext';
import DatabaseService from './Services/DatabaseService';
import Header from '@/Components/layout/Header';
import Sidebar from '@/Components/layout/Sidebar';
import GameViewer from '@/Components/gameplay/GameViewer';
import SettingsPanel from '@/Components/settings/SettingsPanel';
import HomePage from '@/Components/pages/HomePage';
import ProjectsPage from '@/Components/pages/ProjectsPage';
import TemplatesPage from '@/Components/pages/TemplatesPage';
import StudioPage from '@/Components/pages/StudioPage';

function AppContent() {
  const [minigames, setMinigames] = useState<Minigame[]>(INITIAL_MINIGAMES);
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGame, setActiveGame] = useState<Minigame | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeHeroFilter, setActiveHeroFilter] = useState<string>('library');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
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
      .sort((a, b) => (a.id.startsWith('gen-') && !b.id.startsWith('gen-') ? -1 : 1));
  }, [minigames, selectedGrade, selectedSubject, searchTerm]);

  const handlePlayGame = (game: Minigame) => {
    setActiveGame(game);
  };

  const handleCloseViewer = () => {
    setActiveGame(null);
  };

  const handleGameCreated = (newGame: Minigame) => {
    setMinigames((prevGames) => [newGame, ...prevGames]);
    setActiveGame(newGame);
  };

  const handleGameUpdate = (gameId: string, newHtmlContent: string) => {
    setMinigames((prevGames) =>
      prevGames.map((game) => (game.id === gameId ? { ...game, htmlContent: newHtmlContent } : game)),
    );
    setActiveGame((prevGame) => (prevGame ? { ...prevGame, htmlContent: newHtmlContent } : null));
  };

  const handleGameDetailsUpdate = (gameId: string, updates: Partial<Omit<Minigame, 'id'>>) => {
    setMinigames((prevGames) =>
      prevGames.map((game) => (game.id === gameId ? { ...game, ...updates } : game)),
    );
    setActiveGame((prevGame) =>
      prevGame && prevGame.id === gameId ? { ...prevGame, ...updates } : prevGame,
    );
  };

  const handleGameSaved = (savedGame: Minigame) => {
    setMinigames((prevGames) =>
      prevGames.map((game) =>
        game.id === savedGame.id ? { ...game, ...savedGame, isSavedToDB: true } : game
      ),
    );
    setActiveGame((prevGame) =>
      prevGame && prevGame.id === savedGame.id ? { ...prevGame, ...savedGame, isSavedToDB: true } : prevGame
    );
  };

  const handleDeleteGame = async (gameId: string) => {
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

  useEffect(() => {
    const loadSavedGames = async () => {
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
  }, []);

  const handleSettingsChange = (newSettings: Settings) => {
    updateSettings(newSettings);
  };

  const handleCreateFromSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#f6f9ff] to-[#fef6ff] flex text-slate-900">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onCreateClick={handleCreateFromSidebar}
        />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Header
            onSettingsClick={() => setIsSettingsOpen(true)}
            onMenuToggle={() => setIsSidebarOpen(true)}
          />
          <main className="relative flex-1 overflow-y-auto pb-12">
            <div className="absolute inset-x-16 top-6 h-64 bg-gradient-to-r from-purple-300/40 via-white to-sky-200/40 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      activeHeroFilter={activeHeroFilter}
                      setActiveHeroFilter={setActiveHeroFilter}
                      selectedSubject={selectedSubject}
                      setSelectedSubject={setSelectedSubject}
                      filteredGames={filteredGames}
                      handlePlayGame={handlePlayGame}
                      handleDeleteGame={handleDeleteGame}
                      selectedGrade={selectedGrade}
                      setSelectedGrade={setSelectedGrade}
                    />
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProjectsPage
                      filteredGames={filteredGames}
                      handlePlayGame={handlePlayGame}
                      handleDeleteGame={handleDeleteGame}
                      selectedGrade={selectedGrade}
                      setSelectedGrade={setSelectedGrade}
                      selectedSubject={selectedSubject}
                      setSelectedSubject={setSelectedSubject}
                      setSearchTerm={setSearchTerm}
                      searchTerm={searchTerm}
                    />
                  }
                />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route
                  path="/studio"
                  element={
                    <StudioPage
                      onGameCreated={handleGameCreated}
                      onGameSaved={handleGameSaved}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
          {activeGame && (
            <GameViewer
              game={activeGame}
              onClose={handleCloseViewer}
              onGameUpdate={handleGameUpdate}
              onGameDetailsUpdate={handleGameDetailsUpdate}
              onGameSaved={handleGameSaved}
            />
          )}
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;