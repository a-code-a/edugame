import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-white/80 via-[#ede9ff]/70 to-white/80 backdrop-blur-xl border-b border-white/60 shadow-[0_10px_60px_-30px_rgba(85,65,165,0.6)]" />
      <div className="relative mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10 py-3">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label="Navigation öffnen"
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-400/15 text-slate-600 hover:text-slate-900 transition-colors lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold text-lg shadow-lg shadow-indigo-300/40">
              E
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">EduGame</p>
              <h1 className="text-lg font-bold text-slate-900">Creator-Arbeitsbereich</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white border border-white/70 text-slate-500 hover:text-purple-600 shadow-lg shadow-slate-300/30 transition-colors"
              aria-label="Einstellungen"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="hidden sm:flex items-center gap-3 rounded-full bg-white/80 border border-white/70 px-3 py-1 shadow-sm hover:bg-white transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold flex items-center justify-center">
                {getUserInitials()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700">{getUserName()}</p>
                <p className="text-xs text-slate-400">Creator</p>
              </div>
              <svg className={`h-4 w-4 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;