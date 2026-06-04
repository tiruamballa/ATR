import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Flame,
  Award,
  CheckSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import TiltCard from '../components/TiltCard';
import XPBar from '../components/XPBar';
import XPFloat from '../components/XPFloat';

const Daily = () => {
  const [checklist, setChecklist] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [floats, setFloats] = useState([]);

  const fetchDailyData = async () => {
    try {
      const [todayRes, streakRes] = await Promise.all([
        apiRequest('/daily/today'),
        apiRequest('/daily/streak'),
      ]);

      if (todayRes.success) {
        setChecklist(todayRes.progress?.checklist || []);
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

  const handleToggle = async (e, itemKey, xpAmount) => {
    try {
      // Capture coordinates of the click for floating XP effect
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX || (rect.left + rect.width / 2);
      const clickY = e.clientY || (rect.top + rect.height / 2);

      // Find current item completion state
      const targetItem = checklist.find(item => item.key === itemKey);
      const isChecking = targetItem ? !targetItem.completed : false;

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

        // Trigger XP Float effect if checked complete
        if (isChecking) {
          setFloats((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), amount: xpAmount, x: clickX, y: clickY }
          ]);
        }

        // Celebrate if all tasks are complete
        const updatedChecklist = checklist.map((item) =>
          item.key === itemKey ? { ...item, completed: !item.completed } : item
        );
        const allDone = updatedChecklist.every((item) => item.completed);
        if (allDone) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#22D3EE', '#8B5CF6', '#F59E0B', '#EC4899'],
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  const completedCount = checklist.filter(t => t.completed).length;
  const totalCount = checklist.length;
  const isDayFinished = completedCount === totalCount && totalCount > 0;

  // Icon mapping for each habit card
  const iconMap = {
    dsa: '⚔',
    english: '🎙',
    aptitude: '🧠',
    dev: '💻',
    github: '📡',
    hours: '⌛',
  };

  // XP Mapping for each habit
  const xpMap = {
    dsa: 60,
    english: 40,
    aptitude: 40,
    dev: 50,
    github: 30,
    hours: 50,
  };

  // Label Mapping
  const labelMap = {
    dsa: 'DSA Problems',
    english: 'Speaking Practice',
    aptitude: 'Aptitude Lab Check',
    dev: 'Build Project',
    github: 'GitHub Push Logs',
    hours: 'Continuous Grind',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* XP Floating indicator overlay rendering */}
      {floats.map((f) => (
        <XPFloat
          key={f.id}
          amount={f.amount}
          x={f.x}
          y={f.y}
          onComplete={() => setFloats((prev) => prev.filter((item) => item.id !== f.id))}
        />
      ))}

      {/* ── HEADER STATUS INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Study Streak */}
        <div className="cyber-card p-6 flex items-center justify-between border-l-4 border-l-cyber-yellow relative overflow-hidden" style={{ boxShadow: 'var(--glow-yellow)' }}>
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="p-2.5 rounded-xl bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/20 animate-pulse">
              <Flame size={24} className="fill-cyber-yellow/25" />
            </div>
            <div>
              <span className="block text-2xl font-display font-black text-white">{streak?.currentStreak || 0} DAYS</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">ACTIVE STUDY STREAK</span>
            </div>
          </div>
          <span className="text-3xl opacity-20 relative z-10">🔥</span>
        </div>

        {/* Peak Record Streak */}
        <div className="cyber-card p-6 flex items-center justify-between border-l-4 border-l-cyber-purple relative overflow-hidden" style={{ boxShadow: 'var(--glow-purple)' }}>
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="p-2.5 rounded-xl bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20">
              <Award size={24} />
            </div>
            <div>
              <span className="block text-2xl font-display font-black text-white">{streak?.longestStreak || 0} DAYS</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">PEAK ACHIEVED STREAK</span>
            </div>
          </div>
          <span className="text-3xl opacity-20 relative z-10">👑</span>
        </div>

        {/* Quests Solved Counter */}
        <div className="cyber-card p-6 flex items-center justify-between border-l-4 border-l-cyber-cyan relative overflow-hidden" style={{ boxShadow: 'var(--glow-cyan)' }}>
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="p-2.5 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span className="block text-2xl font-display font-black text-white">{completedCount} / {totalCount}</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">QUESTS SOLVED TODAY</span>
            </div>
          </div>
          <span className="text-3xl opacity-20 relative z-10">🏆</span>
        </div>

      </div>

      {/* ── HABIT QUEST CARDS GRID */}
      <div className="cyber-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-6">
          <div>
            <h3 className="font-display font-bold text-white text-base tracking-wider uppercase flex items-center gap-2">
              <CheckSquare size={20} className="text-cyber-cyan" />
              DAILY QUEST DIARY
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-body">
              Level up your skill statistics and maintain daily streak multipliers by checking off your quest targets.
            </p>
          </div>

          {isDayFinished && (
            <div className="px-3.5 py-1.5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono tracking-wider font-bold flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(0,245,212,0.2)]">
              <Sparkles size={14} /> QUEST LOG COMPLETE! +500 XP BONUS
            </div>
          )}
        </div>

        {/* The Quest Card Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklist.map((item) => {
            const icon = iconMap[item.key] || '⚔';
            const xp = xpMap[item.key] || 40;
            const labelName = labelMap[item.key] || item.title;

            return (
              <TiltCard key={item.key}>
                <div
                  onClick={(e) => handleToggle(e, item.key, xp)}
                  className={`p-5 rounded-2xl border flex flex-col justify-between h-40 cursor-pointer select-none transition-all duration-300 relative group ${
                    item.completed
                      ? 'bg-cyber-cyan/5 border-cyber-cyan/20 text-slate-500 shadow-[inset_0_0_10px_rgba(0,245,212,0.02)]'
                      : 'bg-white/5 border-white/5 hover:border-cyber-cyan/30 text-white'
                  }`}
                  style={item.completed ? { boxShadow: '0 0 15px rgba(0, 245, 212, 0.05)' } : {}}
                >
                  {/* Top row: Icon & Circle status */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl text-lg font-mono leading-none ${item.completed ? 'bg-cyber-cyan/10 text-cyber-cyan/70' : 'bg-white/5 text-cyber-cyan'}`}>
                      {icon}
                    </div>
                    <div>
                      {item.completed ? (
                        <div className="w-6 h-6 rounded-lg border-2 border-cyber-cyan bg-cyber-cyan/25 flex items-center justify-center text-cyber-cyan text-xs font-bold font-display">
                          ✓
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg border-2 border-white/10 group-hover:border-cyber-cyan/50 transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Text Description */}
                  <div className="space-y-1 mt-4">
                    <div className="flex justify-between items-center">
                      <h4 className={`text-sm font-display font-bold tracking-wide ${item.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {labelName}
                      </h4>
                      <span className="font-mono text-[9px] text-cyber-yellow">+{xp} XP</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal font-body">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Daily;
