import React, { useState, useMemo } from 'react';
import { Minigame } from './types';
import { INITIAL_MINIGAMES } from './constants';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import MinigameGrid from './components/MinigameGrid';
import GameViewer from './components/GameViewer';
import VibeCoder from './components/VibeCoder';

function App() {
  const [minigames, setMinigames] = useState<Minigame[]>(INITIAL_MINIGAMES);
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activeGame, setActiveGame] = useState<Minigame | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-800 dark:text-slate-200">
      <Header />
      <main className="max-w-8xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-0">
          
          {/* Left Column: Controls */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="bg-white dark:bg-gray-900/50 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Find a Game</h3>
                <FilterControls
                    selectedGrade={selectedGrade}
                    setSelectedGrade={setSelectedGrade}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                />
            </div>
            <VibeCoder onGameCreated={handleGameCreated} />
          </aside>

          {/* Right Column: Game Grid */}
          <div className="lg:col-span-9">
             <div className="p-2">
                <h2 className="text-3xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">Minigame Library</h2>
                <MinigameGrid games={filteredGames} onPlay={handlePlayGame} />
             </div>
          </div>

        </div>
      </main>
      {activeGame && <GameViewer game={activeGame} onClose={handleCloseViewer} onGameUpdate={handleGameUpdate} onGameDetailsUpdate={handleGameDetailsUpdate} />}
    </div>
  );
}

export default App;