import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar as CalendarIcon, Info } from 'lucide-react';
import { apiRequest } from '../utils/api';

const FloatingAddButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phases, setPhases] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    priority: 'P2',
    deadline: '',
    phaseId: '',
    weekNumber: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch phases for select dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchPhases = async () => {
        try {
          const data = await apiRequest('/phases');
          if (data.success && data.phases) {
            setPhases(data.phases);
            // Default select to first phase if empty
            if (!formData.phaseId && data.phases.length > 0) {
              setFormData((prev) => ({
                ...prev,
                phaseId: data.phases[0]._id,
                // Set default deadline to middle of that phase
                deadline: `${data.phases[0].year}-${String(getMonthNumber(data.phases[0].monthName)).padStart(2, '0')}-15`,
              }));
            }
          }
        } catch (err) {
          console.error('Failed to load phases for modal:', err);
        }
      };
      fetchPhases();
    }
  }, [isOpen]);

  const handlePhaseChange = (e) => {
    const selectedPhaseId = e.target.value;
    const selectedPhase = phases.find((p) => p._id === selectedPhaseId);
    
    setFormData((prev) => ({
      ...prev,
      phaseId: selectedPhaseId,
      // Reset default deadline matching the year/month of selected phase
      deadline: selectedPhase
        ? `${selectedPhase.year}-${String(getMonthNumber(selectedPhase.monthName)).padStart(2, '0')}-15`
        : '',
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = await apiRequest('/tasks', {
        method: 'POST',
        body: {
          ...formData,
          isCustom: true,
        },
      });

      if (data.success) {
        // Dispatch custom global event so listing pages (Calendar/Tasks) refresh instantly
        window.dispatchEvent(new CustomEvent('taskCreated'));
        
        // Reset form and close
        setFormData({
          title: '',
          description: '',
          category: 'Development',
          priority: 'P2',
          deadline: '',
          phaseId: phases.length > 0 ? phases[0]._id : '',
          weekNumber: 1,
        });
        setIsOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to create custom task');
    } finally {
      setSubmitting(false);
    }
  };

  const getMonthNumber = (monthName) => {
    const months = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };
    return months[monthName] || 6;
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
        title="Add Custom Task"
      >
        <Plus size={28} />
      </button>

      {/* Task Creation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          {/* Modal Card */}
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 shadow-2xl glass-panel animate-float-delayed"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center">
                <CalendarIcon className="mr-2.5 text-cyan-400" size={20} />
                Create Custom Roadmap Task
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm flex items-start">
                <Info size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Build authentication middleware flow"
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add details, hints, or instructions..."
                  className="w-full glass-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full glass-input bg-[#0A0F1D] text-white"
                  >
                    <option value="Development">Development</option>
                    <option value="DSA">DSA (Java)</option>
                    <option value="English">English</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="AI">AI Learning</option>
                    <option value="Project">Project Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full glass-input bg-[#0A0F1D] text-white"
                  >
                    <option value="P1">P1 (Critical)</option>
                    <option value="P2">P2 (Medium)</option>
                    <option value="P3">P3 (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Associate with Month
                  </label>
                  <select
                    name="phaseId"
                    value={formData.phaseId}
                    onChange={handlePhaseChange}
                    className="w-full glass-input bg-[#0A0F1D] text-white text-xs"
                  >
                    {phases.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.monthName} '{String(p.year).slice(-2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Target Week
                  </label>
                  <select
                    name="weekNumber"
                    value={formData.weekNumber}
                    onChange={handleInputChange}
                    className="w-full glass-input bg-[#0A0F1D] text-white"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Target Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-sm font-bold text-white shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAddButton;
