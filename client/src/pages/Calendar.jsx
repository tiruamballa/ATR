import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Layers } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import XPBar from '../components/XPBar';

const Calendar = () => {
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchPhases = async () => {
    try {
      const res = await apiRequest('/phases');
      if (res.success && res.phases.length > 0) {
        // Sort chronologically
        const sorted = [...res.phases].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthIndex - b.monthIndex;
        });
        setPhases(sorted);

        // Find active phase
        const activeRes = await apiRequest('/phases/current');
        let initialPhase = sorted[0];
        if (activeRes.success && activeRes.phase) {
          const found = sorted.find(p => p._id === activeRes.phase._id);
          if (found) initialPhase = found;
        }
        setSelectedPhase(initialPhase);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-cyan" />
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
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── HEADER NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="font-display text-[9px] text-slate-500 tracking-[0.2em] uppercase mb-1 font-mono">
            Roadmap Timelines
          </div>
          <h1 className="text-2xl font-black font-display text-white tracking-widest">
            ROADMAP OVERVIEW
          </h1>
        </div>

        {/* Dropdown Selector */}
        <div className="relative inline-block text-left">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-lg border border-white/10 hover:border-cyber-cyan bg-white/5 hover:bg-cyber-cyan/5 text-white font-mono text-xs tracking-wider transition-all cursor-pointer"
          >
            <CalendarIcon size={14} className="text-cyber-cyan" />
            <span className="font-display font-semibold uppercase tracking-wider">
              {selectedPhase ? `${selectedPhase.name} (${selectedPhase.monthName} ${selectedPhase.year})` : 'Select Month'}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#111827] p-4.5 shadow-2xl z-30 max-h-[350px] overflow-y-auto">
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
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'bg-cyber-cyan/15 border border-cyber-cyan/35 text-cyber-cyan'
                              : 'hover:bg-white/5 border border-transparent text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-display tracking-wider uppercase text-[10px] truncate max-w-[170px]">
                              {phase.name}
                            </span>
                            <span className="font-mono text-[9px] text-slate-500">
                              {phase.monthName.slice(0, 3)}
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
        <div className="bg-[#151B26] border border-white/5 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-2.5">
              <span className="p-2.5 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
                <CalendarIcon size={18} />
              </span>
              <div>
                <h2 className="font-display font-black text-lg text-white tracking-wide uppercase">
                  {selectedPhase.name}
                </h2>
                <p className="text-[10px] font-mono text-cyber-cyan font-semibold tracking-widest uppercase">
                  {selectedPhase.monthName} {selectedPhase.year}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <span className="block text-slate-500 uppercase tracking-widest text-[9px] font-bold font-mono">Skill Focus</span>
                <span className="text-white font-semibold">{selectedPhase.primarySkill}</span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase tracking-widest text-[9px] font-bold font-mono">Month Goal Description</span>
                <span className="text-slate-300 font-semibold block mt-0.5">{selectedPhase.goal}</span>
              </div>
            </div>
          </div>

          {/* Completion Meter */}
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
            <XPBar
              label="PHASE COMPLETION %"
              current={Math.round(selectedPhase.completionPercentage || 0)}
              max={100}
              color="#22D3EE"
            />
          </div>
        </div>
      )}

      {/* ── 4-WEEK SYLLABUS CARDS GRID */}
      {selectedPhase && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedPhase.weeks.map((w) => {
            const creativeWeekName = getWeekName(selectedPhase.name, w.weekNumber);
            const total = w.topics.length;
            const completed = w.topics.filter(t => t.isCompleted).length;
            const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <TiltCard key={w.weekNumber}>
                <div className="cyber-card flex flex-col min-h-[320px] h-full justify-between">
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Week {w.weekNumber}</span>
                        <h3 className="font-display font-bold text-xs tracking-wider uppercase text-white mt-0.5">
                          {creativeWeekName}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/20 text-[9px] font-mono text-cyber-cyan font-bold">
                        {completionPercent}% DONE
                      </span>
                    </div>

                    {/* Topics Sub-Checklist */}
                    <div className="space-y-3">
                      {w.topics.length > 0 ? (
                        w.topics.map((topic) => (
                          <div
                            key={topic._id}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              topic.isCompleted
                                ? 'bg-cyber-cyan/5 border-cyber-cyan/15 text-slate-500 line-through'
                                : 'bg-white/5 border-white/5 text-white'
                            }`}
                          >
                            <div className="flex items-start space-x-2.5 min-w-0">
                              <span className="mt-0.5 flex-shrink-0 text-slate-500">
                                {topic.isCompleted ? (
                                  <CheckCircle2 size={15} className="text-cyber-cyan" />
                                ) : (
                                  <Circle size={15} className="text-slate-500" />
                                )}
                              </span>
                              <span className={`text-[11px] font-mono leading-relaxed truncate ${topic.isCompleted ? 'text-slate-500' : 'text-slate-200'}`}>
                                {topic.name}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider rounded ${
                              topic.category === 'DSA'
                                ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/10'
                                : topic.category === 'Aptitude'
                                ? 'bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/10'
                                : topic.category === 'IP Skills'
                                ? 'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/10'
                                : 'bg-white/5 text-slate-400 border border-white/5'
                            }`}>
                              {topic.category}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center text-xs text-slate-600 italic py-12 font-mono">
                          No targets defined for this week.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Calendar;
