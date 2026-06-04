import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';

const AttendanceDashboard = ({ semester }) => {
  const [summary, setSummary] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, subjectsRes] = await Promise.all([
        apiRequest('/attendance/summary'),
        apiRequest('/attendance/subjects')
      ]);

      if (summaryRes.success) setSummary(summaryRes.summary);
      if (subjectsRes.success) setSubjects(subjectsRes.subjects);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [semester]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  const { overallPercentage = 0, status = 'SAFE', bestSubject = 'N/A', lowestSubject = 'N/A', bufferMessage = '', totalPeriods = 0, presentPeriods = 0 } = summary || {};

  const statusColors = {
    SAFE: 'text-green-400 bg-green-500/10 border-green-500/20',
    WARNING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    DANGER: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const statusColor = statusColors[status] || statusColors.SAFE;

  // Ring gauge calculations
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  const getSubjectPercent = (sub) => {
    return sub.totalPeriods > 0 ? (sub.presentPeriods / sub.totalPeriods) * 100 : 100;
  };

  // Subject target advice helper
  const getSubjectBufferMessage = (sub) => {
    const p = sub.presentPeriods;
    const t = sub.totalPeriods;
    if (t === 0) return 'No attendance logged yet.';
    const pct = (p / t) * 100;
    if (pct >= 76) {
      const maxMissable = Math.floor((p * 100 - 76 * t) / 76);
      return maxMissable > 0
        ? `You can miss ${maxMissable} class${maxMissable > 1 ? 'es' : ''}`
        : 'Do not miss any more classes.';
    } else {
      const minNeeded = Math.ceil((76 * t - 100 * p) / 24);
      return `Attend ${minNeeded} consecutive class${minNeeded > 1 ? 'es' : ''} to reach 76%`;
    }
  };

  const getCardBorderColor = (pct) => {
    if (pct >= 85) return 'border-green-500/20 hover:border-green-500/35';
    if (pct >= 76) return 'border-cyan-500/20 hover:border-cyan-500/35';
    return 'border-red-500/20 hover:border-red-500/35';
  };

  const getCardDotColor = (pct) => {
    if (pct >= 85) return 'bg-green-500';
    if (pct >= 76) return 'bg-cyan-400';
    return 'bg-red-500';
  };

  const getCardTextColor = (pct) => {
    if (pct >= 85) return 'text-green-400';
    if (pct >= 76) return 'text-cyan-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      
      {/* ── METRICS SUMMARY HEADER HERO CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Circle dial card */}
        <div className="lg:col-span-1 bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-[80px]" />
          
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Overall Status
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${statusColor}`}>
              {status}
            </span>
          </div>

          <div className="relative my-4" style={{ width: size, height: size }}>
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
                stroke={status === 'SAFE' ? '#22C55E' : (status === 'WARNING' ? '#F59E0B' : '#EF4444')}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-2xl font-mono font-black text-white">{Math.round(overallPercentage)}%</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Attendance</span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-4">
            {presentPeriods} / {totalPeriods} periods attended
          </span>
        </div>

        {/* Dynamic calculation card */}
        <div className="lg:col-span-2 bg-[#151B26] border border-white/5 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-purple/5 rounded-full blur-[80px]" />
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Real-Time Calculator
              </span>
              <span className="text-[10px] font-mono text-slate-400">Target limit: 76%</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3.5 bg-black/25 p-4 rounded-lg border border-white/5">
                <TrendingUp className="text-cyber-cyan mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Action Advice</span>
                  <span className="text-sm font-semibold text-white mt-1 block">{bufferMessage}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Best Performer</span>
                  <span className="text-xs font-semibold text-green-400 block mt-1 truncate">{bestSubject}</span>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Lowest Performer</span>
                  <span className="text-xs font-semibold text-red-400 block mt-1 truncate">{lowestSubject}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-6 pt-2 border-t border-white/5 text-center sm:text-left">
            Calculations sync instantly across day entries & quick counters
          </div>
        </div>

      </div>

      {/* ── SUBJECT-WISE CARDS GRID */}
      <div>
        <h3 className="font-display font-black text-xs text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/5">
          Subject Details
        </h3>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => {
              const pct = getSubjectPercent(sub);
              const cardBorder = getCardBorderColor(pct);
              const dotColor = getCardDotColor(pct);
              const textColor = getCardTextColor(pct);
              const advice = getSubjectBufferMessage(sub);

              return (
                <div key={sub._id} className={`bg-[#151B26] border rounded-xl p-5 flex flex-col justify-between h-44 transition-all duration-200 ${cardBorder}`}>
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-display font-extrabold text-sm text-white truncate max-w-[170px] uppercase">
                        {sub.name}
                      </h4>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className={`text-xs font-mono font-bold ${textColor}`}>
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </div>

                    <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">
                      {sub.presentPeriods} / {sub.totalPeriods} classes attended
                    </span>
                  </div>

                  <div className="bg-black/25 p-3 rounded-lg border border-white/5 mt-4 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400 uppercase tracking-wider">Advice</span>
                    <span className="text-white font-semibold truncate max-w-[160px]">{advice}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-xs text-slate-500 italic border border-dashed border-white/5 rounded-lg bg-black/10 flex flex-col items-center justify-center space-y-2">
            <AlertCircle size={20} className="text-slate-600 animate-bounce" />
            <span>No subjects configured for this semester. Go to Subjects tab to get started.</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default AttendanceDashboard;
