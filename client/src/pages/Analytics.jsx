import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  Clock,
  Plus,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Hours logger states
  const [studyHours, setStudyHours] = useState('');
  const [targetHours, setTargetHours] = useState('6');
  const [submittingHours, setSubmittingHours] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await apiRequest('/analytics');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleLogHoursSubmit = async (e) => {
    e.preventDefault();
    setSubmittingHours(true);
    setMessage('');

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const res = await apiRequest('/analytics/study-hours', {
        method: 'POST',
        body: {
          date: todayStr,
          studyHours: Number(studyHours),
          targetHours: Number(targetHours),
        },
      });

      if (res.success) {
        setMessage('Today\'s study hours logged successfully!');
        setStudyHours('');
        await fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to log study hours:', err);
    } finally {
      setSubmittingHours(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Logger Widget row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick statistics header */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Study Target Metric
            </span>
            <h2 className="text-2xl font-black text-white">Daily Target: 6 Hours</h2>
            <p className="text-xs text-gray-400 mt-1">Recommended baseline study duration for B.Tech placement readiness.</p>
          </div>
          <div className="text-[10px] text-cyan-400 font-extrabold uppercase mt-6 flex items-center gap-1">
            <Sparkles size={12} /> Auto calculated stats below
          </div>
        </div>

        {/* Study Hours log form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[80px]" />
          
          <div className="space-y-3.5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Clock className="text-cyan-400" size={16} />
              Log Study Hours for Today
            </h3>

            {message && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} /> <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleLogHoursSubmit} className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="flex-1">
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0"
                  max="24"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  placeholder="Actual study hours (e.g. 5.5)"
                  className="w-full glass-input text-xs py-2"
                />
              </div>

              <div className="flex-1">
                <input
                  type="number"
                  required
                  step="1"
                  min="1"
                  max="24"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  placeholder="Target hours (default 6)"
                  className="w-full glass-input text-xs py-2"
                />
              </div>

              <button
                type="submit"
                disabled={submittingHours}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/15"
              >
                <Plus size={14} /> Log Hours
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Weekly Task completion (Bar) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <BarChart3 size={16} className="text-cyan-400" />
            Weekly Task Completion (Last 8 Weeks)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="completed" name="Completed Tasks" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="Total Tasks" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Progress Trend (Line) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            18-Month Cumulative Completion Trend (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="percentage" name="Completion Rate (%)" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Skill Areas Radar */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Award size={16} className="text-purple-400" />
            Topic Category Competency Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="80%" data={data?.radarData || []}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="Completion Rate" dataKey="percentage" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Study Hours Log (Area) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" />
            Actual vs Target Study Hours (30 Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.studyLogs || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="actual" name="Logged Hours" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorActual2)" />
                <Area type="monotone" dataKey="target" name="Target Hours" stroke="#475569" strokeDasharray="3 3" strokeWidth={1} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
