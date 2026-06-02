import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Code2,
  RefreshCw,
  Award,
  Sparkles,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DSA = () => {
  const [topics, setTopics] = useState([]);
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');

  const fetchDSATracker = async () => {
    try {
      const data = await apiRequest('/dsa');
      if (data.success) {
        setTopics(data.topics);
      }

      // Fetch user settings to show current username
      const userRes = await apiRequest('/auth/me');
      if (userRes.success && userRes.user) {
        setLeetcodeUsername(userRes.user.leetcodeUsername || '');
      }
    } catch (err) {
      console.error('Failed to load DSA data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDSATracker();
  }, []);

  const handleUpdateQuestions = async (topicId, solvedQuestions, targetQuestions) => {
    try {
      const data = await apiRequest(`/dsa/${topicId}`, {
        method: 'PUT',
        body: { solvedQuestions, targetQuestions },
      });
      if (data.success && data.topic) {
        setTopics((prev) =>
          prev.map((t) => (t._id === topicId ? data.topic : t))
        );

        // Celebrate if a topic becomes 100% completed
        if (solvedQuestions >= targetQuestions && targetQuestions > 0) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#06b6d4', '#a855f7', '#10b981'],
          });
        }
      }
    } catch (err) {
      console.error('Failed to update DSA topic progress:', err);
    }
  };

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    setSavingUsername(true);
    setMessage('');
    setErrMessage('');

    try {
      const data = await apiRequest('/profile/leetcode-username', {
        method: 'POST',
        body: { username: leetcodeUsername },
      });
      if (data.success) {
        setMessage('LeetCode username configured successfully!');
      }
    } catch (err) {
      setErrMessage(err.message || 'Failed to update LeetCode username');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleLeetcodeSync = async () => {
    if (!leetcodeUsername) {
      return setErrMessage('Configure a LeetCode username in the field below first.');
    }
    setSyncing(true);
    setMessage('');
    setErrMessage('');

    try {
      const data = await apiRequest('/dsa/sync', { method: 'POST' });
      if (data.success) {
        setTopics(data.topics);
        setMessage(data.message);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      setErrMessage(err.message || 'LeetCode API sync failed. Verify your username.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Aggregate stats
  const totalSolved = topics.reduce((acc, t) => acc + t.solvedQuestions, 0);
  const totalTarget = topics.reduce((acc, t) => acc + t.targetQuestions, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Top Banner and Leetcode Sync Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall DSA summary */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between border-l-4 border-l-cyan-500">
          <div className="space-y-2">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
              Total DSA Progress (Java)
            </span>
            <h2 className="text-3xl font-black text-white leading-none">
              {totalSolved} <span className="text-sm font-semibold text-gray-400">/ {totalTarget} Solved</span>
            </h2>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400">
              <span>Overall Completion</span>
              <span className="text-cyan-400">{overallPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* LeetCode Sync Panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[80px]" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Code2 className="text-cyan-400" size={18} />
                LeetCode Profile Synchronization
              </h3>
              <button
                onClick={handleLeetcodeSync}
                disabled={syncing}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync LeetCode'}
              </button>
            </div>

            {/* Notification messages */}
            {message && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle size={14} /> <span>{message}</span>
              </div>
            )}
            {errMessage && (
              <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs flex items-center gap-1.5">
                <HelpCircle size={14} /> <span>{errMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveUsername} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="Enter LeetCode username..."
                className="flex-1 glass-input py-2 text-xs"
              />
              <button
                type="submit"
                disabled={savingUsername}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                {savingUsername ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* 14 Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => {
          const isDone = topic.solvedQuestions >= topic.targetQuestions && topic.targetQuestions > 0;
          const percent = topic.targetQuestions > 0 ? Math.round((topic.solvedQuestions / topic.targetQuestions) * 100) : 0;
          
          return (
            <div
              key={topic._id}
              className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border transition-all ${
                isDone ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-white truncate max-w-[170px]">{topic.topicName}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-gray-500 border-white/5'
                  }`}>
                    {isDone ? 'Topic Mastered 🏆' : `${percent}% Done`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDone ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Adjust Solved / Target buttons */}
              <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/5 gap-2">
                
                {/* Solved controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() =>
                      handleUpdateQuestions(
                        topic._id,
                        Math.max(0, topic.solvedQuestions - 1),
                        topic.targetQuestions
                      )
                    }
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-white w-8 text-center">
                    {topic.solvedQuestions}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateQuestions(
                        topic._id,
                        topic.solvedQuestions + 1,
                        topic.targetQuestions
                      )
                    }
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                  <span className="text-[9px] text-gray-500 font-bold uppercase">Solved</span>
                </div>

                {/* Target direct input */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] text-gray-500 font-bold uppercase">Target</span>
                  <input
                    type="number"
                    value={topic.targetQuestions}
                    onChange={(e) =>
                      handleUpdateQuestions(
                        topic._id,
                        topic.solvedQuestions,
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="w-12 glass-input py-1 px-1.5 text-center text-xs font-bold bg-[#0A0F1D] text-white"
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DSA;
