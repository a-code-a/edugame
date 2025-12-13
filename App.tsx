import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Settings } from './types';
import { SettingsProvider, useSettings } from './Context/SettingsContext';
import { GameProvider, useGame } from './Context/GameContext';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Header from '@/Components/layout/Header';
import Sidebar from '@/Components/layout/Sidebar';
import GameViewer from '@/Components/gameplay/GameViewer';
import SettingsPanel from '@/Components/settings/SettingsPanel';
import HomePage from '@/Components/pages/HomePage';
import ProjectsPage from '@/Components/pages/ProjectsPage';

import ExplorePage from '@/Components/pages/ExplorePage';
import HistoryPage from '@/Components/pages/HistoryPage';
import LikedGamesPage from '@/Components/pages/LikedGamesPage';
import PlaylistsPage from '@/Components/pages/PlaylistsPage';
import PlaylistDetailPage from '@/Components/pages/PlaylistDetailPage';
import Login from '@/Components/auth/Login';
import Signup from '@/Components/auth/Signup';
import DatabaseService from './Services/DatabaseService';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { settings, updateSettings } = useSettings();
  const { activeGame } = useGame();
  const { user } = useAuth();

  // Update DatabaseService with current user ID
  useEffect(() => {
    if (user) {
      DatabaseService.getInstance().setUserId(user.uid);
    }
  }, [user]);

  const handleSettingsChange = (newSettings: Settings) => {
    updateSettings(newSettings);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#f6f9ff] to-[#fef6ff] flex flex-col text-slate-900">
      {user && (
        <Header
          onSettingsClick={() => setIsSettingsOpen(true)}
          onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
        />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {user && (
          <Sidebar
            isMobileOpen={isSidebarOpen}
            isCollapsed={!isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="relative flex-1 overflow-y-auto pb-12">
          <div className="absolute inset-x-16 top-6 h-64 bg-gradient-to-r from-purple-300/40 via-white to-sky-200/40 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ExplorePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/liked"
                element={
                  <ProtectedRoute>
                    <LikedGamesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/playlists"
                element={
                  <ProtectedRoute>
                    <PlaylistsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/playlists/:id"
                element={
                  <ProtectedRoute>
                    <PlaylistDetailPage />
                  </ProtectedRoute>
                }
              />

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
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;