import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, User as UserIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Map path to a readable page name
  const pageNames = {
    '/dashboard': 'Placement Preparation Dashboard',
    '/calendar': 'ATR Month-by-Month Calendar',
    '/tasks': 'Task Roadmap Repository',
    '/dsa': 'DSA Java Coding Tracker',
    '/english': 'English Communication Tracker',
    '/aptitude': 'Quantitative Aptitude Tracker',
    '/daily': 'Daily Tracking Checklists',
    '/resources': 'Milestone Resources Library',
    '/analytics': 'Performance Progress Analytics',
    '/settings': 'Settings & Core Configurations',
  };

  const currentPage = pageNames[location.pathname] || 'ATR Roadmap Platform';

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 bg-[#0A0F1D]/80 backdrop-blur-md border-b border-white/5">
      {/* Left section: mobile hamburger & page title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white lg:hidden focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
          {currentPage}
        </h1>
      </div>

      {/* Right section: user profile card */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-semibold text-white">{user.name}</span>
          <span className="text-xs text-cyan-400 font-medium">B.Tech IT • 2nd Year</span>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 glow-cyan">
          <UserIcon size={18} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
