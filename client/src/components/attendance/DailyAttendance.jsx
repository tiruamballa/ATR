import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { AlertCircle, Calendar, Check, Plus, Save, X } from 'lucide-react';

const DailyAttendance = ({ semester }) => {
  const [date, setDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD
    const local = new Date();
    const y = local.getFullYear();
    const m = String(local.getMonth() + 1).padStart(2, '0');
    const d = String(local.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [subjects, setSubjects] = useState([]);
  const [scheduledList, setScheduledList] = useState([]); // List of subjects currently in today's entry
  const [extraSubjects, setExtraSubjects] = useState([]); // Other subjects available to add
  const [attendanceMap, setAttendanceMap] = useState({}); // { subjectId: 'Present' | 'Absent' }
  const [showExtraDropdown, setShowExtraDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Helper to parse day of week
  const getDayName = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return days[dateObj.getDay()];
  };

  const loadDailyEntry = async () => {
    if (!date) return;
    setMessage('');
    setError('');
    setShowExtraDropdown(false);
    
    try {
      // 1. Fetch all subjects
      const subRes = await apiRequest('/attendance/subjects');
      if (!subRes.success) return;
      const allSubs = subRes.subjects;
      setSubjects(allSubs);

      // 2. Fetch all entries to see if this date is already logged
      const entriesRes = await apiRequest('/attendance/entries');
      const dayOfWeek = getDayName(date);

      let existingLog = null;
      if (entriesRes.success) {
        existingLog = entriesRes.entries.find(e => e.date === date);
      }

      const initialMap = {};
      const listToShow = [];

      if (existingLog) {
        // Date is already logged: load logged subjects and status map
        existingLog.subjects.forEach(item => {
          initialMap[item.subjectId] = item.status;
          
          const fullSub = allSubs.find(s => s._id === item.subjectId);
          if (fullSub) {
            listToShow.push({
              ...fullSub,
              periodsCount: item.periodsCount,
              isExtra: !isScheduledOnDay(fullSub, dayOfWeek)
            });
          }
        });

        // Add any scheduled subjects that weren't in the log just in case
        allSubs.forEach(sub => {
          if (isScheduledOnDay(sub, dayOfWeek) && !listToShow.some(s => s._id === sub._id)) {
            listToShow.push({
              ...sub,
              periodsCount: getScheduledPeriods(sub, dayOfWeek),
              isExtra: false
            });
          }
        });
      } else {
        // No log exists: Load scheduled subjects for this day of week by default
        allSubs.forEach(sub => {
          if (isScheduledOnDay(sub, dayOfWeek)) {
            listToShow.push({
              ...sub,
              periodsCount: getScheduledPeriods(sub, dayOfWeek),
              isExtra: false
            });
          }
        });
      }

      setScheduledList(listToShow);
      setAttendanceMap(initialMap);

      // Determine extra subjects (all active subjects minus currently shown ones)
      const extras = allSubs.filter(sub => !listToShow.some(s => s._id === sub._id));
      setExtraSubjects(extras);

    } catch (err) {
      console.error('Failed to load daily entry details:', err);
    }
  };

  const isScheduledOnDay = (subject, day) => {
    const daySched = subject.schedule.find(s => s.dayOfWeek === day);
    return daySched && daySched.periods.length > 0;
  };

  const getScheduledPeriods = (subject, day) => {
    const daySched = subject.schedule.find(s => s.dayOfWeek === day);
    return daySched ? daySched.periods.length : 1;
  };

  useEffect(() => {
    loadDailyEntry();
  }, [date, semester]);

  // Click quick P/A selector
  const handleSelectStatus = (subjectId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [subjectId]: prev[subjectId] === status ? null : status // toggle off if clicked same
    }));
  };

  // Add extra subject manually
  const handleAddExtraSubject = (sub) => {
    setScheduledList(prev => [
      ...prev,
      { ...sub, periodsCount: 1, isExtra: true }
    ]);
    setExtraSubjects(prev => prev.filter(s => s._id !== sub._id));
    setShowExtraDropdown(false);
  };

  // Mark Full Day Present
  const handleMarkFullDayPresent = async () => {
    if (scheduledList.length === 0) {
      return setError('No subjects scheduled for today. Add subjects manually to mark attendance.');
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const data = await apiRequest('/attendance/entries', {
        method: 'POST',
        body: {
          date,
          entryType: 'Day',
          dayStatus: 'Present'
        }
      });
      if (data.success) {
        setMessage('Full day PRESENT logged successfully!');
        loadDailyEntry();
      }
    } catch (err) {
      setError(err.message || 'Failed to log full day present');
    } finally {
      setSaving(false);
    }
  };

  // Mark Full Day Absent
  const handleMarkFullDayAbsent = async () => {
    if (scheduledList.length === 0) {
      return setError('No subjects scheduled for today. Add subjects manually to mark attendance.');
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const data = await apiRequest('/attendance/entries', {
        method: 'POST',
        body: {
          date,
          entryType: 'Day',
          dayStatus: 'Absent'
        }
      });
      if (data.success) {
        setMessage('Full day ABSENT logged successfully!');
        loadDailyEntry();
      }
    } catch (err) {
      setError(err.message || 'Failed to log full day absent');
    } finally {
      setSaving(false);
    }
  };

  // Save Subject-Wise Attendance Log
  const handleSaveSubjectWise = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    // Compile list of marked subjects
    const loggedSubjects = scheduledList
      .filter(sub => attendanceMap[sub._id] === 'Present' || attendanceMap[sub._id] === 'Absent')
      .map(sub => ({
        subjectId: sub._id,
        status: attendanceMap[sub._id]
      }));

    if (loggedSubjects.length === 0) {
      setSaving(false);
      return setError('Please mark at least one subject as Present or Absent before saving.');
    }

    try {
      const data = await apiRequest('/attendance/entries', {
        method: 'POST',
        body: {
          date,
          entryType: 'SubjectWise',
          subjects: loggedSubjects
        }
      });

      if (data.success) {
        setMessage('Subject-wise attendance saved successfully!');
        loadDailyEntry();
      }
    } catch (err) {
      setError(err.message || 'Failed to save subject-wise attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── DATE PICKER HEADER */}
      <div className="cyber-card p-6 bg-black/45 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="text-cyber-cyan" size={18} />
          <div>
            <h3 className="font-display font-black text-white text-xs tracking-wider uppercase">
              Daily Attendance Logger
            </h3>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider block mt-0.5 uppercase">
              {getDayName(date)} Schedule
            </span>
          </div>
        </div>

        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass-input text-xs font-mono py-2"
          />
        </div>
      </div>

      {/* Notifications banner */}
      {message && (
        <div className="p-3.5 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-2">
          <Check size={14} /> <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-lg bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono flex items-center gap-2">
          <AlertCircle size={14} /> <span>{error}</span>
        </div>
      )}

      {/* ── MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Full Day Override */}
        <div className="lg:col-span-1 space-y-6">
          <div className="cyber-card p-5 bg-black/45 border border-white/5 space-y-4">
            <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase">
              Full Day Attendance
            </h4>
            <p className="text-[11px] text-slate-400 font-body leading-relaxed">
              Mark all today's scheduled subjects as either present or absent in a single click.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleMarkFullDayPresent}
                disabled={saving}
                className="w-full py-3 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer"
              >
                🟢 Present Full Day
              </button>
              <button
                onClick={handleMarkFullDayAbsent}
                disabled={saving}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer"
              >
                🔴 Absent Full Day
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Subject-Wise List (P/A Clickers) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cyber-card p-5 bg-black/45 border border-white/5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase">
                Subject-wise Attendance
              </h4>
              
              {/* Add Extra Subject Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExtraDropdown(!showExtraDropdown)}
                  className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-cyber-cyan/10 border border-white/10 hover:border-cyber-cyan text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus size={12} className="text-cyber-cyan" /> Add Extra Subject
                </button>

                {showExtraDropdown && (
                  <div className="absolute right-0 mt-2 z-20 w-48 rounded-lg border border-white/10 bg-[#151B26] p-2 shadow-2xl space-y-1">
                    {extraSubjects.length > 0 ? (
                      extraSubjects.map(sub => (
                        <button
                          key={sub._id}
                          type="button"
                          onClick={() => handleAddExtraSubject(sub)}
                          className="w-full text-left px-3 py-2 rounded text-xs text-slate-300 hover:text-white hover:bg-white/5 truncate block font-mono"
                        >
                          {sub.name}
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic p-2 block text-center font-mono">
                        No other subjects available
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* List of Subjects */}
            {scheduledList.length > 0 ? (
              <form onSubmit={handleSaveSubjectWise} className="space-y-4">
                <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto pr-1">
                  {scheduledList.map((sub) => {
                    const status = attendanceMap[sub._id];
                    return (
                      <div key={sub._id} className="flex items-center justify-between py-3.5 gap-4">
                        <div>
                          <h5 className="font-mono text-xs font-bold text-white uppercase">{sub.name}</h5>
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5 uppercase tracking-wider">
                            {sub.isExtra ? 'Extra Class' : `${sub.periodsCount} Period${sub.periodsCount > 1 ? 's' : ''} Today`}
                          </span>
                        </div>

                        {/* Quick P/A Clicks */}
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSelectStatus(sub._id, 'Present')}
                            className={`w-12 py-2 text-xs font-mono font-black border rounded-lg transition-all cursor-pointer ${
                              status === 'Present'
                                ? 'bg-green-500/25 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                                : 'bg-white/5 border-white/5 hover:border-slate-600 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectStatus(sub._id, 'Absent')}
                            className={`w-12 py-2 text-xs font-mono font-black border rounded-lg transition-all cursor-pointer ${
                              status === 'Absent'
                                ? 'bg-red-500/25 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                                : 'bg-white/5 border-white/5 hover:border-slate-600 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="cyber-btn py-2.5 px-6 text-xs font-bold flex items-center gap-1.5 uppercase font-mono tracking-wider"
                  >
                    <Save size={13} /> {saving ? 'SAVING...' : 'SAVE ATTENDANCE'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500 italic font-mono uppercase tracking-wider">
                No subjects scheduled for this weekday. Click "+ Add Extra Subject" to log an extra class or swap.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DailyAttendance;
