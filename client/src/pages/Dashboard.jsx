import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  Flame,
  Github,
  Clock,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  AlertCircle,
  PlusCircle,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import XPBar from '../components/XPBar';
import TypewriterText from '../components/TypewriterText';

// ── ATTENDANCE OVERVIEW CARD
const AttendanceOverviewCard = ({ summary }) => {
  if (!summary) return null;

  const { overallPercentage = 0, status = 'SAFE', bestSubject = 'N/A', lowestSubject = 'N/A', bufferMessage = '' } = summary;

  const statusColors = {
    SAFE: 'text-green-400 bg-green-500/10 border-green-500/20',
    WARNING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    DANGER: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const ringColors = {
    SAFE: '#22C55E', // green
    WARNING: '#F59E0B', // yellow
    DANGER: '#EF4444', // red
  };

  const statusColor = statusColors[status] || statusColors.SAFE;
  const ringColor = ringColors[status] || ringColors.SAFE;

  // Circular progress math
  const size = 90;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-[80px]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Attendance Overview
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase tracking-wider ${statusColor}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center space-x-6 py-2">
          {/* Ring */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ringColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-sm font-mono font-black text-white">{Math.round(overallPercentage)}%</span>
              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Overall</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Target Attendance</span>
            <span className="text-sm font-black text-white">76%</span>
            <p className="text-[10px] text-slate-300 font-mono mt-2 font-semibold leading-relaxed">{bufferMessage}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Best Subject</span>
            <span className="text-white font-semibold block truncate mt-0.5">{bestSubject}</span>
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Lowest Subject</span>
            <span className="text-white font-semibold block truncate mt-0.5">{lowestSubject}</span>
          </div>
        </div>
      </div>

      <Link
        to="/attendance"
        className="cyber-btn mt-6 w-full py-2.5 text-xs text-cyber-cyan border border-cyber-cyan/20 bg-cyber-cyan/5 hover:bg-cyber-cyan/10 font-semibold text-center block relative z-10"
      >
        OPEN ATTENDANCE PANEL
      </Link>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentPhase, setCurrentPhase] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [streak, setStreak] = useState(null);
  const [todayChecklist, setTodayChecklist] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action States
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyHours, setStudyHours] = useState('');
  const [submittingHours, setSubmittingHours] = useState(false);
  const [studyMessage, setStudyMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [phaseRes, attendanceRes, streakRes, todayRes, analyticsRes] = await Promise.all([
        apiRequest('/phases/current'),
        apiRequest('/attendance/summary'),
        apiRequest('/daily/streak'),
        apiRequest('/daily/today'),
        apiRequest('/analytics')
      ]);

      if (phaseRes.success) setCurrentPhase(phaseRes.phase);
      if (attendanceRes.success) setAttendanceSummary(attendanceRes.summary);
      if (streakRes.success) setStreak(streakRes.streak);
      if (todayRes.success) setTodayChecklist(todayRes.progress);
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

  const handleToggleDailyTask = async (itemKey) => {
    try {
      const data = await apiRequest('/daily/toggle', {
        method: 'POST',
        body: { itemKey },
      });
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to toggle daily task:', err);
    }
  };

  const handleLogStudySession = async (e) => {
    e.preventDefault();
    if (!studyHours) return;
    setSubmittingHours(true);
    setStudyMessage('');
    try {
      const data = await apiRequest('/analytics/study-hours', {
        method: 'POST',
        body: { studyHours: Number(studyHours) }
      });
      if (data.success) {
        setStudyMessage('Hours logged successfully!');
        setStudyHours('');
        fetchDashboardData();
        setTimeout(() => {
          setShowStudyModal(false);
          setStudyMessage('');
        }, 1200);
      }
    } catch (err) {
      setStudyMessage(err.message || 'Failed to log hours');
    } finally {
      setSubmittingHours(false);
    }
  };

  const triggerAddTask = () => {
    window.dispatchEvent(new CustomEvent('openAddTaskModal'));
  };

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

  // Dynamically compute target registration days (Target: Feb 1, 2027)
  const getDaysRemaining = () => {
    const target = new Date('2027-02-01');
    const today = new Date();
    const diff = target - today;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  const daysRemaining = getDaysRemaining();

  // Dynamically compute estimated study duration
  const getEstimatedTime = () => {
    let mins = 0;
    todayTasks.forEach(t => {
      if (t.completed) return; // Only count pending tasks
      if (t.key === 'dsa') mins += 90;
      else if (t.key === 'dev') mins += 120;
      else if (t.key === 'english') mins += 30;
      else if (t.key === 'aptitude') mins += 60;
      else mins += 45;
    });
    if (mins === 0) return '0h';
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── HEADER NAVIGATION & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black font-display text-white tracking-wide">
            WELCOME BACK, <span className="text-cyber-cyan">{user?.name}</span>!
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Target Readiness: <strong className="text-cyber-cyan">Feb 1, 2027</strong> • {daysRemaining} Days remaining
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerAddTask}
            className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-cyber-cyan bg-white/5 hover:bg-cyber-cyan/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={14} className="text-cyber-cyan" /> Add Task
          </button>
          <button
            onClick={() => navigate('/resources')}
            className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-cyber-cyan bg-white/5 hover:bg-cyber-cyan/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen size={14} className="text-cyber-cyan" /> Add Resource
          </button>
          <button
            onClick={() => setShowStudyModal(true)}
            className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-cyber-cyan bg-white/5 hover:bg-cyber-cyan/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Activity size={14} className="text-cyber-cyan" /> Log Study Session
          </button>
        </div>
      </div>

      {/* ── MAIN GRID: COMMAND CENTER & READY MULTIPLIER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dominant Command Center Card */}
        <div className="lg:col-span-2">
          <div className="bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">COMMAND CENTER</span>
                  <h2 className="text-lg font-bold text-white uppercase mt-0.5 font-display tracking-wider">
                    {currentPhase?.name || 'ROADMAP INITIATION'}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">ESTIMATED TIME TODAY</span>
                  <span className="text-sm font-mono font-bold text-cyber-cyan">{getEstimatedTime()}</span>
                </div>
              </div>

              {/* Dynamic Focus Milestone Header */}
              <div className="flex items-center gap-2 mb-6">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/20 uppercase tracking-wide">
                  Month {Number(currentPhase?.monthIndex || 0) + 1} Focus
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentPhase?.primarySkill || 'Initial Curriculum Baseline'}
                </span>
              </div>

              {/* Today's Checklist Priorities */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">TODAY'S PRIORITIES</h4>
                
                {todayTasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {todayTasks.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleDailyTask(t.key)}
                        className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          t.completed
                            ? 'bg-cyber-cyan/5 border-cyber-cyan/20 text-slate-400'
                            : 'bg-black/20 border-white/5 hover:border-cyber-cyan/35 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {t.completed ? (
                            <CheckCircle2 size={16} className="text-cyber-cyan flex-shrink-0" />
                          ) : (
                            <Circle size={16} className="text-slate-500 hover:text-cyber-cyan flex-shrink-0" />
                          )}
                          <span className={`text-xs font-medium truncate ${t.completed ? 'line-through text-slate-500' : ''}`}>
                            {t.title}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-slate-400">
                          {t.category}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 italic border border-dashed border-white/5 rounded-lg bg-black/10">
                    No tasks scheduled
                  </div>
                )}
              </div>
            </div>

            {/* Current month progress bar */}
            <div className="mt-8 pt-4 border-t border-white/5">
              <XPBar
                label="CURRENT MONTH MILESTONE PROGRESS"
                current={Math.round(currentPhase?.completionPercentage || 0)}
                max={100}
                color="#22D3EE"
              />
            </div>
          </div>
        </div>

        {/* Attendance overview card */}
        <div className="lg:col-span-1">
          <AttendanceOverviewCard summary={attendanceSummary} />
        </div>

      </div>

      {/* ── ROW 2: RECOMMENDATIONS & SECONDARY METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Recommended Task Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Next Recommended Task
              </div>
              <div className="space-y-3.5">
                <div className="p-3.5 bg-cyber-cyan/5 border border-cyber-cyan/10 rounded-lg">
                  <span className="text-[9px] text-cyber-cyan uppercase tracking-wider font-bold block mb-1 font-mono">Active Target</span>
                  <span className="text-sm font-semibold text-white block">Complete: React Hooks</span>
                  <span className="text-xs text-slate-400 mt-1 block">Learn State sharing and Lifecycle triggers</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-400 bg-black/25 p-3 rounded-lg border border-white/5">
                  <span>ESTIMATED DURATION:</span>
                  <strong className="text-white">45 min</strong>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-400 bg-black/25 p-3 rounded-lg border border-white/5">
                  <span>PRIORITY:</span>
                  <strong className="text-cyber-purple uppercase">High</strong>
                </div>
              </div>
            </div>
            <button className="cyber-btn mt-6 w-full py-2.5 text-xs font-semibold">
              START TASK
            </button>
          </div>
        </div>

        {/* Streak Widget Card */}
        <div className="lg:col-span-1 bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between h-full">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Daily Streak status
            </div>
            <div className="p-5 rounded-lg bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/20 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <Flame size={20} className="fill-cyber-yellow/25 animate-pulse" />
                <div>
                  <span className="block text-xl font-mono font-bold text-white">{streak?.currentStreak || 0} DAYS</span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Current Streak</span>
                </div>
              </div>
              <span className="text-sm px-2 py-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-cyber-yellow font-bold font-mono">
                LEVEL READY
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-4 font-semibold leading-relaxed uppercase tracking-wider text-center">
            maintain streak to build momentum
          </p>
        </div>

        {/* Tasks Completed overview Card */}
        <div className="lg:col-span-1 bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between h-full">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Task Checklist Completeness
            </div>
            <div className="p-5 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <CheckCircle2 size={20} className="text-cyber-purple" />
                <div>
                  <span className="block text-xl font-mono font-bold text-white">
                    {completedToday} / {totalToday}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Completed Today</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-cyber-purple">{checklistPercent}%</span>
                <div className="w-16 bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-cyber-purple h-full" style={{ width: `${checklistPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-4 font-semibold leading-relaxed uppercase tracking-wider text-center">
            complete today's priorities checklist
          </p>
        </div>

      </div>

      {/* ── ROW 3: STUDY HOUR CHART */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Study Logs Area Chart */}
        <div className="w-full">
          <div className="bg-[#151B26] border border-white/5 rounded-xl p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                <Clock className="text-cyber-cyan" size={16} />
                STUDY RADAR (LAST 30 DAYS)
              </h3>
              <div className="flex items-center gap-4 text-[9px] font-mono font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-cyber-cyan rounded-full" /> Actual</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-cyber-purple rounded-full" /> Target</span>
              </div>
            </div>

            {!analytics?.studyLogs || analytics.studyLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-44 text-slate-500 italic text-xs border border-dashed border-white/5 rounded-xl bg-black/10">
                Start tracking your progress
              </div>
            ) : (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.studyLogs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#4B5563" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                    <YAxis stroke="#4B5563" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                    />
                    <Area type="monotone" dataKey="actual" stroke="#22D3EE" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                    <Area type="monotone" dataKey="target" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorTarget)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Log Study Session Modal Overlay */}
      {showStudyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/5 bg-[#151B26] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Log Study Session</h3>
              <button
                onClick={() => setShowStudyModal(false)}
                className="text-slate-500 hover:text-white p-1 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            
            {studyMessage && (
              <div className="mb-3 p-2.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan text-xs font-mono">
                {studyMessage}
              </div>
            )}

            <form onSubmit={handleLogStudySession} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Actual Hours Trained Today
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min="0.5"
                  max="24"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="w-full px-3 py-2 rounded-lg border border-white/5 bg-black/30 text-white font-mono text-sm focus:outline-none focus:border-cyber-cyan"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudyModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-white/5 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHours}
                  className="cyber-btn py-2 px-4 text-xs font-semibold"
                >
                  {submittingHours ? 'Logging...' : 'Log Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
