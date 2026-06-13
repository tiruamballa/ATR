import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  Target,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CyberButton from '../components/CyberButton';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Target goals
  const [targets, setTargets] = useState({
    studyHoursTarget: 4,
    dsaTarget: 4,
    attendanceTarget: 75
  });

  const [saving, setSaving] = useState(false);

  const fetchTargets = async () => {
    try {
      const res = await apiRequest('/profile/readiness');
      if (res.success && res.targets) {
        setTargets({
          studyHoursTarget: res.targets.studyHoursTarget || 4,
          dsaTarget: res.targets.dsaTarget || 4,
          attendanceTarget: res.targets.attendanceTarget || 75
        });
      }
    } catch (err) {
      console.error('Failed to load target configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleTargetsSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const res = await apiRequest('/profile/targets', {
        method: 'PUT',
        body: targets
      });
      if (res.success) {
        setMessage('Execution targets updated successfully!');
        confetti({ particleCount: 30, spread: 25, origin: { y: 0.8 }, colors: ['#22D3EE', '#FACC15'] });
      }
    } catch (err) {
      setError(err.message || 'Failed to update target parameters');
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    if (!window.confirm('WARNING: Rebooting will reset all active daily tracking checklists and streaks to 0. Roadmap mission backlogs are preserved. Continue?')) {
      return;
    }
    
    setMessage('');
    setError('');
    
    try {
      const res = await apiRequest('/daily/reset', {
        method: 'POST'
      });
      if (res.success) {
        setMessage('System Reboot Complete! Daily checklist progress and streaks have been reset.');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#8B5CF6', '#22D3EE'],
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to complete system reboot');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-cyan" />
        <span className="animate-pulse tracking-widest uppercase">Syncing configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-1 py-3 select-none">
      
      {/* Alert Notifications */}
      {message && (
        <div className="p-3.5 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={15} /> <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-lg bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={15} /> <span>{error}</span>
        </div>
      )}

      {/* ── TARGET CONFIGURATIONS PANEL */}
      <div className="cyber-card p-6 border border-cyber-cyan/20 bg-black/45 shadow-[0_0_15px_rgba(0,245,212,0.03)] space-y-5">
        <div className="flex items-center space-x-3.5 border-b border-white/5 pb-3">
          <span className="p-2 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 rounded-xl">
            <SlidersHorizontal size={16} />
          </span>
          <div>
            <h3 className="font-display font-black text-white text-xs tracking-wider uppercase">
              Execution Goals & Targets
            </h3>
            <span className="text-[9px] text-slate-500 font-mono block mt-0.5 uppercase">
              Configure daily objectives and metrics tracking
            </span>
          </div>
        </div>

        <form onSubmit={handleTargetsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Study hours target */}
            <div className="space-y-2">
              <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Daily Study Hours Goal
              </label>
              <input
                type="number"
                required
                min="1"
                max="24"
                value={targets.studyHoursTarget}
                onChange={(e) => setTargets({ ...targets, studyHoursTarget: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full glass-input text-xs font-mono py-2 text-center"
              />
              <span className="block text-[8px] text-slate-500 font-mono text-center">Default: 4 Hours</span>
            </div>

            {/* DSA Questions target */}
            <div className="space-y-2">
              <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Daily DSA Target
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={targets.dsaTarget}
                onChange={(e) => setTargets({ ...targets, dsaTarget: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full glass-input text-xs font-mono py-2 text-center"
              />
              <span className="block text-[8px] text-slate-500 font-mono text-center">Default: 4 Questions</span>
            </div>

            {/* Attendance Target */}
            <div className="space-y-2">
              <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Attendance Percentage Target
              </label>
              <input
                type="number"
                required
                min="50"
                max="100"
                value={targets.attendanceTarget}
                onChange={(e) => setTargets({ ...targets, attendanceTarget: Math.min(100, Math.max(50, parseInt(e.target.value) || 75)) })}
                className="w-full glass-input text-xs font-mono py-2 text-center"
              />
              <span className="block text-[8px] text-slate-500 font-mono text-center">Default: 75% Target</span>
            </div>

          </div>

          <div className="pt-2">
            <CyberButton
              type="submit"
              variant="cyan"
              disabled={saving}
              className="w-full py-3 text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-1.5"
            >
              {saving ? <RefreshCw size={12} className="animate-spin" /> : null}
              {saving ? 'UPDATING...' : 'CONFIRM TARGETS UPDATE'}
            </CyberButton>
          </div>
        </form>
      </div>

      {/* ── DIAGNOSTIC REBOOT PANEL */}
      <div className="cyber-card p-5 border border-cyber-red/20 bg-black/45 shadow-[0_0_15px_rgba(255,0,85,0.02)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-cyber-red/10 text-cyber-red border border-cyber-red/20 animate-pulse mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-xs tracking-wider uppercase">
                SYSTEM REBOOT & LOG DIAGNOSTICS
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-body leading-relaxed">
                Execute a clean status reset on daily checkboxes and active learning streaks. This operation performs a database scrub for transient progress records while keeping all roadmap task backlogs, DSA status states, and uploaded files completely intact.
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-auto">
            <CyberButton
              onClick={handleResetProgress}
              variant="red"
              className="w-full md:w-auto px-6 py-2.5 text-xs font-bold font-mono tracking-widest uppercase border border-cyber-red/30 hover:shadow-[0_0_15px_rgba(255,0,85,0.3)]"
            >
              INITIATE REBOOT
            </CyberButton>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
