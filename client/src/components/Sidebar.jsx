import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThreeDLogo from './ThreeDLogo';
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
  X,
  CalendarDays
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'Calendar',     icon: Calendar },
    { to: '/dsa', label: 'DSA',      icon: Code2 },
    { to: '/aptitude', label: 'Aptitude',    icon: BrainCircuit },
    { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { to: '/settings', label: 'Settings',          icon: Settings },
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-white/5 bg-[#111827] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-hidden`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center space-x-3" onClick={isOpen ? toggleSidebar : undefined}>
            <ThreeDLogo size={32} />
            <span className="font-display font-bold text-sm tracking-wider text-white">
              ATR
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 lg:hidden text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={isOpen ? toggleSidebar : undefined}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 group relative ${
                  isActive
                    ? 'text-cyber-cyan bg-cyber-cyan/5 border-l-2 border-cyber-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={16}
                    className={`mr-3 transition-transform duration-150 group-hover:scale-105 ${
                      isActive ? 'text-cyber-cyan' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile section at bottom */}
        <div className="p-4 border-t border-white/5 flex-shrink-0 bg-black/10">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="relative w-10 h-10 rounded-full border border-white/10 overflow-hidden flex-shrink-0">
              <img src="/avatar-suit.jpg" alt="User Headshot" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-white text-xs font-semibold truncate leading-tight uppercase">
                {user?.name || 'AGENT'}
              </h4>
              <span className="text-[10px] font-mono text-slate-500 tracking-wider block truncate">
                {user?.email || 'UNKNOWN'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              if (isOpen) toggleSidebar();
            }}
            className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-cyber-red hover:text-white rounded-lg bg-cyber-red/5 hover:bg-cyber-red border border-cyber-red/10 hover:border-cyber-red transition-all duration-200 cursor-pointer"
          >
            <LogOut size={13} className="mr-2" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
