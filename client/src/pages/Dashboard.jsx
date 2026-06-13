import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import {
  Flame,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  GraduationCap,
  Clock,
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import XPBar from '../components/XPBar';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [streak, setStreak] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [activePhase, setActivePhase] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [errorText, setErrorText] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [todayRes, readinessRes, attendanceRes, historyRes, phaseRes] = await Promise.all([
        apiRequest('/daily/today'),
        apiRequest('/profile/readiness'),
        apiRequest('/attendance/summary'),
        apiRequest('/daily/history'),
        apiRequest('/phases/current')
      ]);

      if (todayRes.success) {
        setProgress(todayRes.progress);
        setStreak(todayRes.streak);
        setTasks(todayRes.tasks || []);
      }
      if (readinessRes.success) {
        setReadiness(readinessRes);
      }
      if (attendanceRes.success) {
        setAttendance(attendanceRes.summary);
      }
      if (historyRes.success) {
        setHistory(historyRes.history);
      }
      if (phaseRes.success) {
        setActivePhase(phaseRes.phase);
      }
    } catch (err) {
      console.error('Failed to load Today\'s Command Center metrics:', err);
      setErrorText('Error syncing local execution targets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAttendanceToggle = async (field) => {
    try {
      const data = await apiRequest('/daily/toggle', {
        method: 'POST',
        body: { field }
      });
      if (data.success) {
        setProgress(data.progress);
        setStreak(data.streak);
        setTasks(data.tasks || []);
        
        // Refresh readiness metrics and completion history
        const [readinessRes, historyRes] = await Promise.all([
          apiRequest('/profile/readiness'),
          apiRequest('/daily/history')
        ]);
        if (readinessRes.success) setReadiness(readinessRes);
        if (historyRes.success) setHistory(historyRes.history);
      }
    } catch (err) {
      console.error('Failed to update attendance toggle:', err);
    }
  };

  const handleTaskToggle = async (taskId) => {
    try {
      const data = await apiRequest(`/daily/tasks/${taskId}/toggle`, {
        method: 'POST'
      });
      if (data.success) {
        setProgress(data.progress);
        setStreak(data.streak);
        setTasks(data.tasks || []);
        
        // Refresh readiness metrics and completion history
        const [readinessRes, historyRes] = await Promise.all([
          apiRequest('/profile/readiness'),
          apiRequest('/daily/history')
        ]);
        if (readinessRes.success) setReadiness(readinessRes);
        if (historyRes.success) setHistory(historyRes.history);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-cyan" />
        <span className="animate-pulse tracking-widest uppercase">Booting Career Execution System...</span>
      </div>
    );
  }

  // Calculate current week and day relative to start date
  const todayDate = new Date();
  const ROADMAP_START_DATE = new Date('2026-06-15');
  const diffTime = todayDate - ROADMAP_START_DATE;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentGlobalWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
  const currentDayOfWeek = Math.max(1, (diffDays % 7) + 1);
  const roadmapDay = readiness?.metrics?.roadmapDay || Math.max(1, Math.min(505, diffDays + 1));

  const expectedProgress = readiness?.metrics?.expectedProgressPercent || 0;
  const actualProgress = readiness?.metrics?.actualProgressPercent || 0;
  const gap = expectedProgress - actualProgress;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── HEADER STATUS BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black font-display text-white tracking-wide uppercase">
            TODAY'S COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Student: <span className="text-cyber-cyan font-bold">Tiru Naidu</span> • Roadmap Start: <span className="text-white">15 June 2026</span>
          </p>
        </div>
        
        {/* Quick Goal Check */}
        <div className="flex items-center gap-3 text-xs bg-slate-950 border border-white/5 px-4 py-2.5 rounded-xl font-mono">
          <Target size={14} className="text-cyber-cyan animate-pulse" />
          <span className="text-slate-400">Internship placement drive is active. Keep executing daily targets!</span>
        </div>
      </div>

      {errorText && (
        <div className="p-3 rounded-lg bg-cyber-red/10 border border-cyber-red/20 text-cyber-red text-xs font-mono flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{errorText}</span>
        </div>
      )}

      {/* ── TOP SECTION: CORE SYSTEM METRICS GAUGE */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        
        {/* 1. Streak */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Streak</span>
          <div className="flex items-center space-x-1.5 mt-2.5">
            <Flame size={15} className="text-cyber-yellow fill-cyber-yellow/15 animate-pulse" />
            <span className="text-xs font-black text-white font-mono">{streak?.currentStreak || 0} Days</span>
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase">Max: {streak?.longestStreak || 0}</span>
        </div>

        {/* 2. Timeline */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Week Focus</span>
          <div className="mt-2.5 text-xs font-black text-white font-mono">
            W{currentGlobalWeek} • D{currentDayOfWeek}
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase">Of 70 Weeks</span>
        </div>

        {/* 3. DSA Progress */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">DSA Progress</span>
          <div className="mt-2.5 text-xs font-black text-cyber-cyan font-mono">
            {readiness?.metrics?.dsaPct || 0}%
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase truncate">{readiness?.metrics?.solvedDsa || 0} Subtopics Done</span>
        </div>

        {/* 4. Aptitude Progress */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Aptitude</span>
          <div className="mt-2.5 text-xs font-black text-cyber-purple font-mono">
            {readiness?.metrics?.aptPct || 0}%
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase truncate">{readiness?.metrics?.completedApt || 0} Topics Done</span>
        </div>

        {/* 5. Development Progress */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Dev Progress</span>
          <div className="mt-2.5 text-xs font-black text-white font-mono">
            {readiness?.metrics?.roadmapPct || 0}%
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase truncate">{readiness?.metrics?.completedRoadmapTopics || 0} Topics Done</span>
        </div>

        {/* 6. Attendance */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Attendance</span>
          <div className="mt-2.5 text-xs font-black text-cyber-cyan font-mono">
            {attendance ? `${Math.round(attendance.overallPercentage)}%` : '0%'}
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase">Goal: {readiness?.targets?.attendanceTarget || 75}%</span>
        </div>

        {/* 7. Expected Progress */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Expected</span>
          <div className="mt-2.5 text-xs font-black text-slate-400 font-mono">
            {expectedProgress}%
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase">Linear timeline</span>
        </div>

        {/* 8. Actual Progress */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Actual</span>
          <div className="mt-2.5 text-xs font-black text-green-400 font-mono">
            {actualProgress}%
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase">Weighted score</span>
        </div>

        {/* 9. Gap Remaining */}
        <div className="bg-surface border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-white/10 transition-all">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Gap</span>
          <div className="flex items-center space-x-1 mt-2.5">
            {gap > 0 ? (
              <span className="text-xs font-mono font-black text-cyber-red flex items-center">
                <TrendingDown size={12} className="mr-0.5" />{gap}%
              </span>
            ) : (
              <span className="text-xs font-mono font-black text-green-400 flex items-center">
                <TrendingUp size={12} className="mr-0.5" />{Math.abs(gap)}%
              </span>
            )}
          </div>
          <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase truncate">
            {gap > 0 ? 'Behind' : 'Ahead'}
          </span>
        </div>

      </div>

      {/* ── CORE SECTION: TODAY TARGETS & SMART TRACKING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* A. TODAY TARGETS (Checkbox based scorecard) */}
        <div className="lg:col-span-2 bg-[#151B26] border border-white/5 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-[80px]" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-display font-black text-white text-xs tracking-wider uppercase">
                Daily Targets Checklist
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyber-cyan/15 border border-cyber-cyan/35 text-cyber-cyan uppercase tracking-wider">
                Daily Completion: {progress?.completionPercentage || 0}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.length === 0 ? (
                <div className="col-span-2 text-center text-xs font-mono text-slate-500 py-6">
                  No execution tasks generated for today.
                </div>
              ) : (
                tasks.map(task => {
                  const weights = {
                    'Study Hours': '15%',
                    'DSA': '20%',
                    'Aptitude': '20%',
                    'IP Skill': '20%',
                    'Technical Skill': '15%',
                    'English Speaking': '10%'
                  };
                  const weight = weights[task.category] || '0%';
                  
                  return (
                    <div
                      key={task._id}
                      onClick={() => handleTaskToggle(task._id)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        task.completed
                          ? 'bg-cyber-cyan/5 border-cyber-cyan/20 text-slate-400'
                          : 'bg-black/25 border-white/5 hover:border-cyber-cyan/35 text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {task.completed ? (
                          <CheckCircle2 size={18} className="text-cyber-cyan flex-shrink-0" />
                        ) : (
                          <Circle size={18} className="text-slate-500 hover:text-cyber-cyan flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{task.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono capitalize">
                            Category: {task.category} • {task.estimatedMinutes} Mins
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-900 border border-white/5 text-slate-400 rounded flex-shrink-0">
                        {weight}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* College & Holiday toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/5 text-xs font-mono">
              <div
                onClick={() => handleAttendanceToggle('wentToCollege')}
                className="flex items-center space-x-2 cursor-pointer select-none"
              >
                {progress?.wentToCollege ? (
                  <div className="w-4 h-4 border border-cyber-cyan bg-cyber-cyan/10 rounded flex items-center justify-center text-cyber-cyan text-[10px]">✓</div>
                ) : (
                  <div className="w-4 h-4 border border-slate-600 rounded hover:border-cyber-cyan" />
                )}
                <span className="text-slate-300">Went to College</span>
              </div>

              <div
                onClick={() => handleAttendanceToggle('isHoliday')}
                className="flex items-center space-x-2 cursor-pointer select-none"
              >
                {progress?.isHoliday ? (
                  <div className="w-4 h-4 border border-cyber-yellow bg-cyber-yellow/10 rounded flex items-center justify-center text-cyber-yellow text-[10px]">✓</div>
                ) : (
                  <div className="w-4 h-4 border border-slate-600 rounded hover:border-cyber-yellow" />
                )}
                <span className="text-slate-300">College Holiday (Bypasses Target Score Requirements)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/5">
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">TODAY'S TECHNICAL FOCUS</span>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs flex items-center space-x-3">
              <BookOpen size={15} className="text-cyber-purple" />
              <span className="text-slate-200 font-semibold">
                {tasks.find(t => t.category === 'Technical Skill')?.title || 'Review active modules'}
              </span>
            </div>
          </div>
        </div>

        {/* B. SMART TRACKING (Days remaining & Readiness status) */}
        <div className="lg:col-span-1 bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Smart Readiness Engine
              </span>
              <span className="text-[9px] font-mono text-slate-400">V4 Algorithms</span>
            </div>

            <div className="space-y-4">
              
              {/* Internship Goal */}
              <div className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-cyber-cyan" />
                    Internship Goal
                  </span>
                  <span className="font-mono text-slate-400 font-bold">{readiness?.metrics?.daysToInternship || 0} Days left</span>
                </div>
                <XPBar
                  label="INTERNSHIP READY METRIC"
                  current={readiness?.metrics?.internshipReadiness || 0}
                  max={100}
                  color="#22D3EE"
                />
              </div>

              {/* Placement Goal */}
              <div className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Target size={14} className="text-cyber-purple" />
                    Placement Target
                  </span>
                  <span className="font-mono text-slate-400 font-bold">{readiness?.metrics?.daysToPlacement || 0} Days left</span>
                </div>
                <XPBar
                  label="PLACEMENT READY METRIC"
                  current={readiness?.metrics?.placementReadiness || 0}
                  max={100}
                  color="#8B5CF6"
                />
              </div>

            </div>
          </div>

          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-6 pt-2 border-t border-white/5 leading-relaxed">
            Readiness scores are mapped dynamically based on phase milestones, DSA question solves, and aptitude topics completions.
          </div>
        </div>

      </div>

      {/* ── BOTTOM SECTION: 30 DAY COMPLETION GRAPH */}
      <div className="bg-[#151B26] border border-white/5 rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
            <Clock className="text-cyber-cyan" size={16} />
            30-Day Completion Radar (Score %)
          </h3>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            Daily Execution Completeness
          </span>
        </div>

        {history.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-500 italic text-xs border border-dashed border-white/5 rounded-xl bg-black/10">
            No historical completion entries logged yet. Check off items to compile logs.
          </div>
        ) : (
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="date" stroke="#4B5563" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                <YAxis stroke="#4B5563" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                  itemStyle={{ color: '#22D3EE', fontFamily: 'var(--font-mono)' }}
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#111827', stroke: '#22D3EE', strokeWidth: 1.5 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
