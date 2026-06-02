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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
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
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500">
          <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Total Questions Practiced
          </span>
          <span className="text-3xl font-black text-white mt-1 block">
            {totalAttempted} Qs
          </span>
        </div>

        {/* Accuracy summaries */}
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500">
          <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Average Aptitude Accuracy
          </span>
          <span className="text-3xl font-black text-white mt-1 block">
            {avgAccuracy}%
          </span>
        </div>

        {/* Practice Session logger */}
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-indigo-500">
          <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Skills Mastered (&gt;80% Accuracy)
          </span>
          <span className="text-3xl font-black text-white mt-1 block">
            {topics.filter(t => t.accuracy >= 80).length} / {topics.length}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Update stats form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <BrainCircuit size={18} className="text-amber-500" />
              Log Practice Session
            </h3>

            {message && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} /> <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Select Topic
                </label>
                <select
                  value={activeTopicId}
                  onChange={(e) => handleTopicSelect(e.target.value)}
                  className="w-full glass-input bg-[#0A0F1D] text-xs text-white"
                >
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.topicName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Questions Attempted
                </label>
                <input
                  type="number"
                  name="attempted"
                  required
                  value={formData.attempted}
                  onChange={handleInputChange}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Accuracy Percentage (%)
                </label>
                <input
                  type="number"
                  name="accuracy"
                  required
                  max={100}
                  value={formData.accuracy}
                  onChange={handleInputChange}
                  className="w-full glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Updating...' : 'Update Topic Results'}
              </button>
            </form>
          </div>
        </div>

        {/* Topics grid list */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic) => {
            const isProficient = topic.accuracy >= 80;
            return (
              <div
                key={topic._id}
                onClick={() => handleTopicSelect(topic._id)}
                className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border cursor-pointer hover:border-amber-500/20 transition-all ${
                  activeTopicId === topic._id ? 'ring-2 ring-amber-500/40 border-amber-500/30' : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-white">{topic.topicName}</h4>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                    isProficient
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/5 text-gray-500 border border-white/5'
                  }`}>
                    {isProficient ? 'Proficient ⭐️' : 'Needs Practice'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Attempted</span>
                    <span className="font-bold text-white mt-0.5 block">{topic.attempted} Qs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Accuracy</span>
                    <span className={`font-bold mt-0.5 block ${isProficient ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {topic.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-gray-500 mt-4 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>Last practiced:</span>
                  <span>
                    {topic.lastPracticed
                      ? new Date(topic.lastPracticed).toLocaleDateString()
                      : 'Never'}
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
