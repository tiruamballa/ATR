import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Code2, CheckCircle2, Circle, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import XPBar from '../components/XPBar';

const DSA = () => {
  const [topics, setTopics] = useState([]);
  const [overallStats, setOverallStats] = useState({ total: 0, completed: 0, percent: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});

  const fetchDSATopics = async () => {
    try {
      const data = await apiRequest('/dsa/topics');
      if (data.success) {
        setTopics(data.topics);
        setOverallStats({
          total: data.overall.total,
          completed: data.overall.completed,
          percent: data.overall.percent
        });
      }
    } catch (err) {
      console.error('Failed to load DSA topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDSATopics();
  }, []);

  const toggleTopicExpand = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleToggleParentTopic = async (topicId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const data = await apiRequest(`/dsa/topics/${topicId}`, {
        method: 'PUT',
        body: {
          isCompleted: nextStatus
        }
      });
      if (data.success) {
        await fetchDSATopics();
        if (nextStatus) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#3B82F6', '#8B5CF6']
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle parent DSA topic:', err);
    }
  };

  const handleToggleSubtopic = async (topicId, subtopicId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const data = await apiRequest(`/dsa/topics/${topicId}`, {
        method: 'PUT',
        body: {
          subtopicId,
          subCompleted: nextStatus
        }
      });
      if (data.success) {
        await fetchDSATopics();
        if (data.topic.isCompleted && !currentStatus) {
          confetti({
            particleCount: 30,
            spread: 40,
            origin: { y: 0.8 },
            colors: ['#3B82F6', '#8B5CF6']
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle DSA subtopic:', err);
    }
  };

  const handleStepParentQuestions = async (topicId, currentVal, increment) => {
    const newVal = Math.max(0, currentVal + increment);
    try {
      const data = await apiRequest(`/dsa/topics/${topicId}`, {
        method: 'PUT',
        body: {
          questionsSolved: newVal
        }
      });
      if (data.success) {
        await fetchDSATopics();
      }
    } catch (err) {
      console.error('Failed to update parent questions solved:', err);
    }
  };

  const handleStepSubtopicQuestions = async (topicId, subtopicId, currentVal, increment) => {
    const newVal = Math.max(0, currentVal + increment);
    try {
      const data = await apiRequest(`/dsa/topics/${topicId}`, {
        method: 'PUT',
        body: {
          subtopicId,
          questionsSolved: newVal
        }
      });
      if (data.success) {
        await fetchDSATopics();
      }
    } catch (err) {
      console.error('Failed to update subtopic questions solved:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Calculate overall stats
  let totalSolvedCount = 0;
  topics.forEach(t => {
    totalSolvedCount += (t.questionsSolved || 0);
    (t.subtopics || []).forEach(s => {
      totalSolvedCount += (s.questionsSolved || 0);
    });
  });

  const remainingSubtopics = overallStats.total - overallStats.completed;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 py-3 select-none">
      
      {/* ── TOP STATS BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">Overall Progress</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{overallStats.percent}%</div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block uppercase">{overallStats.completed} / {overallStats.total} subtopics done</span>
        </div>

        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">Solved Count</span>
          <div className="text-xl font-bold text-blue-400 font-mono mt-1">{totalSolvedCount}</div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block uppercase">Total Questions Logged</span>
        </div>

        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">Remaining Subtopics</span>
          <div className="text-xl font-bold text-yellow-500 font-mono mt-1">{remainingSubtopics}</div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block uppercase">Subtopics to Complete</span>
        </div>

        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">DSA Curriculum</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{topics.length}</div>
          <span className="text-[9px] text-slate-500 font-mono mt-1.5 block uppercase">Accordion Sections</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            DSA Topic List
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Click headers to expand subtopics
          </span>
        </div>

        {/* ── ACCORDION LIST */}
        {topics.map((topic) => {
          const isExpanded = !!expandedTopics[topic._id];
          
          return (
            <div
              key={topic._id}
              className="bg-[#1E293B] border border-white/5 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Accordion Header */}
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/10 hover:bg-slate-900/20 transition-colors">
                <div
                  onClick={() => toggleTopicExpand(topic._id)}
                  className="flex items-center space-x-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleParentTopic(topic._id, topic.isCompleted);
                    }}
                    className="text-slate-500 hover:text-blue-500 flex-shrink-0 cursor-pointer"
                  >
                    {topic.isCompleted ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : (
                      <Circle size={18} className="hover:text-blue-500" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <span className="text-xs font-bold font-display text-white uppercase tracking-wider block">
                      {topic.topicName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block mt-0.5">
                      Progress: {topic.progress}% ({topic.subtopics.filter(s => s.isCompleted).length} / {topic.subtopics.length} Done)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  {/* Topic level Questions Done counter */}
                  <div className="flex items-center space-x-2 bg-slate-950/60 border border-white/5 px-2.5 py-1 rounded-lg text-xs font-mono">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Topic Qs:</span>
                    <button
                      onClick={() => handleStepParentQuestions(topic._id, topic.questionsSolved || 0, -1)}
                      className="p-0.5 hover:text-blue-400 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-white font-bold font-mono w-6 text-center text-xs">
                      {topic.questionsSolved || 0}
                    </span>
                    <button
                      onClick={() => handleStepParentQuestions(topic._id, topic.questionsSolved || 0, 1)}
                      className="p-0.5 hover:text-blue-400 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleTopicExpand(topic._id)}
                    className="text-slate-500 p-1 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Accordion Content Panel */}
              {isExpanded && (
                <div className="border-t border-white/5 bg-slate-950/20 divide-y divide-white/5 px-5 py-3">
                  {topic.subtopics && topic.subtopics.length > 0 ? (
                    topic.subtopics.map((sub) => (
                      <div
                        key={sub._id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-1"
                      >
                        {/* Subtopic name and Checkbox */}
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <button
                            onClick={() => handleToggleSubtopic(topic._id, sub._id, sub.isCompleted)}
                            className="text-slate-500 hover:text-blue-500 cursor-pointer flex-shrink-0"
                          >
                            {sub.isCompleted ? (
                              <CheckCircle2 size={16} className="text-green-500 fill-green-500/5" />
                            ) : (
                              <Circle size={16} className="hover:text-blue-500" />
                            )}
                          </button>
                          <span className={`text-[11px] font-mono tracking-wide truncate ${sub.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {sub.name}
                          </span>
                        </div>

                        {/* Subtopic Questions counter */}
                        <div className="flex items-center space-x-2 bg-slate-950/60 border border-white/5 px-2.5 py-1 rounded-lg text-xs font-mono w-fit">
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Solved:</span>
                          <button
                            onClick={() => handleStepSubtopicQuestions(topic._id, sub._id, sub.questionsSolved || 0, -1)}
                            className="p-0.5 hover:text-blue-400 hover:bg-white/5 rounded cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-white font-bold font-mono w-6 text-center text-xs">
                            {sub.questionsSolved || 0}
                          </span>
                          <button
                            onClick={() => handleStepSubtopicQuestions(topic._id, sub._id, sub.questionsSolved || 0, 1)}
                            className="p-0.5 hover:text-blue-400 hover:bg-white/5 rounded cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-500 italic text-xs font-mono">
                      No subtopics loaded for this category.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default DSA;
