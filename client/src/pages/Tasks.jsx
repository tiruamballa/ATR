import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Copy,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTasks = async () => {
    try {
      const data = await apiRequest('/tasks');
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Listen for custom taskCreated events to reload data
    window.addEventListener('taskCreated', fetchTasks);
    return () => {
      window.removeEventListener('taskCreated', fetchTasks);
    };
  }, []);

  const handleToggleStatus = async (task) => {
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
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDuplicate = async (task) => {
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

  const handleDelete = async (taskId) => {
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

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = catFilter === 'All' || task.category === catFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    if (priority === 'P1') return 'text-pink-500 bg-pink-500/10 border-pink-500/20';
    if (priority === 'P2') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="w-48 bg-slate-950 border border-cyber-cyan/30 h-2 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 bg-cyber-cyan animate-pulse" style={{ width: '60%' }} />
        </div>
        <span className="animate-pulse tracking-widest uppercase">LOADING BACKLOG INTEL...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Search & Filter Header card */}
      <div className="cyber-card p-6 border border-cyber-cyan/15 bg-black/45 shadow-[0_0_15px_rgba(0,245,212,0.03)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Filter tasks by code keyword or module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 glass-input text-xs font-mono"
            />
          </div>

          {/* Sliders icons */}
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            <SlidersHorizontal size={12} className="text-cyber-cyan" />
            <span>Roadmap Backlog Filters</span>
          </div>
        </div>

        {/* Filters dropdown row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full glass-input text-xs font-mono"
            >
              <option value="All">All Categories</option>
              <option value="Development">Development</option>
              <option value="DSA">DSA (Java)</option>
              <option value="English">English</option>
              <option value="Aptitude">Aptitude</option>
              <option value="AI">AI Learning</option>
              <option value="Project">Project Work</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full glass-input text-xs font-mono"
            >
              <option value="All">All Priorities</option>
              <option value="P1">P1 (Critical)</option>
              <option value="P2">P2 (Medium)</option>
              <option value="P3">P3 (Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full glass-input text-xs font-mono"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Listing */}
      <div className="cyber-card p-0 border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 uppercase">
            <ListTodo size={16} className="text-cyber-cyan" />
            Active Mission Backlog
          </h3>
          <span className="text-[10px] text-slate-500 font-mono font-bold">
            SHOWING {filteredTasks.length} / {tasks.length} QUEUED TASKS
          </span>
        </div>

        <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div
                  key={task._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-cyber-cyan/[0.02] text-slate-500 line-through border-l-2 border-l-cyber-cyan/40'
                      : 'bg-black/20 hover:bg-white/[0.02] border-l-2 border-l-transparent text-white'
                  }`}
                >
                  {/* Left: Check and Title */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-cyber-cyan transition-colors cursor-pointer focus:outline-none"
                    >
                      {isCompleted ? (
                        <div className="w-4.5 h-4.5 border border-cyber-cyan bg-cyber-cyan/15 flex items-center justify-center rounded-sm transition-all text-cyber-cyan font-bold font-mono text-[10px]">
                          ✓
                        </div>
                      ) : (
                        <div className="w-4.5 h-4.5 border border-slate-600 hover:border-cyber-cyan flex items-center justify-center rounded-sm transition-all" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold font-mono tracking-wide leading-relaxed ${isCompleted ? 'text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 font-body mt-1 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Badges & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider">
                    {/* Category */}
                    <span className={`px-2.5 py-0.5 rounded border ${
                      task.category === 'DSA'
                        ? 'bg-cyber-cyan/5 text-cyber-cyan border-cyber-cyan/20'
                        : task.category === 'English'
                        ? 'bg-cyber-purple/5 text-cyber-purple border-cyber-purple/20'
                        : task.category === 'Aptitude'
                        ? 'bg-cyber-yellow/5 text-cyber-yellow border-cyber-yellow/20'
                        : 'bg-cyber-pink/5 text-cyber-pink border-cyber-pink/20'
                    }`}>
                      {task.category}
                    </span>

                    {/* Priority */}
                    <span className={`px-2.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>

                    {/* Actions Panel */}
                    <div className="flex items-center space-x-2 text-slate-500 ml-2">
                      <button
                        onClick={() => handleDuplicate(task)}
                        title="Duplicate Task"
                        className="p-1.5 rounded bg-white/5 hover:bg-cyber-cyan/10 hover:text-cyber-cyan transition-all border border-white/5 cursor-pointer"
                      >
                        <Copy size={11} />
                      </button>
                      {task.isCustom && (
                        <button
                          onClick={() => handleDelete(task._id)}
                          title="Delete Custom Task"
                          className="p-1.5 rounded bg-white/5 hover:bg-cyber-red/10 hover:text-cyber-red transition-all border border-white/5 cursor-pointer"
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
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3 font-mono">
              <AlertCircle size={22} className="text-slate-600 animate-bounce" />
              <span className="text-xs font-semibold italic tracking-wider">NO MATCHING BACKLOG MODULES FOUND</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
