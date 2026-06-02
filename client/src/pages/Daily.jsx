import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  CheckSquare,
  Square,
  Flame,
  Award,
  BookOpen,
  Code2,
  Volume2,
  BrainCircuit,
  Github,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Daily = () => {
  const [checklist, setChecklist] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyData = async () => {
    try {
      const [todayRes, streakRes] = await Promise.all([
        apiRequest('/daily/today'),
        apiRequest('/daily/streak'),
      ]);

      if (todayRes.success) {
        setChecklist(todayRes.checklist || []);
      }
      if (streakRes.success) {
        setStreak(streakRes.streak);
      }
    } catch (err) {
      console.error('Failed to load daily tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
  }, []);

  const handleToggle = async (itemKey) => {
    try {
      const data = await apiRequest('/daily/toggle', {
        method: 'POST',
        body: { itemKey },
      });

      if (data.success) {
        // Update checklist local state
        setChecklist((prev) =>
          prev.map((item) => (item.key === itemKey ? { ...item, completed: !item.completed } : item))
        );

        // Update streak details
        if (data.streak) {
          setStreak(data.streak);
        }

        // Celebrate if all 6 habits are checked complete
        const updatedChecklist = checklist.map((item) =>
          item.key === itemKey ? { ...item, completed: !item.completed } : item
        );
        const allDone = updatedChecklist.every((item) => item.completed);
        if (allDone) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#10b981', '#f59e0b', '#a855f7'],
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle habit check status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const completedCount = checklist.filter(t => t.completed).length;
  const totalCount = checklist.length;
  const isDayFinished = completedCount === totalCount && totalCount > 0;

  // Icon mapping for each habit card
  const iconMap = {
    dsa: { icon: Code2, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    english: { icon: Volume2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    aptitude: { icon: BrainCircuit, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    dev: { icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    github: { icon: Github, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    hours: { icon: Clock, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Upper Streak dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Streak Widget */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-orange-500">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 glow-purple">
              <Flame size={24} className="fill-orange-500/25" />
            </div>
            <div>
              <span className="block text-2xl font-black text-white">{streak?.currentStreak || 0} Days</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Study Streak</span>
            </div>
          </div>
          <span className="text-2xl">🔥</span>
        </div>

        {/* Longest Streak Widget */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-purple-500">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award size={24} />
            </div>
            <div>
              <span className="block text-2xl font-black text-white">{streak?.longestStreak || 0} Days</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">All-Time Peak Record</span>
            </div>
          </div>
          <span className="text-2xl">👑</span>
        </div>

        {/* Day check counts */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-cyan-500">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span className="block text-2xl font-black text-white">{completedCount} / {totalCount}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Habits Checked Today</span>
            </div>
          </div>
          <span className="text-2xl">🏆</span>
        </div>

      </div>

      {/* Habit checklists grid */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-6">
          <div>
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <CheckSquare size={20} className="text-cyan-400" />
              Daily Career Development Habit Checklist
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mark off these parallel tasks daily to increment streaks and maintain high placement readiness.
            </p>
          </div>

          {isDayFinished && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles size={14} /> Full checklist complete! Perfect day.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklist.map((item) => {
            const config = iconMap[item.key] || { icon: CheckSquare, color: 'text-gray-400 bg-white/5' };
            const Icon = config.icon;
            
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-5 rounded-2xl border flex flex-col justify-between h-40 cursor-pointer select-none transition-all duration-300 relative group ${
                  item.completed
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-400'
                    : 'bg-white/5 border-white/5 hover:border-cyan-500/25 text-white'
                }`}
              >
                {/* Header Icon & status box */}
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl border ${config.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    {item.completed ? (
                      <CheckSquare size={22} className="text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Square size={22} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-1 mt-4">
                  <h4 className={`text-sm font-extrabold ${item.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    {item.key === 'dsa' && 'Solve today\'s DSA target problems (Arrays, strings, recursion).'}
                    {item.key === 'english' && 'Engage in a 5-min vocabulary look-up or verbal standup round.'}
                    {item.key === 'aptitude' && 'Complete quantitative ratio or logic checks.'}
                    {item.key === 'dev' && 'Develop current milestone feature logs.'}
                    {item.key === 'github' && 'Commit code and push updates to your repo portfolio.'}
                    {item.key === 'hours' && 'Log 6 target hours of continuous study.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Daily;
