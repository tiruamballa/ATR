import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { BrainCircuit, CheckCircle2, Circle, ChevronDown, ChevronUp, Save, Plus, Minus } from 'lucide-react';
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

  // Local editing states: { topicId: { questionsSolved, accuracyPercent, revisionCount, notes } }
  const [editStates, setEditStates] = useState({});

  const fetchAptitudeData = async () => {
    try {
      const data = await apiRequest('/aptitude/topics');
      if (data.success) {
        setGroupedTopics(data.grouped);
        setOverallStats(data.overall);

        // Populate local edit states
        const initialStates = {};
        Object.keys(data.grouped).forEach(part => {
          data.grouped[part].forEach(topic => {
            initialStates[topic._id] = {
              questionsSolved: topic.questionsSolved || 0,
              accuracyPercent: topic.accuracyPercent || 0,
              revisionCount: topic.revisionCount || 0,
              notes: topic.notes || ''
            };
          });
        });
        setEditStates(initialStates);
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

  const handleFieldChange = (topicId, field, value) => {
    setEditStates(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [field]: value
      }
    }));
  };

  const handleStepQuestionsSolved = async (topicId, currentVal, increment) => {
    const newVal = Math.max(0, currentVal + increment);
    handleFieldChange(topicId, 'questionsSolved', newVal);

    try {
      const data = await apiRequest(`/aptitude/topics/${topicId}`, {
        method: 'PUT',
        body: {
          questionsSolved: newVal
        }
      });
      if (data.success) {
        await fetchAptitudeData();
      }
    } catch (err) {
      console.error('Failed to step questions solved:', err);
    }
  };

  const handleToggleParentTopic = async (topicId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const data = await apiRequest(`/aptitude/topics/${topicId}`, {
        method: 'PUT',
        body: {
          isCompleted: nextStatus
        }
      });
      if (data.success) {
        await fetchAptitudeData();
        if (nextStatus) {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#FACC15', '#22D3EE']
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle Aptitude topic completion:', err);
    }
  };

  const handleSaveTopicMetrics = async (topicId) => {
    const state = editStates[topicId];
    if (!state) return;

    try {
      const data = await apiRequest(`/aptitude/topics/${topicId}`, {
        method: 'PUT',
        body: {
          questionsSolved: Number(state.questionsSolved),
          accuracyPercent: Number(state.accuracyPercent),
          revisionCount: Number(state.revisionCount),
          notes: state.notes
        }
      });
      if (data.success) {
        await fetchAptitudeData();
      }
    } catch (err) {
      console.error('Failed to save aptitude topic metrics:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  const parts = [
    'PART 1 Quantitative Aptitude',
    'PART 2 Analytical Reasoning',
    'PART 3 Grammar & Reading Comprehension',
    'PART 4 Vocabulary'
  ];

  // Calculate sum of all solved questions across parts
  let overallSolvedQuestions = 0;
  Object.keys(groupedTopics).forEach(part => {
    groupedTopics[part].forEach(t => {
      overallSolvedQuestions += (t.questionsSolved || 0);
    });
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 py-3 select-none">
      
      {/* ── TOP HIGHLIGHT PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Card */}
        <div className="lg:col-span-1 bg-[#1E293B] border border-white/5 rounded-xl p-5 flex flex-col justify-between border-l-4 border-l-yellow-500 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">
              Aptitude syllabus completion
            </span>
            <h2 className="text-2xl font-black text-white leading-none font-mono">
              {overallStats.completed} <span className="text-xs font-mono font-semibold text-slate-400">/ {overallStats.total} Chapters Done</span>
            </h2>
          </div>

          <div className="space-y-2 mt-4">
            <XPBar
              label="APTITUDE PREP TREE"
              current={overallStats.percent}
              max={100}
              color="#F59E0B"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
              <BrainCircuit className="text-yellow-500" size={15} />
              Logical & Quantitative Core Syllabus
            </h3>
            <p className="text-[11px] text-slate-400 font-body leading-relaxed">
              This module tracks standard book chapters split into four core parts. Record questions solved count, accuracy rates, revision sessions, and custom notes to monitor placement preparation.
            </p>
          </div>
          <div className="flex items-center space-x-6 text-[10px] font-mono text-slate-500 mt-4 border-t border-white/5 pt-2">
            <span>Overall Solved: <span className="text-white font-bold">{overallSolvedQuestions} Qs</span></span>
            <span>Total Chapters: <span className="text-white font-bold">{overallStats.total}</span></span>
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
            <div key={partName} className="bg-[#1E293B] border border-white/5 rounded-xl overflow-hidden shadow-sm">
              
              {/* Accordion header toggle */}
              <div
                onClick={() => togglePart(partName)}
                className="px-5 py-4 bg-slate-900/10 hover:bg-slate-900/20 border-b border-white/5 flex items-center justify-between cursor-pointer select-none transition-all"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span className="text-yellow-500"><BrainCircuit size={15} /></span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate font-display">
                      {partName}
                    </h3>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5 uppercase">
                      {partCompleted} / {partTotal} Chapters Completed • {partPercent}% Done
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-20 bg-slate-950 h-1 rounded-full overflow-hidden border border-white/5 hidden sm:block">
                    <div className="bg-yellow-500 h-full" style={{ width: `${partPercent}%` }} />
                  </div>
                  <span className="text-slate-500">
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </span>
                </div>
              </div>

              {/* Accordion body list */}
              {isExpanded && (
                <div className="divide-y divide-white/5 px-5 py-2 bg-slate-950/20">
                  {list.length > 0 ? (
                    list.map((topic) => {
                      const editState = editStates[topic._id] || { questionsSolved: 0, accuracyPercent: 0, revisionCount: 0, notes: '' };
                      
                      return (
                        <div
                          key={topic._id}
                          className="py-4.5 flex flex-col space-y-3.5 first:pt-2 last:pb-2"
                        >
                          {/* Header Row: Checkbox, Name, and Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0">
                              <button
                                onClick={() => handleToggleParentTopic(topic._id, topic.isCompleted)}
                                className="text-slate-500 hover:text-yellow-500 cursor-pointer flex-shrink-0"
                              >
                                {topic.isCompleted ? (
                                  <CheckCircle2 size={17} className="text-green-500" />
                                ) : (
                                  <Circle size={17} className="hover:text-yellow-500" />
                                )}
                              </button>
                              <span className={`text-xs font-bold font-mono tracking-wide ${topic.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                {topic.topicName}
                              </span>
                            </div>
                            
                            <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded border w-fit ${
                              topic.isCompleted
                                ? 'bg-green-500/10 text-green-400 border-green-500/10'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10'
                            }`}>
                              {topic.isCompleted ? 'Completed' : 'In Progress'}
                            </span>
                          </div>

                          {/* Metrics Controls Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end pt-2 border-t border-white/5/50">
                            
                            {/* Questions Solved Counter */}
                            <div className="space-y-1.5">
                              <span className="block text-[9px] text-slate-500 font-mono uppercase font-bold">Solved:</span>
                              <div className="flex items-center space-x-2 bg-slate-950 border border-white/5 px-2 py-1 rounded-lg justify-between h-9">
                                <button
                                  onClick={() => handleStepQuestionsSolved(topic._id, editState.questionsSolved || 0, -1)}
                                  className="p-1 text-slate-400 hover:text-yellow-500 cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-white font-bold font-mono text-xs text-center w-8">
                                  {editState.questionsSolved}
                                </span>
                                <button
                                  onClick={() => handleStepQuestionsSolved(topic._id, editState.questionsSolved || 0, 1)}
                                  className="p-1 text-slate-400 hover:text-yellow-500 cursor-pointer"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Accuracy input */}
                            <div className="space-y-1.5">
                              <span className="block text-[9px] text-slate-500 font-mono uppercase font-bold">Accuracy %:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editState.accuracyPercent}
                                onChange={(e) => handleFieldChange(topic._id, 'accuracyPercent', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-full bg-slate-950 text-white border border-white/5 rounded-lg px-2.5 h-9 text-center focus:outline-none focus:border-yellow-500 font-bold font-mono text-xs"
                              />
                            </div>

                            {/* Revision count input */}
                            <div className="space-y-1.5">
                              <span className="block text-[9px] text-slate-500 font-mono uppercase font-bold">Revision:</span>
                              <input
                                type="number"
                                min="0"
                                value={editState.revisionCount}
                                onChange={(e) => handleFieldChange(topic._id, 'revisionCount', parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-950 text-white border border-white/5 rounded-lg px-2.5 h-9 text-center focus:outline-none focus:border-yellow-500 font-bold font-mono text-xs"
                              />
                            </div>

                            {/* Notes input */}
                            <div className="space-y-1.5 md:col-span-2 flex items-end gap-2.5">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <span className="block text-[9px] text-slate-500 font-mono uppercase font-bold">Formula & Review Notes:</span>
                                <input
                                  type="text"
                                  placeholder="Review pointer notes..."
                                  value={editState.notes}
                                  onChange={(e) => handleFieldChange(topic._id, 'notes', e.target.value)}
                                  className="w-full bg-slate-950 text-slate-300 border border-white/5 rounded-lg px-3 h-9 text-xs focus:outline-none focus:border-yellow-500 font-mono"
                                />
                              </div>
                              <button
                                onClick={() => handleSaveTopicMetrics(topic._id)}
                                className="h-9 px-3 bg-white/5 hover:bg-yellow-500/10 hover:text-yellow-500 border border-white/10 hover:border-yellow-500/30 rounded-lg flex items-center justify-center cursor-pointer transition-all shrink-0"
                                title="Save metrics & notes"
                              >
                                <Save size={14} />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-500 italic text-xs font-mono">
                      No chapters loaded under this part.
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
