import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  MessageSquareText,
  Plus,
  BookOpen,
  Volume2,
  FileText,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CyberButton from '../components/CyberButton';

const English = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'vocabulary',
    count: 1,
  });
  const [logging, setLogging] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/english');
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch English stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLogging(true);
    setMessage('');

    const payload = {
      vocabularyCount: form.type === 'vocabulary' ? form.count : 0,
      speakingSessions: form.type === 'speaking' ? form.count : 0,
      readingSessions: form.type === 'reading' ? form.count : 0,
      writingSessions: form.type === 'writing' ? form.count : 0,
    };

    try {
      const data = await apiRequest('/english', {
        method: 'POST',
        body: payload,
      });

      if (data.success) {
        setMessage('Practice session logged successfully!');
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#a855f7', '#ec4899'],
        });
        
        // Reset form
        setForm((prev) => ({ ...prev, count: 1 }));
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to log English practice:', err);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="w-48 bg-slate-950 border border-cyber-cyan/30 h-2 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 bg-cyber-cyan animate-pulse" style={{ width: '45%' }} />
        </div>
        <span className="animate-pulse tracking-widest uppercase">TUNING COMMUNICATIONS TRANSCRIPT...</span>
      </div>
    );
  }

  const totals = stats?.totals || { vocabulary: 0, speaking: 0, reading: 0, writing: 0 };
  const targets = stats?.targets || { vocabulary: 100, speaking: 15, reading: 15, writing: 15 };

  const getPercent = (value, target) => {
    return Math.min(100, Math.round((value / target) * 100));
  };

  const skillCards = [
    {
      title: 'Vocabulary Bank',
      value: totals.vocabulary,
      target: targets.vocabulary,
      unit: 'Words logged',
      icon: Bookmark,
      color: 'text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/20',
      progressColor: 'bg-cyber-cyan',
    },
    {
      title: 'Speaking Sessions',
      value: totals.speaking,
      target: targets.speaking,
      unit: 'Standup sessions',
      icon: Volume2,
      color: 'text-cyber-purple bg-cyber-purple/10 border-cyber-purple/20',
      progressColor: 'bg-cyber-purple',
    },
    {
      title: 'Reading Sessions',
      value: totals.reading,
      target: targets.reading,
      unit: 'Technical reports',
      icon: BookOpen,
      color: 'text-cyber-pink bg-cyber-pink/10 border-cyber-pink/20',
      progressColor: 'bg-cyber-pink',
    },
    {
      title: 'Writing Sessions',
      value: totals.writing,
      target: targets.writing,
      unit: 'Documentation/Logs',
      icon: FileText,
      color: 'text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/20',
      progressColor: 'bg-cyber-yellow',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Practice Logging Form */}
        <div className="lg:col-span-1 cyber-card p-6 border border-cyber-purple/20 bg-black/45 shadow-[0_0_15px_rgba(123,97,255,0.03)] flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 mb-2 uppercase">
              <MessageSquareText size={16} className="text-cyber-purple" />
              Log Practice Session
            </h3>

            {message && (
              <div className="p-2.5 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 size={13} /> <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
                  Activity Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full glass-input text-xs font-mono"
                >
                  <option value="vocabulary">Vocabulary (Word Log)</option>
                  <option value="speaking">Speaking (elevator pitch / daily updates)</option>
                  <option value="reading">Reading (technical papers / docs)</option>
                  <option value="writing">Writing (bug logs / readmes)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
                  Increment Count
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.count}
                  onChange={(e) => setForm((prev) => ({ ...prev, count: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <CyberButton
                type="submit"
                disabled={logging}
                variant="purple"
                className="w-full py-2.5 text-xs font-bold"
              >
                <Plus size={13} className="inline mr-1" />
                <span>{logging ? 'Saving...' : 'Add Practice Log'}</span>
              </CyberButton>
            </form>
          </div>
        </div>

        {/* Skill Cards Display (2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skillCards.map((card, idx) => {
            const percent = getPercent(card.value, card.target);
            return (
              <div key={idx} className="cyber-card p-5 border border-white/5 bg-black/45 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-black text-white uppercase tracking-wider">{card.title}</span>
                    <span className={`p-2 rounded-lg border ${card.color}`}>
                      <card.icon size={15} />
                    </span>
                  </div>
                  
                  <div>
                    <span className="block text-2xl font-display font-black text-white tracking-wide">
                      {card.value}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                      {card.unit} / Target: {card.target}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
                    <span>PROGRESS VECTOR</span>
                    <span className="text-white">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${card.progressColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Recent Practice logs */}
      {stats?.logs && stats.logs.length > 0 && (
        <div className="cyber-card p-5 border border-white/5 bg-black/45">
          <h3 className="font-display font-bold text-white text-xs tracking-wider mb-4 uppercase">
            Recent Practice Logs Transcript
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {stats.logs.map((log, idx) => (
              <div
                key={log._id || idx}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-xs text-slate-300"
              >
                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="text-slate-500 font-medium">&gt;&gt;</span>
                  <span className="font-semibold text-white">
                    {log.vocabularyCount > 0 && `Vocabulary (+${log.vocabularyCount})`}
                    {log.speakingSessions > 0 && `Speaking (+${log.speakingSessions})`}
                    {log.readingSessions > 0 && `Reading (+${log.readingSessions})`}
                    {log.writingSessions > 0 && `Writing (+${log.writingSessions})`}
                  </span>
                  <span className="text-slate-600">LOG_CONFIRMED</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  {new Date(log.createdAt || log.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default English;
