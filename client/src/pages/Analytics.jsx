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
import CyberButton from '../components/CyberButton';

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
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="w-48 bg-slate-950 border border-cyber-cyan/30 h-2 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 bg-cyber-cyan animate-pulse" style={{ width: '50%' }} />
        </div>
        <span className="animate-pulse tracking-widest uppercase">SYNCING TACTICAL ANALYTICS DECK...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Logger Widget row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick statistics header */}
        <div className="lg:col-span-1 cyber-card p-6 border-l-4 border-l-cyber-cyan flex flex-col justify-between bg-black/45">
          <div className="space-y-1">
            <span className="block text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest">
              STUDY TARGET METRIC
            </span>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-wide">Daily Target: 6 Hours</h2>
            <p className="text-[11px] text-slate-400 font-body mt-1">Recommended baseline study duration for B.Tech placement readiness.</p>
          </div>
          <div className="text-[10px] text-cyber-cyan font-mono font-extrabold uppercase mt-6 flex items-center gap-1.5 animate-pulse">
            <Sparkles size={12} /> Auto calculated stats below
          </div>
        </div>

        {/* Study Hours log form */}
        <div className="lg:col-span-2 cyber-card p-6 relative overflow-hidden flex flex-col justify-between bg-black/45 border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-[80px]" />
          
          <div className="space-y-3.5">
            <h3 className="font-display font-bold text-white text-xs tracking-wider flex items-center gap-2 uppercase">
              <Clock className="text-cyber-cyan animate-pulse" size={15} />
              Log Study Hours for Today
            </h3>

            {message && (
              <div className="p-2.5 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 size={13} /> <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleLogHoursSubmit} className="flex flex-col sm:flex-row gap-3 pt-1 items-end w-full">
              <div className="flex-1 w-full">
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">
                  Actual Study Hours
                </label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0"
                  max="24"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  placeholder="e.g. 5.5"
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1">
                  Target Hours
                </label>
                <input
                  type="number"
                  required
                  step="1"
                  min="1"
                  max="24"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  placeholder="6"
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <CyberButton
                type="submit"
                variant="cyan"
                disabled={submittingHours}
                className="py-2.5 font-bold text-xs flex items-center justify-center gap-1 flex-shrink-0 w-full sm:w-auto px-6"
              >
                <Plus size={13} /> Log Hours
              </CyberButton>
            </form>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Weekly Task completion (Bar) */}
        <div className="cyber-card p-6 bg-black/45 border border-white/5 space-y-4">
          <h3 className="font-display font-bold text-white text-xs tracking-wider flex items-center gap-2 uppercase">
            <BarChart3 size={15} className="text-cyber-cyan" />
            Weekly Task Completion (Last 8 Weeks)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#475569" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                  itemStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
                <Bar dataKey="completed" name="Completed Tasks" fill="#00F5D4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="total" name="Total Tasks" fill="rgba(255,255,255,0.05)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Progress Trend (Line) */}
        <div className="cyber-card p-6 bg-black/45 border border-white/5 space-y-4">
          <h3 className="font-display font-bold text-white text-xs tracking-wider flex items-center gap-2 uppercase">
            <TrendingUp size={15} className="text-cyber-purple" />
            18-Month Cumulative Completion Trend (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#475569" fontSize={8} tickLine={false} fontFamily="var(--font-mono)" />
                <YAxis stroke="#475569" fontSize={9} domain={[0, 100]} tickLine={false} fontFamily="var(--font-mono)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                  itemStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="percentage" name="Completion Rate (%)" stroke="#7B61FF" strokeWidth={2} dot={{ fill: '#7B61FF', strokeWidth: 1.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Skill Areas Radar */}
        <div className="cyber-card p-6 bg-black/45 border border-white/5 space-y-4 flex flex-col justify-between">
          <h3 className="font-display font-bold text-white text-xs tracking-wider flex items-center gap-2 uppercase">
            <Award size={15} className="text-cyber-purple" />
            Topic Category Competency Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="75%" data={data?.radarData || []}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={9} fontFamily="var(--font-mono)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} fontFamily="var(--font-mono)" />
                <Radar name="Completion Rate" dataKey="percentage" stroke="#00F5D4" fill="#00F5D4" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Study Hours Log (Area) */}
        <div className="cyber-card p-6 bg-black/45 border border-white/5 space-y-4">
          <h3 className="font-display font-bold text-white text-xs tracking-wider flex items-center gap-2 uppercase">
            <Clock size={15} className="text-cyber-yellow" />
            Actual vs Target Study Hours (30 Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.studyLogs || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={8} tickLine={false} fontFamily="var(--font-mono)" />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} fontFamily="var(--font-mono)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                  itemStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="actual" name="Logged Hours" stroke="#FACC15" strokeWidth={2} fillOpacity={1} fill="url(#colorActual2)" />
                <Area type="monotone" dataKey="target" name="Target Hours" stroke="#7B61FF" strokeDasharray="3 3" strokeWidth={1} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
