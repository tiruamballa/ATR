import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Settings as SettingsIcon,
  Github,
  Award,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CyberButton from '../components/CyberButton';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [github, setGithub] = useState({
    repos: 0,
    contributions: 0,
    streak: 0,
    projectsCount: 0,
  });

  const [skills, setSkills] = useState({
    react: 0,
    backend: 0,
    sql: 0,
    dbms: 0,
    os: 0,
    cn: 0,
    oops: 0,
    aptitude: 0,
    mockInterviews: 0,
  });

  const [resume, setResume] = useState({
    version: 'v1',
    fileName: '',
    fileUrl: 'https://example.com/resumes/my_resume.pdf',
    notes: '',
  });

  const [existingResumes, setExistingResumes] = useState([]);

  const fetchUserData = async () => {
    try {
      const data = await apiRequest('/auth/me');
      if (data.success && data.user) {
        const u = data.user;
        setGithub({
          repos: u.githubStats?.repos || 0,
          contributions: u.githubStats?.contributions || 0,
          streak: u.githubStats?.streak || 0,
          projectsCount: u.githubStats?.projectsCount || 0,
        });

        setSkills({
          react: u.skillsProficiency?.react || 0,
          backend: u.skillsProficiency?.backend || 0,
          sql: u.skillsProficiency?.sql || 0,
          dbms: u.skillsProficiency?.dbms || 0,
          os: u.skillsProficiency?.os || 0,
          cn: u.skillsProficiency?.cn || 0,
          oops: u.skillsProficiency?.oops || 0,
          aptitude: u.skillsProficiency?.aptitude || 0,
          mockInterviews: u.skillsProficiency?.mockInterviews || 0,
        });

        setExistingResumes(u.resumes || []);
      }
    } catch (err) {
      console.error('Failed to load user info in settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await apiRequest('/profile/github', {
        method: 'POST',
        body: github,
      });
      if (res.success) {
        setMessage('GitHub metrics updated successfully!');
        confetti({ particleCount: 30, spread: 20, origin: { y: 0.8 } });
      }
    } catch (err) {
      setError(err.message || 'Failed to update GitHub stats');
    }
  };

  const handleSkillsSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await apiRequest('/profile/skills', {
        method: 'POST',
        body: skills,
      });
      if (res.success) {
        setMessage('Skill proficiency details updated!');
        confetti({ particleCount: 30, spread: 20, origin: { y: 0.8 } });
      }
    } catch (err) {
      setError(err.message || 'Failed to update skill proficiency');
    }
  };

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!resume.fileName) return setError('Please provide a file name');

    try {
      const res = await apiRequest('/profile/resumes', {
        method: 'POST',
        body: resume,
      });
      if (res.success) {
        setMessage(`Resume version ${resume.version} registered successfully!`);
        setExistingResumes(res.resumes);
        setResume({
          version: 'v1',
          fileName: '',
          fileUrl: 'https://example.com/resumes/my_resume.pdf',
          notes: '',
        });
        confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
      }
    } catch (err) {
      setError(err.message || 'Failed to register resume version');
    }
  };

  const getMonthStr = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        setMessage('System Reboot Complete! Daily progress and streaks have been reset.');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF6B6B', '#7B61FF', '#00F5D4'],
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to complete system reboot');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="w-48 bg-slate-950 border border-cyber-cyan/30 h-2 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 bg-cyber-cyan animate-pulse" style={{ width: '80%' }} />
        </div>
        <span className="animate-pulse tracking-widest uppercase">INITIALIZING CONFIG CHANNELS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Alert response status bar */}
      {message && (
        <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-1.5 animate-pulse">
          <CheckCircle2 size={14} /> <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono flex items-center gap-1.5">
          <AlertTriangle size={14} /> <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GitHub Stats Panel */}
        <div className="cyber-card p-5 border border-cyber-purple/20 bg-black/45 shadow-[0_0_15px_rgba(123,97,255,0.03)]">
          <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 mb-4 uppercase">
            <Github size={16} className="text-cyber-purple" />
            GitHub HUD Configuration
          </h3>
          <form onSubmit={handleGithubSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Repositories</label>
                <input
                  type="number"
                  value={github.repos}
                  onChange={(e) => setGithub({ ...github, repos: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs font-mono py-2"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Contributions</label>
                <input
                  type="number"
                  value={github.contributions}
                  onChange={(e) => setGithub({ ...github, contributions: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs font-mono py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Active Streak (Days)</label>
                <input
                  type="number"
                  value={github.streak}
                  onChange={(e) => setGithub({ ...github, streak: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs font-mono py-2"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Projects Count (Max 4)</label>
                <input
                  type="number"
                  max="4"
                  value={github.projectsCount}
                  onChange={(e) => setGithub({ ...github, projectsCount: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs font-mono py-2"
                />
              </div>
            </div>

            <CyberButton
              type="submit"
              variant="purple"
              className="w-full py-2.5 text-xs font-bold"
            >
              Update GitHub Credentials
            </CyberButton>
          </form>
        </div>

        {/* Skill Proficiencies Panel */}
        <div className="cyber-card p-5 border border-cyber-cyan/20 bg-black/45 shadow-[0_0_15px_rgba(0,245,212,0.03)]">
          <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 mb-4 uppercase">
            <Award size={16} className="text-cyber-cyan" />
            Core Academic & Skill Proficiencies
          </h3>
          <form onSubmit={handleSkillsSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">React (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.react}
                  onChange={(e) => setSkills({ ...skills, react: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">Backend (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.backend}
                  onChange={(e) => setSkills({ ...skills, backend: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">SQL (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.sql}
                  onChange={(e) => setSkills({ ...skills, sql: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">DBMS (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.dbms}
                  onChange={(e) => setSkills({ ...skills, dbms: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">OS (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.os}
                  onChange={(e) => setSkills({ ...skills, os: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">Networks (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.cn}
                  onChange={(e) => setSkills({ ...skills, cn: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">OOPs (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.oops}
                  onChange={(e) => setSkills({ ...skills, oops: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">Aptitude (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.aptitude}
                  onChange={(e) => setSkills({ ...skills, aptitude: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1 truncate">Mocks Count</label>
                <input
                  type="number"
                  max="5"
                  value={skills.mockInterviews}
                  onChange={(e) => setSkills({ ...skills, mockInterviews: Math.min(5, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs font-mono py-1.5 px-2 text-center"
                />
              </div>
            </div>

            <CyberButton
              type="submit"
              variant="cyan"
              className="w-full py-2.5 text-xs font-bold"
            >
              Update Skill Parameters
            </CyberButton>
          </form>
        </div>

      </div>

      {/* Resume Versioning Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload simulated resume */}
        <div className="lg:col-span-1 cyber-card p-5 border border-cyber-pink/20 bg-black/45 shadow-[0_0_15px_rgba(244,114,182,0.03)] flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 mb-2 uppercase">
              <Upload size={16} className="text-cyber-pink" />
              Register Resumes
            </h3>

            <form onSubmit={handleResumeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Select Version</label>
                <select
                  value={resume.version}
                  onChange={(e) => setResume({ ...resume, version: e.target.value })}
                  className="w-full glass-input text-xs font-mono"
                >
                  <option value="v1">Resume v1 (Internship Ready)</option>
                  <option value="v2">Resume v2 (Placement Ready)</option>
                  <option value="v3">Resume v3 (Final Offers)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">PDF File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John_Doe_Resume_v1.pdf"
                  value={resume.fileName}
                  onChange={(e) => setResume({ ...resume, fileName: e.target.value })}
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Simulated URL</label>
                <input
                  type="text"
                  required
                  value={resume.fileUrl}
                  onChange={(e) => setResume({ ...resume, fileUrl: e.target.value })}
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">Version Notes</label>
                <textarea
                  placeholder="Highlights (e.g. Added MERN portfolio details...)"
                  rows="2"
                  value={resume.notes}
                  onChange={(e) => setResume({ ...resume, notes: e.target.value })}
                  className="w-full glass-input text-xs font-mono resize-none"
                />
              </div>

              <CyberButton
                type="submit"
                variant="pink"
                className="w-full py-2.5 text-xs font-bold"
              >
                Register Resume Version
              </CyberButton>
            </form>
          </div>
        </div>

        {/* Existing resume list */}
        <div className="lg:col-span-2 cyber-card p-5 border border-white/5 bg-black/45 flex flex-col justify-between">
          <div className="space-y-4 w-full">
            <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 mb-2 uppercase">
              <FileSpreadsheet size={16} className="text-cyber-cyan" />
              Resume Repository
            </h3>

            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1 w-full">
              {existingResumes.length > 0 ? (
                existingResumes.map((res) => (
                  <div
                    key={res._id || res.version}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyber-cyan/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded bg-cyber-cyan/5 text-cyber-cyan font-mono font-bold border border-cyber-cyan/20 uppercase tracking-widest text-[8px]">
                          {res.version}
                        </span>
                        <strong className="text-white text-xs font-mono">{res.fileName}</strong>
                      </div>
                      {res.notes && <p className="text-[11px] text-slate-400 font-body mt-1">{res.notes}</p>}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px] text-slate-500 font-mono">
                      <span>UPLOADED: {getMonthStr(res.date)}</span>
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5 cursor-pointer font-mono"
                      >
                        VIEW LINK
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-xs text-slate-500 italic font-mono uppercase tracking-widest">
                  No resume versions uploaded. Add Resume v1 to boost Internship readiness!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* System Reboot / Diagnostic Panel */}
      <div className="cyber-card p-5 border border-cyber-red/20 bg-black/45 shadow-[0_0_15px_rgba(255,0,85,0.03)]">
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

