import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  BrainCircuit,
  Award,
  CheckCircle,
  Plus,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CyberButton from '../components/CyberButton';

const Aptitude = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopicId, setActiveTopicId] = useState('');
  const [formData, setFormData] = useState({
    attempted: 0,
    accuracy: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAptitudeTopics = async () => {
    try {
      const data = await apiRequest('/aptitude');
      if (data.success) {
        setTopics(data.topics);
        if (data.topics.length > 0 && !activeTopicId) {
          setActiveTopicId(data.topics[0]._id);
          setFormData({
            attempted: data.topics[0].attempted,
            accuracy: data.topics[0].accuracy,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load Aptitude topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAptitudeTopics();
  }, []);

  const handleTopicSelect = (topicId) => {
    setActiveTopicId(topicId);
    const selected = topics.find((t) => t._id === topicId);
    if (selected) {
      setFormData({
        attempted: selected.attempted,
        accuracy: selected.accuracy,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeTopicId) return;

    setSubmitting(true);
    setMessage('');

    try {
      const data = await apiRequest(`/aptitude/${activeTopicId}`, {
        method: 'PUT',
        body: {
          attempted: formData.attempted,
          accuracy: Math.min(100, formData.accuracy),
        },
      });

      if (data.success && data.topic) {
        setMessage('Aptitude practice results logged successfully!');
        
        // Update topics local state
        setTopics((prev) =>
          prev.map((t) => (t._id === activeTopicId ? data.topic : t))
        );

        if (formData.accuracy >= 80) {
          confetti({
            particleCount: 50,
            spread: 40,
            origin: { y: 0.8 },
            colors: ['#f59e0b', '#10b981'],
          });
        }
      }
    } catch (err) {
      console.error('Failed to update Aptitude topic stats:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="w-48 bg-slate-950 border border-cyber-cyan/30 h-2 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 bg-cyber-cyan animate-pulse" style={{ width: '70%' }} />
        </div>
        <span className="animate-pulse tracking-widest uppercase">TUNING LOGIC CORES...</span>
      </div>
    );
  }

  // Aggregate stats
  const totalAttempted = topics.reduce((acc, t) => acc + t.attempted, 0);
  const totalAccuracySum = topics.reduce((acc, t) => acc + t.accuracy, 0);
  const avgAccuracy = topics.length > 0 ? Math.round(totalAccuracySum / topics.length) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Top Aggregated Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Practice log summary */}
        <div className="cyber-card p-6 border-l-4 border-l-cyber-yellow bg-black/45 shadow-[0_0_15px_rgba(250,204,21,0.03)]">
          <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">
            Total Questions Practiced
          </span>
          <span className="text-2xl font-display font-black text-white mt-1 block">
            {totalAttempted} Qs
          </span>
        </div>

        {/* Accuracy summaries */}
        <div className="cyber-card p-6 border-l-4 border-l-cyber-cyan bg-black/45 shadow-[0_0_15px_rgba(0,245,212,0.03)]">
          <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">
            Average Aptitude Accuracy
          </span>
          <span className="text-2xl font-display font-black text-white mt-1 block">
            {avgAccuracy}%
          </span>
        </div>

        {/* Practice Session logger */}
        <div className="cyber-card p-6 border-l-4 border-l-cyber-purple bg-black/45 shadow-[0_0_15px_rgba(123,97,255,0.03)]">
          <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">
            Modules Mastered (&gt;80% Accuracy)
          </span>
          <span className="text-2xl font-display font-black text-white mt-1 block">
            {topics.filter(t => t.accuracy >= 80).length} / {topics.length}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Update stats form */}
        <div className="lg:col-span-1 cyber-card p-6 border border-cyber-yellow/20 bg-black/45 flex flex-col justify-between shadow-[0_0_15px_rgba(250,204,21,0.03)]">
          <div className="space-y-4">
            <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 mb-2 uppercase">
              <BrainCircuit size={16} className="text-cyber-yellow animate-pulse" />
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
                  Select Topic
                </label>
                <select
                  value={activeTopicId}
                  onChange={(e) => handleTopicSelect(e.target.value)}
                  className="w-full glass-input text-xs font-mono"
                >
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.topicName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
                  Questions Attempted
                </label>
                <input
                  type="number"
                  name="attempted"
                  required
                  value={formData.attempted}
                  onChange={handleInputChange}
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
                  Accuracy Percentage (%)
                </label>
                <input
                  type="number"
                  name="accuracy"
                  required
                  max={100}
                  value={formData.accuracy}
                  onChange={handleInputChange}
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <CyberButton
                type="submit"
                disabled={submitting}
                variant="yellow"
                className="w-full py-2.5 text-xs font-bold"
              >
                {submitting ? 'Updating...' : 'Update Topic Results'}
              </CyberButton>
            </form>
          </div>
        </div>

        {/* Topics grid list */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic) => {
            const isProficient = topic.accuracy >= 80;
            const isActive = activeTopicId === topic._id;
            return (
              <div
                key={topic._id}
                onClick={() => handleTopicSelect(topic._id)}
                className={`cyber-card p-5 bg-black/45 flex flex-col justify-between cursor-pointer border hover:border-cyber-yellow/40 transition-all duration-200 ${
                  isActive 
                    ? 'border-cyber-yellow/40 shadow-[0_0_15px_rgba(250,204,21,0.08)] bg-cyber-yellow/[0.01]' 
                    : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-xs text-white tracking-wide uppercase truncate mr-2">
                    {topic.topicName}
                  </h4>
                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 ${
                    isProficient
                      ? 'bg-cyber-cyan/5 text-cyber-cyan border-cyber-cyan/20'
                      : 'bg-white/5 text-slate-500 border-white/5'
                  }`}>
                    {isProficient ? 'READY ⭐️' : 'PRACTICE'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">Attempted</span>
                    <span className="font-bold text-white mt-0.5 block">{topic.attempted} Qs</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">Accuracy</span>
                    <span className={`font-bold mt-0.5 block ${isProficient ? 'text-cyber-cyan' : 'text-slate-300'}`}>
                      {topic.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="text-[8px] font-mono text-slate-600 mt-4 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>LAST PRACTICE:</span>
                  <span className="uppercase">
                    {topic.lastPracticed
                      ? new Date(topic.lastPracticed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'NEVER'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Aptitude;
