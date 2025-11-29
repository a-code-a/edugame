import React from 'react';

interface HeaderProps {
  onSettingsClick?: () => void;
  onMenuToggle?: () => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onSettingsClick, onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-white/80 via-[#ede9ff]/70 to-white/80 backdrop-blur-xl border-b border-white/60 shadow-[0_10px_60px_-30px_rgba(85,65,165,0.6)]" />
      <div className="relative mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label="Navigation öffnen"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-400/15 text-slate-600 hover:text-slate-900 transition-colors lg:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold text-xl shadow-lg shadow-indigo-300/40">
              E
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">EduGame</p>
              <h1 className="text-xl font-bold text-slate-900">Creator-Arbeitsbereich</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-white/70 text-slate-500 hover:text-purple-600 shadow-lg shadow-slate-300/30 transition-colors"
              aria-label="Einstellungen"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-3 rounded-full bg-white/80 border border-white/70 px-3 py-1 shadow-sm">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold flex items-center justify-center">
              K
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-700">Klasse 5B</p>
              <p className="text-xs text-slate-400">Lehrkraft</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;