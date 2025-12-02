import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Settings } from './types';
import { SettingsProvider, useSettings } from './Context/SettingsContext';
import { GameProvider, useGame } from './Context/GameContext';
import Header from '@/Components/layout/Header';
import Sidebar from '@/Components/layout/Sidebar';
import GameViewer from '@/Components/gameplay/GameViewer';
import SettingsPanel from '@/Components/settings/SettingsPanel';
import HomePage from '@/Components/pages/HomePage';
import ProjectsPage from '@/Components/pages/ProjectsPage';
import TemplatesPage from '@/Components/pages/TemplatesPage';

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const { activeGame } = useGame();

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
                  element={<HomePage />}
                />
                <Route
                  path="/projects"
                  element={<ProjectsPage />}
                />
                <Route path="/templates" element={<TemplatesPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
          {activeGame && <GameViewer />}
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
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SettingsProvider>
  );
}

export default App;