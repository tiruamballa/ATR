import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Copy,
  ChevronRight,
  Clock,
  Layers,
  ArrowRightLeft,
  Trash2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        setPhases(phasesRes.phases);
        
        // Find current phase based on index or set default to index 0
        const activeRes = await apiRequest('/phases/current');
        let initialPhase = phasesRes.phases[0];
        if (activeRes.success && activeRes.phase) {
          const found = phasesRes.phases.find(p => p._id === activeRes.phase._id);
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
  }, []);

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
        // Append duplicated task
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
        // If moved to another phase, remove from current listing
        if (targetPhaseId !== selectedPhase._id) {
          setTasks((prev) => prev.filter((t) => t._id !== activeTask._id));
        } else {
          // If in same phase, update week number
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Group tasks by week
  const getTasksByWeek = (weekNum) => {
    return tasks.filter((t) => t.weekNumber === weekNum);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Horizontal Month Timeline Slider */}
      <div className="glass-panel p-4 rounded-2xl flex items-center space-x-3 overflow-x-auto select-none">
        {phases.map((phase) => {
          const isSelected = selectedPhase?._id === phase._id;
          return (
            <button
              key={phase._id}
              onClick={() => handlePhaseSelect(phase)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {phase.monthName.slice(0, 3)} '{String(phase.year).slice(-2)}
            </button>
          );
        })}
      </div>

      {/* Selected Phase Header details */}
      {selectedPhase && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[80px]" />
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <CalendarIcon size={18} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-white">{selectedPhase.name}</h2>
                <p className="text-xs text-cyan-400 font-semibold">{selectedPhase.monthName} {selectedPhase.year}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{selectedPhase.goal}</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-l-4 border-l-indigo-500">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                <span>Phase Progress</span>
                <span className="text-cyan-400">{Math.round(selectedPhase.completionPercentage)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedPhase.completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
              <div>
                <span className="block text-[10px] text-gray-500 font-black uppercase tracking-wider">
                  Target Hours
                </span>
                <span className="text-lg font-black text-white flex items-center gap-1 mt-0.5">
                  <Clock size={14} className="text-indigo-400" />
                  {selectedPhase.estimatedHours}h
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 font-black uppercase tracking-wider">
                  Skill Focus
                </span>
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1 mt-1 truncate">
                  <Layers size={12} />
                  {selectedPhase.primarySkill}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Week Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((weekNum) => {
          const weekTasks = getTasksByWeek(weekNum);
          return (
            <div key={weekNum} className="glass-panel p-5 rounded-2xl flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h3 className="font-extrabold text-white text-sm">Week {weekNum}</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-500 font-bold">
                  {weekTasks.length} {weekTasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>

              {/* Task list container */}
              <div className="flex-1 space-y-3.5 overflow-y-auto">
                {weekTasks.length > 0 ? (
                  weekTasks.map((task) => {
                    const isCompleted = task.status === 'Completed';
                    return (
                      <div
                        key={task._id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all relative group ${
                          isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-gray-400/90 line-through'
                            : 'bg-white/5 border-white/5 hover:border-cyan-500/25 text-white'
                        }`}
                      >
                        {/* Task Title & Toggle Check */}
                        <div className="flex items-start space-x-2.5">
                          <button
                            onClick={() => handleToggleTask(task)}
                            className="mt-0.5 flex-shrink-0 text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle size={16} />
                            )}
                          </button>
                          <span className={`text-xs font-semibold leading-relaxed ${isCompleted ? 'text-gray-500' : 'text-gray-200'}`}>
                            {task.title}
                          </span>
                        </div>

                        {/* Task Badges & Inline Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-bold uppercase tracking-wider">
                          <span className={`px-1.5 py-0.5 rounded-md ${
                            task.category === 'DSA'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : task.category === 'English'
                              ? 'bg-purple-500/10 text-purple-400'
                              : task.category === 'Aptitude'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {task.category}
                          </span>

                          {/* Hover Actions Bar */}
                          <div className="flex items-center space-x-2 text-gray-500">
                            <button
                              onClick={() => handleDuplicateTask(task)}
                              title="Duplicate Task"
                              className="hover:text-cyan-400 transition-all cursor-pointer"
                            >
                              <Copy size={11} />
                            </button>
                            <button
                              onClick={() => openMoveModal(task)}
                              title="Migrate/Move Task"
                              className="hover:text-indigo-400 transition-all cursor-pointer"
                            >
                              <ArrowRightLeft size={11} />
                            </button>
                            {task.isCustom && (
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                title="Delete Task"
                                className="hover:text-pink-500 transition-all cursor-pointer"
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
                  <div className="h-full flex items-center justify-center text-xs text-gray-600 italic text-center py-10">
                    No tasks assigned
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Migration Modal */}
      {showMoveModal && activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="font-extrabold text-white text-base">Migrate Roadmap Task</h3>
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setActiveTask(null);
                }}
                className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Moving task: <strong className="text-white">"{activeTask.title}"</strong>
            </p>

            <form onSubmit={handleMoveTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Target Phase (Month)
                </label>
                <select
                  value={targetPhaseId}
                  onChange={(e) => setTargetPhaseId(e.target.value)}
                  className="w-full glass-input bg-[#0A0F1D] text-xs text-white"
                >
                  {phases.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.monthName} '{String(p.year).slice(-2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Target Week
                </label>
                <select
                  value={targetWeekNum}
                  onChange={(e) => setTargetWeekNum(e.target.value)}
                  className="w-full glass-input bg-[#0A0F1D] text-xs text-white"
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
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-400 cursor-pointer"
                >
                  Confirm Migrate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
