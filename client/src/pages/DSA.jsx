import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Code2, CheckCircle2, Circle, Save, ChevronDown, ChevronUp, Star, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import XPBar from '../components/XPBar';

const DSA = () => {
  const [topics, setTopics] = useState([]);
  const [overallStats, setOverallStats] = useState({ total: 0, completed: 0, percent: 0 });
  const [loading, setLoading] = useState(true);

  // Accordion collapsed state: { topicId: boolean }
  const [expandedTopics, setExpandedTopics] = useState({});

  // Local editing states: { topicId: { subtopicId: { questionsSolved, revisionCount, notes } } }
  const [editSubStates, setEditSubStates] = useState({});

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

        // Initialize local edit states
        const initialSubStates = {};
        data.topics.forEach(topic => {
          initialSubStates[topic._id] = {};
          (topic.subtopics || []).forEach(sub => {
            initialSubStates[topic._id][sub._id] = {
              questionsSolved: sub.questionsSolved || 0,
              revisionCount: sub.revisionCount || 0,
              notes: sub.notes || ''
            };
          });
        });
        setEditSubStates(initialSubStates);
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

  const handleSubChange = (topicId, subtopicId, field, value) => {
    setEditSubStates(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [subtopicId]: {
          ...prev[topicId][subtopicId],
          [field]: value
        }
      }
    }));
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
            particleCount: 40,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#3B82F6', '#8B5CF6']
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle DSA subtopic status:', err);
    }
  };

  const handleSaveSubtopic = async (topicId, subtopicId) => {
    const subState = editSubStates[topicId]?.[subtopicId];
    if (!subState) return;

    try {
      const data = await apiRequest(`/dsa/topics/${topicId}`, {
        method: 'PUT',
        body: {
          subtopicId,
          questionsSolved: Number(subState.questionsSolved),
          revisionCount: Number(subState.revisionCount),
          subNotes: subState.notes
        }
      });
      if (data.success) {
        await fetchDSATopics();
      }
    } catch (err) {
      console.error('Failed to save subtopic properties:', err);
    }
  };

  const handleStepQuestionsSolved = async (topicId, subtopicId, currentVal, increment) => {
    const newVal = Math.max(0, currentVal + increment);
    handleSubChange(topicId, subtopicId, 'questionsSolved', newVal);

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
      console.error('Failed to step questions solved:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-cyan" />
      </div>
    );
  }

  // Calculate sum of all manually entered solved questions
  let totalManualSolved = 0;
  topics.forEach(t => {
    (t.subtopics || []).forEach(s => {
      totalManualSolved += (s.questionsSolved || 0);
    });
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── TOP HIGHLIGHT PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Card */}
        <div className="lg:col-span-1 bg-surface border border-white/5 rounded-xl p-5 flex flex-col justify-between border-l-4 border-l-cyber-cyan">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
              DSA Syllabus completion
            </span>
            <h2 className="text-3xl font-display font-black text-white leading-none">
              {overallStats.completed} <span className="text-xs font-mono font-semibold text-slate-400">/ {overallStats.total} Subtopics Completed</span>
            </h2>
          </div>

          <div className="space-y-2 mt-6">
            <XPBar
              label="DSA TRACKER PROGRESS"
              current={overallStats.percent}
              max={100}
              color="#3B82F6"
            />
          </div>
        </div>

        {/* Stats Gauge Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-surface border border-white/5 rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">
              Total Solved Questions
            </span>
            <div className="text-4xl font-mono font-black text-cyber-cyan mt-4">
              {totalManualSolved}
            </div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase mt-2">
              Sum of manual solves across subtopics
            </span>
          </div>

          <div className="bg-surface border border-white/5 rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">
              Total DSA Topics
            </span>
            <div className="text-4xl font-mono font-black text-white mt-4">
              {topics.length}
            </div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase mt-2">
              Standard Striver A2Z categories
            </span>
          </div>
        </div>

      </div>

      {/* ── SYLLABUS LIST (ACCORDION STYLE LAYOUT) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            Striver A2Z DSA Curriculum
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Click topic headers to expand subtopics
          </span>
        </div>

        {topics.map((topic) => {
          const isExpanded = !!expandedTopics[topic._id];
          
          return (
            <div
              key={topic._id}
              className="bg-surface border border-white/5 rounded-xl overflow-hidden transition-all duration-200"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleTopicExpand(topic._id)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {topic.isCompleted ? (
                    <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Code2 size={18} className="text-cyber-cyan flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-black font-display text-white uppercase tracking-wider block">
                      {topic.topicName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block mt-0.5">
                      Progress: {topic.progress}% ({topic.subtopics.filter(s => s.isCompleted).length} / {topic.subtopics.length} Done)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-mono font-bold bg-[#0F172A] px-2.5 py-1 rounded border border-white/5 text-slate-400 uppercase">
                    Solved: {topic.subtopics.reduce((acc, sub) => acc + (sub.questionsSolved || 0), 0)} Qs
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </div>

              {/* Accordion Content Panel */}
              {isExpanded && (
                <div className="border-t border-white/5 bg-black/10 divide-y divide-white/5 p-4 space-y-4">
                  {topic.subtopics && topic.subtopics.length > 0 ? (
                    topic.subtopics.map((sub) => {
                      const editState = editSubStates[topic._id]?.[sub._id] || { questionsSolved: 0, revisionCount: 0, notes: '' };
                      
                      return (
                        <div
                          key={sub._id}
                          className="py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4 first:pt-0 last:pb-0"
                        >
                          {/* Checkbox & Subtopic Name */}
                          <div className="flex items-center space-x-3 min-w-0 lg:max-w-xs">
                            <button
                              onClick={() => handleToggleSubtopic(topic._id, sub._id, sub.isCompleted)}
                              className="text-slate-500 hover:text-cyber-cyan cursor-pointer flex-shrink-0"
                            >
                              {sub.isCompleted ? (
                                <CheckCircle2 size={17} className="text-green-500 fill-green-500/10" />
                              ) : (
                                <Circle size={17} className="hover:text-cyber-cyan" />
                              )}
                            </button>
                            <span className={`text-xs font-bold font-mono tracking-wide truncate ${sub.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                              {sub.name}
                            </span>
                          </div>

                          {/* Controls Panel */}
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                            
                            {/* Questions Solved Counter with + and - */}
                            <div className="flex items-center space-x-2 bg-slate-950 border border-white/5 px-2.5 py-1 rounded-lg">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Solved:</span>
                              <button
                                onClick={() => handleStepQuestionsSolved(topic._id, sub._id, sub.questionsSolved, -1)}
                                className="p-0.5 hover:text-cyber-cyan hover:bg-white/5 rounded cursor-pointer"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="text-white font-bold font-mono w-6 text-center text-xs">
                                {editState.questionsSolved}
                              </span>
                              <button
                                onClick={() => handleStepQuestionsSolved(topic._id, sub._id, sub.questionsSolved, 1)}
                                className="p-0.5 hover:text-cyber-cyan hover:bg-white/5 rounded cursor-pointer"
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            {/* Revisions Tracker */}
                            <div className="flex items-center space-x-2 bg-slate-950 border border-white/5 px-2.5 py-1 rounded-lg">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Revs:</span>
                              <span className="text-white font-bold font-mono w-4 text-center text-xs">{editState.revisionCount}</span>
                              <button
                                onClick={() => handleSubChange(topic._id, sub._id, 'revisionCount', Number(editState.revisionCount) + 1)}
                                className="p-0.5 hover:text-cyber-cyan hover:bg-white/5 rounded cursor-pointer"
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            {/* Brief Notes */}
                            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                              <input
                                type="text"
                                placeholder="Optimization notes (e.g. O(N) space, two-pointers...)"
                                value={editState.notes}
                                onChange={(e) => handleSubChange(topic._id, sub._id, 'notes', e.target.value)}
                                className="flex-1 min-w-[150px] px-2.5 py-1 rounded-lg border border-white/5 bg-slate-950 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-cyber-cyan"
                              />
                              <button
                                onClick={() => handleSaveSubtopic(topic._id, sub._id)}
                                className="p-1.5 bg-white/5 hover:bg-cyber-cyan/10 hover:text-cyber-cyan rounded-lg border border-white/5 hover:border-cyber-cyan/20 cursor-pointer transition-all"
                                title="Save Subtopic Settings"
                              >
                                <Save size={12} />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-500 italic text-xs font-mono">
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
