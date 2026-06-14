import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import {
  Flame,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  GraduationCap,
  Clock,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
      <div className="flex flex-col items-center justify-center min-h-[70vh] font-mono text-xs text-blue-500 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        <span className="animate-pulse tracking-widest uppercase">Booting Command Center...</span>
      </div>
    );
  }

  // Calculate current week and day relative to start date
  const todayDate = new Date();
  const ROADMAP_START_DATE = new Date('2026-06-15');
  const diffTime = todayDate - ROADMAP_START_DATE;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentGlobalWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
  const roadmapDay = Math.max(1, Math.min(504, diffDays + 1));

  const expectedProgress = readiness?.metrics?.expectedProgressPercent || 0;
  const actualProgress = readiness?.metrics?.actualProgressPercent || 0;
  const gap = expectedProgress - actualProgress;

  // Split tasks by categories to render nicely
  const devTask = tasks.find(t => t.category === 'Technical Skill');
  const dsaTask = tasks.find(t => t.category === 'DSA');
  const aptTask = tasks.find(t => t.category === 'Aptitude');
  const ipTask = tasks.find(t => t.category === 'IP Skill');
  const engTask = tasks.find(t => t.category === 'English Speaking');

  const progressCategories = [
    { name: 'Development Progress', key: 'developmentPct', color: 'text-blue-400' },
    { name: 'DSA Progress', key: 'dsaPct', color: 'text-purple-400' },
    { name: 'Aptitude Progress', key: 'aptPct', color: 'text-yellow-400' },
    { name: 'IP Skills Progress', key: 'ipSkillsPct', color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── HEADER STATUS BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-white tracking-wide uppercase">
            TODAY'S COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Student: <span className="text-blue-500 font-bold">Tiru Naidu</span> • Roadmap Start: <span className="text-white font-semibold">15 June 2026</span>
          </p>
        </div>
      </div>

      {errorText && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{errorText}</span>
        </div>
      )}

      {/* ── TOP SECTION: CORE SYSTEM METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        
        {/* 1. Streak */}
        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Streak</span>
          <div className="flex items-center space-x-1.5 mt-2">
            <Flame size={16} className="text-yellow-500 fill-yellow-500/10" />
            <span className="text-sm font-bold text-white font-mono">{streak?.currentStreak || 0} Days</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block uppercase">Max: {streak?.longestStreak || 0}</span>
        </div>

        {/* 2. Timeline */}
        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Roadmap Day</span>
          <div className="mt-2 text-sm font-bold text-white font-mono">
            Day {roadmapDay} <span className="text-[10px] text-slate-500 font-normal">/ 504</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block uppercase">Est. Completion: Nov 2027</span>
        </div>

        {/* 3. Current Phase */}
        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Current Phase</span>
          <div className="mt-2 text-sm font-bold text-white truncate font-display">
            {activePhase ? activePhase.name.replace('Phase ', '') : 'Foundation'}
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block uppercase truncate">{activePhase?.monthName || 'June 2026'}</span>
        </div>

        {/* 4. Current Week */}
        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Current Week</span>
          <div className="mt-2 text-sm font-bold text-white font-mono">
            Week {currentGlobalWeek} <span className="text-[10px] text-slate-500 font-normal">/ 70</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block uppercase">Timeline active</span>
        </div>

        {/* 5. Attendance */}
        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Attendance</span>
          <div className="mt-2 text-sm font-bold text-blue-400 font-mono">
            {attendance ? `${Math.round(attendance.overallPercentage)}%` : '0%'}
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-2 block uppercase">Min Target: 75%</span>
        </div>

      </div>

      {/* ── TODAY TARGETS (Roadmap subtopics execution) */}
      <div className="bg-[#1E293B] border border-white/5 rounded-xl p-6 relative overflow-hidden shadow-md">
        
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-6">
          <div>
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Today's Roadmap Execution Checklist
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Checkbox inputs update roadmap progress automatically
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wider">
            Daily Progress: {progress?.completionPercentage || 0}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.length === 0 ? (
            <div className="col-span-full text-center text-xs font-mono text-slate-500 py-6">
              No tasks generated for today.
            </div>
          ) : (
            tasks.map(task => {
              const displayCategoryMap = {
                'Technical Skill': 'Development',
                'DSA': 'DSA',
                'Aptitude': 'Aptitude',
                'IP Skill': 'IP Skills',
                'English Speaking': 'English'
              };
              const displayCategoryName = displayCategoryMap[task.category] || task.category;
              
              return (
                <div
                  key={task._id}
                  onClick={() => handleTaskToggle(task._id)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-blue-500/5 border-blue-500/10 text-slate-500'
                      : 'bg-slate-900/50 border-white/5 hover:border-blue-500/30 text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {task.completed ? (
                      <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-slate-500 hover:text-blue-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
                        {displayCategoryName}
                      </span>
                      <span className={`text-xs font-semibold block mt-0.5 truncate ${task.completed ? 'line-through' : ''}`}>
                        {task.title.includes(': ') ? task.title.split(': ')[1] : task.title}
                      </span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-slate-950 border border-white/5 text-slate-500 rounded uppercase">
                    {task.estimatedMinutes}m
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* College & Holiday toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-4 mt-6 border-t border-white/5 text-xs font-mono text-slate-400">
          <div
            onClick={() => handleAttendanceToggle('wentToCollege')}
            className="flex items-center space-x-2.5 cursor-pointer select-none hover:text-white"
          >
            <div className={`w-4.5 h-4.5 border rounded flex items-center justify-center transition-all ${
              progress?.wentToCollege ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700'
            }`}>
              {progress?.wentToCollege && '✓'}
            </div>
            <span>Went to College</span>
          </div>

          <div
            onClick={() => handleAttendanceToggle('isHoliday')}
            className="flex items-center space-x-2.5 cursor-pointer select-none hover:text-white"
          >
            <div className={`w-4.5 h-4.5 border rounded flex items-center justify-center transition-all ${
              progress?.isHoliday ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-slate-700'
            }`}>
              {progress?.isHoliday && '✓'}
            </div>
            <span>College Holiday (Bypasses Target Score Requirements)</span>
          </div>
        </div>

      </div>

      {/* ── LOWER SECTION: ANALYTICS & GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* A. PROGRESS METRICS (Expected, Actual, Gap) */}
        <div className="lg:col-span-1 bg-[#1E293B] border border-white/5 rounded-xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider pb-3 border-b border-white/5 mb-4">
              Execution Progress Metrics
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 text-center">
                <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Expected</span>
                <span className="text-base font-bold text-white font-mono block mt-1">{expectedProgress}%</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 text-center">
                <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Actual</span>
                <span className="text-base font-bold text-green-400 font-mono block mt-1">{actualProgress}%</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 text-center">
                <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Gap</span>
                <span className={`text-base font-bold font-mono block mt-1 ${gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {gap > 0 ? `-${gap}%` : `+${Math.abs(gap)}%`}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {progressCategories.map((c) => {
                const val = readiness?.metrics?.[c.key] || 0;
                return (
                  <div key={c.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-semibold">
                      <span className="text-slate-400">{c.name}</span>
                      <span className={c.color}>{val}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.key === 'developmentPct' ? 'bg-blue-500' :
                          c.key === 'dsaPct' ? 'bg-purple-500' :
                          c.key === 'aptPct' ? 'bg-yellow-500' : 'bg-pink-500'
                        }`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 mt-6 pt-3 border-t border-white/5 leading-relaxed">
            Readiness scores map Phase targets, DSA subtopics, and Aptitude completions.
          </div>
        </div>

        {/* B. 30 DAY COMPLETION GRAPH */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-white/5 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="text-blue-400" size={15} />
                30-Day Completion Radar (Score %)
              </h3>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                Daily Execution Log
              </span>
            </div>

            {history.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500 italic text-xs border border-dashed border-white/5 rounded-xl bg-black/10">
                No historical completion entries logged yet.
              </div>
            ) : (
              <div className="h-48 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="date" stroke="#4B5563" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                    <YAxis stroke="#4B5563" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                      itemStyle={{ color: '#3B82F6', fontFamily: 'var(--font-mono)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completion"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0F172A', stroke: '#3B82F6', strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
