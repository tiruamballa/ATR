import React, { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

const SemesterSettings = ({ semester, onSemesterReset }) => {
  const [newSemesterName, setNewSemesterName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleStartNewSemester = async (e) => {
    e.preventDefault();
    if (!newSemesterName.trim()) return;
    setResetting(true);
    setError('');

    try {
      const data = await apiRequest('/attendance/semester/new', {
        method: 'POST',
        body: { name: newSemesterName.trim() }
      });

      if (data.success) {
        setShowConfirm(false);
        setNewSemesterName('');
        onSemesterReset(); // callback to refresh parent
      }
    } catch (err) {
      setError(err.message || 'Failed to start new semester');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── SEMESTER SETTINGS HEADER */}
      <div className="cyber-card p-6 bg-black/45 border border-white/5 space-y-4">
        <div>
          <h3 className="font-display font-black text-white text-xs tracking-wider uppercase">
            Semester Configuration
          </h3>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5 uppercase">
            Active Semester: <strong className="text-cyber-cyan">{semester?.name || 'N/A'}</strong>
          </span>
        </div>
      </div>

      {/* ── ACTIONS HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Start New Semester Card */}
        <div className="lg:col-span-2 cyber-card p-5 border border-cyber-red/20 bg-black/45 shadow-[0_0_15px_rgba(239,68,68,0.02)] space-y-5">
          <div className="flex items-start space-x-3.5">
            <AlertTriangle className="text-cyber-red mt-0.5 animate-pulse" size={20} />
            <div>
              <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase">
                Start New Semester
              </h4>
              <p className="text-[11px] text-slate-400 font-body leading-relaxed mt-1">
                Starting a new semester will **completely scrub all active subjects, timetable schedules, and attendance records**. 
                This action is permanent and cannot be undone. Keep this option only when transition seasons arrive.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono">
              {error}
            </div>
          )}

          {!showConfirm ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="px-6 py-2.5 bg-cyber-red/5 hover:bg-cyber-red border border-cyber-red/20 hover:border-cyber-red text-cyber-red hover:text-white text-xs font-bold font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer rounded-lg"
              >
                Start New Semester
              </button>
            </div>
          ) : (
            <form onSubmit={handleStartNewSemester} className="space-y-4 pt-3 border-t border-white/5 animate-glow-pulse">
              <div className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-lg text-xs font-mono text-red-400 leading-normal">
                ⚠️ **Confirmation**: Starting a new semester will remove all attendance records and subjects from the current semester. Continue?
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  New Semester Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-2, 4-1"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="w-full sm:w-64 glass-input text-xs font-mono py-2"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-white/5 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-6 py-2 bg-cyber-red text-white text-xs font-bold font-mono tracking-wider rounded-lg hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={12} className={resetting ? 'animate-spin' : ''} />
                  {resetting ? 'RESETTING...' : 'START NEW SEMESTER'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

export default SemesterSettings;
