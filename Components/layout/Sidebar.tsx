import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
}

const IconButton: React.FC<React.PropsWithChildren<{ label: string; to: string; isCollapsed: boolean }>> = ({ label, to, children, isCollapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${isActive
        ? 'text-purple-700 bg-white shadow-md shadow-purple-100/50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
      } ${isCollapsed ? 'justify-center' : ''}`
    }
    title={isCollapsed ? label : undefined}
  >
    {({ isActive }) => (
      <>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${isActive ? 'bg-purple-100 text-purple-600' : 'bg-white/70 text-slate-600'
          }`}>
          {children}
        </div>
        {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
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

const IconHistory: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconPlaylists: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const IconSparkles: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 4.737a.75.75 0 011.374 0l.467 1.189a3 3 0 002.243 1.801l1.22.212a.75.75 0 01.386 1.273l-.902.902a3 3 0 00-.798 2.69l.212 1.22a.75.75 0 01-1.088.804l-1.098-.626a3 3 0 00-2.99 0l-1.098.626a.75.75 0 01-1.088-.804l.212-1.22a3 3 0 00-.798-2.69l-.902-.902a.75.75 0 01.386-1.273l1.22-.212a3 3 0 002.243-1.801l.468-1.189zM16.5 3l.563 1.438a2 2 0 001.498 1.205L20 5.938l-1.126 1.108a2 2 0 00-.563 1.773l.28 1.575-1.406-.77a2 2 0 00-1.876 0l-1.406.77.28-1.575a2 2 0 00-.563-1.773L13 5.938l1.438-.295a2 2 0 001.499-1.205L16.5 3z" />
  </svg>
);

const IconClose: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, isCollapsed, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 flex h-full flex-col bg-gradient-to-b from-white/90 via-white/80 to-white/60 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/80 border-r border-white/40 dark:border-slate-800/80 shadow-xl backdrop-blur-2xl transition-all duration-300 
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed && !isMobileOpen ? 'lg:w-[5.5rem]' : 'lg:w-64'}
        `}
        aria-label="Hauptnavigation"
      >
        <div className="flex items-center justify-end px-6 pt-6 pb-4">
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-full bg-white/60 text-slate-500 hover:text-slate-700 shadow-sm"
            aria-label="Navigation schließen"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-4 pb-8 space-y-6">

          {/* Main Games Scetion */}
          <div>
            <div className="space-y-1">
              <IconButton label="Startseite" to="/" isCollapsed={isCollapsed}>
                <IconHome className="h-5 w-5" />
              </IconButton>
            </div>
          </div>

          <div className={`border-t border-slate-200/60 my-2 ${isCollapsed ? 'mx-2' : ''}`} />

          {/* Mein EduGamer Section */}
          <div>
            {!isCollapsed && (
              <p className="px-2 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3 font-semibold">
                Mein EduGamer
              </p>
            )}
            <div className="space-y-1">
              <IconButton label="Meine Projekte" to="/projects" isCollapsed={isCollapsed}>
                <IconProjects className="h-5 w-5" />
              </IconButton>
              <IconButton label="Playlists" to="/playlists" isCollapsed={isCollapsed}>
                <IconPlaylists className="h-5 w-5" />
              </IconButton>
              <IconButton label="Verlauf" to="/history" isCollapsed={isCollapsed}>
                <IconHistory className="h-5 w-5" />
              </IconButton>
              <IconButton label="Spiele, die ich mag" to="/liked" isCollapsed={isCollapsed}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.247-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                </svg>
              </IconButton>
            </div>
          </div>

          <div className={`border-t border-slate-200/60 my-2 ${isCollapsed ? 'mx-2' : ''}`} />

          {/* Entdecken Section */}
          <div>
            {!isCollapsed && (
              <p className="px-2 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3 font-semibold">
                Studio
              </p>
            )}
            <div className="space-y-1">
              <IconButton label="Erstellen" to="/explore" isCollapsed={isCollapsed}>
                <IconSparkles className="h-5 w-5" />
              </IconButton>
            </div>
          </div>

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;