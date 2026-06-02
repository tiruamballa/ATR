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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const selectedPhase = phases.find(p => p._id === selectedPhaseId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-3 select-none">
      
      {/* Selector and Goal Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[80px]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Library size={20} />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white">Study Resource Bank</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage references and logs for each milestone phase.</p>
            </div>
          </div>

          <div>
            <select
              value={selectedPhaseId}
              onChange={handlePhaseChange}
              className="w-full glass-input bg-[#0A0F1D] text-xs text-white"
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
          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">
            <strong className="text-white block mb-1">Active Phase Objective:</strong>
            {selectedPhase.goal}
          </div>
        )}
      </div>

      {/* Success Notification Bar */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
          <CheckCircle2 size={16} /> <span>{message}</span>
        </div>
      )}

      {fetchingResource ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: YouTube references */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Youtube className="text-pink-500" size={18} />
                YouTube Reference Tutorials
              </h3>

              {/* YouTube Links List */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {resource?.youtubeLinks && resource.youtubeLinks.length > 0 ? (
                  resource.youtubeLinks.map((link) => (
                    <div
                      key={link._id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-300 hover:text-cyan-400 flex items-center gap-1 min-w-0"
                      >
                        <ExternalLink size={12} className="flex-shrink-0" />
                        <span className="truncate">{link.title}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteLink('youtube', link._id)}
                        className="text-gray-500 hover:text-pink-500 transition-colors p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-500 italic">No YouTube tutorials linked.</div>
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
                placeholder="Video title (e.g. Flexbox layout crash course)"
                className="w-full glass-input text-[11px] py-2"
              />
              <input
                type="url"
                required
                value={ytForm.url}
                onChange={(e) => setYtForm({ ...ytForm, url: e.target.value })}
                placeholder="YouTube URL (https://...)"
                className="w-full glass-input text-[11px] py-2"
              />
              <button
                type="submit"
                disabled={addingLink}
                className="w-full py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500 hover:text-white border border-pink-500/20 text-pink-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Add Video Link
              </button>
            </form>
          </div>

          {/* Column 2: Article / Doc References */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <FileText className="text-cyan-400" size={18} />
                Documentation & Article Links
              </h3>

              {/* Documentation links list */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {resource?.docLinks && resource.docLinks.length > 0 ? (
                  resource.docLinks.map((link) => (
                    <div
                      key={link._id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-300 hover:text-cyan-400 flex items-center gap-1 min-w-0"
                      >
                        <ExternalLink size={12} className="flex-shrink-0" />
                        <span className="truncate">{link.title}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteLink('doc', link._id)}
                        className="text-gray-500 hover:text-pink-500 transition-colors p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-500 italic">No document links configured.</div>
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
                placeholder="Article title (e.g. MDN CSS Grid Guides)"
                className="w-full glass-input text-[11px] py-2"
              />
              <input
                type="url"
                required
                value={docForm.url}
                onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                placeholder="Documentation URL (https://...)"
                className="w-full glass-input text-[11px] py-2"
              />
              <button
                type="submit"
                disabled={addingLink}
                className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 text-cyan-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Add Doc Link
              </button>
            </form>
          </div>

          {/* Column 3: Personal Rich Study Notes */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4 flex-1 flex flex-col">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <BookOpen className="text-purple-400" size={18} />
                Personal Phase Notes
              </h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down notes, formulas, design diagrams, or key learning links for this active month milestone phase..."
                className="flex-1 w-full glass-input text-xs min-h-[170px] resize-none leading-relaxed"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/15"
              >
                <Save size={14} />
                <span>{savingNotes ? 'Saving Notes...' : 'Save Study Notes'}</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Resources;
