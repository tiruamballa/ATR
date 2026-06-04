import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  Flame,
  Github,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import TiltCard from '../components/TiltCard';
import CyberButton from '../components/CyberButton';
import XPBar from '../components/XPBar';
import TypewriterText from '../components/TypewriterText';

// ── CONCENTRIC DOUBLE-RING READINESS METER
const ReadinessMeter = ({ internshipPct = 0, placementPct = 0 }) => {
  const size = 220;
  const strokeW = 10;
  
  // Outer circle (Internship)
  const rOuter = (size - strokeW * 2) / 2;
  const circOuter = 2 * Math.PI * rOuter;
  
  // Inner circle (Placement)
  const rInner = rOuter - 18;
  const circInner = 2 * Math.PI * rInner;

  return (
    <TiltCard className="h-full">
      <div className="cyber-card flex flex-col items-center justify-center p-6 text-center h-full">
        <div className="font-mono text-[10px] text-slate-500 tracking-[0.2em] mb-4 uppercase">
          READINESS MATRIX
        </div>
        <div className="relative">
          <svg width={size} height={size} className="overflow-visible">
            {/* Outer Internship Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={rOuter}
              fill="none"
              stroke="rgba(0, 245, 212, 0.05)"
              strokeWidth={strokeW}
            />
            {/* Outer Internship Progress */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={rOuter}
              fill="none"
              stroke="#00F5D4"
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={circOuter}
              initial={{ strokeDashoffset: circOuter }}
              animate={{ strokeDashoffset: circOuter - (internshipPct / 100) * circOuter }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 212, 0.4))' }}
            />

            {/* Inner Placement Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={rInner}
              fill="none"
              stroke="rgba(123, 97, 255, 0.05)"
              strokeWidth={strokeW}
            />
            {/* Inner Placement Progress */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={rInner}
              fill="none"
              stroke="#7B61FF"
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={circInner}
              initial={{ strokeDashoffset: circInner }}
              animate={{ strokeDashoffset: circInner - (placementPct / 100) * circInner }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ filter: 'drop-shadow(0 0 8px rgba(123, 97, 255, 0.4))' }}
            />
          </svg>

          {/* Text inside the ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-black text-3xl text-cyber-cyan text-shadow-[0_0_10px_rgba(0,245,212,0.6)]">
              {internshipPct}%
            </span>
            <span className="font-mono text-[9px] text-slate-500 tracking-wider mt-1.5 uppercase">
              INTERNSHIP READY
            </span>
          </div>
        </div>
        
        {/* Visual Legend */}
        <div className="flex gap-4 mt-5 text-[10px] font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyber-cyan rounded-full animate-ping" /> Internship</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyber-purple rounded-full" /> Placement ({placementPct}%)</span>
        </div>
      </div>
    </TiltCard>
  );
};

// ── FUTURE SELF METRIC BAR PREVIEWS
const FutureSelfWidget = ({ user, readiness }) => {
  const currentSkills = [
    { label: 'DSA Solved', current: readiness?.breakdown?.dsaCompletionPercent || 0, max: 100, level: Math.floor((readiness?.breakdown?.dsaCompletionPercent || 0) / 10), color: '#00F5D4' },
    { label: 'React Proficiency', current: user?.skillsProficiency?.react || 0, max: 100, level: Math.floor((user?.skillsProficiency?.react || 0) / 10), color: '#7B61FF' },
    { label: 'Backend Architecture', current: user?.skillsProficiency?.backend || 0, max: 100, level: Math.floor((user?.skillsProficiency?.backend || 0) / 10), color: '#F472B6' }
  ];

  const targetSkills = [
    { label: 'DSA Solved', current: 95, max: 100, level: 9, color: '#00F5D4' },
    { label: 'React Proficiency', current: 90, max: 100, level: 9, color: '#7B61FF' },
    { label: 'Backend Architecture', current: 85, max: 100, level: 8, color: '#F472B6' }
  ];

  return (
    <TiltCard>
      <div className="cyber-card h-full">
        <div className="font-mono text-[10px] text-cyber-purple tracking-[0.2em] mb-4 uppercase">
          🔮 FUTURE SELF MODE
        </div>
        <div className="grid grid-cols-[1fr_2px_1fr] gap-4 items-stretch">
          {/* Current Column */}
          <div>
            <div className="text-[9px] text-slate-500 mb-3 font-mono uppercase tracking-widest">NOW</div>
            {currentSkills.map(s => <XPBar key={s.label} {...s} />)}
          </div>
          {/* Vertical Divider */}
          <div className="bg-cyber-purple/20 self-stretch shadow-purple/10 shadow-lg" />
          {/* Target Column */}
          <div>
            <div className="text-[9px] text-cyber-purple mb-3 font-mono uppercase tracking-widest">NOV 2027</div>
            {targetSkills.map(s => <XPBar key={s.label} {...s} />)}
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

// ── AI MISSION ADVISOR WIDGET
const AIAgentWidget = () => {
  return (
    <TiltCard>
      <div className="cyber-card border border-cyber-purple/30 h-full flex flex-col justify-between">
        <div>
          <div className="font-mono text-[10px] text-cyber-purple tracking-[0.2em] mb-3 uppercase">
            🤖 ATR AI — MISSION ADVISOR
          </div>
          
          {/* Station Cam Feed showing User's setup photo */}
          <div className="relative w-full h-24 rounded-lg overflow-hidden border border-cyber-purple/20 mb-3.5 group">
            <img 
              src="/developer-mode.jpg" 
              alt="Developer setup feed" 
              className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.1] grayscale-[15%] group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute top-2 left-2 flex items-center space-x-1.5 px-2 py-0.5 rounded bg-black/75 border border-cyber-purple/30 font-mono text-[8px] text-cyber-purple tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-cyber-purple rounded-full animate-ping" />
              <span>LIVE FEED: BUNK_01</span>
            </div>
            <div className="absolute bottom-1 right-2 font-mono text-[8px] text-slate-500">
              SECURE_LINK // 83.9B
            </div>
          </div>

          <div className="text-xs text-slate-400 mb-3 leading-relaxed font-body h-12">
            <TypewriterText text="Analyzing preparation logs... Suggested focus: solve Tree traversals & study DBMS indexing patterns." speed={40} />
          </div>

          <div className="bg-cyber-purple/5 border border-cyber-purple/10 rounded-xl p-3.5 mb-4 text-xs font-mono">
            <div className="text-slate-500 mb-1.5 uppercase text-[9px] tracking-wider">SUGGESTED MISSION:</div>
            <div className="text-cyber-cyan mb-3">Solve 3 BST questions (P1)</div>
            <div className="text-slate-500 mb-1.5 uppercase text-[9px] tracking-wider">RECOMMENDED INTEL:</div>
            <div className="text-cyber-purple">Practice on Leetcode / Strivers Trees</div>
          </div>
        </div>

        <CyberButton variant="purple" className="w-full text-center py-2.5 text-xs">
          ACCEPT MISSION
        </CyberButton>
      </div>
    </TiltCard>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  const [currentPhase, setCurrentPhase] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [streak, setStreak] = useState(null);
  const [todayChecklist, setTodayChecklist] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [phaseRes, readinessRes, streakRes, todayRes, analyticsRes] = await Promise.all([
        apiRequest('/phases/current'),
        apiRequest('/profile/readiness'),
        apiRequest('/daily/streak'),
        apiRequest('/daily/today'),
        apiRequest('/analytics')
      ]);

      if (phaseRes.success) setCurrentPhase(phaseRes.phase);
      if (readinessRes.success) setReadiness(readinessRes);
      if (streakRes.success) setStreak(streakRes.streak);
      if (todayRes.success) setTodayChecklist(todayRes);
      if (analyticsRes.success) setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for custom taskCreated events to reload data
    window.addEventListener('taskCreated', fetchDashboardData);
    return () => {
      window.removeEventListener('taskCreated', fetchDashboardData);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  const todayTasks = todayChecklist?.checklist || [];
  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const checklistPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // RPG Stat Layout values mapped from actual user skills
  const rpgStats = [
    { label: 'DSA PRACTICE', current: readiness?.breakdown?.dsaCompletionPercent || 0, max: 100, level: Math.floor((readiness?.breakdown?.dsaCompletionPercent || 0) / 10), color: '#00F5D4' },
    { label: 'REACT ENG', current: user?.skillsProficiency?.react || 0, max: 100, level: Math.floor((user?.skillsProficiency?.react || 0) / 10), color: '#7B61FF' },
    { label: 'BACKEND DEV', current: user?.skillsProficiency?.backend || 0, max: 100, level: Math.floor((user?.skillsProficiency?.backend || 0) / 10), color: '#F472B6' },
    { label: 'QUANT LOGIC', current: readiness?.breakdown?.avgAptAccuracy || 0, max: 100, level: Math.floor((readiness?.breakdown?.avgAptAccuracy || 0) / 10), color: '#FACC15' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── HERO BANNER */}
      <div className="relative p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-void via-card to-void overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-display text-[10px] text-slate-500 tracking-[0.25em] uppercase mb-1">
              ░░ MISSION CONTROL STATUS ░░
            </div>
            <h2 className="text-3xl font-display font-black text-white flex items-center gap-2">
              WELCOME BACK, <span className="text-cyber-cyan">{user?.name?.toUpperCase()}</span>! ⚡
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              INTERNSHIP REGISTRATION BEGINS <strong className="text-cyber-cyan">JUNE 2026</strong>. TARGET READINESS DATE: <strong className="text-cyber-cyan">FEB 2027</strong>.
            </p>
          </div>
          {/* Daily Streak Achievement Badge */}
          <div className="flex items-center space-x-3 bg-cyber-yellow/5 border border-cyber-yellow/20 px-5 py-3 rounded-2xl shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            <Flame size={24} className="text-cyber-yellow fill-cyber-yellow animate-bounce" />
            <div>
              <span className="block text-2xl font-display font-black text-white leading-none">
                {streak?.currentStreak || 0} DAYS
              </span>
              <span className="text-[9px] text-cyber-yellow/80 font-bold uppercase tracking-wider">
                CURRENT STREAK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID: HUD DIAGRAM & STATUS PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Concentric Double-Ring Readiness Meter */}
        <div className="lg:col-span-1">
          <ReadinessMeter
            internshipPct={readiness?.internshipScore}
            placementPct={readiness?.placementScore}
          />
        </div>

        {/* Character RPG Status Logs */}
        <div className="lg:col-span-1">
          <TiltCard>
            <div className="cyber-card h-full flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] text-slate-500 tracking-[0.2em] mb-4 uppercase">
                  CHARACTER PORTRAIT & STATS
                </div>
                
                {/* Character Headshot Frame */}
                <div className="flex items-center space-x-4 mb-5 pb-4 border-b border-white/5">
                  <div className="relative w-16 h-16 rounded-xl border-2 border-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.3)] overflow-hidden flex-shrink-0">
                    <img 
                      src="/avatar-arms-crossed.jpg" 
                      alt="Developer Portrait" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0.5 right-1 w-2.5 h-2.5 bg-cyber-cyan rounded-full border border-black animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white tracking-wider">
                      {user?.name?.toUpperCase() || 'AGENT'}
                    </h4>
                    <span className="text-[10px] font-mono text-cyber-cyan tracking-wider uppercase block">
                      CLASS: FULL STACK MAGE 🧙
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      LEVEL 14 ROADMAP AGENT
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {rpgStats.map(s => (
                    <XPBar
                      key={s.label}
                      label={s.label}
                      current={s.current}
                      max={s.max}
                      level={s.level}
                      color={s.color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Active Mission HUD card */}
        <div className="lg:col-span-1">
          <TiltCard className="h-full">
            <div className="cyber-card border-l-2 border-l-cyber-cyan h-full flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] text-cyber-cyan tracking-[0.2em] mb-4 uppercase">
                  ⚡ ACTIVE MISSION
                </div>
                <h3 className="font-display font-black text-base text-white tracking-wide leading-snug mb-2">
                  {currentPhase?.name || 'INITIAL BOOTUP PHASE'}
                </h3>
                <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/5 border border-cyber-cyan/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Month {Number(currentPhase?.monthIndex || 0) + 1}
                </span>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-body">
                  {currentPhase?.goal || 'Seeding curriculum logs. Initialize roadmap tracker to fetch.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                <XPBar
                  label="MISSION PROGRESS"
                  current={Math.round(currentPhase?.completionPercentage || 0)}
                  max={100}
                  level={Math.floor((currentPhase?.completionPercentage || 0) / 10)}
                  color="#00F5D4"
                />
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* ── MIDDLE HUD ROW: FUTURE SELF & MISSION ADVISOR & QUESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Future Self Mode Bar comparisons */}
        <div className="lg:col-span-1">
          <FutureSelfWidget user={user} readiness={readiness} />
        </div>

        {/* AI Advisor Mini Widget */}
        <div className="lg:col-span-1">
          <AIAgentWidget />
        </div>

        {/* Today's parallel track quests preview */}
        <div className="lg:col-span-1">
          <TiltCard className="h-full">
            <div className="cyber-card flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase">
                    TODAY'S QUEST LOGS
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest">
                    {completedToday}/{totalToday} DONE
                  </span>
                </div>

                <div className="w-full bg-slate-900 border border-white/5 rounded-md h-1.5 overflow-hidden">
                  <div
                    className="bg-cyber-cyan h-full rounded-full transition-all duration-300"
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>

                {/* Quests mini list */}
                <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto">
                  {todayTasks.length > 0 ? (
                    todayTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] transition-all font-mono ${
                          t.completed
                            ? 'bg-cyber-cyan/5 border-cyber-cyan/20 text-cyber-cyan/95'
                            : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        <span>{t.title}</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-slate-500 font-bold border border-white/5 uppercase">
                          {t.category}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500 italic font-mono">
                      No active daily quests seeded.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end">
                <Link to="/daily" className="text-xs font-mono font-bold text-cyber-cyan hover:text-cyan-300 flex items-center gap-1 group">
                  OPEN QUEST DIARY
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* ── BOT ROW: GITHUB AND STUDY TIME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GitHub Stats card */}
        <div className="lg:col-span-1">
          <TiltCard className="h-full">
            <div className="cyber-card flex flex-col justify-between h-full relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase">
                    GITHUB HUD TRACKER
                  </h3>
                  <span className="text-[10px] text-cyber-cyan font-bold flex items-center gap-1 animate-pulse">
                    <Sparkles size={12} /> SYNC ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5 font-mono">
                    <span className="block text-xl font-bold text-white">
                      {user?.githubStats?.repos || 0}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      REPOS
                    </span>
                  </div>

                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5 font-mono">
                    <span className="block text-xl font-bold text-white">
                      {user?.githubStats?.contributions || 0}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      CONTR.
                    </span>
                  </div>

                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5 font-mono">
                    <span className="block text-xl font-bold text-white">
                      {user?.githubStats?.streak || 0}d
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      STREAK
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span>PROJECT CREDITS:</span>
                  <strong className="text-white">{user?.githubStats?.projectsCount || 0}/4 Complete</strong>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end">
                <Link to="/settings" className="text-xs font-mono font-bold text-cyber-cyan hover:text-cyan-300 flex items-center gap-1 group">
                  SYNC LINK
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Analytics chart: Weekly study hours */}
        {analytics?.studyLogs && (
          <div className="lg:col-span-2">
            <TiltCard className="h-full">
              <div className="cyber-card h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                    <Clock className="text-cyber-cyan animate-pulse" size={16} />
                    STUDY RADAR (LAST 30 DAYS)
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-mono font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyber-cyan rounded-full" /> Actual</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyber-purple rounded-full" /> Target</span>
                  </div>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.studyLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#00F5D4" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#7B61FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                      <YAxis stroke="#475569" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                      />
                      <Area type="monotone" dataKey="actual" stroke="#00F5D4" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                      <Area type="monotone" dataKey="target" stroke="#7B61FF" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TiltCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
