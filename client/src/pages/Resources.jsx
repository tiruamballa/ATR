import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Library,
  Youtube,
  FileText,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Info,
  CheckCircle2
} from 'lucide-react';
import CyberButton from '../components/CyberButton';

const Resources = () => {
  const [phases, setPhases] = useState([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingResource, setFetchingResource] = useState(false);

  // Form states
  const [ytForm, setYtForm] = useState({ title: '', url: '' });
  const [docForm, setDocForm] = useState({ title: '', url: '' });
  const [notes, setNotes] = useState('');

  const [savingNotes, setSavingNotes] = useState(false);
  const [message, setMessage] = useState('');
  const [addingLink, setAddingLink] = useState(false);

  const fetchPhases = async () => {
    try {
      const data = await apiRequest('/phases');
      if (data.success && data.phases.length > 0) {
        setPhases(data.phases);
        
        // Find current phase, default to it
        const currentRes = await apiRequest('/phases/current');
        let initialId = data.phases[0]._id;
        if (currentRes.success && currentRes.phase) {
          const found = data.phases.find(p => p._id === currentRes.phase._id);
          if (found) initialId = found._id;
        }

        setSelectedPhaseId(initialId);
        await fetchResource(initialId);
      }
    } catch (err) {
      console.error('Failed to load phases for resources page:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResource = async (phaseId) => {
    setFetchingResource(true);
    setMessage('');
    try {
      const data = await apiRequest(`/resources/phase/${phaseId}`);
      if (data.success && data.resource) {
        setResource(data.resource);
        setNotes(data.resource.notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch phase resources:', err);
    } finally {
      setFetchingResource(false);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const handlePhaseChange = async (e) => {
    const newId = e.target.value;
    setSelectedPhaseId(newId);
    await fetchResource(newId);
  };

  const handleAddLink = async (e, type) => {
    e.preventDefault();
    setAddingLink(true);
    setMessage('');
    
    const form = type === 'youtube' ? ytForm : docForm;
    if (!form.title || !form.url) return;

    try {
      const data = await apiRequest(`/resources/phase/${selectedPhaseId}/${type}`, {
        method: 'POST',
        body: form,
      });

      if (data.success) {
        setResource(data.resource);
        // Clear form
        if (type === 'youtube') setYtForm({ title: '', url: '' });
        else setDocForm({ title: '', url: '' });
        setMessage(`${type === 'youtube' ? 'YouTube' : 'Documentation'} link added!`);
      }
    } catch (err) {
      console.error('Failed to add resource link:', err);
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (type, linkId) => {
    setMessage('');
    try {
      const data = await apiRequest(`/resources/phase/${selectedPhaseId}/link/${type}/${linkId}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setResource(data.resource);
        setMessage('Link deleted successfully.');
      }
    } catch (err) {
      console.error('Failed to delete resource link:', err);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setMessage('');
    try {
      const data = await apiRequest(`/resources/phase/${selectedPhaseId}/notes`, {
        method: 'PUT',
        body: { notes },
      });
      if (data.success) {
        setResource(data.resource);
        setMessage('Study notes saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save study notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-mono text-xs text-cyber-cyan space-y-4">
        <div className="w-48 bg-slate-950 border border-cyber-cyan/30 h-2 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 bg-cyber-cyan animate-pulse" style={{ width: '40%' }} />
        </div>
        <span className="animate-pulse tracking-widest uppercase">BOOTING INTEL DATA CHANNELS...</span>
      </div>
    );
  }

  const selectedPhase = phases.find(p => p._id === selectedPhaseId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Selector and Goal Card */}
      <div className="cyber-card p-6 border border-cyber-cyan/15 bg-black/45 shadow-[0_0_15px_rgba(0,245,212,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-[80px]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
              <Library size={18} />
            </span>
            <div>
              <h2 className="text-lg font-display font-black text-white tracking-wide">STUDY RESOURCE BANK</h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">MANAGE TARGET REFERENCE LOGS FOR EACH ROADMAP MILESTONE</p>
            </div>
          </div>

          <div>
            <select
              value={selectedPhaseId}
              onChange={handlePhaseChange}
              className="w-full glass-input text-xs font-mono"
            >
              {phases.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.monthName} '{String(p.year).slice(-2)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedPhase && (
          <div className="mt-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-400 font-body leading-relaxed">
            <strong className="text-white font-mono text-[10px] tracking-wider block mb-1 uppercase text-cyber-cyan">
              ACTIVE PHASE OBJECTIVE:
            </strong>
            {selectedPhase.goal}
          </div>
        )}
      </div>

      {/* Success Notification Bar */}
      {message && (
        <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan text-xs font-mono flex items-center gap-1.5 animate-pulse">
          <CheckCircle2 size={14} /> <span>{message}</span>
        </div>
      )}

      {fetchingResource ? (
        <div className="flex flex-col items-center justify-center py-16 font-mono text-xs text-cyber-cyan space-y-3">
          <div className="w-24 bg-slate-950 border border-cyber-cyan/20 h-1 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 bg-cyber-cyan animate-pulse" style={{ width: '75%' }} />
          </div>
          <span className="animate-pulse">FETCHING INTEL...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: YouTube references */}
          <div className="cyber-card p-5 border border-cyber-pink/20 bg-black/45 shadow-[0_0_15px_rgba(244,114,182,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 uppercase">
                <Youtube className="text-cyber-pink" size={16} />
                YouTube References
              </h3>

              {/* YouTube Links List */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {resource?.youtubeLinks && resource.youtubeLinks.length > 0 ? (
                  resource.youtubeLinks.map((link) => (
                    <div
                      key={link._id}
                      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-cyber-pink/20 transition-all flex items-center justify-between text-xs"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-slate-300 hover:text-cyber-pink flex items-center gap-1 min-w-0"
                      >
                        <ExternalLink size={11} className="flex-shrink-0" />
                        <span className="truncate">{link.title}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteLink('youtube', link._id)}
                        className="text-slate-500 hover:text-cyber-red transition-colors p-1"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 italic font-mono uppercase tracking-wider">No YouTube tutorials linked.</div>
                )}
              </div>
            </div>

            {/* Add Link Form */}
            <form onSubmit={(e) => handleAddLink(e, 'youtube')} className="space-y-3 mt-6 pt-4 border-t border-white/5">
              <input
                type="text"
                required
                value={ytForm.title}
                onChange={(e) => setYtForm({ ...ytForm, title: e.target.value })}
                placeholder="Video Title..."
                className="w-full glass-input text-[11px] font-mono py-2"
              />
              <input
                type="url"
                required
                value={ytForm.url}
                onChange={(e) => setYtForm({ ...ytForm, url: e.target.value })}
                placeholder="YouTube URL..."
                className="w-full glass-input text-[11px] font-mono py-2"
              />
              <CyberButton
                type="submit"
                variant="yellow"
                disabled={addingLink}
                className="w-full py-2.5 text-xs flex items-center justify-center gap-1 font-bold"
              >
                <Plus size={12} /> Add Video Link
              </CyberButton>
            </form>
          </div>

          {/* Column 2: Article / Doc References */}
          <div className="cyber-card p-5 border border-cyber-cyan/20 bg-black/45 shadow-[0_0_15px_rgba(0,245,212,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 uppercase">
                <FileText className="text-cyber-cyan" size={16} />
                Doc & Article Links
              </h3>

              {/* Documentation links list */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {resource?.docLinks && resource.docLinks.length > 0 ? (
                  resource.docLinks.map((link) => (
                    <div
                      key={link._id}
                      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-cyber-cyan/20 transition-all flex items-center justify-between text-xs"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-slate-300 hover:text-cyber-cyan flex items-center gap-1 min-w-0"
                      >
                        <ExternalLink size={11} className="flex-shrink-0" />
                        <span className="truncate">{link.title}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteLink('doc', link._id)}
                        className="text-slate-500 hover:text-cyber-red transition-colors p-1"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 italic font-mono uppercase tracking-wider">No document links configured.</div>
                )}
              </div>
            </div>

            {/* Add Link Form */}
            <form onSubmit={(e) => handleAddLink(e, 'doc')} className="space-y-3 mt-6 pt-4 border-t border-white/5">
              <input
                type="text"
                required
                value={docForm.title}
                onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                placeholder="Documentation Title..."
                className="w-full glass-input text-[11px] font-mono py-2"
              />
              <input
                type="url"
                required
                value={docForm.url}
                onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                placeholder="Documentation URL..."
                className="w-full glass-input text-[11px] font-mono py-2"
              />
              <CyberButton
                type="submit"
                variant="cyan"
                disabled={addingLink}
                className="w-full py-2.5 text-xs flex items-center justify-center gap-1 font-bold"
              >
                <Plus size={12} /> Add Doc Link
              </CyberButton>
            </form>
          </div>

          {/* Column 3: Personal Rich Study Notes */}
          <div className="cyber-card p-5 border border-cyber-purple/20 bg-black/45 shadow-[0_0_15px_rgba(123,97,255,0.03)] flex flex-col justify-between">
            <div className="space-y-4 flex-1 flex flex-col">
              <h3 className="font-display font-black text-white text-xs tracking-wider flex items-center gap-2 uppercase">
                <BookOpen className="text-cyber-purple" size={16} />
                Phase Study Notes
              </h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down notes, formulas, design diagrams, or key learning links for this active month milestone phase..."
                className="flex-1 w-full glass-input text-xs min-h-[170px] resize-none leading-relaxed font-mono focus:border-cyber-purple focus:shadow-[0_0_10px_rgba(123,97,255,0.15)]"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <CyberButton
                onClick={handleSaveNotes}
                disabled={savingNotes}
                variant="purple"
                className="w-full py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold"
              >
                <Save size={13} />
                <span>{savingNotes ? 'Saving Notes...' : 'Save Study Notes'}</span>
              </CyberButton>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Resources;
