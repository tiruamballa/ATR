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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
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
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      progressColor: 'bg-cyan-500',
    },
    {
      title: 'Speaking Sessions',
      value: totals.speaking,
      target: targets.speaking,
      unit: 'Standup sessions',
      icon: Volume2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      progressColor: 'bg-purple-500',
    },
    {
      title: 'Reading Sessions',
      value: totals.reading,
      target: targets.reading,
      unit: 'Technical reports',
      icon: BookOpen,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      progressColor: 'bg-pink-500',
    },
    {
      title: 'Writing Sessions',
      value: totals.writing,
      target: targets.writing,
      unit: 'Documentation/Logs',
      icon: FileText,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      progressColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Practice Logging Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <MessageSquareText size={18} className="text-purple-400" />
              Log Verbal Practice
            </h3>

            {message && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} /> <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Activity Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full glass-input bg-[#0A0F1D] text-xs text-white"
                >
                  <option value="vocabulary">Vocabulary (Word Log)</option>
                  <option value="speaking">Speaking (elevator pitch / daily updates)</option>
                  <option value="reading">Reading (technical papers / docs)</option>
                  <option value="writing">Writing (bug logs / readmes)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Increment Count
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.count}
                  onChange={(e) => setForm((prev) => ({ ...prev, count: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={logging}
                className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <Plus size={14} />
                <span>{logging ? 'Saving...' : 'Add Practice Log'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Skill Cards Display (2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skillCards.map((card, idx) => {
            const percent = getPercent(card.value, card.target);
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{card.title}</span>
                    <span className={`p-2 rounded-lg border ${card.color}`}>
                      <card.icon size={16} />
                    </span>
                  </div>
                  
                  <div>
                    <span className="block text-2xl font-black text-white">
                      {card.value}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {card.unit} / Target: {card.target}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>Target complete</span>
                    <span>{percent}%</span>
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
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-extrabold text-white text-sm mb-4">
            Recent Practice Logs Backlog
          </h3>
          <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
            {stats.logs.map((log, idx) => (
              <div
                key={log._id || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 font-medium">Log #{idx + 1}:</span>
                  <span className="font-semibold text-white">
                    {log.vocabularyCount > 0 && `Vocabulary (+${log.vocabularyCount})`}
                    {log.speakingSessions > 0 && `Speaking (+${log.speakingSessions})`}
                    {log.readingSessions > 0 && `Reading (+${log.readingSessions})`}
                    {log.writingSessions > 0 && `Writing (+${log.writingSessions})`}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">
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
