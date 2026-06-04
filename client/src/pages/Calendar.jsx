import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Copy,
  Clock,
  Layers,
  ArrowRightLeft,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../components/TiltCard';
import CyberButton from '../components/CyberButton';
import XPBar from '../components/XPBar';

const Calendar = () => {
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [targetPhaseId, setTargetPhaseId] = useState('');
  const [targetWeekNum, setTargetWeekNum] = useState(1);

  const fetchPhasesAndTasks = async () => {
    try {
      const phasesRes = await apiRequest('/phases');
      if (phasesRes.success && phasesRes.phases.length > 0) {
        // Sort phases by year and month index to ensure timeline chronology
        const sortedPhases = [...phasesRes.phases].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthIndex - b.monthIndex;
        });
        setPhases(sortedPhases);
        
        // Find current phase based on index or set default to index 0
        const activeRes = await apiRequest('/phases/current');
        let initialPhase = sortedPhases[0];
        if (activeRes.success && activeRes.phase) {
          const found = sortedPhases.find(p => p._id === activeRes.phase._id);
          if (found) initialPhase = found;
        }
        
        setSelectedPhase(initialPhase);
        await fetchTasks(initialPhase._id);
      }
    } catch (err) {
      console.error('Error fetching calendar base data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (phaseId) => {
    try {
      const tasksRes = await apiRequest(`/tasks?phaseId=${phaseId}`);
      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
      }
    } catch (err) {
      console.error('Error fetching phase tasks:', err);
    }
  };

  useEffect(() => {
    fetchPhasesAndTasks();

    // Listen for custom taskCreated events to reload data
    const handleTaskCreated = () => {
      if (selectedPhase) fetchTasks(selectedPhase._id);
    };
    window.addEventListener('taskCreated', handleTaskCreated);
    return () => {
      window.removeEventListener('taskCreated', handleTaskCreated);
    };
  }, [selectedPhase]);

  const handlePhaseSelect = async (phase) => {
    setSelectedPhase(phase);
    await fetchTasks(phase._id);
  };

  // Toggle task completion
  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const data = await apiRequest(`/tasks/${task._id}`, {
        method: 'PUT',
        body: { status: nextStatus },
      });
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
        );
        // Refresh selected phase stats
        const updatedPhases = await apiRequest('/phases');
        if (updatedPhases.success) {
          setPhases(updatedPhases.phases);
          const currentUpdated = updatedPhases.phases.find((p) => p._id === selectedPhase._id);
          if (currentUpdated) setSelectedPhase(currentUpdated);
        }
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Duplicate task
  const handleDuplicateTask = async (task) => {
    try {
      const data = await apiRequest(`/tasks/${task._id}/duplicate`, {
        method: 'POST',
      });
      if (data.success && data.task) {
        setTasks((prev) => [...prev, data.task]);
      }
    } catch (err) {
      console.error('Failed to duplicate task:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      const data = await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Migrate task open modal
  const openMoveModal = (task) => {
    setActiveTask(task);
    setTargetPhaseId(task.phaseId);
    setTargetWeekNum(task.weekNumber);
    setShowMoveModal(true);
  };

  // Move task trigger
  const handleMoveTaskSubmit = async (e) => {
    e.preventDefault();
    if (!activeTask) return;

    try {
      const data = await apiRequest(`/tasks/${activeTask._id}/move`, {
        method: 'PUT',
        body: {
          targetPhaseId,
          targetWeek: Number(targetWeekNum),
        },
      });

      if (data.success) {
        if (targetPhaseId !== selectedPhase._id) {
          setTasks((prev) => prev.filter((t) => t._id !== activeTask._id));
        } else {
          setTasks((prev) =>
            prev.map((t) =>
              t._id === activeTask._id ? { ...t, weekNumber: Number(targetWeekNum) } : t
            )
          );
        }
        setShowMoveModal(false);
        setActiveTask(null);
      }
    } catch (err) {
      console.error('Failed to migrate task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  const getTasksByWeek = (weekNum) => {
    return tasks.filter((t) => t.weekNumber === weekNum);
  };

  // Group phases by year for timeline structure
  const phasesByYear = phases.reduce((acc, phase) => {
    const yr = phase.year;
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(phase);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* ── TWO COLUMN TIMELINE AND WEEK TASK SHEETS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.4fr] gap-8">
        
        {/* Left Column: Vertical Chronological Journey Map */}
        <div className="space-y-6">
          <div className="font-display text-[10px] text-slate-500 tracking-[0.25em] mb-4 uppercase">
            ░░ JOURNEY TIMELINE ░░
          </div>

          {Object.keys(phasesByYear).sort().map((year) => (
            <div key={year} className="space-y-4">
              {/* Year Timeline Separator */}
              <div className="font-display text-[11px] font-bold tracking-[0.3em] text-slate-500 border-b border-white/5 pb-2 mb-4">
                {year} ──────────────────────
              </div>

              <div className="space-y-4 pl-2">
                {phasesByYear[year].map((phase, idx) => {
                  const isSelected = selectedPhase?._id === phase._id;
                  const isLast = idx === phasesByYear[year].length - 1;
                  
                  // Phase status mappings based on estimated hours/index
                  let status = 'locked';
                  if (phase.completionPercentage >= 100) status = 'complete';
                  else if (phase.completionPercentage > 0 || isSelected) status = 'active';

                  return (
                    <div key={phase._id} className="flex gap-4 items-stretch select-none">
                      {/* Timeline dot and dynamic line */}
                      <div className="flex flex-col items-center pt-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                            status === 'complete'
                              ? 'bg-cyber-cyan border-cyber-cyan shadow-[0_0_10px_#00F5D4]'
                              : status === 'active'
                              ? 'bg-cyber-yellow border-cyber-yellow animate-glow-pulse'
                              : 'bg-slate-800 border-slate-700'
                          }`}
                        />
                        {!isLast && <div className="w-[1.5px] flex-1 bg-white/5 mt-2.5 min-h-[40px]" />}
                      </div>

                      {/* Phase Card Trigger */}
                      <div className="flex-1 pb-4">
                        <TiltCard>
                          <div
                            onClick={() => handlePhaseSelect(phase)}
                            className={`cyber-card cursor-pointer p-4 transition-all duration-300 select-none ${
                              isSelected
                                ? 'border-cyber-cyan/40 bg-cyber-cyan/5'
                                : 'hover:border-white/10'
                            }`}
                            style={isSelected ? { boxShadow: 'var(--glow-cyan)' } : {}}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-display font-extrabold text-xs text-cyber-cyan tracking-wider">
                                {phase.name.toUpperCase()}
                              </span>
                              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                                {phase.monthName.slice(0, 3)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-body leading-relaxed line-clamp-2">
                              {phase.goal}
                            </p>
                          </div>
                        </TiltCard>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Selected Phase Detail & 4-Week Grid Sheet */}
        <div className="space-y-6">
          
          {/* Selected Phase Info Header HUD */}
          {selectedPhase && (
            <div className="cyber-card relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-[80px]" />
              
              <div className="space-y-2 relative z-10 flex-1">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
                    <CalendarIcon size={18} />
                  </span>
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-white tracking-wide uppercase">
                      {selectedPhase.name}
                    </h2>
                    <p className="text-[10px] font-mono text-cyber-cyan font-semibold tracking-wider">
                      {selectedPhase.monthName.toUpperCase()} {selectedPhase.year}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-body leading-relaxed max-w-xl">
                  {selectedPhase.goal}
                </p>
              </div>

              {/* Progress HUD stats */}
              <div className="w-full md:w-56 font-mono text-xs text-slate-400 space-y-4 relative z-10 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                <div>
                  <XPBar
                    label="PHASE PROGRESS"
                    current={Math.round(selectedPhase.completionPercentage)}
                    max={100}
                    level={Math.floor(selectedPhase.completionPercentage / 10)}
                    color="#00F5D4"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <span className="block text-slate-500 uppercase tracking-widest text-[9px]">TARGET TIME</span>
                    <span className="text-white font-bold flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} className="text-cyber-purple" /> {selectedPhase.estimatedHours}h
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-widest text-[9px]">SKILL CORE</span>
                    <span className="text-cyber-cyan font-bold flex items-center gap-1 mt-0.5 truncate">
                      <Layers size={11} /> {selectedPhase.primarySkill}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4-Week Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((weekNum) => {
              const weekTasks = getTasksByWeek(weekNum);
              return (
                <TiltCard key={weekNum}>
                  <div className="cyber-card flex flex-col min-h-[300px] h-full justify-between">
                    <div>
                      {/* Week Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                        <h3 className="font-display font-bold text-xs tracking-wider uppercase text-white">WEEK {weekNum}</h3>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-slate-500">
                          {weekTasks.length} {weekTasks.length === 1 ? 'QUEST' : 'QUESTS'}
                        </span>
                      </div>

                      {/* Quest Items List */}
                      <div className="space-y-3.5">
                        {weekTasks.length > 0 ? (
                          weekTasks.map((task) => {
                            const isCompleted = task.status === 'Completed';
                            return (
                              <div
                                key={task._id}
                                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all relative group ${
                                  isCompleted
                                    ? 'bg-cyber-cyan/5 border-cyber-cyan/15 text-slate-500 line-through'
                                    : 'bg-white/5 border-white/5 hover:border-cyber-cyan/25 text-white'
                                }`}
                              >
                                {/* Title and checkbox */}
                                <div className="flex items-start space-x-2.5">
                                  <button
                                    onClick={() => handleToggleTask(task)}
                                    className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-cyber-cyan transition-colors cursor-pointer"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 size={16} className="text-cyber-cyan fill-cyber-cyan/15" />
                                    ) : (
                                      <Circle size={16} />
                                    )}
                                  </button>
                                  <span className={`text-xs font-body font-medium leading-relaxed ${isCompleted ? 'text-slate-500' : 'text-slate-200'}`}>
                                    {task.title}
                                  </span>
                                </div>

                                {/* Category Badge & Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-mono font-bold tracking-wider">
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    task.category === 'DSA'
                                      ? 'bg-cyber-cyan/10 text-cyber-cyan'
                                      : task.category === 'English'
                                      ? 'bg-cyber-purple/10 text-cyber-purple'
                                      : task.category === 'Aptitude'
                                      ? 'bg-cyber-yellow/10 text-cyber-yellow'
                                      : 'bg-cyber-pink/10 text-cyber-pink'
                                  }`}>
                                    {task.category}
                                  </span>

                                  {/* Inline actions bar */}
                                  <div className="flex items-center space-x-3 text-slate-500">
                                    <button
                                      onClick={() => handleDuplicateTask(task)}
                                      title="Duplicate Task"
                                      className="hover:text-cyber-cyan transition-all cursor-pointer"
                                    >
                                      <Copy size={11} />
                                    </button>
                                    <button
                                      onClick={() => openMoveModal(task)}
                                      title="Migrate/Move Task"
                                      className="hover:text-cyber-purple transition-all cursor-pointer"
                                    >
                                      <ArrowRightLeft size={11} />
                                    </button>
                                    {task.isCustom && (
                                      <button
                                        onClick={() => handleDeleteTask(task._id)}
                                        title="Delete Task"
                                        className="hover:text-cyber-red transition-all cursor-pointer"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center text-xs text-slate-600 italic py-10 font-mono">
                            No active quests assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic migration modal */}
      {showMoveModal && activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-cyber-cyan/35 bg-[#0D111A] p-6 shadow-2xl relative" style={{ boxShadow: 'var(--glow-cyan)' }}>
            
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="font-display font-bold text-white text-xs tracking-widest uppercase">MIGRATE ROADMAP TASK</h3>
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setActiveTask(null);
                }}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-mono leading-relaxed">
              MOVING TASK: <strong className="text-white">"{activeTask.title}"</strong>
            </p>

            <form onSubmit={handleMoveTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  TARGET PHASE (MONTH)
                </label>
                <select
                  value={targetPhaseId}
                  onChange={(e) => setTargetPhaseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-xs text-white font-mono focus:outline-none focus:border-cyber-cyan"
                >
                  {phases.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name.toUpperCase()} ({p.monthName} '{String(p.year).slice(-2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  TARGET WEEK
                </label>
                <select
                  value={targetWeekNum}
                  onChange={(e) => setTargetWeekNum(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-xs text-white font-mono focus:outline-none focus:border-cyber-cyan"
                >
                  <option value={1}>Week 1</option>
                  <option value={2}>Week 2</option>
                  <option value={3}>Week 3</option>
                  <option value={4}>Week 4</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoveModal(false);
                    setActiveTask(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white border border-white/5 hover:bg-white/5 cursor-pointer font-mono"
                >
                  CANCEL
                </button>
                <CyberButton
                  type="submit"
                  variant="cyan"
                  className="text-xs py-2 px-4"
                >
                  CONFIRM MIGRATE
                </CyberButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
