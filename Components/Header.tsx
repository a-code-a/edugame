import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-8xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
          E
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          EduGame Creator
        </h1>
      </div>
    </header>
  );
};

export default Header;