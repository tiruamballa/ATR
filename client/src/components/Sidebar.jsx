import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DeveloperCharacter from './DeveloperCharacter';
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
  const { logout } = useAuth();
  
  // Pick quote based on day of the week
  const dayIndex = new Date().getDay();
  const dailyQuote = quotes[dayIndex] || quotes[0];

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'ATR Calendar', icon: Calendar },
    { to: '/tasks', label: 'All Tasks', icon: ListTodo },
    { to: '/dsa', label: 'DSA Tracker', icon: Code2 },
    { to: '/english', label: 'English Tracker', icon: MessageSquareText },
    { to: '/aptitude', label: 'Aptitude Tracker', icon: BrainCircuit },
    { to: '/daily', label: 'Daily Tracker', icon: ClipboardCheck },
    { to: '/resources', label: 'Resource Library', icon: Library },
    { to: '/analytics', label: 'Analytics Panel', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-white/5 bg-[#0F172A]/95 backdrop-blur-md transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center space-x-2" onClick={isOpen ? toggleSidebar : undefined}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white font-extrabold text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              A
            </div>
            <span className="font-sans font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
              ATR ROADMAP
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 lg:hidden text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Developer character & quote inside sidebar */}
        <div className="px-4 py-6 text-center border-b border-white/5 flex-shrink-0">
          <DeveloperCharacter />
          <div className="mt-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-cyan-300/90 italic leading-relaxed select-none">
            {dailyQuote}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={isOpen ? toggleSidebar : undefined}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 border-l-4 border-cyan-500 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={18}
                    className={`mr-3.5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  />
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <button
            onClick={() => {
              logout();
              if (isOpen) toggleSidebar();
            }}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-pink-400 hover:text-white rounded-xl bg-pink-500/5 hover:bg-pink-500 border border-pink-500/10 hover:border-pink-500 transition-all duration-300 cursor-pointer"
          >
            <LogOut size={16} className="mr-2" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
