import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
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
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-r from-white/80 via-[#ede9ff]/70 to-white/80 backdrop-blur-xl border-b border-white/60 shadow-[0_10px_60px_-30px_rgba(85,65,165,0.6)]" />
      <div className="relative mx-auto flex w-full items-center justify-between px-4 sm:px-6 lg:px-6 py-1">
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label="Navigation öffnen"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 transition-colors text-slate-700"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          )}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xl shadow-md">
              E
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight text-slate-900 relative">
                Edu
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Gamer</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search bar placeholder could go here similar to YouTube */}

        <div className="flex items-center gap-2 sm:gap-4">

          {/* Add Game Button */}
          <button
            onClick={() => navigate('/explore')} // Assuming /explore is the Studio/Create page now
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Erstellen</span>
          </button>



          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-medium text-sm shadow-sm hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500 transition-all"
            >
              {getUserInitials()}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-sm font-semibold text-slate-800">{getUserName()}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Creator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Abmelden
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