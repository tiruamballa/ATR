import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  Flame,
  Github,
  Award,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Calculate today's checklist percentage
  const todayTasks = todayChecklist?.checklist || [];
  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const checklistPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      {/* Welcome Banner */}
      <div className="relative p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-indigo-950/40 via-cyan-950/20 to-slate-900/60 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Welcome back, {user?.name}! ⚡
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Your internship prep timeline starts <strong className="text-cyan-400">June 2026</strong>. Goal: Interview ready by <strong className="text-cyan-400">Feb 2027</strong>.
            </p>
          </div>
          {/* Flame Streak Badge */}
          <div className="flex items-center space-x-3 bg-gradient-to-tr from-orange-500/10 to-amber-500/15 border border-orange-500/25 px-5 py-3 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <Flame size={28} className="text-orange-500 fill-orange-500 animate-pulse" />
            <div>
              <span className="block text-2xl font-black text-white leading-none">
                {streak?.currentStreak || 0} Days
              </span>
              <span className="text-xs text-orange-400/90 font-bold uppercase tracking-wider">
                Current Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Phase Status & Readiness Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Phase Card */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                Active Phase
              </span>
              <span className="text-xs font-bold text-gray-400">
                Month {Number(currentPhase?.monthIndex || 0) + 1} of 18
              </span>
            </div>
            
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                {currentPhase?.name || 'No Phase Configured'}
              </h3>
              <p className="text-xs text-cyan-400 font-semibold mt-1">
                Primary Stack: {currentPhase?.primarySkill}
              </p>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed min-h-[60px]">
              {currentPhase?.goal || 'No objective set. Create phases to populate.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
              <span>Goal Progress</span>
              <span className="text-cyan-400">
                {currentPhase ? Math.round(currentPhase.completionPercentage) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentPhase ? currentPhase.completionPercentage : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dual Readiness Scores (2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Internship Readiness Card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award size={16} className="text-cyan-400" />
                  Internship Readiness
                </h4>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                  Target: Feb 2027
                </span>
              </div>

              {/* Progress Circle Visual */}
              <div className="flex items-center space-x-5 py-2">
                <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#06b6d4"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - (readiness?.internshipScore || 0) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-white">
                    {readiness?.internshipScore || 0}%
                  </span>
                </div>
                
                {/* Score breakdown metrics list */}
                <div className="text-xs space-y-1.5 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>DSA solved: <strong>{readiness?.breakdown?.dsaCompletionPercent || 0}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Projects: <strong>{readiness?.breakdown?.githubProjects || 0}/4 completed</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Resume: <strong>{readiness?.breakdown?.hasResumeV1 ? 'v1 Uploaded' : 'Pending'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Info size={12} /> Key skills: DSA, React, SQL, Node
              </span>
            </div>
          </div>

          {/* Placement Readiness Card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-purple-400" />
                  Placement Readiness
                </h4>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                  Target: Nov 2027
                </span>
              </div>

              {/* Progress Circle Visual */}
              <div className="flex items-center space-x-5 py-2">
                <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#a855f7"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - (readiness?.placementScore || 0) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-white">
                    {readiness?.placementScore || 0}%
                  </span>
                </div>
                
                {/* Score breakdown metrics list */}
                <div className="text-xs space-y-1.5 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>OS, CN, OOPs depth checked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Aptitude accuracy: <strong>{readiness?.breakdown?.avgAptAccuracy || 0}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    <span>Resume v2/v3: <strong>{readiness?.breakdown?.hasResumeV3 ? 'v3 complete' : readiness?.breakdown?.hasResumeV2 ? 'v2 complete' : 'v1 only'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Info size={12} /> Adds core OS, Networks, OOPs & Aptitude depth
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Middle row: Today's Checklist & GitHub Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Today's Checklist Summary */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <CheckSquare className="text-cyan-400" size={20} />
                Today's Parallel Track Tasks
              </h3>
              <span className="text-xs text-gray-400 font-bold">
                {completedToday}/{totalToday} Completed
              </span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${checklistPercent}%` }}
              />
            </div>

            {/* Micro list of today's topics */}
            <div className="space-y-2 mt-2 max-h-[140px] overflow-y-auto">
              {todayTasks.length > 0 ? (
                todayTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      t.completed
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400/90'
                        : 'bg-white/5 border-white/5 text-gray-300'
                    }`}
                  >
                    <span>{t.title}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 font-bold border border-white/5 uppercase">
                      {t.category}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 italic">
                  All done! Make sure roadmap has seeded tasks for today.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end">
            <Link to="/daily" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group">
              Open Daily Tracker
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* GitHub Stats Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Github className="text-purple-400" size={20} />
                GitHub Portfolio Tracker
              </h3>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles size={12} /> Auto Sync Active
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-xl font-black text-white">
                  {user?.githubStats?.repos || 0}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Repositories
                </span>
              </div>

              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-xl font-black text-white">
                  {user?.githubStats?.contributions || 0}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Contributions
                </span>
              </div>

              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-xl font-black text-white">
                  {user?.githubStats?.streak || 0}d
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Active Streak
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
              <span>Primary Projects Count (scaled to 4):</span>
              <strong className="text-white">{user?.githubStats?.projectsCount || 0}/4 Complete</strong>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end">
            <Link to="/settings" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group">
              Configure Github Link
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics chart: Weekly study hours */}
      {analytics?.studyLogs && (
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Clock className="text-cyan-400" size={20} />
              Daily Study Hours (Last 30 Days)
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" /> Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" /> Target</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.studyLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
