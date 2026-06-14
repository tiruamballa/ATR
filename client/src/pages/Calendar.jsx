import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Calendar as CalendarIcon, CheckCircle2, Circle, ChevronDown, ChevronUp, BookOpen, Code2, BrainCircuit, ShieldAlert, Languages } from 'lucide-react';
import XPBar from '../components/XPBar';

const Calendar = () => {
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const fetchPhases = async (maintainSelection = false) => {
    try {
      const res = await apiRequest('/phases');
      if (res.success && res.phases.length > 0) {
        const sorted = [...res.phases].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthIndex - b.monthIndex;
        });
        setPhases(sorted);

        if (maintainSelection && selectedPhase) {
          const updatedSelected = sorted.find(p => p._id === selectedPhase._id);
          if (updatedSelected) {
            setSelectedPhase(updatedSelected);
            return;
          }
        }

        // Find active phase
        const activeRes = await apiRequest('/phases/current');
        let initialPhase = sorted[0];
        if (activeRes.success && activeRes.phase) {
          const found = sorted.find(p => p._id === activeRes.phase._id);
          if (found) initialPhase = found;
        }
        setSelectedPhase(initialPhase);

        // Auto-expand the first week
        if (initialPhase && initialPhase.weeks.length > 0) {
          setExpandedWeeks({ [initialPhase.weeks[0].weekNumber]: true });
        }
      }
    } catch (err) {
      console.error('Error loading roadmap phases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const toggleWeekExpand = (weekNumber) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNumber]: !prev[weekNumber]
    }));
  };

  const handleToggleSubtopic = async (weekNumber, topicId, subtopicId, currentStatus) => {
    try {
      const res = await apiRequest(`/phases/${selectedPhase._id}/weeks/${weekNumber}/topics/${topicId}`, {
        method: 'PUT',
        body: {
          subtopicId,
          isCompleted: !currentStatus
        }
      });
      if (res.success) {
        // Reload phase data to trigger recalculations
        await fetchPhases(true);
      }
    } catch (err) {
      console.error('Failed to toggle calendar subtopic:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Group phases by year
  const phasesByYear = phases.reduce((acc, p) => {
    const yr = p.year;
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(p);
    return acc;
  }, {});

  // Dynamic week names helper
  const getWeekName = (phaseName, weekNum) => {
    const name = (phaseName || '').toLowerCase();
    const weekNames = {
      ignition: ['Foundation Forge', 'UI Builder', 'Responsive Mastery', 'Mini Project Sprint'],
      reactor: ['Component Core', 'State Mastery', 'Hooks Laboratory', 'React Sprint'],
      backend: ['API Forge', 'Express Engine', 'Database Bridge', 'Backend Sprint'],
      launchpad: ['Token Foundations', 'Prompt Studio', 'RAG Mission', 'AI Builder'],
      quest: ['Pandas Lab', 'Visualizations', 'AI Model Integration', 'Analytics Project'],
      foundations: ['OOPs Java', 'SOLID Design', 'Network Basics', 'HLD Routers'],
      infrastructure: ['OS Processes', 'TCP/UDP Layers', 'Docker Containers', 'Network Security'],
      arena: ['Cloud Services', 'Jest Component Testing', 'Complexities Study', 'Technical Mocks'],
      sprint: ['Interview Prep', 'Alumni Mocks', 'UI Framer Motion', 'Placement Rounds']
    };

    const matchedKey = Object.keys(weekNames).find(key => name.includes(key));
    if (matchedKey && weekNames[matchedKey][weekNum - 1]) {
      return weekNames[matchedKey][weekNum - 1];
    }
    
    return `Week ${weekNum} Focus`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 py-3 select-none">
      
      {/* ── HEADER NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-white tracking-wide uppercase">
            ROADMAP OVERVIEW
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Execution Roadmap Milestones
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="relative inline-block text-left">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-lg border border-white/10 hover:border-blue-500 bg-slate-900 hover:bg-slate-900/80 text-white font-mono text-xs tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <CalendarIcon size={14} className="text-blue-500" />
            <span className="font-display font-semibold uppercase tracking-wider">
              {selectedPhase ? `${selectedPhase.name} (${selectedPhase.monthName})` : 'Select Phase'}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#1E293B] p-4 shadow-2xl z-30 max-h-[350px] overflow-y-auto">
              {Object.keys(phasesByYear).sort().map((year) => (
                <div key={year} className="mb-3.5 last:mb-0">
                  <div className="text-[9px] font-bold tracking-[0.2em] text-slate-500 border-b border-white/5 pb-1 mb-2 font-mono">
                    {year}
                  </div>
                  <div className="space-y-1">
                    {phasesByYear[year].map((phase) => {
                      const isSelected = selectedPhase?._id === phase._id;
                      return (
                        <div
                          key={phase._id}
                          onClick={() => {
                            setSelectedPhase(phase);
                            setDropdownOpen(false);
                            // Reset expanded weeks for the new phase
                            if (phase.weeks.length > 0) {
                              setExpandedWeeks({ [phase.weeks[0].weekNumber]: true });
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                              : 'hover:bg-white/5 border border-transparent text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-display tracking-wider uppercase text-[10px] truncate max-w-[170px]">
                              {phase.name}
                            </span>
                            <span className="font-mono text-[9px] text-slate-500 font-normal">
                              {phase.monthName.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PHASE HIGHLIGHT CARD */}
      {selectedPhase && (
        <div className="bg-[#1E293B] border border-white/5 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <CalendarIcon size={16} />
              </span>
              <div>
                <h2 className="font-display font-bold text-base text-white tracking-wide uppercase">
                  {selectedPhase.name}
                </h2>
                <p className="text-[10px] font-mono text-blue-500 font-semibold tracking-wider uppercase">
                  {selectedPhase.monthName}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
              <div>
                <span className="block text-slate-500 uppercase tracking-widest text-[9px] font-bold font-mono">Skill Focus</span>
                <span className="text-white font-semibold">{selectedPhase.primarySkill}</span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase tracking-widest text-[9px] font-bold font-mono">Month Goal</span>
                <span className="text-slate-300 font-medium block mt-0.5">{selectedPhase.goal}</span>
              </div>
            </div>
          </div>

          {/* Completion Meter */}
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
            <XPBar
              label="PHASE COMPLETION %"
              current={Math.round(selectedPhase.completionPercentage || 0)}
              max={100}
              color="#3B82F6"
            />
          </div>
        </div>
      )}

      {/* ── ACCORDION WEEKS LIST */}
      {selectedPhase && (
        <div className="space-y-4">
          {selectedPhase.weeks.map((w) => {
            const creativeWeekName = getWeekName(selectedPhase.name, w.weekNumber);
            const isExpanded = !!expandedWeeks[w.weekNumber];
            
            // Calculate week completion based on topics
            const totalTopics = w.topics.length;
            const completedTopics = w.topics.filter(t => t.isCompleted).length;
            const completionPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return (
              <div key={w.weekNumber} className="bg-[#1E293B] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                
                {/* Week Header */}
                <div
                  onClick={() => toggleWeekExpand(w.weekNumber)}
                  className="px-5 py-4 bg-slate-900/10 hover:bg-slate-900/20 flex items-center justify-between cursor-pointer transition-colors border-b border-white/5"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="text-blue-500 font-mono text-xs font-bold">W{w.weekNumber}</span>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display truncate">
                        {creativeWeekName}
                      </h3>
                      <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                        {completedTopics} / {totalTopics} Topics Completed • {completionPercent}% Done
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-20 bg-slate-950 h-1 rounded-full overflow-hidden border border-white/5 hidden sm:block">
                      <div className="bg-blue-500 h-full" style={{ width: `${completionPercent}%` }} />
                    </div>
                    {isExpanded ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
                  </div>
                </div>

                {/* Week Accordion Content */}
                {isExpanded && (
                  <div className="p-5 bg-slate-900/20 divide-y divide-white/5 space-y-5">
                    {w.topics.map((topic) => {
                      const categoryIcons = {
                        'Development': BookOpen,
                        'DSA': Code2,
                        'Aptitude': BrainCircuit,
                        'IP Skills': ShieldAlert
                      };
                      const CategoryIcon = categoryIcons[topic.category] || BookOpen;

                      // Display planned targets if defined
                      let targetDisplay = null;
                      if (topic.category === 'DSA' && topic.practiceTarget) {
                        targetDisplay = `Question Target: ${topic.practiceTarget}`;
                      } else if (topic.category === 'Aptitude' && topic.practiceTarget) {
                        targetDisplay = `Practice Target: ${topic.practiceTarget}`;
                      }

                      return (
                        <div key={topic._id} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Topic Details Column */}
                          <div className="md:col-span-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400 flex-shrink-0"><CategoryIcon size={14} /></span>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                                {topic.category}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                              {topic.name}
                            </h4>
                            {targetDisplay && (
                              <span className="block text-[10px] text-blue-400 font-mono mt-1">
                                {targetDisplay}
                              </span>
                            )}
                          </div>

                          {/* Subtopics Checklist Column */}
                          <div className="md:col-span-2 space-y-2.5">
                            {topic.subtopics && topic.subtopics.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {topic.subtopics.map((sub) => (
                                  <div
                                    key={sub._id}
                                    onClick={() => handleToggleSubtopic(w.weekNumber, topic._id, sub._id, sub.isCompleted)}
                                    className={`p-2.5 rounded-lg border flex items-center space-x-2.5 cursor-pointer transition-all ${
                                      sub.isCompleted
                                        ? 'bg-blue-500/5 border-blue-500/10 text-slate-500'
                                        : 'bg-[#1E293B]/40 border-white/5 text-slate-200 hover:border-blue-500/20'
                                    }`}
                                  >
                                    <span className="flex-shrink-0">
                                      {sub.isCompleted ? (
                                        <CheckCircle2 size={14} className="text-green-500" />
                                      ) : (
                                        <Circle size={14} className="text-slate-500 hover:text-blue-500" />
                                      )}
                                    </span>
                                    <span className={`text-[10px] font-mono tracking-wide truncate ${sub.isCompleted ? 'line-through' : ''}`}>
                                      {sub.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500 italic font-mono pt-1">
                                No subtopics specified.
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}

                    {/* Standard English Speaking module (Rendered automatically per week if no database match) */}
                    <div className="py-4 last:pb-0 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5">
                      <div className="md:col-span-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-400 flex-shrink-0"><Languages size={14} /></span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                            English Speaking
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                          Speaking Practice
                        </h4>
                      </div>
                      <div className="md:col-span-2 flex items-center">
                        <div className="p-3 bg-[#1E293B]/40 border border-white/5 rounded-xl text-[10px] text-slate-400 font-mono w-full">
                          Task: Daily 15-minute speaking logs. Complete conversational sessions or public speaking mock prep.
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Calendar;
