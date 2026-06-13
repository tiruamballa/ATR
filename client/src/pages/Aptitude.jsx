import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { BrainCircuit, CheckCircle2, Circle, Save, ChevronDown, ChevronUp, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import XPBar from '../components/XPBar';

const Aptitude = () => {
  const [groupedTopics, setGroupedTopics] = useState({});
  const [overallStats, setOverallStats] = useState({ total: 0, completed: 0, percent: 0 });
  const [loading, setLoading] = useState(true);

  // Accordion collapsed state: { partName: boolean }
  const [expandedParts, setExpandedParts] = useState({
    'PART 1 Quantitative Aptitude': true,
    'PART 2 Analytical Reasoning': true,
    'PART 3 Grammar & Reading Comprehension': false,
    'PART 4 Vocabulary': false
  });

  // Local editing states: { topicId: { progress, notes } }
  const [editStates, setEditStates] = useState({});
  const [editSubStates, setEditSubStates] = useState({});

  const fetchAptitudeData = async () => {
    try {
      const data = await apiRequest('/aptitude/topics');
      if (data.success) {
        setGroupedTopics(data.grouped);
        setOverallStats(data.overall);

        // Populate local edit states
        const initialStates = {};
        const initialSubStates = {};
        Object.keys(data.grouped).forEach(part => {
          data.grouped[part].forEach(topic => {
            initialStates[topic._id] = {
              progress: topic.progress || 0,
              notes: topic.notes || ''
            };
            initialSubStates[topic._id] = {};
            (topic.subtopics || []).forEach(sub => {
              initialSubStates[topic._id][sub._id] = {
                questionsSolved: sub.questionsSolved || 0,
                accuracyPercent: sub.accuracyPercent || 0,
                revisionCount: sub.revisionCount || 0,
                notes: sub.notes || ''
              };
            });
          });
        });
        setEditStates(initialStates);
        setEditSubStates(initialSubStates);
      }
    } catch (err) {
      console.error('Failed to load Aptitude syllabus details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAptitudeData();
  }, []);

  const togglePart = (part) => {
    setExpandedParts(prev => ({
      ...prev,
      [part]: !prev[part]
    }));
  };

  const handleLocalChange = (topicId, field, value) => {
    setEditStates(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [field]: value
      }
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

  const handleSaveTopic = async (topicId) => {
    const state = editStates[topicId];
    if (!state) return;

    try {
      const data = await apiRequest(`/aptitude/topics/${topicId}`, {
        method: 'PUT',
        body: {
          notes: state.notes
        }
      });
      if (data.success) {
        await fetchAptitudeData();
      }
    } catch (err) {
      console.error('Failed to update aptitude topic notes:', err);
    }
  };

  const handleToggleSubtopic = async (topicId, subtopicId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const data = await apiRequest(`/aptitude/topics/${topicId}`, {
        method: 'PUT',
        body: {
          subtopicId,
          subCompleted: nextStatus
        }
      });
      if (data.success) {
        await fetchAptitudeData();
        
        if (data.topic.isCompleted && !currentStatus) {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#FACC15', '#22D3EE']
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle subtopic status:', err);
    }
  };

  const handleSaveSubtopic = async (topicId, subtopicId) => {
    const subState = editSubStates[topicId]?.[subtopicId];
    if (!subState) return;

    try {
      const data = await apiRequest(`/aptitude/topics/${topicId}`, {
        method: 'PUT',
        body: {
          subtopicId,
          questionsSolved: Number(subState.questionsSolved),
          accuracyPercent: Number(subState.accuracyPercent),
          revisionCount: Number(subState.revisionCount),
          subNotes: subState.notes
        }
      });
      if (data.success) {
        await fetchAptitudeData();
      }
    } catch (err) {
      console.error('Failed to save subtopic properties:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-cyan" />
      </div>
    );
  }

  const parts = [
    'PART 1 Quantitative Aptitude',
    'PART 2 Analytical Reasoning',
    'PART 3 Grammar & Reading Comprehension',
    'PART 4 Vocabulary'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── TOP HIGHLIGHT PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Card */}
        <div className="lg:col-span-1 bg-[#151B26] border border-white/5 rounded-xl p-5 flex flex-col justify-between border-l-4 border-l-cyber-yellow">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
              Aptitude syllabus completion
            </span>
            <h2 className="text-3xl font-display font-black text-white leading-none">
              {overallStats.completed} <span className="text-xs font-mono font-semibold text-slate-400">/ {overallStats.total} Solved</span>
            </h2>
          </div>

          <div className="space-y-2 mt-6">
            <XPBar
              label="APTITUDE PREP TREE %"
              current={overallStats.percent}
              max={100}
              color="#FACC15"
            />
          </div>
        </div>

        {/* Text descriptions */}
        <div className="lg:col-span-2 bg-[#151B26] border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-yellow/5 rounded-full blur-[80px]" />
          <div className="relative z-10 space-y-3">
            <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
              <BrainCircuit className="text-cyber-yellow" size={16} />
              Logical & Quantitative Core Syllabus
            </h3>
            <p className="text-[11px] text-slate-400 font-body leading-relaxed">
              This module tracks topics from standard quantitative, analytical reasoning, corporate grammar, and vocabulary lists. Log study progress percentages, toggle completions, and store key notes for preparation reviews.
            </p>
          </div>
        </div>

      </div>

      {/* ── ACCORDION PART PANELS */}
      <div className="space-y-4">
        {parts.map((partName) => {
          const list = groupedTopics[partName] || [];
          const isExpanded = !!expandedParts[partName];
          
          const partTotal = list.length;
          const partCompleted = list.filter(t => t.isCompleted).length;
          const partPercent = partTotal > 0 ? Math.round((partCompleted / partTotal) * 100) : 0;

          return (
            <div key={partName} className="bg-[#151B26] border border-white/5 rounded-xl overflow-hidden shadow-xl">
              
              {/* Accordion header toggle */}
              <div
                onClick={() => togglePart(partName)}
                className="px-6 py-4.5 bg-white/[0.01] hover:bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer select-none transition-all"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span className="text-cyber-yellow"><BrainCircuit size={16} /></span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate font-display">
                      {partName}
                    </h3>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5 uppercase">
                      {partCompleted} / {partTotal} Topics Completed • {partPercent}% Done
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5 hidden sm:block">
                    <div className="bg-cyber-yellow h-full" style={{ width: `${partPercent}%` }} />
                  </div>
                  <span className="text-slate-500">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
              </div>

              {/* Accordion body list */}
              {isExpanded && (
                <div className="divide-y divide-white/5">
                  {list.length > 0 ? (
                    list.map((topic) => {
                      const values = editStates[topic._id] || { progress: 0, notes: '' };
                      return (
                        <div
                          key={topic._id}
                          className={`p-5 flex flex-col space-y-4 transition-all duration-150 border-b border-white/5 ${
                            topic.isCompleted ? 'bg-cyber-yellow/[0.01]' : 'hover:bg-white/[0.01]'
                          }`}
                        >
                          {/* Parent Row: Topic Name & Notes */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Left: Complete Checkbox and Name */}
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <h4 className={`text-xs font-bold font-mono tracking-wide ${topic.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                    {topic.topicName}
                                  </h4>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border flex-shrink-0 ${
                                    topic.isCompleted
                                      ? 'bg-green-500/10 text-green-400 border-green-500/15'
                                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15'
                                  }`}>
                                    {topic.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2.5 mt-1.5 font-mono text-[9px] text-slate-500">
                                  <span>Dynamic Progress: <span className="text-white font-bold">{topic.progress}%</span></span>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Notes and Actions */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input
                                type="text"
                                placeholder="Insert notes, formulas, or review pointers..."
                                value={values.notes}
                                onChange={(e) => handleLocalChange(topic._id, 'notes', e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-white/5 bg-black/25 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-cyber-yellow"
                              />
                              <button
                                onClick={() => handleSaveTopic(topic._id)}
                                title="Save Notes"
                                className="p-2 bg-white/5 hover:bg-cyber-yellow/10 hover:text-cyber-yellow rounded-lg border border-white/5 hover:border-cyber-yellow/20 transition-all cursor-pointer flex-shrink-0"
                              >
                                <Save size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Nested Subtopics Grid */}
                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <div className="pl-6 border-l border-white/5 space-y-2.5">
                              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                                Subtopic Curriculum Checklist
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {topic.subtopics.map((sub) => {
                                  const subState = editSubStates[topic._id]?.[sub._id] || { questionsSolved: 0, accuracyPercent: 0, notes: '' };
                                  return (
                                    <div
                                      key={sub._id}
                                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                                        sub.isCompleted
                                          ? 'bg-cyber-yellow/5 border-cyber-yellow/15 text-slate-500'
                                          : 'bg-black/20 border-white/5 text-white'
                                      }`}
                                    >
                                      {/* Subtopic Header: checkbox & name */}
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                          <button
                                            onClick={() => handleToggleSubtopic(topic._id, sub._id, sub.isCompleted)}
                                            className="text-slate-500 hover:text-cyber-yellow cursor-pointer flex-shrink-0"
                                          >
                                            {sub.isCompleted ? (
                                              <CheckCircle2 size={15} className="text-cyber-yellow fill-cyber-yellow/10" />
                                            ) : (
                                              <Circle size={15} className="hover:text-cyber-yellow" />
                                            )}
                                          </button>
                                          <span className={`text-[10px] font-mono font-bold leading-relaxed truncate ${sub.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                            {sub.name}
                                          </span>
                                        </div>
                                        <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${
                                          sub.isCompleted
                                            ? 'bg-green-500/10 text-green-400 border-green-500/10'
                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10'
                                        }`}>
                                          {sub.isCompleted ? 'Done' : 'Study'}
                                        </span>
                                      </div>

                                      {/* Subtopic Metrics Controls */}
                                      <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-slate-500 pt-2 border-t border-white/5">
                                        <div>
                                          <span className="block text-[8px] text-slate-600 uppercase">Questions</span>
                                          <input
                                            type="number"
                                            min="0"
                                            value={subState.questionsSolved}
                                            onChange={(e) => handleSubChange(topic._id, sub._id, 'questionsSolved', parseInt(e.target.value) || 0)}
                                            className="w-full bg-black/40 text-white border border-white/5 rounded px-1.5 py-0.5 mt-0.5 text-center focus:outline-none focus:border-cyber-yellow font-bold text-[9px]"
                                          />
                                        </div>
                                        <div>
                                          <span className="block text-[8px] text-slate-600 uppercase">Accuracy %</span>
                                          <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={subState.accuracyPercent}
                                            onChange={(e) => handleSubChange(topic._id, sub._id, 'accuracyPercent', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                            className="w-full bg-black/40 text-white border border-white/5 rounded px-1.5 py-0.5 mt-0.5 text-center focus:outline-none focus:border-cyber-yellow font-bold text-[9px]"
                                          />
                                        </div>
                                        <div className="flex flex-col justify-end">
                                          <button
                                            onClick={() => handleSaveSubtopic(topic._id, sub._id)}
                                            className="w-full py-0.5 bg-white/5 hover:bg-cyber-yellow/10 hover:text-cyber-yellow border border-white/10 hover:border-cyber-yellow/25 rounded cursor-pointer transition-all flex items-center justify-center font-bold text-[8px] h-[20px]"
                                          >
                                            <Save size={10} className="mr-0.5" /> Save
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-600 italic text-xs font-mono flex items-center justify-center gap-1.5">
                      <HelpCircle size={15} />
                      <span>No topics mapped under this part.</span>
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

export default Aptitude;
