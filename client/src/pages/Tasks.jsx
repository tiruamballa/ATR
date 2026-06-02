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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Search & Filter Header card */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search tasks by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 glass-input text-sm py-2.5"
            />
          </div>

          {/* Sliders icons */}
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
            <SlidersHorizontal size={14} />
            <span>Roadmap Backlog Filters</span>
          </div>
        </div>

        {/* Filters dropdown row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
              Category
            </label>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full glass-input bg-[#0A0F1D] text-xs py-2 text-white"
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
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full glass-input bg-[#0A0F1D] text-xs py-2 text-white"
            >
              <option value="All">All Priorities</option>
              <option value="P1">P1 (Critical)</option>
              <option value="P2">P2 (Medium)</option>
              <option value="P3">P3 (Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full glass-input bg-[#0A0F1D] text-xs py-2 text-white"
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
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <ListTodo size={18} className="text-cyan-400" />
            Active Tasks Backlog
          </h3>
          <span className="text-xs text-gray-500 font-bold">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>

        <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div
                  key={task._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/5 text-gray-500 line-through'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {/* Left: Check and Title */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="mt-0.5 flex-shrink-0 text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4 className={`text-sm font-semibold leading-relaxed ${isCompleted ? 'text-gray-500' : 'text-gray-200'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Badges & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 text-xs font-bold uppercase tracking-wider">
                    {/* Category */}
                    <span className={`px-2 py-0.5 rounded-md ${
                      task.category === 'DSA'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : task.category === 'English'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : task.category === 'Aptitude'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {task.category}
                    </span>

                    {/* Priority */}
                    <span className={`px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>

                    {/* Actions Panel */}
                    <div className="flex items-center space-x-2 text-gray-500 ml-2">
                      <button
                        onClick={() => handleDuplicate(task)}
                        title="Duplicate Task"
                        className="p-1 rounded hover:bg-white/5 hover:text-cyan-400 transition-all cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                      {task.isCustom && (
                        <button
                          onClick={() => handleDelete(task._id)}
                          title="Delete Custom Task"
                          className="p-1 rounded hover:bg-white/5 hover:text-pink-500 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-2">
              <AlertCircle size={24} className="text-gray-600 animate-bounce" />
              <span className="text-sm font-semibold italic">No matching tasks found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
