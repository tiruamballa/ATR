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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Alert response status bar */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
          <CheckCircle2 size={16} /> <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs flex items-center gap-1.5">
          <AlertTriangle size={16} /> <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GitHub Stats Panel */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
            <Github size={18} className="text-purple-400" />
            GitHub Stats Configuration
          </h3>
          <form onSubmit={handleGithubSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Repositories</label>
                <input
                  type="number"
                  value={github.repos}
                  onChange={(e) => setGithub({ ...github, repos: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs py-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Contributions</label>
                <input
                  type="number"
                  value={github.contributions}
                  onChange={(e) => setGithub({ ...github, contributions: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Active Streak (Days)</label>
                <input
                  type="number"
                  value={github.streak}
                  onChange={(e) => setGithub({ ...github, streak: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs py-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Projects Count (Max 4)</label>
                <input
                  type="number"
                  max="4"
                  value={github.projectsCount}
                  onChange={(e) => setGithub({ ...github, projectsCount: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full glass-input text-xs py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Update GitHub Credentials
            </button>
          </form>
        </div>

        {/* Skill Proficiencies Panel */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
            <Award size={18} className="text-cyan-400" />
            Core Academic & Skill Proficiencies
          </h3>
          <form onSubmit={handleSkillsSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">React (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.react}
                  onChange={(e) => setSkills({ ...skills, react: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">Backend (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.backend}
                  onChange={(e) => setSkills({ ...skills, backend: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">SQL (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.sql}
                  onChange={(e) => setSkills({ ...skills, sql: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">DBMS (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.dbms}
                  onChange={(e) => setSkills({ ...skills, dbms: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">OS (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.os}
                  onChange={(e) => setSkills({ ...skills, os: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">Networks (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.cn}
                  onChange={(e) => setSkills({ ...skills, cn: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">OOPs (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.oops}
                  onChange={(e) => setSkills({ ...skills, oops: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">Aptitude (%)</label>
                <input
                  type="number"
                  max="100"
                  value={skills.aptitude}
                  onChange={(e) => setSkills({ ...skills, aptitude: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">Mocks Count</label>
                <input
                  type="number"
                  max="5"
                  value={skills.mockInterviews}
                  onChange={(e) => setSkills({ ...skills, mockInterviews: Math.min(5, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full glass-input text-xs py-1.5 px-2 text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
            >
              Update Skill Parameters
            </button>
          </form>
        </div>

      </div>

      {/* Resume Versioning Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload simulated resume */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Upload size={18} className="text-pink-400" />
              Register Resume Versions
            </h3>

            <form onSubmit={handleResumeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Select Version</label>
                <select
                  value={resume.version}
                  onChange={(e) => setResume({ ...resume, version: e.target.value })}
                  className="w-full glass-input bg-[#0A0F1D] text-xs text-white"
                >
                  <option value="v1">Resume v1 (Internship Ready)</option>
                  <option value="v2">Resume v2 (Placement Ready)</option>
                  <option value="v3">Resume v3 (Final Offers)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">PDF File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John_Doe_Resume_v1.pdf"
                  value={resume.fileName}
                  onChange={(e) => setResume({ ...resume, fileName: e.target.value })}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Simulated URL</label>
                <input
                  type="text"
                  required
                  value={resume.fileUrl}
                  onChange={(e) => setResume({ ...resume, fileUrl: e.target.value })}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Version Notes</label>
                <textarea
                  placeholder="Highlights (e.g. Added MERN portfolio details...)"
                  rows="2"
                  value={resume.notes}
                  onChange={(e) => setResume({ ...resume, notes: e.target.value })}
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Register Resume Version
              </button>
            </form>
          </div>
        </div>

        {/* Existing resume list */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-400" />
              Registered Resume Repository
            </h3>

            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {existingResumes.length > 0 ? (
                existingResumes.map((res) => (
                  <div
                    key={res._id || res.version}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-extrabold border border-cyan-500/20 uppercase tracking-widest text-[9px]">
                          {res.version}
                        </span>
                        <strong className="text-white text-xs">{res.fileName}</strong>
                      </div>
                      {res.notes && <p className="text-[11px] text-gray-400 mt-1">{res.notes}</p>}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px] text-gray-500">
                      <span>Uploaded: {getMonthStr(res.date)}</span>
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5 cursor-pointer"
                      >
                        View Link
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-xs text-gray-500 italic">
                  No resume versions uploaded. Add Resume v1 to boost Internship readiness!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Settings;
