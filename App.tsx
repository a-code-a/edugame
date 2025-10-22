import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Minigame, Settings } from './types';
import { INITIAL_MINIGAMES } from './constants';
import { SettingsProvider, useSettings } from './Context/SettingsContext';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import FilterControls from './Components/FilterControls';
import MinigameGrid from './Components/MinigameGrid';
import GameViewer from './Components/GameViewer';
import VibeCoder from './Components/VibeCoder';
import SettingsPanel from './Components/SettingsPanel';

const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M12.475 1.889a1 1 0 0 0-1.95 0l-.488 1.563a3 3 0 0 1-2.083 2.05l-1.59.431a1 1 0 0 0-.454 1.655l1.138 1.16a3 3 0 0 1 .74 2.705l-.335 1.653a1 1 0 0 0 1.465 1.07l1.432-.782a3 3 0 0 1 2.88 0l1.432.783a1 1 0 0 0 1.464-1.07l-.334-1.654a3 3 0 0 1 .738-2.705l1.138-1.16a1 1 0 0 0-.454-1.654l-1.59-.432a3 3 0 0 1-2.083-2.05l-.488-1.563ZM6.5 3.25a.75.75 0 0 0-1.41-.41l-.334.668a1.5 1.5 0 0 1-.832.75l-.727.242a.75.75 0 0 0-.3 1.234l.53.53a1.5 1.5 0 0 1 .4 1.381l-.155.758a.75.75 0 0 0 1.081.81l.71-.378a1.5 1.5 0 0 1 1.44 0l.71.378a.75.75 0 0 0 1.082-.81l-.156-.758a1.5 1.5 0 0 1 .4-1.38l.53-.531a.75.75 0 0 0-.301-1.234l-.726-.242a1.5 1.5 0 0 1-.833-.75L6.5 3.25ZM4.25 12.5a.75.75 0 0 0-1.41-.41l-.22.439a1 1 0 0 1-.554.5l-.473.158a.75.75 0 0 0-.3 1.235l.377.379a1 1 0 0 1 .266.92l-.11.541a.75.75 0 0 0 1.081.811l.457-.243a1 1 0 0 1 .959 0l.457.243a.75.75 0 0 0 1.081-.81l-.11-.542a1 1 0 0 1 .266-.92l.376-.38a.75.75 0 0 0-.3-1.234l-.472-.158a1 1 0 0 1-.553-.5l-.22-.439Z" />
  </svg>
);

const SubjectIcons: Record<string, React.ReactNode> = {
  All: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2Zm0 2c-4.418 0-8 3.582-8 8 0 1.321.323 2.568.894 3.662L15.662 6.894A7.962 7.962 0 0 0 12 4Zm7.106 4.338L8.338 19.106A7.962 7.962 0 0 0 12 20c4.418 0 8-3.582 8-8 0-1.321-.323-2.568-.894-3.662Z" />
    </svg>
  ),
  Math: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6h15M4.5 12h15M4.5 18h7.5m6 0h-3" />
    </svg>
  ),
  'Language Arts': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  ),
  Science: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75v5.17a4 4 0 00.8 2.4l2.2 2.933a1 1 0 001.5 0l2.2-2.933a4 4 0 00.8-2.4V6.75m-7.5 0h7.5M8.25 6.75h7.5" />
    </svg>
  ),
  'Social Studies': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a4 4 0 110 8 4 4 0 010-8zm0 10c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" />
    </svg>
  ),
  Art: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a7 7 0 00-7 7 7 7 0 007 7h6a5 5 0 005-5 5 5 0 00-5-5H9zm0 0a3 3 0 013-3" />
    </svg>
  ),
};

const SUBJECT_SHORTCUTS = [
  { id: 'All', label: 'Alle Fächer', value: 'All', gradient: 'from-slate-100 to-slate-200' },
  { id: 'Math', label: 'Mathe Labor', value: 'Math', gradient: 'from-sky-100 to-sky-200' },
  { id: 'Language Arts', label: 'Sprachatelier', value: 'Language Arts', gradient: 'from-pink-100 to-rose-200' },
  { id: 'Science', label: 'Science Lab', value: 'Science', gradient: 'from-green-100 to-emerald-200' },
  { id: 'Social Studies', label: 'Gesellschaft', value: 'Social Studies', gradient: 'from-amber-100 to-orange-200' },
  { id: 'Art', label: 'Kreativstudio', value: 'Art', gradient: 'from-purple-100 to-indigo-200' },
];

const HERO_FILTERS = [
  { id: 'library', label: 'Bibliothek' },
  { id: 'templates', label: 'Vorlagen' },
  { id: 'ai', label: 'EduGame AI' },
];

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
  const vibeCoderRef = useRef<HTMLDivElement>(null);

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

  const recentGames = useMemo(() => minigames.slice(0, 8), [minigames]);

  const handlePlayGame = (game: Minigame) => {
    setActiveGame(game);
  };

  const handleCloseViewer = () => {
    setActiveGame(null);
  };

  const handleGameCreated = (newGame: Minigame) => {
    setMinigames((prevGames) => [newGame, ...prevGames]);
    setActiveGame(newGame);
    setSelectedSubject('All');
    setSelectedGrade('All');
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

  const handleSettingsChange = (newSettings: Settings) => {
    updateSettings(newSettings);
  };

  const handleCreateFromSidebar = useCallback(() => {
    setActiveHeroFilter('ai');
    setIsSidebarOpen(false);
    if (vibeCoderRef.current) {
      vibeCoderRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    requestAnimationFrame(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>('[data-role="vibe-prompt"]');
      textarea?.focus();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#f6f9ff] to-[#fef6ff] flex text-slate-900">
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onCreateClick={handleCreateFromSidebar}
        recentGames={recentGames}
      />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header
          onSettingsClick={() => setIsSettingsOpen(true)}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />
        <main className="relative flex-1 overflow-y-auto pb-12">
          <div className="absolute inset-x-16 top-6 h-64 bg-gradient-to-r from-purple-300/40 via-white to-sky-200/40 blur-3xl pointer-events-none" />
          <div className="relative z-10 px-4 sm:px-8 lg:px-16 space-y-12 pt-8">
            <section className="relative rounded-[36px] bg-gradient-to-br from-[#cddfff] via-white to-[#f8d3ff] border border-white/60 shadow-[0_25px_70px_-35px_rgba(132,97,255,0.55)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),rgba(255,255,255,0)_55%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.9),rgba(255,255,255,0)_45%)]" />
              <div className="relative px-6 sm:px-10 lg:px-14 py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
                <div className="max-w-2xl space-y-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-purple-700 shadow-inner shadow-purple-200">
                    <SparkleIcon className="h-4 w-4 text-purple-500" />
                    EduGame Studio
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900">
                    Lernen neu erleben
                  </h1>
                  <p className="text-lg text-slate-600">
                    Erstelle interaktive Lernspiele mit der Leichtigkeit von Canva. Nutze KI, um Ideen zu generieren, Designs zu verfeinern und Lernpfade anzupassen.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {HERO_FILTERS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveHeroFilter(item.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          activeHeroFilter === item.id
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-400/40'
                            : 'bg-white/70 text-slate-600 hover:bg-white hover:shadow'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <form
                  className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl p-4 flex items-center gap-4"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                    <SparkleIcon className="h-6 w-6" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Millionen von Lernspielen durchsuchen"
                    className="flex-1 bg-transparent text-base text-slate-700 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                    aria-label="Search minigames"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z" />
                    </svg>
                  </button>
                </form>
              </div>
              <div className="relative border-t border-white/60 px-6 sm:px-10 lg:px-14 py-6 overflow-x-auto">
                <div className="flex items-center gap-4 min-w-max">
                  {SUBJECT_SHORTCUTS.map((shortcut) => (
                    <button
                      key={shortcut.id}
                      type="button"
                      onClick={() => setSelectedSubject(shortcut.value)}
                      className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ${
                        selectedSubject === shortcut.value
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-400/50'
                          : `bg-gradient-to-r ${shortcut.gradient} text-slate-700 hover:shadow-md`
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-slate-600">
                        {SubjectIcons[shortcut.value] ?? SubjectIcons.All}
                      </span>
                      {shortcut.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section ref={vibeCoderRef} className="grid lg:grid-cols-[1.25fr_minmax(0,1fr)] gap-10">
              <div className="bg-white/80 rounded-[30px] border border-white shadow-xl shadow-purple-100/50 p-8">
                <VibeCoder onGameCreated={handleGameCreated} />
              </div>
              <div className="bg-white/70 rounded-[30px] border border-white shadow-xl shadow-indigo-100/40 p-8 space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Schnellauswahl · Jahrgang</h3>
                <div className="flex flex-wrap gap-3">
                  {['All', '1', '2', '3', '4', '5', '6'].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        selectedGrade === grade
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-400/50'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {grade === 'All' ? 'Alle Stufen' : `Klasse ${grade}`}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Nutze die Stufen oder wähle ein Fach, um sofort passende Lernspiele zu finden. Du kannst die Filter jederzeit in der Bibliothek weiter verfeinern.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Minigame Library</h2>
                  <p className="text-slate-500 mt-1">
                    Durchsuche deine neuesten Spiele oder starte mit einer Vorlage. Alle Änderungen erscheinen hier sofort.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <FilterControls
                    selectedGrade={selectedGrade}
                    setSelectedGrade={setSelectedGrade}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:shadow-sm"
                    onClick={() => {
                      setSelectedGrade('All');
                      setSelectedSubject('All');
                      setSearchTerm('');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6m-2 4h6m-6 4h10m4-8h2m-2 4h2m-2 4h2" />
                    </svg>
                    Zurücksetzen
                  </button>
                </div>
              </div>

              <div className="bg-white/90 rounded-[30px] border border-white shadow-[0_35px_90px_-60px_rgba(70,60,125,0.7)] p-8">
                <MinigameGrid games={filteredGames} onPlay={handlePlayGame} />
              </div>
            </section>
          </div>
        </main>
        {activeGame && (
          <GameViewer
            game={activeGame}
            onClose={handleCloseViewer}
            onGameUpdate={handleGameUpdate}
            onGameDetailsUpdate={handleGameDetailsUpdate}
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