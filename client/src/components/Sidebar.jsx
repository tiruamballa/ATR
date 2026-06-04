import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import ThreeDLogo from './ThreeDLogo';
import XPBar from './XPBar';
import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Code2,
  MessageSquareText,
  BrainCircuit,
  ClipboardCheck,
  Library,
  BarChart3,
  Settings,
  LogOut,
  X
} from 'lucide-react';

const quotes = [
  "Talk is cheap. Show me the code. 💻",
  "First, solve the problem. Then, write the code. 🧠",
  "Clean code always looks like it was written by someone who cares. ✨",
  "The only way to learn a new programming language is by writing programs. 🚀",
  "Every great developer got there by solving problems they were unqualified to solve. 🌟",
  "Make it work, make it right, make it fast. ⚡",
  "Consistency is the secret sauce of placing into your dream company. 🔥"
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [readiness, setReadiness] = useState({ internshipScore: 78, placementScore: 54 });
  
  // Boot Sequence State
  const [booting, setBooting] = useState(true);
  const [bootIndex, setBootIndex] = useState(0);

  const bootLines = [
    'INITIALIZING ATR OS v2.0...',
    'LOADING ROADMAP DATA...',
    'SYNCING STREAK MODULE...',
    'SYSTEM READY.',
  ];

  // Pick quote based on day of the week
  const dayIndex = new Date().getDay();
  const dailyQuote = quotes[dayIndex] || quotes[0];

  useEffect(() => {
    // Boot sequence animation
    if (bootIndex < bootLines.length) {
      const timer = setTimeout(() => {
        setBootIndex(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setBooting(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [bootIndex]);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const data = await apiRequest('/profile/readiness');
        if (data.success) {
          setReadiness(data);
        }
      } catch (err) {
        console.error('Failed to load readiness scores in sidebar:', err);
      }
    };

    if (user) {
      fetchReadiness();
    }
  }, [user]);

  const navLinks = [
    { to: '/dashboard', label: 'MISSION CONTROL', icon: LayoutDashboard },
    { to: '/calendar', label: 'JOURNEY MAP',     icon: Calendar },
    { to: '/tasks', label: 'QUEST LOG',       icon: ListTodo },
    { to: '/dsa', label: 'SKILL TREE',      icon: Code2 },
    { to: '/english', label: 'COMMS TRAINING',  icon: MessageSquareText },
    { to: '/aptitude', label: 'APTITUDE LAB',    icon: BrainCircuit },
    { to: '/daily', label: 'DAILY QUESTS',    icon: ClipboardCheck },
    { to: '/resources', label: 'INTEL HUB',       icon: Library },
    { to: '/analytics', label: 'WAR ROOM',        icon: BarChart3 },
    { to: '/settings', label: 'SYSTEM',          icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-white/5 bg-[#0A0F1D]/90 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-hidden`}
      >
        {/* Terminal Boot Sequence (runs once on first load) */}
        {booting && (
          <div className="absolute inset-0 bg-[#0B0F19] z-50 flex flex-col justify-center px-6 font-mono text-xs text-cyber-cyan">
            <div className="space-y-3">
              {bootLines.slice(0, bootIndex).map((line, idx) => (
                <div key={idx} className="flex items-center">
                  <span>&gt; {line}</span>
                  {idx === bootIndex - 1 && <span className="animate-blink">█</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header Branding */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center space-x-3.5" onClick={isOpen ? toggleSidebar : undefined}>
            <ThreeDLogo size={36} />
            <span className="font-display font-black text-[13px] tracking-[0.18em] text-white">
              ATR ROADMAP
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 lg:hidden text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* RPG Character Info Panel inside sidebar */}
        <div className="px-5 py-5 border-b border-white/5 flex-shrink-0 bg-black/25">
          {/* User Photo Avatar and Name */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative w-12 h-12 rounded-full border border-cyber-cyan shadow-[0_0_10px_rgba(0,245,212,0.3)] overflow-hidden flex-shrink-0">
              <img src="/avatar-suit.jpg" alt="Agent Headshot" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="min-w-0">
              <h4 className="text-white text-xs font-bold font-display truncate leading-tight uppercase">
                {user?.name || 'AGENT'}
              </h4>
              <span className="text-[9px] font-mono text-slate-500 tracking-wider block truncate">
                {user?.email?.split('@')[0].toUpperCase() || 'UNKNOWN'} // IT
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="font-display text-[11px] font-bold text-cyber-yellow flex items-center gap-1.5">
              ⚡ LVL 14 ENG
            </span>
            <span className="font-mono text-[10px] text-cyber-yellow/90 font-bold bg-cyber-yellow/10 border border-cyber-yellow/20 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.15)] animate-pulse">
              🔥 STREAK {user?.githubStats?.streak || 0}D
            </span>
          </div>

          {/* Intern readiness bar */}
          <XPBar
            label="INTERN READY"
            current={readiness.internshipScore}
            max={100}
            level={Math.floor(readiness.internshipScore / 10)}
            color="#00F5D4"
          />

          {/* Placement readiness bar */}
          <XPBar
            label="PLACEMENT READY"
            current={readiness.placementScore}
            max={100}
            level={Math.floor(readiness.placementScore / 10)}
            color="#7B61FF"
          />
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={isOpen ? toggleSidebar : undefined}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl text-xs font-semibold font-mono tracking-wider transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'text-cyber-cyan bg-cyber-cyan/5 border-l-2 border-cyber-cyan shadow-[inset_0_0_10px_rgba(0,245,212,0.05)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left glow hover sweep */}
                  <div className="absolute inset-0 w-0 bg-cyber-cyan/5 group-hover:w-full transition-all duration-300 pointer-events-none" />
                  
                  <link.icon
                    size={16}
                    className={`mr-3.5 transition-transform duration-200 group-hover:scale-110 relative z-10 ${
                      isActive ? 'text-cyber-cyan filter drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="relative z-10">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Daily quote and logout */}
        <div className="p-4 border-t border-white/5 flex-shrink-0 bg-black/20">
          <div className="mb-3.5 px-3 py-2.5 rounded-xl border border-white/5 bg-black/25 text-[10px] text-cyber-cyan/80 italic leading-relaxed select-none">
            {dailyQuote}
          </div>
          <button
            onClick={() => {
              logout();
              if (isOpen) toggleSidebar();
            }}
            className="flex items-center justify-center w-full px-4 py-3.5 text-xs font-mono font-bold tracking-widest text-cyber-red hover:text-white rounded-xl bg-cyber-red/5 hover:bg-cyber-red border border-cyber-red/10 hover:border-cyber-red transition-all duration-300 cursor-pointer"
          >
            <LogOut size={14} className="mr-2" />
            LOGOUT SESSION
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
