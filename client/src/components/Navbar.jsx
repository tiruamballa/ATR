import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, User as UserIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const pageNames = {
    '/dashboard': 'MISSION CONTROL',
    '/calendar': 'JOURNEY MAP TIMELINE',
    '/tasks': 'QUEST LOG BOARD',
    '/attendance': 'ATTENDANCE CONTROL ENGINE',
    '/dsa': 'DSA SKILL TREE',
    '/english': 'COMMS TRAINING MODULE',
    '/aptitude': 'QUANTITATIVE LABS',
    '/daily': 'DAILY ADVENTURE QUESTS',
    '/resources': 'INTEL REFERENCE HUB',
    '/analytics': 'SYSTEM WAR ROOM ANALYTICS',
    '/settings': 'ATR OS CONFIGURATIONS',
  };

  const currentPage = pageNames[location.pathname] || 'ATR SYSTEM SHELL';

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 bg-black/65 backdrop-blur-md border-b border-white/5">
      {/* Left section: mobile hamburger & page title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white lg:hidden focus:outline-none"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-base font-display font-black tracking-[0.18em] text-cyber-cyan text-shadow-[0_0_12px_rgba(0,245,212,0.4)]">
          {currentPage}
        </h1>
      </div>

      {/* Right section: user profile card */}
      <div className="flex items-center space-x-3.5 select-none">
        <div className="hidden md:flex flex-col text-right font-mono text-[10px]">
          <span className="font-semibold text-white uppercase tracking-wider">{user.name}</span>
          <span className="text-cyber-cyan font-bold tracking-widest mt-0.5">AGENT // B.TECH IT</span>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_12px_rgba(0,245,212,0.2)]">
          <UserIcon size={16} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
