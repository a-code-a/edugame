import React, { useState, useMemo } from 'react';
import { Minigame, Settings } from './types';
import { INITIAL_MINIGAMES } from './constants';
import { SettingsProvider, useSettings } from './Context/SettingsContext';
import Header from './Components/Header';
import FilterControls from './Components/FilterControls';
import MinigameGrid from './Components/MinigameGrid';
import GameViewer from './Components/GameViewer';
import VibeCoder from './Components/VibeCoder';
import SettingsPanel from './Components/SettingsPanel';

function AppContent() {
  const [minigames, setMinigames] = useState<Minigame[]>(INITIAL_MINIGAMES);
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activeGame, setActiveGame] = useState<Minigame | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { settings, updateSettings } = useSettings();

  const filteredGames = useMemo(() => {
    return minigames.filter(game => {
      const gradeMatch = selectedGrade === 'All' || game.grade === parseInt(selectedGrade, 10);
      const subjectMatch = selectedSubject === 'All' || game.subject === selectedSubject;
      return gradeMatch && subjectMatch;
    }).sort((a, b) => a.id.startsWith('gen-') && !b.id.startsWith('gen-') ? -1 : 1); // Show generated games first
  }, [minigames, selectedGrade, selectedSubject]);
  
  const handlePlayGame = (game: Minigame) => {
    setActiveGame(game);
  };

  const handleCloseViewer = () => {
    setActiveGame(null);
  };

  const handleGameCreated = (newGame: Minigame) => {
    setMinigames(prevGames => [newGame, ...prevGames]);
    setActiveGame(newGame);
  };
  
  const handleGameUpdate = (gameId: string, newHtmlContent: string) => {
    setMinigames(prevGames =>
        prevGames.map(game =>
            game.id === gameId ? { ...game, htmlContent: newHtmlContent } : game
        )
    );
    // Also update the active game to reflect changes immediately in the viewer
    setActiveGame(prevGame => prevGame ? { ...prevGame, htmlContent: newHtmlContent } : null);
  };

  const handleGameDetailsUpdate = (gameId: string, updates: Partial<Omit<Minigame, 'id'>>) => {
    setMinigames(prevGames =>
        prevGames.map(game =>
            game.id === gameId ? { ...game, ...updates } : game
        )
    );
    // Also update the active game to reflect changes immediately in the viewer
    setActiveGame(prevGame => prevGame && prevGame.id === gameId ? { ...prevGame, ...updates } : prevGame);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsChange = (newSettings: Settings) => {
    updateSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-800 dark:text-slate-200">
      <Header onSettingsClick={handleSettingsClick} />
      <main className="max-w-8xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-0">

          {/* Left Column: Controls */}
          <aside className="lg:col-span-3 space-y-8">
            <VibeCoder onGameCreated={handleGameCreated} />
          </aside>

          {/* Right Column: Game Grid */}
          <div className="lg:col-span-9">
             <div className="p-2 relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Minigame Library</h2>
                  <button
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    aria-label="Toggle Filters"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
                {isFiltersOpen && (
                  <div className="mb-6 bg-white dark:bg-gray-900/50 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                    <FilterControls
                        selectedGrade={selectedGrade}
                        setSelectedGrade={setSelectedGrade}
                        selectedSubject={selectedSubject}
                        setSelectedSubject={setSelectedSubject}
                    />
                  </div>
                )}
                <MinigameGrid games={filteredGames} onPlay={handlePlayGame} />
             </div>
          </div>

        </div>
      </main>
      {activeGame && <GameViewer game={activeGame} onClose={handleCloseViewer} onGameUpdate={handleGameUpdate} onGameDetailsUpdate={handleGameDetailsUpdate} />}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
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