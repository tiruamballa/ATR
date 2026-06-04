import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Code2,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import TiltCard from '../components/TiltCard';
import CyberButton from '../components/CyberButton';
import XPBar from '../components/XPBar';

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
            particleCount: 100,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#00F5D4', '#7B61FF', '#FACC15'],
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
          colors: ['#00F5D4', '#7B61FF', '#FACC15'],
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  // Aggregate stats
  const totalSolved = topics.reduce((acc, t) => acc + t.solvedQuestions, 0);
  const totalTarget = topics.reduce((acc, t) => acc + t.targetQuestions, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 100) : 0;

  // Determine category color based on index
  const getTopicColor = (index) => {
    if (index < 5) return '#00F5D4'; // Basic -> Cyan
    if (index < 10) return '#7B61FF'; // Intermediate -> Purple
    return '#F472B6'; // Advanced -> Pink
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── TOP STATS AND SYNC CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall progress panel */}
        <div className="lg:col-span-1 cyber-card flex flex-col justify-between border-l-4 border-l-cyber-cyan">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
              Total Skill Progress (Java)
            </span>
            <h2 className="text-3xl font-display font-black text-white leading-none">
              {totalSolved} <span className="text-xs font-mono font-semibold text-slate-400">/ {totalTarget} Solved</span>
            </h2>
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>Overall Skill Tree Sync</span>
              <span className="text-cyber-cyan font-bold">{overallPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-md overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-cyber-cyan to-cyber-purple h-full rounded-md transition-all duration-300"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* LeetCode Sync panel */}
        <div className="lg:col-span-2 cyber-card relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-[80px]" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                <Code2 className="text-cyber-cyan" size={18} />
                SKILL TREE SYNC GATEWAY
              </h3>
              <CyberButton
                onClick={handleLeetcodeSync}
                variant="cyan"
                disabled={syncing}
                className="py-2.5 px-4 text-xs font-mono flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'SYNCING...' : 'SYNC LEETCODE'}
              </CyberButton>
            </div>

            {/* Notification triggers */}
            {message && (
              <div className="p-2.5 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-1.5">
                <CheckCircle size={14} /> <span>{message}</span>
              </div>
            )}
            {errMessage && (
              <div className="p-2.5 rounded-lg bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono flex items-center gap-1.5">
                <HelpCircle size={14} /> <span>{errMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveUsername} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="Enter LeetCode username..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/5 bg-black/45 text-white font-mono text-xs focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_12px_rgba(0,245,212,0.15)] transition-all duration-300"
              />
              <CyberButton
                type="submit"
                variant="cyan"
                disabled={savingUsername}
                className="text-xs py-2.5"
              >
                {savingUsername ? 'SAVING...' : 'SAVE SETTINGS'}
              </CyberButton>
            </form>
          </div>
        </div>

      </div>

      {/* ── 14 TOPICS SKILL TREE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => {
          const isLocked = topic.targetQuestions === 0;
          const isDone = topic.solvedQuestions >= topic.targetQuestions && !isLocked;
          const percent = !isLocked ? Math.round((topic.solvedQuestions / topic.targetQuestions) * 100) : 0;
          
          const topicColor = getTopicColor(index);
          const levelVal = Math.min(7, Math.floor(topic.solvedQuestions / 5));
          const ratingStars = '★'.repeat(levelVal).padEnd(7, '☆');

          // Locked node styling
          if (isLocked) {
            return (
              <div
                key={topic._id}
                className="cyber-card p-5 flex flex-col justify-between h-48 opacity-35 filter grayscale border border-cyber-red/20 cursor-not-allowed select-none bg-black/40"
              >
                <div className="text-center py-2">
                  <div className="text-2xl mb-1.5">🔒</div>
                  <h4 className="font-display font-bold text-xs tracking-wider text-slate-500 uppercase">{topic.topicName}</h4>
                  <div className="font-mono text-[9px] text-cyber-red font-semibold tracking-widest mt-1">LOCKED</div>
                </div>

                {/* Target direct config input */}
                <div className="flex items-center justify-center space-x-2 border-t border-white/5 pt-3 mt-4">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">SET TARGET TO UNLOCK</span>
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
                    className="w-12 py-1 px-1 text-center text-xs font-mono font-bold bg-slate-900 border border-white/10 rounded focus:outline-none focus:border-cyber-cyan text-white cursor-text"
                  />
                </div>
              </div>
            );
          }

          // Unlocked active node styling
          return (
            <TiltCard key={topic._id}>
              <div
                className={`cyber-card p-5 flex flex-col justify-between h-48 transition-all ${
                  isDone ? 'border-cyber-cyan/35 bg-cyber-cyan/5' : ''
                }`}
                style={isDone ? { boxShadow: `0 0 15px rgba(0, 245, 212, 0.05)` } : {}}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display font-extrabold text-sm text-white truncate max-w-[170px] tracking-wide uppercase">
                      {topic.topicName}
                    </h4>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isDone
                        ? 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/20'
                        : 'bg-white/5 text-slate-400 border-white/5'
                    }`}>
                      {isDone ? 'MASTERED 🏆' : `${percent}% Done`}
                    </span>
                  </div>

                  {/* Level rating stars */}
                  <div className="flex space-x-0.5 mb-3 font-mono">
                    {ratingStars.split('').map((char, starIdx) => (
                      <span
                        key={starIdx}
                        style={{ color: char === '★' ? topicColor : '#475569' }}
                        className="text-xs"
                      >
                        {char}
                      </span>
                    ))}
                  </div>

                  {/* Node XP bar */}
                  <div className="w-full bg-slate-900 border border-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, percent)}%`,
                        backgroundColor: isDone ? '#00F5D4' : topicColor,
                        boxShadow: `0 0 8px ${isDone ? '#00F5D4' : topicColor}`
                      }}
                    />
                  </div>
                </div>

                {/* Question increment buttons */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 gap-2">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <button
                      onClick={() =>
                        handleUpdateQuestions(
                          topic._id,
                          Math.max(0, topic.solvedQuestions - 1),
                          topic.targetQuestions
                        )
                      }
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-bold text-white w-7 text-center">
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
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10"
                    >
                      <Plus size={11} />
                    </button>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Solved</span>
                  </div>

                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Target</span>
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
                      className="w-11 py-0.5 text-center text-xs font-bold bg-[#0A0F1D] text-white border border-white/5 rounded focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
};

export default DSA;
