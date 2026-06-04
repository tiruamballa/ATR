import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { AlertCircle, Calendar, Edit2, Plus, Save, Trash2, X } from 'lucide-react';

const AttendanceSubjects = ({ semester }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add Subject Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Subject Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', presentPeriods: '', totalPeriods: '' });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Schedule Modal States
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingSubject, setSchedulingSubject] = useState(null);
  const [tempSchedule, setTempSchedule] = useState({}); // { Monday: [1, 2], Wednesday: [5] }
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  const fetchSubjects = async () => {
    try {
      const data = await apiRequest('/attendance/subjects');
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [semester]);

  const handleAddSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    setSubmittingAdd(true);
    setMessage('');
    setError('');
    try {
      const data = await apiRequest('/attendance/subjects', {
        method: 'POST',
        body: { name: newSubjectName.trim() }
      });
      if (data.success) {
        setMessage('Subject added successfully!');
        setNewSubjectName('');
        setShowAddModal(false);
        fetchSubjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to add subject');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleEditModalOpen = (sub) => {
    setEditingSubject(sub);
    setEditForm({
      name: sub.name,
      presentPeriods: String(sub.presentPeriods),
      totalPeriods: String(sub.totalPeriods)
    });
    setShowEditModal(true);
  };

  const handleEditSubjectSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    setMessage('');
    setError('');
    try {
      // 1. Update name
      const nameRes = await apiRequest(`/attendance/subjects/${editingSubject._id}`, {
        method: 'PUT',
        body: { name: editForm.name.trim() }
      });

      // 2. Overwrite period numbers
      const periodsRes = await apiRequest(`/attendance/subjects/${editingSubject._id}/periods`, {
        method: 'PUT',
        body: {
          presentPeriods: Number(editForm.presentPeriods),
          totalPeriods: Number(editForm.totalPeriods)
        }
      });

      if (nameRes.success && periodsRes.success) {
        setMessage('Subject updated successfully!');
        setShowEditModal(false);
        fetchSubjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to update subject details');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject? All logged attendance periods for it will be lost.')) return;
    setMessage('');
    setError('');
    try {
      const data = await apiRequest(`/attendance/subjects/${subjectId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        setMessage('Subject deleted successfully.');
        fetchSubjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete subject');
    }
  };

  // Quick Counter click handlers
  const handleQuickCounter = async (subjectId, action) => {
    try {
      const data = await apiRequest(`/attendance/subjects/${subjectId}/counter`, {
        method: 'PUT',
        body: { action }
      });
      if (data.success) {
        setSubjects(prev =>
          prev.map(sub => sub._id === subjectId ? data.subject : sub)
        );
      }
    } catch (err) {
      console.error('Failed to run quick counter click:', err);
    }
  };

  // Schedule Modal triggers
  const handleScheduleModalOpen = (sub) => {
    setSchedulingSubject(sub);
    
    // Map existing schedule to an easy lookup dictionary
    const initialSched = {};
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    weekdays.forEach(d => {
      const daySched = sub.schedule.find(s => s.dayOfWeek === d);
      initialSched[d] = daySched ? daySched.periods : [];
    });
    
    setTempSchedule(initialSched);
    setShowScheduleModal(true);
  };

  const handlePeriodToggle = (day, period) => {
    setTempSchedule(prev => {
      const currentList = prev[day] || [];
      const newList = currentList.includes(period)
        ? currentList.filter(p => p !== period)
        : [...currentList, period].sort((a, b) => a - b);
      return {
        ...prev,
        [day]: newList
      };
    });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setMessage('');
    setError('');

    // Format tempSchedule back to the schedule schema list
    const scheduleArray = Object.keys(tempSchedule)
      .filter(day => tempSchedule[day].length > 0)
      .map(day => ({
        dayOfWeek: day,
        periods: tempSchedule[day]
      }));

    try {
      const data = await apiRequest(`/attendance/subjects/${schedulingSubject._id}/schedule`, {
        method: 'PUT',
        body: { schedule: scheduleArray }
      });
      if (data.success) {
        setMessage('Class schedule updated!');
        setShowScheduleModal(false);
        fetchSubjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to update schedule');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  const getSubjectPercent = (sub) => {
    return sub.totalPeriods > 0 ? Math.round((sub.presentPeriods / sub.totalPeriods) * 100) : 100;
  };

  const getPercentColor = (pct) => {
    if (pct >= 85) return 'text-green-400';
    if (pct >= 76) return 'text-cyber-cyan';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      
      {/* Subjects Header Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h3 className="font-display font-black text-white text-xs tracking-wider uppercase">
            Subjects Config Board
          </h3>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5 uppercase">
            Manage subject counts and weekly timetable schedules
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 rounded-lg border border-white/10 hover:border-cyber-cyan bg-white/5 hover:bg-cyber-cyan/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus size={14} className="text-cyber-cyan" /> Add Subject
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-3.5 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-2">
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-lg bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono flex items-center gap-2">
          <AlertCircle size={14} /> <span>{error}</span>
        </div>
      )}

      {/* Subject Cards Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const pct = getSubjectPercent(sub);
            const pctColor = getPercentColor(pct);

            return (
              <div key={sub._id} className="bg-[#151B26] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-56 hover:border-white/10 transition-all duration-200">
                
                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-display font-black text-sm text-white truncate max-w-[170px] uppercase">
                      {sub.name}
                    </h4>
                    <span className={`text-sm font-mono font-black ${pctColor}`}>
                      {pct}%
                    </span>
                  </div>
                  <span className="block text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                    Overall: {sub.presentPeriods} / {sub.totalPeriods} periods
                  </span>
                </div>

                {/* Quick counter face clicks */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 my-3 text-[10px] font-mono select-none">
                  {/* Present Incrementer */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-wider">Present</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuickCounter(sub._id, 'subPresent')}
                        className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-500 text-slate-400 hover:text-white rounded flex items-center justify-center cursor-pointer transition-all"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white leading-none">{sub.presentPeriods}</span>
                      <button
                        onClick={() => handleQuickCounter(sub._id, 'addPresent')}
                        className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-500 text-slate-400 hover:text-white rounded flex items-center justify-center cursor-pointer transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Incrementer */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-wider">Total</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuickCounter(sub._id, 'subTotal')}
                        className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-500 text-slate-400 hover:text-white rounded flex items-center justify-center cursor-pointer transition-all"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white leading-none">{sub.totalPeriods}</span>
                      <button
                        onClick={() => handleQuickCounter(sub._id, 'addTotal')}
                        className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-500 text-slate-400 hover:text-white rounded flex items-center justify-center cursor-pointer transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditModalOpen(sub)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] border border-white/10 text-slate-400 hover:border-[#8B5CF6] text-[10px] font-mono rounded flex items-center gap-1 cursor-pointer transition-all uppercase"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                    <button
                      onClick={() => handleScheduleModalOpen(sub)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-cyber-cyan/10 hover:text-cyber-cyan border border-white/10 text-slate-400 hover:border-cyber-cyan text-[10px] font-mono rounded flex items-center gap-1 cursor-pointer transition-all uppercase"
                    >
                      <Calendar size={10} className="text-cyber-cyan" /> Schedule
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteSubject(sub._id)}
                    className="p-2 text-slate-500 hover:text-cyber-red hover:bg-cyber-red/10 rounded transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-xs text-slate-500 italic border border-dashed border-white/5 rounded-lg bg-black/10 flex flex-col items-center justify-center space-y-2">
          <AlertCircle size={20} className="text-slate-600 animate-bounce" />
          <span>No subjects added yet. Start by clicking "+ Add Subject" above.</span>
        </div>
      )}

      {/* ── MODALS OVERLAYS */}

      {/* 1. Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/5 bg-[#151B26] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display font-black">Add New Subject</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white p-1 text-lg leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java, DBMS, CN"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full glass-input text-xs font-mono py-2 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-white/5 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="cyber-btn py-2 px-4 text-xs font-semibold"
                >
                  {submittingAdd ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Subject Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/5 bg-[#151B26] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display font-black">Edit Subject Periods</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-white p-1 text-lg leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full glass-input text-xs font-mono py-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Present Periods</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editForm.presentPeriods}
                    onChange={(e) => setEditForm({ ...editForm, presentPeriods: e.target.value })}
                    className="w-full glass-input text-xs font-mono py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Periods</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editForm.totalPeriods}
                    onChange={(e) => setEditForm({ ...editForm, totalPeriods: e.target.value })}
                    className="w-full glass-input text-xs font-mono py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-white/5 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="cyber-btn py-2 px-4 text-xs font-semibold"
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Schedule Timetable Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-white/5 bg-[#151B26] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display font-black">
                Configure Schedule: {schedulingSubject?.name}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-500 hover:text-white p-1 text-lg leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const dayPeriods = tempSchedule[day] || [];
                  const isDayChecked = dayPeriods.length > 0;

                  return (
                    <div key={day} className="p-3 bg-black/20 border border-white/5 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={isDayChecked}
                          onChange={() => {
                            setTempSchedule(prev => ({
                              ...prev,
                              [day]: isDayChecked ? [] : [1] // default to period 1 if checking
                            }));
                          }}
                          className="w-3.5 h-3.5 accent-cyber-cyan cursor-pointer"
                        />
                        <label htmlFor={`day-${day}`} className="text-xs font-mono font-bold text-white uppercase cursor-pointer select-none">
                          {day}
                        </label>
                      </div>

                      {/* Period blocks (only if day is checked) */}
                      {isDayChecked && (
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1.5 pl-6 border-t border-white/5">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                            const isPeriodChecked = dayPeriods.includes(num);
                            const section = num <= 4 ? 'Morning' : 'Afternoon';

                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handlePeriodToggle(day, num)}
                                className={`py-1.5 px-1 text-[10px] font-mono border rounded transition-all cursor-pointer ${
                                  isPeriodChecked
                                    ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan font-bold'
                                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                P{num}
                                <span className="block text-[6px] opacity-40 uppercase tracking-widest">{section}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-white/5 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="cyber-btn py-2 px-6 text-xs font-bold font-mono tracking-wider flex items-center gap-1.5"
                >
                  <Save size={13} /> {submittingSchedule ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceSubjects;
