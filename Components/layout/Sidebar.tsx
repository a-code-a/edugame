import React from 'react';
import { Minigame } from '../../types';
import { NavLink, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onCreateClick: () => void;
}

const IconButton: React.FC<React.PropsWithChildren<{ label: string; to: string }>> = ({ label, to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${isActive
        ? 'text-purple-700 bg-white shadow-md shadow-purple-100/50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isActive ? 'bg-purple-100 text-purple-600' : 'bg-white/70 text-slate-600'
          }`}>
          {children}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

const IconHome: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5M4.5 9.75v9A1.75 1.75 0 006.25 20.5h11.5A1.75 1.75 0 0019.5 18.75v-9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.5V12h6v8.5" />
  </svg>
);

const IconProjects: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 6.75a2 2 0 012-2h10.5a2 2 0 012 2v10.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2V6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75v10.5M15 6.75v10.5M6.75 12h10.5" />
  </svg>
);

const IconTemplates: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <rect x="3.75" y="4.75" width="16.5" height="14.5" rx="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 13h4" />
  </svg>
);

const IconSparkles: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 4.737a.75.75 0 011.374 0l.467 1.189a3 3 0 002.243 1.801l1.22.212a.75.75 0 01.386 1.273l-.902.902a3 3 0 00-.798 2.69l.212 1.22a.75.75 0 01-1.088.804l-1.098-.626a3 3 0 00-2.99 0l-1.098.626a.75.75 0 01-1.088-.804l.212-1.22a3 3 0 00-.798-2.69l-.902-.902a.75.75 0 01.386-1.273l1.22-.212a3 3 0 002.243-1.801l.468-1.189zM16.5 3l.563 1.438a2 2 0 001.498 1.205L20 5.938l-1.126 1.108a2 2 0 00-.563 1.773l.28 1.575-1.406-.77a2 2 0 00-1.876 0l-1.406.77.28-1.575a2 2 0 00-.563-1.773L13 5.938l1.438-.295a2 2 0 001.499-1.205L16.5 3z" />
  </svg>
);

const IconPlus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

const IconClose: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile, onCreateClick }) => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate('/');
    onCreateClick();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 flex h-full w-72 flex-col bg-gradient-to-b from-white/90 via-white/80 to-white/60 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/80 border-r border-white/40 dark:border-slate-800/80 shadow-xl backdrop-blur-2xl transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        aria-label="Hauptnavigation"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold text-lg flex items-center justify-center shadow-lg">
              E
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">EduGame</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Creator Studio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-full bg-white/60 text-slate-500 hover:text-slate-700 shadow-sm"
            aria-label="Navigation schließen"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6">
          <button
            type="button"
            onClick={handleCreateClick}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
          >
            <IconPlus className="h-5 w-5" />
            Neues Spiel erstellen
          </button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-4 pb-8">
          <p className="px-2 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3">
            Navigation
          </p>
          <div className="space-y-1 rounded-2xl bg-white/70 dark:bg-slate-900/40 p-2 shadow-inner border border-white/60 dark:border-slate-800/60">
            <IconButton label="Startseite" to="/">
              <IconHome className="h-5 w-5" />
            </IconButton>
            <IconButton label="Projekte" to="/projects">
              <IconProjects className="h-5 w-5" />
            </IconButton>
            <IconButton label="Vorlagen" to="/templates">
              <IconTemplates className="h-5 w-5" />
            </IconButton>
            <IconButton label="Entdecken" to="/explore">
              <IconSparkles className="h-5 w-5" />
            </IconButton>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;